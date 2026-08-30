import React, { useState, useEffect } from 'react';
import { useGame } from '../../context/GameContext';
import { ThemeBuilderModal } from '../../components/ThemeBuilderModal';
import { AvatarDisplay } from '../../components/AvatarDisplay';
import { KickPlayerButton } from '../../components/KickPlayerButton';
import { Difficulty, ImpostorMode } from '@shared/types';

export function ImpostorLobby() {
  const { 
    roomState, playerId, startGame, leaveRoom, addToast, 
    themes, addCustomWord, removeCustomWord, customThemeWords,
    updateConfig, resetScores, navigate, kickPlayer
  } = useGame();
  
  const [copied, setCopied] = useState(false);
  const [newWord, setNewWord] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [show18Modal, setShow18Modal] = useState(false);
  const [pendingTheme, setPendingTheme] = useState<string | null>(null);
  
  const hasConfirmed18 = localStorage.getItem('impostor_18plus_confirmed') === 'true';

  useEffect(() => {
    if (roomState?.config.theme === 'adulto' && !hasConfirmed18) {
      setShow18Modal(true);
    } else if (roomState?.config.theme !== 'adulto' && show18Modal && !pendingTheme) {
      setShow18Modal(false);
    }
  }, [roomState?.config.theme, hasConfirmed18]);

  if (!roomState) return null;

  const isHost = roomState.hostId === playerId || roomState.players.find(p => p.id === playerId)?.isHost === true;
  const canStart = roomState.players.length >= 3;
  const selectedTheme = themes.find(t => t.id === roomState.config.theme);
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
    try {
      await navigator.clipboard.writeText(url);
      addToast('success', 'Link copiado!');
    } catch { /* user cancelled */ }
  };

  const handleAddWord = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWord.trim()) return;
    addCustomWord(newWord.trim());
    setNewWord('');
    addToast('success', 'Palavra enviada!');
  };

  const confirm18AndApply = () => {
    localStorage.setItem('impostor_18plus_confirmed', 'true');
    setShow18Modal(false);
    if (pendingTheme && isHost) {
      updateConfig({ theme: pendingTheme });
      setPendingTheme(null);
    }
  };

  const reject18 = () => {
    setShow18Modal(false);
    leaveRoom();
    navigate('home');
  };

  const handleThemeSelect = (themeId: string) => {
    if (!isHost) return;
    const themeObj = themes.find(t => t.id === themeId);
    if (themeObj?.is18Plus && !hasConfirmed18) {
      setPendingTheme(themeId);
      setShow18Modal(true);
    } else {
      updateConfig({ theme: themeId });
    }
  };

  return (
    <div className="page fade-in">
      {/* GLOBAL 18+ MODAL */}
      {show18Modal && (
        <div className="modal-overlay" style={{ zIndex: 9999 }}>
          <div className="modal-content text-center" style={{ border: '3px solid var(--text-primary)' }}>
            <h2 style={{ fontSize: '3rem', margin: 0 }}>🔞</h2>
            <h3 style={{ marginTop: '8px' }}>Conteúdo Sensível</h3>
            <p className="text-muted" style={{ margin: '16px 0' }}>
              Este tema contém palavras impróprias para menores. Você tem 18 anos ou mais?
            </p>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button className="btn btn-ghost" style={{ flex: 1 }} onClick={reject18}>
                Não, sair
              </button>
              <button className="btn btn-primary" style={{ flex: 1 }} onClick={confirm18AndApply}>
                Sim, tenho +18
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="lobby-layout">
        {/* LADO ESQUERDO: Info da Sala, Código e Jogadores */}
        <div className="lobby-left">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontSize: '2.5rem' }}>🎭</span>
            <h2 style={{ fontSize: '2rem', margin: 0 }}>Sala do Impostor</h2>
          </div>
          <p className="text-muted" style={{ marginBottom: '16px', fontSize: '0.9rem' }}>Descubra quem está com a palavra errada!</p>

          {/* Room Code */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
            <div className="room-code" aria-label={`Código da sala: ${roomState.code}`} style={{ fontSize: '1.5rem', padding: '4px 12px', margin: 0, flex: 1, textAlign: 'center' }}>
              {roomState.code}
            </div>
            <button className="btn btn-secondary btn-sm" onClick={handleCopyCode} style={{ padding: '4px 12px' }}>
              {copied ? '✅' : '📋'}
            </button>
            <button className="btn btn-secondary btn-sm" onClick={handleShare} style={{ padding: '4px 12px' }}>
              📤
            </button>
          </div>

          {/* Players */}
          <div className="card" style={{ marginBottom: '12px', padding: '12px 16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <span style={{ fontWeight: 600 }}>Suspeitos (Jogadores)</span>
              <span className="text-muted" style={{ fontSize: '0.875rem' }}>
                {roomState.players.length}/8
              </span>
            </div>

            <div className="player-list">
              {roomState.players.map(player => (
                <div key={player.id} className="player-item">
                  <div className={`player-dot ${player.isConnected ? '' : 'offline'}`} />
                  <span className="player-name" style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0, flex: 1 }}>
                    <AvatarDisplay avatar={player.avatar} size="2.5rem" />
                    <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', flexShrink: 1 }}>
                      {player.name}
                      {player.id === playerId && ' (você)'}
                    </span>
                    {player.isWinner && <span title="Vencedor da rodada anterior" style={{ flexShrink: 0 }}>👑</span>}
                    <span className="text-muted" style={{ fontSize: '0.8rem', flexShrink: 0, whiteSpace: 'nowrap' }}>🏆 {player.score} pts</span>
                  </span>
                  {player.isHost && <span className="player-badge">HOST</span>}
                  {isHost && player.id !== playerId && (
                    <KickPlayerButton playerId={player.id} playerName={player.name} />
                  )}
                  {!player.isConnected && (
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginLeft: isHost && player.id !== playerId ? '8px' : 'auto' }}>offline</span>
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
              {(!canStart || (config.theme === 'custom' && roomState.customThemeWordCount < 4)) && (
                <p className="text-muted" style={{ fontSize: '0.875rem', marginBottom: '12px', textAlign: 'center' }}>
                  ⏳ {roomState.players.length < 3 ? 'É necessário ter pelo menos 3 jogadores.' : 'São necessárias pelo menos 4 palavras no tema.'}
                </p>
              )}
              <button
                className="btn btn-primary btn-xl w-full"
                onClick={startGame}
                disabled={!canStart || (config.theme === 'custom' && roomState.customThemeWordCount < 4)}
              >
                🚀 Iniciar Investigação
              </button>
            </>
          ) : (
            <div className="status-badge waiting" style={{ marginBottom: '12px' }}>
              ⏳ Aguardando o host iniciar...
            </div>
          )}

        </div>

        {/* LADO DIREITO: Configurações */}
        <div className="lobby-right">
          <div className="card w-full" style={{ marginBottom: '12px', padding: '16px', flex: 1, display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: '8px', marginBottom: '12px' }}>
              <span style={{ fontWeight: 600 }}>Configurações do Impostor</span>
              {!isHost && <span className="badge" style={{ background: 'var(--bg-glass-strong)' }}>Apenas Host</span>}
            </div>

            {isHost ? (
              <div className="config-panel">
                <div className="input-group">
                  <label className="input-label" style={{ margin: 0, marginBottom: '8px' }}>Rodadas (Partida)</label>
                  <select 
                    className="input input-sm" 
                    value={config.totalRounds || 3} 
                    onChange={e => updateConfig({ totalRounds: parseInt(e.target.value) })}
                    style={{ marginBottom: '12px' }}
                  >
                    <option value={1}>1 Rodada</option>
                    <option value={3}>3 Rodadas</option>
                    <option value={5}>5 Rodadas</option>
                    <option value={10}>10 Rodadas</option>
                  </select>
                </div>

                <div className="input-group">
                  <label className="input-label">Tema de Palavras</label>
                  <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                    <button 
                      className="btn btn-secondary btn-icon" 
                      onClick={() => document.getElementById('theme-grid-container')?.scrollBy({ left: -200, behavior: 'smooth' })}
                      style={{ position: 'absolute', left: -24, zIndex: 10 }}
                      title="Anterior"
                    >
                      ◀
                    </button>
                    <div className="theme-grid" id="theme-grid-container" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                      {themes.map(theme => (
                        <div
                          key={theme.id}
                          className={`theme-card ${config.theme === theme.id ? 'selected' : ''}`}
                          onClick={() => handleThemeSelect(theme.id)}
                          style={theme.is18Plus && !hasConfirmed18 ? { filter: 'blur(3px)' } : {}}
                        >
                          <span className="theme-icon">{theme.icon}</span>
                          <span className="theme-name">{theme.name}</span>
                          <span className="theme-count">{theme.groupCount} grupos</span>
                        </div>
                      ))}
                      
                      <div
                        className={`theme-card ${config.theme === 'custom' ? 'selected' : ''}`}
                        onClick={() => updateConfig({ theme: 'custom' })}
                      >
                        <span className="theme-icon">🤝</span>
                        <span className="theme-name">Colaborativo</span>
                        <span className="theme-count">Envio Livre</span>
                      </div>
                    </div>
                    <button 
                      className="btn btn-secondary btn-icon" 
                      onClick={() => document.getElementById('theme-grid-container')?.scrollBy({ left: 200, behavior: 'smooth' })}
                      style={{ position: 'absolute', right: -24, zIndex: 10 }}
                      title="Próximo"
                    >
                      ▶
                    </button>
                  </div>
                </div>

                {config.theme !== 'custom' && (
                  <>
                    <div className="spacer-4" />
                    <div className="input-group">
                      <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
                        <button
                          className={`btn btn-sm ${!config.useFlatMode ? 'btn-primary' : 'btn-ghost'}`}
                          onClick={() => updateConfig({ useFlatMode: false })}
                          style={{ flex: 1 }}
                        >
                          🎭 Pares
                        </button>
                        <button
                          className={`btn btn-sm ${config.useFlatMode ? 'btn-primary' : 'btn-ghost'}`}
                          onClick={() => updateConfig({ useFlatMode: true })}
                          style={{ flex: 1 }}
                        >
                          🔀 Palavras Soltas
                        </button>
                      </div>
                      
                      <div className="difficulty-selector">
                        {[
                          { value: Difficulty.EASY, label: '😊 Fácil' },
                          { value: Difficulty.MEDIUM, label: '🤔 Médio' },
                          { value: Difficulty.HARD, label: '😈 Difícil' },
                        ].map(d => (
                          <div
                            key={d.value}
                            className={`difficulty-option ${config.difficulty === d.value ? 'selected' : ''}`}
                            onClick={() => updateConfig({ difficulty: d.value })}
                          >
                            {d.label}
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                )}

                <div className="spacer-4" />
                <div className="input-group">
                  <label className="input-label" style={{ margin: 0, marginBottom: '8px' }}>Quantos Impostores?</label>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    {[1, 2, 3].map(n => (
                      <div
                        key={n}
                        className={`difficulty-option ${config.customImpostorCount === n ? 'selected' : ''}`}
                        onClick={() => updateConfig({ customImpostorCount: n, impostorMode: ImpostorMode.CUSTOM })}
                        style={{ flex: 1 }}
                      >
                        {n}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="spacer-4" />
                <div 
                  className="input-group" 
                  onClick={() => updateConfig({ impostorNoWord: !config.impostorNoWord })}
                  style={{ 
                    display: 'flex',
                    flexDirection: 'row',
                    alignItems: 'center', 
                    justifyContent: 'center',
                    gap: '12px', 
                    cursor: 'pointer',
                    userSelect: 'none'
                  }}
                >
                  <div style={{
                    width: '24px',
                    height: '24px',
                    border: '3px solid var(--text-primary)',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    background: 'var(--bg-primary)',
                    fontSize: '1.2rem',
                    fontWeight: 900,
                    lineHeight: 1,
                  }}>
                    {config.impostorNoWord && 'X'}
                  </div>
                  <span style={{ fontSize: '1.1rem', fontWeight: 600 }}>
                    Impostor Sem Palavra (Só recebe o tema)
                  </span>
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
              <div className="read-only-config" style={{ background: 'var(--bg-glass)', padding: '12px', borderRadius: 'var(--radius-sm)' }}>
                <p className="text-muted" style={{ margin: 0, fontSize: '0.9rem', lineHeight: '1.6' }}>
                  <strong>Partida:</strong> {config.totalRounds || 3} rodadas<br/>
                  <strong>Tema:</strong> {config.theme === 'custom' ? 'Colaborativo' : selectedTheme?.name} {selectedTheme?.is18Plus && '🔞'}<br/>
                  {config.theme !== 'custom' && (
                    <>
                      <strong>Modo:</strong> {config.useFlatMode ? 'Palavras Soltas' : 'Pares'}<br/>
                      <strong>Dificuldade:</strong> {config.difficulty === Difficulty.EASY ? 'Fácil' : config.difficulty === Difficulty.MEDIUM ? 'Médio' : 'Difícil'}<br/>
                    </>
                  )}
                  <strong>Impostores:</strong> {config.customImpostorCount}<br/>
                  <strong>Sem Palavra:</strong> {config.impostorNoWord ? 'Sim' : 'Não'}
                </p>
              </div>
            )}
          </div>

          {/* Theme Collaboration info */}
          {config.theme === 'custom' && (
            <div className="card w-full" style={{ marginBottom: '16px', textAlign: 'center' }}>
              <h3 style={{ marginBottom: '8px' }}>🤝 Tema Colaborativo</h3>
              <p className="text-muted" style={{ fontSize: '0.9rem', marginBottom: '16px' }}>
                Envie palavras para o sorteio. Ninguém verá o que você enviou.
              </p>
              
              <form onSubmit={handleAddWord} style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
                <input 
                  type="text"
                  className="input"
                  placeholder="Ex: Macaco..."
                  value={newWord}
                  onChange={e => setNewWord(e.target.value)}
                  style={{ flex: 1, height: '48px' }}
                />
                <button type="submit" className="btn btn-primary" style={{ height: '48px' }} disabled={!newWord.trim()}>
                  Enviar
                </button>
              </form>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div className="status-badge ready">
                  {roomState.customThemeWordCount} palavras na urna
                </div>
                {isHost && (
                  <button className="btn btn-ghost btn-sm" onClick={() => setIsModalOpen(true)}>
                    ⚙️ Ver palavras
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

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
