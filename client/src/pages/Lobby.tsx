import React, { useState } from 'react';
import { useGame } from '../context/GameContext';
import { ThemeBuilderModal } from '../components/ThemeBuilderModal';

export function Lobby() {
  const { roomState, playerId, startGame, leaveRoom, addToast, themes, addCustomWord, removeCustomWord, customThemeWords } = useGame();
  const [copied, setCopied] = useState(false);
  const [newWord, setNewWord] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  if (!roomState) return null;

  const isHost = roomState.hostId === playerId;
  const canStart = roomState.players.length >= 3;

  const selectedTheme = themes.find(t => t.id === roomState.config.theme);

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(roomState.code);
      setCopied(true);
      addToast('success', 'Código copiado!');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      addToast('error', 'Falha ao copiar.');
    }
  };

  const handleShare = async () => {
    const url = `${window.location.origin}?room=${roomState.code}`;
    const shareData = {
      title: 'Impostor 🎭',
      text: `Entre na minha sala do Impostor! Código: ${roomState.code}`,
      url,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(`${shareData.text}\n${url}`);
        addToast('success', 'Link copiado!');
      }
    } catch { /* user cancelled */ }
  };

  const handleAddWord = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWord.trim()) return;
    addCustomWord(newWord.trim());
    setNewWord('');
    addToast('success', 'Palavra enviada!');
  };

  return (
    <div className="page">
      <h2>Sala</h2>
      <div className="spacer-3" />

      {/* Room Code */}
      <div className="room-code" aria-label={`Código da sala: ${roomState.code}`}>
        {roomState.code}
      </div>

      <div className="spacer-3" />

      <div style={{ display: 'flex', gap: '8px' }}>
        <button className="btn btn-secondary btn-sm" onClick={handleCopyCode} id="btn-copy-code">
          {copied ? '✅ Copiado' : '📋 Copiar código'}
        </button>
        <button className="btn btn-secondary btn-sm" onClick={handleShare} id="btn-share">
          📤 Compartilhar
        </button>
      </div>

      <div className="spacer-6" />

      {/* Theme info */}
      {roomState.config.theme === 'custom' ? (
        <div className="card" style={{ marginBottom: '16px', textAlign: 'center' }}>
          <h3 className="text-primary" style={{ marginBottom: '8px' }}>🤝 Tema Colaborativo</h3>
          <p className="text-muted" style={{ fontSize: '0.9rem', marginBottom: '16px' }}>
            Envie palavras para compor o tema desta partida. Ninguém verá o que você enviou.
          </p>
          
          <form onSubmit={handleAddWord} style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
            <input 
              type="text"
              className="input"
              placeholder="Digite uma palavra..."
              value={newWord}
              onChange={e => setNewWord(e.target.value)}
              style={{ flex: 1 }}
            />
            <button type="submit" className="btn btn-primary btn-sm" disabled={!newWord.trim()}>
              Enviar
            </button>
          </form>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div className="status-badge ready">
              {roomState.customThemeWordCount} palavras enviadas
            </div>
            {isHost && (
              <button className="btn btn-ghost btn-sm" onClick={() => setIsModalOpen(true)}>
                ⚙️ Moderar
              </button>
            )}
          </div>
        </div>
      ) : selectedTheme && (
        <div className="status-badge ready" style={{ marginBottom: '12px' }}>
          {selectedTheme.icon} {selectedTheme.name}
        </div>
      )}

      {/* Players */}
      <div className="card" style={{ marginBottom: '16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <span style={{ fontWeight: 600 }}>Jogadores</span>
          <span className="text-muted" style={{ fontSize: '0.875rem' }}>
            {roomState.players.length}/8
          </span>
        </div>

        <div className="player-list">
          {roomState.players.map(player => (
            <div key={player.id} className="player-item">
              <div className={`player-dot ${player.isConnected ? '' : 'offline'}`} />
              <span className="player-name" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '1.2rem' }}>{player.avatar || '👤'}</span>
                <span>
                  {player.name}
                  {player.id === playerId && ' (você)'}
                </span>
              </span>
              {player.isHost && <span className="player-badge">HOST</span>}
              {!player.isConnected && (
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>offline</span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Progress bar */}
      <div className="progress-bar" style={{ marginBottom: '12px' }}>
        <div className="progress-fill" style={{ width: `${(roomState.players.length / 8) * 100}%` }} />
      </div>

      {/* Start / Messages */}
      {isHost ? (
        <>
          {(!canStart || (roomState.config.theme === 'custom' && roomState.customThemeWordCount < 4)) && (
            <p className="text-muted" style={{ fontSize: '0.875rem', marginBottom: '12px', textAlign: 'center' }}>
              ⏳ {roomState.players.length < 3 ? 'É necessário ter pelo menos 3 jogadores.' : 'São necessárias pelo menos 4 palavras no tema.'}
            </p>
          )}
          <button
            className="btn btn-primary btn-xl"
            onClick={startGame}
            disabled={!canStart || (roomState.config.theme === 'custom' && roomState.customThemeWordCount < 4)}
            id="btn-start-game"
          >
            🚀 Iniciar Jogo
          </button>
        </>
      ) : (
        <div className="status-badge waiting" style={{ marginBottom: '12px' }}>
          ⏳ Aguardando o host iniciar...
        </div>
      )}

      <div className="spacer-4" />

      <button className="btn btn-ghost btn-sm" onClick={leaveRoom} id="btn-leave">
        🚪 Sair da sala
      </button>

      {isModalOpen && isHost && (
        <ThemeBuilderModal 
          words={customThemeWords} 
          onClose={() => setIsModalOpen(false)}
          onRemoveWord={removeCustomWord}
        />
      )}
    </div>
  );
}
