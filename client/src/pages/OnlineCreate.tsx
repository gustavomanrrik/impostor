import React, { useState } from 'react';
import { useGame } from '../context/GameContext';
import { getSavedPlayerName } from '../services/localStorage';
import { Difficulty, ImpostorMode } from '@shared/types';

export function OnlineCreate() {
  const { navigate, createRoom, themes } = useGame();
  const [playerName, setPlayerName] = useState(getSavedPlayerName());
  const [selectedTheme, setSelectedTheme] = useState('relacionamentos');
  const [difficulty, setDifficulty] = useState<Difficulty>(Difficulty.MEDIUM);
  const [impostorMode, setImpostorMode] = useState<ImpostorMode>(ImpostorMode.AUTO);
  const [customImpostorCount, setCustomImpostorCount] = useState(1);
  const [showCustomTheme, setShowCustomTheme] = useState(false);
  const [useFlatMode, setUseFlatMode] = useState(false);
  const [customWords, setCustomWords] = useState('');
  const [customThemeName, setCustomThemeName] = useState('');

  const handleCreate = () => {
    if (!playerName.trim()) return;

    const config = {
      theme: showCustomTheme ? 'custom' : selectedTheme,
      difficulty,
      impostorMode,
      customImpostorCount,
      discussionTimeLimit: 0,
      showImpostorCount: true,
      soundEnabled: true,
      useFlatMode: !showCustomTheme && useFlatMode, // Só aplica se não for tema colaborativo
    };

    // Para o tema colaborativo, o tema será construído no lobby
    // Não enviamos um customTheme inicial
    createRoom(playerName.trim(), config);
  };

  return (
    <div className="page">
      <button className="btn btn-ghost back-btn" onClick={() => navigate('home')} aria-label="Voltar">
        ← Voltar
      </button>

      <h2 className="text-gradient">Criar Sala</h2>
      <p className="text-muted" style={{ marginTop: '4px' }}>Configure e convide seus amigos</p>

      <div className="spacer-6" />

      {/* Player Name */}
      <div className="input-group">
        <label className="input-label" htmlFor="create-name">Seu nome</label>
        <input
          id="create-name"
          className="input"
          type="text"
          placeholder="Digite seu nome..."
          value={playerName}
          onChange={e => setPlayerName(e.target.value)}
          maxLength={20}
          autoComplete="off"
        />
      </div>

      <div className="spacer-6" />

      {/* Theme Selection */}
      <div className="input-group">
        <label className="input-label">Tema</label>
        <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
          <button
            className={`btn btn-sm ${!showCustomTheme ? 'btn-primary' : 'btn-ghost'}`}
            onClick={() => setShowCustomTheme(false)}
          >
            Temas prontos
          </button>
          <button
            className={`btn btn-sm ${showCustomTheme ? 'btn-primary' : 'btn-ghost'}`}
            onClick={() => setShowCustomTheme(true)}
          >
            Colaborativo (Lobby)
          </button>
        </div>

        {!showCustomTheme ? (
          <div className="theme-grid">
            {themes.map(theme => (
              <div
                key={theme.id}
                className={`theme-card ${selectedTheme === theme.id ? 'selected' : ''}`}
                onClick={() => setSelectedTheme(theme.id)}
                role="radio"
                aria-checked={selectedTheme === theme.id}
                tabIndex={0}
                onKeyDown={e => e.key === 'Enter' && setSelectedTheme(theme.id)}
              >
                <span className="theme-icon">{theme.icon}</span>
                <span className="theme-name">{theme.name}</span>
                <span className="theme-count">{theme.groupCount} grupos</span>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col gap-3" style={{ padding: '16px', background: 'var(--bg-glass)', borderRadius: 'var(--radius-md)', textAlign: 'center' }}>
            <span style={{ fontSize: '2rem' }}>🤝</span>
            <p className="text-primary" style={{ fontWeight: 600 }}>Tema Colaborativo</p>
            <p className="text-muted" style={{ fontSize: '0.9rem' }}>
              Ao criar a sala, todos os jogadores poderão enviar palavras secretamente para formar o tema da rodada no Lobby!
            </p>
          </div>
        )}
      </div>

      <div className="spacer-6" />

      {/* Difficulty & Flat Mode */}
      {!showCustomTheme && (
        <div className="input-group">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <label className="input-label" style={{ margin: 0 }}>Modo de Jogo</label>
          </div>
          
          <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
            <button
              className={`btn btn-sm ${!useFlatMode ? 'btn-primary' : 'btn-ghost'}`}
              onClick={() => setUseFlatMode(false)}
              style={{ flex: 1 }}
            >
              🎭 Pares (Padrão)
            </button>
            <button
              className={`btn btn-sm ${useFlatMode ? 'btn-primary' : 'btn-ghost'}`}
              onClick={() => setUseFlatMode(true)}
              style={{ flex: 1 }}
            >
              🔀 Palavras Soltas
            </button>
          </div>

          {!useFlatMode && (
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
              role="radio"
              aria-checked={difficulty === d.value}
              tabIndex={0}
              onKeyDown={e => e.key === 'Enter' && setDifficulty(d.value)}
            >
              {d.label}
            </div>
            ))}
            </div>
          )}
          
          {useFlatMode && (
            <div style={{ padding: '12px', background: 'var(--bg-glass)', borderRadius: 'var(--radius-sm)' }}>
              <p className="text-muted" style={{ fontSize: '0.85rem', textAlign: 'center', margin: 0 }}>
                O jogo irá ignorar a dificuldade e sorteará duas palavras aleatórias do tema inteiro. Nenhuma rodada será igual à outra!
              </p>
            </div>
          )}
        </div>
      )}

      <div className="spacer-6" />

      {/* Impostor Mode */}
      <div className="input-group">
        <label className="input-label">Impostores</label>
        <div className="difficulty-selector">
          <div
            className={`difficulty-option ${impostorMode === ImpostorMode.AUTO ? 'selected' : ''}`}
            onClick={() => setImpostorMode(ImpostorMode.AUTO)}
            role="radio"
            aria-checked={impostorMode === ImpostorMode.AUTO}
            tabIndex={0}
            onKeyDown={e => e.key === 'Enter' && setImpostorMode(ImpostorMode.AUTO)}
          >
            🤖 Automático
          </div>
          <div
            className={`difficulty-option ${impostorMode === ImpostorMode.CUSTOM ? 'selected' : ''}`}
            onClick={() => setImpostorMode(ImpostorMode.CUSTOM)}
            role="radio"
            aria-checked={impostorMode === ImpostorMode.CUSTOM}
            tabIndex={0}
            onKeyDown={e => e.key === 'Enter' && setImpostorMode(ImpostorMode.CUSTOM)}
          >
            ✏️ Personalizado
          </div>
        </div>

        {impostorMode === ImpostorMode.CUSTOM && (
          <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
            {[1, 2].map(n => (
              <div
                key={n}
                className={`difficulty-option ${customImpostorCount === n ? 'selected' : ''}`}
                onClick={() => setCustomImpostorCount(n)}
                style={{ flex: 1 }}
              >
                {n} impostor{n > 1 ? 'es' : ''}
              </div>
            ))}
          </div>
        )}

        {impostorMode === ImpostorMode.AUTO && (
          <p className="text-muted" style={{ fontSize: '0.8rem', marginTop: '4px' }}>
            3-4 jogadores: 1 impostor · 5-8 jogadores: 2 impostores
          </p>
        )}
      </div>

      <div className="spacer-8" />

      {/* Create Button */}
      <button
        className="btn btn-primary btn-xl"
        onClick={handleCreate}
        disabled={!playerName.trim()}
        id="btn-create-room"
      >
        🎮 Criar Sala
      </button>
    </div>
  );
}
