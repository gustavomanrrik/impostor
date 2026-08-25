// ============================================
// IMPOSTOR GAME — Motor de Seleção de Palavras
// ============================================
import { Difficulty, WordSelection, CustomTheme } from '../../../shared/types.ts';
import { themes, getThemeById } from '../../../shared/themes.ts';

export class WordEngine {
  /**
   * Seleciona um par de palavras para a rodada.
   * @param themeId - ID do tema
   * @param difficulty - Nível de dificuldade
   * @param usedGroupIds - IDs dos grupos já usados (para evitar repetição)
   * @param customTheme - Tema personalizado (opcional)
   */
  static selectWords(
    themeId: string,
    difficulty: Difficulty,
    usedGroupIds: string[] = [],
    customTheme?: CustomTheme,
    useFlatMode?: boolean
  ): WordSelection | null {
    // Tema personalizado
    if (themeId === 'custom' && customTheme) {
      return this.selectFromCustomTheme(customTheme, usedGroupIds);
    }

    const theme = getThemeById(themeId);
    if (!theme) return null;

    if (useFlatMode) {
      // Extrair todas as palavras únicas deste tema
      const allWords = new Set<string>();
      Object.values(theme.pairs).forEach(difficultyPairs => {
        difficultyPairs.forEach(pair => {
          allWords.add(pair[0]);
          allWords.add(pair[1]);
        });
      });
      
      const flatTheme: CustomTheme = {
        id: theme.id + '-flat',
        name: theme.name,
        words: Array.from(allWords)
      };
      
      return this.selectFromCustomTheme(flatTheme, usedGroupIds);
    }

    let availablePairs: [string, string][];
    let pairIdPrefix = '';

    switch (difficulty) {
      case Difficulty.EASY:
        availablePairs = theme.pairs.easy;
        pairIdPrefix = 'easy-';
        break;
      case Difficulty.MEDIUM:
        availablePairs = theme.pairs.medium;
        pairIdPrefix = 'medium-';
        break;
      case Difficulty.HARD:
        availablePairs = theme.pairs.hard;
        pairIdPrefix = 'hard-';
        break;
      default:
        availablePairs = theme.pairs.medium;
        pairIdPrefix = 'medium-';
    }

    // Filtrar pares não usados
    let pairsToChoose = availablePairs.map((pair, index) => ({
      id: `${themeId}-${pairIdPrefix}${index}`,
      pair
    })).filter(p => !usedGroupIds.includes(p.id));

    // Se todos já foram usados, usar todos novamente
    if (pairsToChoose.length === 0) {
      pairsToChoose = availablePairs.map((pair, index) => ({
        id: `${themeId}-${pairIdPrefix}${index}`,
        pair
      }));
    }

    // Selecionar par aleatório
    const selected = pairsToChoose[Math.floor(Math.random() * pairsToChoose.length)];
    const pair = selected.pair;

    // Randomizar qual é normal e qual é impostor
    const isSwapped = Math.random() > 0.5;

    return {
      groupId: selected.id,
      normalWord: isSwapped ? pair[1] : pair[0],
      impostorWord: isSwapped ? pair[0] : pair[1],
      themeName: theme.name,
    };
  }

  /**
   * Seleciona par de palavras de um tema personalizado.
   */
  private static selectFromCustomTheme(
    customTheme: CustomTheme,
    usedGroupIds: string[]
  ): WordSelection | null {
    const words = customTheme.words;
    if (words.length < 2) return null;

    // Gerar todas as combinações possíveis de pares
    const pairs: [string, string, string][] = [];
    for (let i = 0; i < words.length; i++) {
      for (let j = i + 1; j < words.length; j++) {
        const pairId = `custom-${words[i]}-${words[j]}`;
        if (!usedGroupIds.includes(pairId)) {
          pairs.push([words[i], words[j], pairId]);
        }
      }
    }

    // Se todos os pares foram usados, resetar
    if (pairs.length === 0) {
      for (let i = 0; i < words.length; i++) {
        for (let j = i + 1; j < words.length; j++) {
          const pairId = `custom-${words[i]}-${words[j]}`;
          pairs.push([words[i], words[j], pairId]);
        }
      }
    }

    const selected = pairs[Math.floor(Math.random() * pairs.length)];
    const isSwapped = Math.random() > 0.5;

    return {
      groupId: selected[2],
      normalWord: isSwapped ? selected[1] : selected[0],
      impostorWord: isSwapped ? selected[0] : selected[1],
      themeName: customTheme.name,
    };
  }

  /**
   * Calcula quantos impostores devem existir de forma automática baseado no número de jogadores.
   * 3-4 jogadores: 1 impostor
   * 5-6 jogadores: 2 impostores
   * 7-8 jogadores: 2 impostores (pode ser 3, mas 2 é mais equilibrado)
   */
  static calculateImpostors(playerCount: number): number {
    if (playerCount <= 4) return 1;
    if (playerCount <= 8) return 2;
    return Math.floor(playerCount / 3);
  }
}
