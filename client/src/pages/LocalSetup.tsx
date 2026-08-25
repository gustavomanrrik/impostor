import React, { useState } from 'react';
import { useGame, LocalGameState, LocalPlayer } from '../context/GameContext';
import { Difficulty } from '@shared/types';
import { themes as localThemes } from '@shared/themes';

export function LocalSetup() {
  const { navigate, setLocalState, themes, addToast } = useGame();
  const [playerCount, setPlayerCount] = useState(4);
  const [playerNames, setPlayerNames] = useState<string[]>(Array(8).fill(''));
  const [selectedTheme, setSelectedTheme] = useState('comida');
  const [difficulty, setDifficulty] = useState<Difficulty>(Difficulty.MEDIUM);
  const [impostorCount, setImpostorCount] = useState(1);

  const handleStart = () => {
    const names = playerNames.slice(0, playerCount).map(n => n.trim());
    if (names.some(n => !n)) {
      addToast('error', 'Preencha todos os nomes dos jogadores.');
      return;
    }

    // Check duplicates
    const unique = new Set(names.map(n => n.toLowerCase()));
    if (unique.size < names.length) {
      addToast('error', 'Nomes não podem se repetir.');
      return;
    }

    // Get theme data
    const themeData = localThemes.find(t => t.id === selectedTheme);
    if (!themeData) {
      addToast('error', 'Tema não disponível para modo local.');
      return;
    }

    // Get available pairs based on difficulty
    let availablePairs: [string, string][];
    switch (difficulty) {
      case Difficulty.EASY:
        availablePairs = themeData.pairs.easy;
        break;
      case Difficulty.MEDIUM:
        availablePairs = themeData.pairs.medium;
        break;
      case Difficulty.HARD:
        availablePairs = themeData.pairs.hard;
        break;
      default:
        availablePairs = themeData.pairs.medium;
    }

    // Select random pair
    const pair = availablePairs[Math.floor(Math.random() * availablePairs.length)];

    // Randomize normal/impostor
    const [normalWord, impostorWord] = Math.random() > 0.5 ? [pair[1], pair[0]] : [pair[0], pair[1]];

    // Select impostors
    const playerIndices = Array.from({ length: playerCount }, (_, i) => i);
    for (let i = playerIndices.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [playerIndices[i], playerIndices[j]] = [playerIndices[j], playerIndices[i]];
    }
    const impostorIndices = new Set(playerIndices.slice(0, impostorCount));

    // Create players
    const players: LocalPlayer[] = names.map((name, idx) => ({
      id: idx.toString(),
      name,
      isImpostor: impostorIndices.has(idx),
      word: impostorIndices.has(idx) ? impostorWord : normalWord,
      hasSeenWord: false,
      hasVoted: false,
    }));

    const groupId = `local-${selectedTheme}-${normalWord}-${impostorWord}`;

    setLocalState({
      phase: 'word-reveal',
      players,
      currentPlayerIndex: 0,
      config: {
        theme: selectedTheme,
        difficulty,
        impostorCount,
        themeName: themeData.name,
      },
      normalWord,
      impostorWord,
      groupId,
      votes: new Map(),
      result: null,
    });

    navigate('local-game');
  };

  const localThemeList = Object.entries(localThemes).map(([id, data]) => ({
    id,
    name: data.name,
    icon: themes.find(t => t.id === id)?.icon || '🎮',
    groupCount: data.groups.length,
  }));

  return (
    <div className="page">
      <button className="btn btn-ghost back-btn" onClick={() => navigate('home')} aria-label="Voltar">
        ← Voltar
      </button>

      <h2 className="text-gradient">Modo Local</h2>
      <p className="text-muted" style={{ marginTop: '4px' }}>Todos jogam no mesmo dispositivo</p>

      <div className="spacer-6" />

      {/* Player Count */}
      <div className="input-group">
        <label className="input-label">Número de jogadores: {playerCount}</label>
        <input
          type="range"
          min={3}
          max={8}
          value={playerCount}
          onChange={e => setPlayerCount(Number(e.target.value))}
          style={{ width: '100%', accentColor: 'var(--accent-primary)' }}
        />
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
          <span>3</span><span>8</span>
        </div>
      </div>

      <div className="spacer-4" />

      {/* Player Names */}
      <div className="input-group">
        <label className="input-label">Nomes dos jogadores</label>
        {Array.from({ length: playerCount }, (_, i) => (
          <input
            key={i}
            className="input"
            placeholder={`Jogador ${i + 1}`}
            value={playerNames[i]}
            onChange={e => {
              const newNames = [...playerNames];
              newNames[i] = e.target.value;
              setPlayerNames(newNames);
            }}
            maxLength={20}
          />
        ))}
      </div>

      <div className="spacer-6" />

      {/* Theme */}
      <div className="input-group">
        <label className="input-label">Tema</label>
        <div className="theme-grid">
          {localThemeList.map(theme => (
            <div
              key={theme.id}
              className={`theme-card ${selectedTheme === theme.id ? 'selected' : ''}`}
              onClick={() => setSelectedTheme(theme.id)}
            >
              <span className="theme-icon">{theme.icon}</span>
              <span className="theme-name">{theme.name}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="spacer-6" />

      {/* Difficulty */}
      <div className="input-group">
        <label className="input-label">Dificuldade</label>
        <div className="difficulty-selector">
          {[
            { value: Difficulty.EASY, label: '😊 Fácil' },
            { value: Difficulty.MEDIUM, label: '🤔 Médio' },
            { value: Difficulty.HARD, label: '😈 Difícil' },
          ].map(d => (
            <div
              key={d.value}
              className={`difficulty-option ${difficulty === d.value ? 'selected' : ''}`}
              onClick={() => setDifficulty(d.value)}
            >
              {d.label}
            </div>
          ))}
        </div>
      </div>

      <div className="spacer-4" />

      {/* Impostor Count */}
      <div className="input-group">
        <label className="input-label">Impostores</label>
        <div className="difficulty-selector">
          {[1, 2].map(n => (
            <div
              key={n}
              className={`difficulty-option ${impostorCount === n ? 'selected' : ''}`}
              onClick={() => {
                if (n < playerCount) setImpostorCount(n);
              }}
              style={{ opacity: n >= playerCount ? 0.4 : 1 }}
            >
              {n} impostor{n > 1 ? 'es' : ''}
            </div>
          ))}
        </div>
      </div>

      <div className="spacer-8" />

      <button className="btn btn-primary btn-xl" onClick={handleStart}>
        🎮 Começar
      </button>
    </div>
  );
}
