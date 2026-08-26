import React, { useState } from 'react';
import { useGame } from '../../context/GameContext';
import { AvatarDisplay } from '../../components/AvatarDisplay';

export function NumbersLobby() {
  const { 
    roomState, playerId, startGame, leaveRoom, addToast, 
    updateConfig, resetScores
  } = useGame();
  
  const [copied, setCopied] = useState(false);

  if (!roomState) return null;

  const isHost = roomState.hostId === playerId || roomState.players.find(p => p.id === playerId)?.isHost === true;
  const canStart = roomState.players.length >= 2;
  const config = roomState.config;

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
      title: 'Jogo dos Números 🔢',
      text: `Entra aqui pra jogar o Jogo dos Números! Código: ${roomState.code}`,
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

  return (
    <div className="page fade-in">
      <div className="lobby-layout">
        {/* LADO ESQUERDO: Info da Sala, Código e Jogadores */}
        <div className="lobby-left">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontSize: '2.5rem' }}>🔢</span>
            <h2 style={{ fontSize: '2rem', margin: 0 }}>Sala dos Números</h2>
          </div>
          <p className="text-muted" style={{ marginBottom: '24px' }}>Tente descobrir o número dos outros antes que descubram o seu!</p>

          {/* Room Code */}
          <div className="room-code" aria-label={`Código da sala: ${roomState.code}`}>
            {roomState.code}
          </div>

          <div className="spacer-3" />

          <div style={{ display: 'flex', gap: '8px', marginBottom: '24px' }}>
            <button className="btn btn-secondary btn-sm" onClick={handleCopyCode} style={{ flex: 1 }}>
              {copied ? '✅ Copiado' : '📋 Copiar'}
            </button>
            <button className="btn btn-secondary btn-sm" onClick={handleShare} style={{ flex: 1 }}>
              📤 Compartilhar
            </button>
          </div>

          {/* Players */}
          <div className="card" style={{ marginBottom: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <span style={{ fontWeight: 600 }}>Jogadores (Mín. 2)</span>
              <span className="text-muted" style={{ fontSize: '0.875rem' }}>
                {roomState.players.length}/8
              </span>
            </div>

            <div className="player-list">
              {roomState.players.map(player => (
                <div key={player.id} className="player-item">
                  <div className={`player-dot ${player.isConnected ? '' : 'offline'}`} />
                  <span className="player-name" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <AvatarDisplay avatar={player.avatar} size="2.5rem" />
                    <span>
                      {player.name}
                      {player.isWinner && <span title="Vencedor da rodada anterior" style={{ marginLeft: '4px' }}>👑</span>}
                      <span className="text-muted" style={{ marginLeft: '8px', fontSize: '0.8rem' }}>{player.score} pts</span>
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
          <div className="progress-bar" style={{ marginBottom: '16px' }}>
            <div className="progress-fill" style={{ width: `${(roomState.players.length / 8) * 100}%` }} />
          </div>

          {/* Start / Messages */}
          {isHost ? (
            <>
              {!canStart && (
                <p className="text-muted" style={{ fontSize: '0.875rem', marginBottom: '12px', textAlign: 'center' }}>
                  ⏳ É necessário ter pelo menos 2 jogadores.
                </p>
              )}
              <button
                className="btn btn-primary btn-xl w-full"
                onClick={startGame}
                disabled={!canStart}
              >
                🚀 Sortear Números
              </button>
            </>
          ) : (
            <div className="status-badge waiting" style={{ marginBottom: '12px' }}>
              ⏳ Aguardando o host iniciar...
            </div>
          )}

          <div className="spacer-4" />

          <button className="btn btn-ghost btn-sm w-full" onClick={leaveRoom}>
            🚪 Sair da sala
          </button>
        </div>

        {/* LADO DIREITO: Configurações */}
        <div className="lobby-right">
          <div className="card w-full" style={{ marginBottom: '16px', padding: '16px', flex: 1 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <span style={{ fontWeight: 600 }}>Regras do Sorteio</span>
              {!isHost && <span className="badge" style={{ background: 'var(--bg-primary)' }}>Apenas Host edita</span>}
            </div>

            {isHost ? (
              <div className="config-panel">
                <div className="input-group">
                  <label className="input-label" style={{ margin: 0, marginBottom: '8px' }}>Intervalo de Sorteio (Ex: 1 a 100)</label>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <input
                      type="number"
                      className="input"
                      value={config.numbersMin || 1}
                      onChange={(e) => updateConfig({ numbersMin: parseInt(e.target.value) || 1 })}
                      style={{ flex: 1 }}
                      placeholder="Mín"
                    />
                    <span style={{ alignSelf: 'center' }}>-</span>
                    <input
                      type="number"
                      className="input"
                      value={config.numbersMax || 100}
                      onChange={(e) => updateConfig({ numbersMax: parseInt(e.target.value) || 1 })}
                      style={{ flex: 1 }}
                      placeholder="Máx"
                    />
                  </div>
                </div>
                
                <div className="spacer-4" />
                <button 
                  className="btn btn-ghost btn-sm w-full" 
                  onClick={() => {
                    if (window.confirm('Tem certeza que deseja zerar a pontuação de todos?')) {
                      resetScores();
                    }
                  }}
                >
                  🔄 Zerar Pontuações
                </button>
              </div>
            ) : (
              <div className="read-only-config" style={{ background: 'var(--bg-primary)', padding: '12px', borderRadius: 'var(--radius-sm)' }}>
                <p className="text-muted" style={{ margin: 0, fontSize: '0.9rem', lineHeight: '1.6' }}>
                  <strong>Intervalo:</strong> {config.numbersMin || 1} a {config.numbersMax || 100}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
