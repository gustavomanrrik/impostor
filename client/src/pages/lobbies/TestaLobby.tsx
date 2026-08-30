import React, { useState, useEffect } from 'react';
import { useGame } from '../../context/GameContext';
import { ThemeBuilderModal } from '../../components/ThemeBuilderModal';
import { AvatarDisplay } from '../../components/AvatarDisplay';
import { Difficulty } from '@shared/types';

export function TestaLobby() {
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
  const canStart = roomState.players.length >= 2;
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
            <span style={{ fontSize: '2.5rem' }}>🧠</span>
            <h2 style={{ fontSize: '2rem', margin: 0 }}>Jogo da Testa</h2>
          </div>
          <p className="text-muted" style={{ marginBottom: '24px' }}>Adivinhe qual palavra colaram na sua testa!</p>

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
              <span style={{ fontWeight: 600 }}>Jogadores</span>
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
                    <span className="text-muted" style={{ fontSize: '0.8rem', flexShrink: 0 }}>{player.score} pts</span>
                  </span>
                  {player.isHost && <span className="player-badge">HOST</span>}
                  {isHost && player.id !== playerId && (
                    <button className="btn btn-ghost btn-sm" onClick={() => kickPlayer(player.id)} title="Expulsar jogador" style={{ padding: '0 8px', marginLeft: 'auto' }}>
                      Expulsar
                    </button>
                  )}
                  {!player.isConnected && (
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginLeft: isHost && player.id !== playerId ? '8px' : 'auto' }}>offline</span>
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
              {(!canStart || (config.theme === 'custom' && roomState.customThemeWordCount < 4)) && (
                <p className="text-muted" style={{ fontSize: '0.875rem', marginBottom: '12px', textAlign: 'center' }}>
                  ⏳ {roomState.players.length < 2 ? 'É necessário ter pelo menos 2 jogadores.' : 'São necessárias pelo menos 4 palavras no tema.'}
                </p>
              )}
              <button
                className="btn btn-primary btn-xl w-full"
                onClick={startGame}
                disabled={!canStart || (config.theme === 'custom' && roomState.customThemeWordCount < 4)}
              >
                🚀 Distribuir Palavras
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
              <span style={{ fontWeight: 600 }}>Sobre o Jogo</span>
              {!isHost && <span className="badge" style={{ background: 'var(--bg-primary)' }}>Apenas Host edita</span>}
            </div>

            {isHost ? (
              <div className="config-panel">
                <div className="input-group">
                  <label className="input-label" style={{ margin: 0, marginBottom: '8px' }}>Rodadas (Partida)</label>
                  <select 
                    className="input" 
                    value={config.totalRounds || 3} 
                    onChange={e => updateConfig({ totalRounds: parseInt(e.target.value) })}
                    style={{ marginBottom: '16px' }}
                  >
                    <option value={1}>1 Rodada</option>
                    <option value={3}>3 Rodadas</option>
                    <option value={5}>5 Rodadas</option>
                    <option value={10}>10 Rodadas</option>
                  </select>
                </div>

                <div className="input-group">
                  <label className="input-label">O que vai ter escrito na testa?</label>
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
                        <span className="theme-name">Inventado</span>
                        <span className="theme-count">Pela Galera</span>
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

                <div className="spacer-4" />
                <div className="input-group">
                  <label className="input-label" style={{ margin: 0, marginBottom: '8px' }}>Dificuldade das Palavras</label>
                  <div className="difficulty-selector">
                    {[
                      { value: Difficulty.EASY, label: '😃 Fácil' },
                      { value: Difficulty.MEDIUM, label: '🤔 Médio' },
                      { value: Difficulty.HARD, label: '🤯 Difícil' },
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

                <div className="spacer-4" />
                <div className="input-group">
                  <label className="input-label" style={{ margin: 0, marginBottom: '8px' }}>Modo de Jogo</label>
                  <div className="difficulty-selector">
                    {[
                      { value: 'points', label: '🏆 Modo Pontos' },
                      { value: 'survival', label: '❤️ Sobrevivência' },
                    ].map(d => (
                      <div
                        key={d.value}
                        className={`difficulty-option ${config.testaMode === d.value || (config.testaMode === undefined && d.value === 'points') ? 'selected' : ''}`}
                        onClick={() => updateConfig({ testaMode: d.value as any, testaLives: d.value === 'points' ? 0 : 3 })}
                      >
                        {d.label}
                      </div>
                    ))}
                  </div>
                </div>

                {config.testaMode === 'survival' && (
                  <>
                    <div className="spacer-4" />
                    <div className="input-group">
                      <label className="input-label" style={{ margin: 0, marginBottom: '8px' }}>Corações (Vidas)</label>
                      <div className="difficulty-selector">
                        {[
                          { value: 3, label: '3 Vidas' },
                          { value: 5, label: '5 Vidas' },
                          { value: 10, label: '10 Vidas' },
                        ].map(d => (
                          <div
                            key={d.value}
                            className={`difficulty-option ${config.testaLives === d.value ? 'selected' : ''}`}
                            onClick={() => updateConfig({ testaLives: d.value })}
                          >
                            {d.label}
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                )}

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
                      <strong>Partida:</strong> {config.totalRounds || 3} rodadas<br/>
                      <strong>Tema selecionado:</strong> {config.theme === 'custom' ? 'Inventado pela Galera' : selectedTheme?.name} {selectedTheme?.is18Plus && '🔞'}<br/>
                    {config.theme !== 'custom' && (
                      <><strong>Dificuldade:</strong> {config.difficulty === Difficulty.EASY ? 'Fácil' : config.difficulty === Difficulty.MEDIUM ? 'Médio' : 'Difícil'}<br/></>
                    )}
                    <strong>Modo de Jogo:</strong> {config.testaMode === 'survival' ? '❤️ Sobrevivência' : '🏆 Modo Pontos'}<br/>
                    {config.testaMode === 'survival' && (
                      <><strong>Corações:</strong> {config.testaLives === 0 || config.testaLives === undefined ? 'Infinito' : `${config.testaLives} Vidas`}<br/></>
                    )}
                  </p>
                </div>
            )}
          </div>

          {/* Theme Collaboration info */}
          {config.theme === 'custom' && (
            <div className="card w-full" style={{ marginBottom: '16px', textAlign: 'center' }}>
              <h3 style={{ marginBottom: '8px' }}>🤝 Palavras da Galera</h3>
              <p className="text-muted" style={{ fontSize: '0.9rem', marginBottom: '16px' }}>
                Escreva palavras secretas para ir pra testa de alguém. (Ninguém vai saber que foi você!)
              </p>
              
              <form onSubmit={handleAddWord} style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
                <input 
                  type="text"
                  className="input"
                  placeholder="Ex: Neymar..."
                  value={newWord}
                  onChange={e => setNewWord(e.target.value)}
                  style={{ flex: 1, height: '48px' }}
                />
                <button type="submit" className="btn btn-primary" style={{ height: '48px' }} disabled={!newWord.trim()}>
                  Mandar
                </button>
              </form>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div className="status-badge ready">
                  {roomState.customThemeWordCount} no saco de palavras
                </div>
                {isHost && (
                  <button className="btn btn-ghost btn-sm" onClick={() => setIsModalOpen(true)}>
                    ⚙️ Espiar palavras
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
