// ============================================
// IMPOSTOR GAME — Room (Sala de Jogo)
// ============================================
import { v4 as uuidv4 } from 'uuid';
import {
  GameState, Player, RoomConfig, RoomPublicState, PublicPlayer,
  Difficulty, ImpostorMode, WordSelection, Vote, VoteResult,
  GameResult, CustomTheme, GameType,
} from '../../../shared/types';
import { StateMachine } from './StateMachine';
import { WordEngine } from './WordEngine';

export class Room {
  readonly code: string;
  public players: Map<string, Player> = new Map();
  private stateMachine: StateMachine = new StateMachine();
  public config: RoomConfig;
  private hostId: string = '';
  private currentWords: WordSelection | null = null;
  private impostorIds: Set<string> = new Set();
  private votes: Map<string, string> = new Map(); // voterId -> votedForId
  private voteRequests: Set<string> = new Set();
  private round: number = 0;
  public currentRound: number = 1;
  public customTheme: CustomTheme | null = null;
  private disconnectTimers: Map<string, ReturnType<typeof setTimeout>> = new Map();
  private skipVotes: Set<string> = new Set();
  private totalSubmittedWords: number = 0;

  // Socket IDs mapeados para player IDs (para reconexão)
  private socketToPlayer: Map<string, string> = new Map();
  public abortedDueToDisconnect: boolean = false;

  constructor(code: string, config?: Partial<RoomConfig>) {
    this.code = code;
    this.config = {
      gameType: GameType.IMPOSTOR,
      theme: 'relacionamentos',
      difficulty: Difficulty.MEDIUM,
      impostorMode: ImpostorMode.AUTO,
      customImpostorCount: 1,
      discussionTimeLimit: 0,
      showImpostorCount: true,
      soundEnabled: true,
      testaLives: 3,
      testaMode: 'points',
      numbersMode: 'points',
      numbersLives: 3,
      numbersMin: 1,
      numbersMax: 100,
      totalRounds: 3,
      ...config,
    };
  }

  // ─── Getters ─────────────────────────────

  get state(): GameState {
    return this.stateMachine.state;
  }

  get playerCount(): number {
    return this.players.size;
  }

  get host(): string {
    return this.hostId;
  }



  // ─── Player Management ─────────────────────

  addPlayer(socketId: string, name: string, avatar: string): Player | null {
    if (this.players.size >= 8) return null;
    // We allow joining in any state now as spectators
    const isSpectator = this.state !== GameState.LOBBY;

    // Verificar nome duplicado
    for (const p of this.players.values()) {
      if (p.name.toLowerCase() === name.toLowerCase()) {
        return null;
      }
    }

    const playerId = uuidv4();
    const isHost = this.players.size === 0;

    const player: Player = {
      id: playerId,
      name,
      avatar,
      isHost,
      isConnected: true,
      isSpectator,
      hasSeenWord: false,
      hasVoted: false,
      hasRequestedVote: false,
      score: 0,
      isWinner: false,
    };

    this.players.set(playerId, player);
    this.socketToPlayer.set(socketId, playerId);

    if (isHost) {
      this.hostId = playerId;
    }

    return player;
  }

  removePlayer(socketId: string): { player: Player; newHostId?: string } | null {
    const playerId = this.socketToPlayer.get(socketId);
    if (!playerId) return null;

    const player = this.players.get(playerId);
    if (!player) return null;

    this.socketToPlayer.delete(socketId);
    this.players.delete(playerId);
    this.impostorIds.delete(playerId);
    this.votes.delete(playerId);
    this.voteRequests.delete(playerId);

    let newHostId: string | undefined;

    // Se era o host, transferir
    if (player.isHost && this.players.size > 0) {
      const nextPlayer = this.players.values().next().value;
      if (nextPlayer) {
        nextPlayer.isHost = true;
        this.hostId = nextPlayer.id;
        newHostId = nextPlayer.id;
      }
    }

    this.checkAbortCondition();

    return { player, newHostId };
  }

  handleDisconnect(socketId: string, onRemove?: () => void): { playerId: string; shouldRemove: boolean } | null {
    const playerId = this.socketToPlayer.get(socketId);
    if (!playerId) return null;

    const player = this.players.get(playerId);
    if (!player) return null;

    player.isConnected = false;

    // Em lobby, remover imediatamente sem chance de reconectar (conforme regra do usuario)
    if (this.state === GameState.LOBBY) {
      return { playerId, shouldRemove: true };
    }

    // Em jogo, manter por 2 minutos
    const timer = setTimeout(() => {
      // Após 2 min, se ainda desconectado, marcar como bot/skip
      const p = this.players.get(playerId);
      if (p && !p.isConnected) {
        // Auto-vote (votar em ninguém ou skip)
        this.disconnectTimers.delete(playerId);
      }
    }, 120000);
    this.disconnectTimers.set(playerId, timer);

    this.checkAbortCondition();

    return { playerId, shouldRemove: false };
  }

  checkAbortCondition(): boolean {
    if (this.state === GameState.LOBBY || this.state === GameState.RESULT) return false;
    const activePlayers = Array.from(this.players.values()).filter(p => p.isConnected && !p.isSpectator);
    if (activePlayers.length < 2) {
      this.abortedDueToDisconnect = true;
      this.stateMachine.forceState(GameState.RESULT);
      return true;
    }
    return false;
  }

  reconnectPlayer(socketId: string, playerId: string): Player | null {
    const player = this.players.get(playerId);
    if (!player) return null;

    // Limpar timer de desconexão
    const timer = this.disconnectTimers.get(playerId);
    if (timer) {
      clearTimeout(timer);
      this.disconnectTimers.delete(playerId);
    }

    // Atualizar socket mapping
    // Remover socket antigo se existir
    for (const [sid, pid] of this.socketToPlayer) {
      if (pid === playerId) {
        this.socketToPlayer.delete(sid);
      }
    }
    this.socketToPlayer.set(socketId, playerId);

    player.isConnected = true;
    return player;
  }

  getPlayerIdBySocket(socketId: string): string | undefined {
    return this.socketToPlayer.get(socketId);
  }

  getSocketIdByPlayerId(playerId: string): string | undefined {
    for (const [sid, pid] of this.socketToPlayer.entries()) {
      if (pid === playerId) return sid;
    }
    return undefined;
  }

  getPlayer(playerId: string): Player | undefined {
    return this.players.get(playerId);
  }

  isHost(playerId: string): boolean {
    return this.hostId === playerId;
  }

  // ─── Config ─────────────────────────────

  updateConfig(playerId: string, updates: Partial<RoomConfig>): boolean {
    if (!this.isHost(playerId)) return false;
    if (this.state !== GameState.LOBBY) return false;

    this.config = { ...this.config, ...updates };
    return true;
  }

  setCustomTheme(theme: CustomTheme): void {
    this.customTheme = theme;
    this.config.theme = 'custom';
    this.config.customThemeId = theme.id;
  }

  addCustomWord(word: string): boolean {
    if (!this.customTheme) {
      this.customTheme = { id: 'colab', name: 'Tema Colaborativo', words: [] };
      this.config.theme = 'custom';
    }
    const cleanWord = word.trim();
    if (!cleanWord) return false;

    // Incrementa sempre para esconder de quem enviou que a palavra foi repetida
    this.totalSubmittedWords++;

    const isDuplicate = this.customTheme.words.some(w => w.toLowerCase() === cleanWord.toLowerCase());
    if (!isDuplicate) {
      this.customTheme.words.push(cleanWord);
    }
    
    return true;
  }

  removeCustomWord(word: string): boolean {
    if (!this.customTheme) return false;
    const initialLength = this.customTheme.words.length;
    this.customTheme.words = this.customTheme.words.filter(w => w !== word);
    if (this.customTheme.words.length < initialLength) {
      this.totalSubmittedWords = Math.max(0, this.totalSubmittedWords - 1);
      return true;
    }
    return false;
  }

  getCustomThemeWords(): string[] {
    return this.customTheme?.words || [];
  }

  // ─── Game Flow ─────────────────────────────

  startGame(playerId: string): { success: boolean; error?: string } {
    if (!this.isHost(playerId)) {
      return { success: false, error: 'Somente o host pode iniciar a partida.' };
    }

    if (!this.stateMachine.canTransition(GameState.STARTING)) {
      return { success: false, error: 'Não é possível iniciar neste momento.' };
    }

    // Dispatch based on game type
    if (this.config.gameType === GameType.TESTA) {
      if (this.players.size < 2 || this.players.size > 6) {
        return { success: false, error: 'Jogo da Testa requer de 2 a 6 jogadores.' };
      }
      return this.startTestaGame();
    } 
    
    if (this.config.gameType === GameType.NUMBERS) {
      if (this.players.size < 2) {
        return { success: false, error: 'Jogo dos Números requer pelo menos 2 jogadores.' };
      }
      return this.startNumbersGame();
    }

    // Default: Impostor
    if (this.players.size < 3) {
      return { success: false, error: 'Impostor requer pelo menos 3 jogadores.' };
    }
    return this.startImpostorGame();
  }

  private startImpostorGame(): { success: boolean; error?: string } {
    // Validar custom theme
    if (this.config.theme === 'custom' && this.customTheme) {
      if (this.customTheme.words.length < 4) {
        return { success: false, error: `O tema precisa de 4 palavras ÚNICAS. No momento temos apenas ${this.customTheme.words.length}.` };
      }
    }

    // Limpar coroas (isWinner) antes de começar
    for (const p of this.players.values()) {
      p.isWinner = false;
    }

    // Calcular número de impostores
    const impostorCount = this.getImpostorCount();
    if (impostorCount >= this.players.size) {
      return { success: false, error: 'Muitos impostores para o número de jogadores.' };
    }

    // Selecionar palavras
    const words = WordEngine.selectWords(
      this.config.theme,
      this.config.difficulty,
      [], // usedGroupIds será passado pelo client
      this.customTheme || undefined,
      this.config.useFlatMode
    );

    if (!words) {
      return { success: false, error: 'Não foi possível selecionar palavras para este tema.' };
    }

    this.currentWords = words;
    this.round++;

    // Sortear impostores
    const playerIds = Array.from(this.players.keys());
    this.shuffleArray(playerIds);
    this.impostorIds = new Set(playerIds.slice(0, impostorCount));

    // Distribuir palavras para cada jogador
    for (const [id, player] of this.players) {
      const isImpostor = this.impostorIds.has(id);
      player.isImpostor = isImpostor;
      player.word = isImpostor ? (this.config.impostorNoWord ? undefined : words.impostorWord) : words.normalWord;
      player.hasSeenWord = false;
      player.hasVoted = false;
      player.hasRequestedVote = false;
      player.votedFor = undefined;
    }

    // Limpar votos
    this.votes.clear();
    this.voteRequests.clear();

    this.stateMachine.transition(GameState.STARTING);
    this.stateMachine.transition(GameState.WORD_REVEAL);

    return { success: true };
  }

  private startTestaGame(): { success: boolean; error?: string } {
    if (this.config.theme === 'custom' && this.customTheme) {
      if (this.customTheme.words.length < this.players.size) {
        return { success: false, error: `O tema precisa de pelo menos ${this.players.size} palavras ÚNICAS.` };
      }
    }

    for (const p of this.players.values()) {
      p.isWinner = false;
      p.hasGuessedTesta = false;
      p.testaGuessedCorrectly = false;
      p.testaGuessOrder = undefined;
      p.testaWord = undefined;
      p.inSuddenDeath = false;
      // In survival mode, use configured lives (default 3). In points mode, set to 0 (unused).
      if (this.config.testaMode === 'survival') {
        p.testaLivesLeft = (this.config.testaLives && this.config.testaLives > 0) ? this.config.testaLives : 3;
      } else {
        p.testaLivesLeft = 0;
      }
    }

    // Assign a random word to each player
    const usedWords = new Set<string>();
    for (const p of this.players.values()) {
      // Find a word not used yet
      let attempts = 0;
      let wordObj = null;
      while (attempts < 50) {
        wordObj = WordEngine.selectWords(
          this.config.theme,
          this.config.difficulty,
          [],
          this.customTheme || undefined,
          true // Force flat mode basically
        );
        if (wordObj && !usedWords.has(wordObj.normalWord)) {
          break;
        }
        attempts++;
      }
      
      if (wordObj) {
        p.testaWord = wordObj.normalWord;
        usedWords.add(wordObj.normalWord);
      } else {
        p.testaWord = 'Palavra ' + Math.floor(Math.random() * 1000); // Fallback
      }
    }

    this.round++;
    this.stateMachine.transition(GameState.STARTING);
    this.stateMachine.transition(GameState.IN_GAME);
    return { success: true };
  }

  private startNumbersGame(): { success: boolean; error?: string } {
    for (const p of this.players.values()) {
      p.isWinner = false;
      p.hasBeenDiscovered = false;
      p.discoveredNumbers = [];
      p.numbersLivesLeft = this.config.numbersLives || 0;
      p.numbersLastChance = false;
    }

    const min = this.config.numbersMin || 1;
    const max = this.config.numbersMax || 100;
    const range = max - min + 1;

    if (range < this.players.size) {
      return { success: false, error: 'O intervalo de números deve ser maior que o número de jogadores.' };
    }

    const usedNumbers = new Set<number>();
    for (const p of this.players.values()) {
      let num = min;
      let attempts = 0;
      do {
        num = Math.floor(Math.random() * range) + min;
        attempts++;
      } while (usedNumbers.has(num) && attempts < 1000);
      
      usedNumbers.add(num);
      p.numberValue = num;
    }

    this.round++;
    this.stateMachine.transition(GameState.STARTING);
    this.stateMachine.transition(GameState.IN_GAME);
    return { success: true };
  }

  markWordSeen(playerId: string): boolean {
    const player = this.players.get(playerId);
    if (!player) return false;

    player.hasSeenWord = true;

    // Verificar se todos viram
    const activePlayers = Array.from(this.players.values()).filter(p => !p.isSpectator);
    const allSeen = activePlayers.length > 0 && activePlayers.every(p => p.hasSeenWord);
    if (allSeen && this.stateMachine.canTransition(GameState.DISCUSSION)) {
      this.stateMachine.transition(GameState.DISCUSSION);
      return true; // indica transição para discussion
    }

    return false;
  }

  allPlayersSeenWord(): boolean {
    const activePlayers = Array.from(this.players.values()).filter(p => !p.isSpectator);
    return activePlayers.length > 0 && activePlayers.every(p => p.hasSeenWord);
  }

  // ─── Voting ─────────────────────────────

  cancelVoteRequest(playerId: string): { count: number; needed: number } | null {
    if (this.state !== GameState.DISCUSSION && this.state !== GameState.VOTING_REQUEST) return null;

    const player = this.players.get(playerId);
    if (!player) return null;
    if (!player.hasRequestedVote) return null;

    player.hasRequestedVote = false;
    this.voteRequests.delete(playerId);

    const needed = this.getVoteRequestsNeeded();
    const count = this.voteRequests.size;

    return { count, needed };
  }

  requestVote(playerId: string): { count: number; needed: number; started: boolean } | null {
    if (this.state !== GameState.DISCUSSION && this.state !== GameState.VOTING_REQUEST) return null;

    const player = this.players.get(playerId);
    if (!player) return null;

    if (player.hasRequestedVote) return null;

    player.hasRequestedVote = true;
    this.voteRequests.add(playerId);

    const needed = this.getVoteRequestsNeeded();
    const count = this.voteRequests.size;
    const started = count >= needed;

    if (started) {
      this.stateMachine.forceState(GameState.VOTING);
    }

    return { count, needed, started };
  }

  cancelVoteRequest(playerId: string): boolean {
    if (this.state !== GameState.DISCUSSION) return false;
    
    const player = this.players.get(playerId);
    if (!player) return false;

    player.hasRequestedVote = false;
    this.voteRequests.delete(playerId);
    return true;
  }

  voteSkip(playerId: string): { skipped: boolean } {
    if (this.state !== GameState.WORD_REVEAL && this.state !== GameState.DISCUSSION && this.state !== GameState.IN_GAME) return { skipped: false };
    
    const player = this.players.get(playerId);
    if (!player || !player.isConnected) return { skipped: false };

    this.skipVotes.add(playerId);
    player.hasVotedSkip = true;

    // Check if all connected alive players voted to skip
    const connectedPlayers = Array.from(this.players.values()).filter(p => p.isConnected && !p.isSpectator);
    if (this.skipVotes.size >= connectedPlayers.length && connectedPlayers.length > 0) {
      this.prepareNextRound();
      return { skipped: true };
    }

    return { skipped: false };
  }

  submitVote(playerId: string, votedForId: string): { success: boolean; allVoted: boolean; error?: string } {
    if (this.state !== GameState.VOTING) {
      return { success: false, allVoted: false, error: 'Não é hora de votar.' };
    }

    const voter = this.players.get(playerId);
    if (!voter) {
      return { success: false, allVoted: false, error: 'Jogador não encontrado.' };
    }

    if (voter.hasVoted) {
      return { success: false, allVoted: false, error: 'Você já votou.' };
    }

    if (playerId === votedForId) {
      return { success: false, allVoted: false, error: 'Você não pode votar em si mesmo.' };
    }

    if (!this.players.has(votedForId)) {
      return { success: false, allVoted: false, error: 'Jogador votado não encontrado.' };
    }

    voter.hasVoted = true;
    voter.votedFor = votedForId;
    this.votes.set(playerId, votedForId);

    const allVoted = Array.from(this.players.values())
      .filter(p => p.isConnected && !p.isSpectator)
      .every(p => p.hasVoted);

    if (allVoted) {
      this.stateMachine.forceState(GameState.REVEALING);
    }

    return { success: true, allVoted };
  }

  getVotesCount(): number {
    return this.votes.size;
  }

  // ─── Results ─────────────────────────────

  calculateResult(): GameResult {
    // Contar votos
    const voteCounts = new Map<string, number>();
    for (const votedFor of this.votes.values()) {
      voteCounts.set(votedFor, (voteCounts.get(votedFor) || 0) + 1);
    }

    // Criar resultados ordenados
    const activePlayers = Array.from(this.players.entries()).filter(([_, p]) => !p.isSpectator);
    const voteResults: VoteResult[] = activePlayers.map(([id, p]) => ({
      playerId: id,
      playerName: p.name,
      voteCount: voteCounts.get(id) || 0,
    })).sort((a, b) => b.voteCount - a.voteCount);

    // Determinar eliminado (mais votado)
    const maxVotes = voteResults[0]?.voteCount || 0;
    const mostVoted = voteResults.filter(v => v.voteCount === maxVotes);

    // Se empate, ninguém é eliminado
    let eliminatedPlayer: { id: string; name: string } | null = null;
    if (mostVoted.length === 1 && maxVotes > 0) {
      eliminatedPlayer = {
        id: mostVoted[0].playerId,
        name: mostVoted[0].playerName,
      };
    }

    // Verificar se os impostores foram descobertos
    const impostors = Array.from(this.impostorIds).map(id => {
      const p = this.players.get(id)!;
      return { id, name: p.name };
    });

    let impostorsDiscovered = 0;
    if (eliminatedPlayer && this.impostorIds.has(eliminatedPlayer.id)) {
      impostorsDiscovered = 1;
    }

    const impostorsFound = impostorsDiscovered === this.impostorIds.size;

    // Distribuir pontos
    for (const [id, p] of this.players.entries()) {
      const isImpostor = this.impostorIds.has(id);
      
      if (impostorsFound) {
        // Jogadores normais ganham
        if (!isImpostor) {
          p.score += 100;
          p.isWinner = true;
        } else {
          p.isWinner = false;
        }
      } else {
        // Impostores ganham
        if (isImpostor) {
          p.score += 150;
          p.isWinner = true;
        } else {
          p.isWinner = false;
        }
      }
    }

    this.stateMachine.forceState(GameState.RESULT);

    return {
      impostorsFound,
      impostors,
      normalWord: this.currentWords!.normalWord,
      impostorWord: this.currentWords!.impostorWord,
      themeName: this.currentWords!.themeName,
      votes: voteResults,
      eliminatedPlayer,
      impostorsDiscovered,
      totalImpostors: this.impostorIds.size,
    };
  }

  // ─── Next Round ─────────────────────────────

  prepareNextRound(): boolean {
    // Allow from any state (result, in_game, word_reveal, discussion, etc)
    this.stateMachine.forceState(GameState.LOBBY);
    this.clearRoundState();
    return true;
  }

  playAgain(playerId: string): { success: boolean; error?: string } {
    if (!this.isHost(playerId)) return { success: false, error: 'Apenas o host pode reiniciar.' };
    
    this.currentRound = 1;
    for (const p of this.players.values()) {
      p.score = 0;
    }
    this.stateMachine.forceState(GameState.LOBBY);
    this.clearRoundState();
    return this.startGame(playerId);
  }

  nextRound(playerId: string): { success: boolean; error?: string } {
    if (!this.isHost(playerId)) return { success: false, error: 'Apenas o host pode avançar a rodada.' };
    if (this.currentRound >= (this.config.totalRounds || 3)) return { success: false, error: 'Limite de rodadas atingido.' };
    
    this.currentRound++;
    this.stateMachine.forceState(GameState.LOBBY);
    this.clearRoundState();
    return this.startGame(playerId);
  }

  private clearRoundState(): void {
    // Reset round state
    this.votes.clear();
    this.voteRequests.clear();
    this.skipVotes.clear();
    this.impostorIds.clear();
    this.currentWords = null;
    
    for (const p of this.players.values()) {
      p.hasSeenWord = false;
      p.hasVoted = false;
      p.hasRequestedVote = false;
      p.hasVotedSkip = false;
      p.isSpectator = false; // Reset spectator status
      p.votedFor = undefined;
      p.isImpostor = undefined;
      p.word = undefined;
      p.isWinner = false;
      
      // Testa
      p.testaWord = undefined;
      p.hasGuessedTesta = false;
      p.testaGuessedCorrectly = false;
      p.testaGuessOrder = undefined;
      p.inSuddenDeath = false;
      
      // Numbers
      p.numberValue = undefined;
      p.discoveredNumbers = [];
      p.hasBeenDiscovered = false;
      p.numbersLastChance = false;
      p.numbersLivesLeft = undefined;
    }
  }

  // ─── Score Management ───────────────────────

  resetScores(playerId: string): boolean {
    if (!this.isHost(playerId)) return false;

    for (const p of this.players.values()) {
      p.score = 0;
      p.isWinner = false;
    }

    return true;
  }

  // ─── Public State ─────────────────────────────

  getPublicState(): RoomPublicState {
    const isResultPhase = this.state === GameState.RESULT;
    const publicPlayers: PublicPlayer[] = Array.from(this.players.values()).map(p => ({
      id: p.id,
      name: p.name,
      avatar: p.avatar,
      isHost: p.isHost,
      isConnected: p.isConnected,
      isSpectator: p.isSpectator || false,
      hasSeenWord: p.hasSeenWord || false,
      hasVoted: p.hasVoted || false,
      hasRequestedVote: p.hasRequestedVote || false,
      hasVotedSkip: p.hasVotedSkip || false,
      score: p.score || 0,
      isWinner: p.isWinner || false,
      testaWord: p.testaWord, // For Testa: other players CAN see each other's words
      hasGuessedTesta: p.hasGuessedTesta,
      testaLivesLeft: p.testaLivesLeft,
      hasBeenDiscovered: p.hasBeenDiscovered,
      inSuddenDeath: p.inSuddenDeath,
      numbersLivesLeft: p.numbersLivesLeft,
      // numberValue is PRIVATE - only shown in result phase or when discovered
      numberValue: (isResultPhase || p.hasBeenDiscovered) ? p.numberValue : undefined,
    }));

    return {
      code: this.code,
      state: this.state,
      players: publicPlayers,
      config: this.config,
      hostId: this.hostId,
      voteRequestCount: this.voteRequests.size,
      voteRequestsNeeded: this.getVoteRequestsNeeded(),
      votesRegistered: Array.from(this.players.values()).filter(p => p.hasVoted && !p.isSpectator).length,
      totalPlayers: Array.from(this.players.values()).filter(p => !p.isSpectator).length,
      round: this.round,
      currentRound: this.currentRound,
      customThemeWordCount: this.totalSubmittedWords,
      abortedDueToDisconnect: this.abortedDueToDisconnect,
    };
  }

  getPlayerWord(playerId: string): { word: string; isImpostor: boolean } | null {
    const player = this.players.get(playerId);
    if (!player) return null;
    // Impostor game uses player.word; Testa game uses player.testaWord
    const word = player.word || player.testaWord;
    if (!word) return null;
    return { word, isImpostor: player.isImpostor || false };
  }

  getWordGroupId(): string | null {
    return this.currentWords?.groupId || null;
  }

  getPlayerNumber(playerId: string): number | null {
    const player = this.players.get(playerId);
    return player?.numberValue || null;
  }

  // ─── Testa Logic ─────────────────────────────

  guessTestaWord(playerId: string, guess: string): { correct: boolean, stateChanged: boolean, livesLeft?: number } {
    if (this.state !== GameState.IN_GAME) return { correct: false, stateChanged: false };
    const player = this.players.get(playerId);
    if (!player || player.hasGuessedTesta || !player.testaWord) return { correct: false, stateChanged: false };

    // Check guess (case insensitive)
    if (guess.trim().toLowerCase() === player.testaWord.toLowerCase()) {
      player.hasGuessedTesta = true;
      player.testaGuessedCorrectly = true;
      // Count only those who have already correctly guessed (before this one)
      player.testaGuessOrder = Array.from(this.players.values()).filter(p => p.testaGuessedCorrectly && p.id !== player.id).length + 1;
      
      // Sudden Death trigger: remaining unguessed players enter sudden death
      const activePlayers = Array.from(this.players.values()).filter(p => p.isConnected && !p.isSpectator);
      const unGuessed = activePlayers.filter(p => !p.hasGuessedTesta);
      unGuessed.forEach(p => { if (!p.inSuddenDeath) p.inSuddenDeath = true; });

      this.checkTestaGameOver();
      return { correct: true, stateChanged: true };
    }
    
    // Wrong guess
    let stateChanged = false;
    if (player.inSuddenDeath) {
      player.hasGuessedTesta = true;
      player.testaGuessedCorrectly = false;
      player.inSuddenDeath = false;
      stateChanged = true;
      this.checkTestaGameOver();
    } else {
      if (player.testaLivesLeft && player.testaLivesLeft > 0) {
        player.testaLivesLeft -= 1;
        stateChanged = true;
        
        if (player.testaLivesLeft === 0) {
          player.hasGuessedTesta = true; // Eliminated
          this.checkTestaGameOver();
        }
      }
    }
    
    return { correct: false, stateChanged, livesLeft: player.testaLivesLeft };
  }

  giveUpTesta(playerId: string): boolean {
    if (this.state !== GameState.IN_GAME) return false;
    const player = this.players.get(playerId);
    if (!player || player.hasGuessedTesta) return false;

    player.hasGuessedTesta = true; // Treats as done
    this.checkTestaGameOver();
    return true;
  }

  private checkTestaGameOver() {
    const activePlayers = Array.from(this.players.values()).filter(p => p.isConnected && !p.isSpectator);
    const unGuessed = activePlayers.filter(p => !p.hasGuessedTesta);
    const waitingForSuddenDeath = unGuessed.filter(p => p.inSuddenDeath);

    if (unGuessed.length === 0) {
      // Everyone is done — end the game
      this.finishTestaGame(activePlayers);
    } else if (unGuessed.length === 1 && waitingForSuddenDeath.length === 0) {
      // 1 player left who hasn't guessed and isn't in sudden death yet — put them in sudden death
      unGuessed[0].inSuddenDeath = true;
      // Don't end game yet — they still need to make their guess
    }
    // If waitingForSuddenDeath.length > 0, players are still making their sudden death guess — don't end.
  }

  private finishTestaGame(activePlayers: Player[]) {
    activePlayers.forEach(p => {
      if (p.testaGuessedCorrectly) {
        if (this.config.testaMode === 'points') {
          const order = p.testaGuessOrder || 1;
          let points = 0;
          if (order === 1) points = 100;
          else if (order === 2) points = 80;
          else if (order === 3) points = 60;
          else if (order === 4) points = 50;
          else points = Math.max(10, 50 - ((order - 4) * 10));
          p.score += points;
        } else {
          p.score += 100;
        }
        p.isWinner = true;
      } else {
        p.isWinner = false;
      }
    });
    this.stateMachine.forceState(GameState.RESULT);
  }

  // ─── Numbers Logic ─────────────────────────────

  guessNumber(playerId: string, targetId: string, guess: number): boolean {
    if (this.state !== GameState.IN_GAME) return false;
    const player = this.players.get(playerId);
    const target = this.players.get(targetId);
    
    if (!player || !target || playerId === targetId) return false;
    if (target.hasBeenDiscovered) return false;
    if (player.hasBeenDiscovered && !player.inSuddenDeath) return false;

    if (target.numberValue === guess) {
      // Correct guess!
      target.hasBeenDiscovered = true;
      target.inSuddenDeath = true; // Target enters sudden death to make a final guess
      
      if (player.inSuddenDeath) {
        player.inSuddenDeath = false; // Used their sudden death chance
      }
      
      if (!player.discoveredNumbers) player.discoveredNumbers = [];
      player.discoveredNumbers.push(targetId);
      
      // Points
      player.score += 150;
      target.score += 50;

      this.checkNumbersGameOver();
      return true;
    } else {
      // Wrong guess
      if (player.inSuddenDeath) {
        // Used sudden death chance and missed — they are fully eliminated
        player.inSuddenDeath = false;
        // player was already hasBeenDiscovered = true (set when they entered sudden death after losing all lives)
        this.checkNumbersGameOver();
      } else if (this.config.numbersMode === 'survival' && this.config.numbersLives && this.config.numbersLives > 0) {
        if (player.numbersLivesLeft !== undefined && player.numbersLivesLeft > 0) {
          player.numbersLivesLeft--;
          if (player.numbersLivesLeft <= 0) {
            // Eliminated — but give them a last sudden death guess at their targets
            player.hasBeenDiscovered = true;
            const hasTargetsLeft = Array.from(this.players.values()).some(
              other => other.id !== player.id && !other.hasBeenDiscovered
            );
            if (hasTargetsLeft) {
              player.inSuddenDeath = true; // Allow one last guess as sudden death
            } else {
              this.checkNumbersGameOver();
            }
          }
        }
      }
      return false;
    }
  }

  private checkNumbersGameOver() {
    const activePlayers = Array.from(this.players.values()).filter(p => p.isConnected && !p.isSpectator);
    
    // Revoke sudden death if there's no one left to guess
    activePlayers.forEach(p => {
      if (p.inSuddenDeath) {
        const canGuess = activePlayers.some(other => other.id !== p.id && !other.hasBeenDiscovered);
        if (!canGuess) {
          p.inSuddenDeath = false;
        }
      }
    });

    const undiscovered = activePlayers.filter(p => !p.hasBeenDiscovered);
    const hasSuddenDeath = activePlayers.some(p => p.inSuddenDeath);

    if (undiscovered.length <= 1 && !hasSuddenDeath) {
      // Game over if 1 or 0 players left undiscovered and no one is taking a last chance!
      undiscovered.forEach(p => p.isWinner = true); 
      this.stateMachine.forceState(GameState.RESULT);
    }
  }

  // ─── Helpers ─────────────────────────────

  private getImpostorCount(): number {
    return Math.max(1, Math.min(this.config.customImpostorCount, this.players.size - 1));
  }

  private getVoteRequestsNeeded(): number {
    // Pelo menos metade dos jogadores (arredondado para cima, mínimo 2)
    return Math.max(2, Math.ceil(this.players.size / 2));
  }

  private shuffleArray<T>(array: T[]): void {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
  }

  // ─── Cleanup ─────────────────────────────

  cleanup(): void {
    for (const timer of this.disconnectTimers.values()) {
      clearTimeout(timer);
    }
    this.disconnectTimers.clear();
  }
}


