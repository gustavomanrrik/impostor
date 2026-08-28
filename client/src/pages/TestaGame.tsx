import React, { useState } from 'react';
import { useGame } from '../context/GameContext';
import { GameState } from '@shared/types';
import { AvatarDisplay } from '../components/AvatarDisplay';
import { VoteSkipButton } from '../components/VoteSkipButton';
import { KickPlayerButton } from '../components/KickPlayerButton';


export function TestaGame() {
  const { roomState, playerId, nextRound, playAgain, leaveRoom, addToast, guessTesta, giveUpTesta, themes } = useGame();
  const [guess, setGuess] = useState('');
  const [personalNotes, setPersonalNotes] = useState('');
  const [isDamaged, setIsDamaged] = useState(false);

  if (!roomState) return null;

  const currentPlayer = roomState.players.find(p => p.id === playerId);
  const isHost = roomState.hostId === playerId;
  const currentTheme = themes.find(t => t.id === roomState.config.theme);

  const handleGuess = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!guess.trim()) return;
    const isCorrect = await guessTesta(guess.trim());
    if (isCorrect === false) {
      setIsDamaged(true);
      setTimeout(() => setIsDamaged(false), 500);
    }
    setGuess('');
  };

  const handleGiveUp = () => {
    if (window.confirm('Tem certeza que deseja desistir? Você poderá ver sua palavra e aguardar os outros.')) {
      giveUpTesta();
    }
  };

  if (roomState.state === GameState.IN_GAME) {
    return (
      <div className="page" style={{ position: 'relative', overflow: 'hidden', display: 'flex', flexDirection: 'column', height: '100%', padding: '16px' }}>
        
        <div style={{ position: 'absolute', top: '16px', right: '16px', zIndex: 10 }}>
          <VoteSkipButton />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
          <div className="status-badge voting" style={{ background: 'var(--text-primary)', color: 'var(--bg-primary)', margin: 0 }}>
            🧠 JOGO DA TESTA
          </div>
          <h2 className="text-center" style={{ fontSize: '1.8rem', margin: 0 }}>Quem sou eu?</h2>
          <div className="status-badge" style={{ background: 'var(--bg-glass-strong)', margin: 0 }}>
            Tema: {roomState.config.theme === 'custom' ? 'Customizado' : `${currentTheme?.icon || ''} ${currentTheme?.name || roomState.config.theme}`}
          </div>
        </div>

        {currentPlayer?.inSuddenDeath && (
          <div className="status-badge error" style={{ margin: '0 auto 16px', display: 'flex', width: 'fit-content', background: 'red', color: 'white', fontWeight: 'bold' }}>
            ⚠️ MORTE SÚBITA! VOCÊ TEM APENAS 1 PALPITE PARA SE SALVAR! ⚠️
          </div>
        )}

        {/* MAIN CONTENT AREA */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', flex: 1, minHeight: 0, width: '100%' }}>
          
          {/* MIDDLE SECTION: My Card (Left) and Notes (Right) */}
          <div style={{ display: 'flex', gap: '16px', flexShrink: 0, width: '100%' }}>
            
            {/* Left: Meu Cartão */}
            <div style={{ flex: '0 0 350px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {currentPlayer?.hasGuessedTesta ? (
                <div className="card text-center" style={{ border: '4px dashed var(--text-primary)', padding: '16px', margin: 0, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                  <h3 style={{ fontSize: '1.2rem', textTransform: 'uppercase' }}>A palavra na sua testa era:</h3>
                  <div style={{ 
                    margin: '16px auto', 
                    fontSize: '2.5rem', 
                    fontFamily: 'var(--font-display)',
                    fontWeight: 900,
                    background: '#fff9c4',
                    color: '#000',
                    padding: '16px 32px',
                    borderRadius: '2px 12px 2px 12px',
                    boxShadow: '3px 3px 5px rgba(0,0,0,0.2)',
                    display: 'inline-block',
                    transform: 'rotate(-2deg)'
                  }}>
                    {currentPlayer.testaWord}
                  </div>
                  
                  {roomState.config.testaMode === 'points' && currentPlayer.testaGuessedCorrectly && (
                    <div style={{ fontSize: '1.2rem', fontWeight: 900, color: 'var(--text-primary)', marginBottom: '8px' }}>
                      Você acertou em {currentPlayer.testaGuessOrder}º lugar! 🏆
                    </div>
                  )}
                  
                  {roomState.config.testaMode === 'survival' && !currentPlayer.testaGuessedCorrectly && (
                    <div style={{ fontSize: '1.2rem', fontWeight: 900, color: 'var(--text-primary)', marginBottom: '8px' }}>
                      Você foi eliminado! 💀
                    </div>
                  )}
                  {roomState.config.testaMode === 'survival' && currentPlayer.testaGuessedCorrectly && (
                    <div style={{ fontSize: '1.2rem', fontWeight: 900, color: 'var(--text-primary)', marginBottom: '8px' }}>
                      Você sobreviveu! 👑
                    </div>
                  )}
                  
                  <p className="text-muted" style={{ fontWeight: 'bold' }}>Aguardando os outros jogadores...</p>
                </div>
              ) : (
                <div className="card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', border: '4px solid var(--text-primary)', padding: '16px', margin: 0, height: '100%' }}>
                  {roomState.config.testaMode === 'survival' && roomState.config.testaLives && roomState.config.testaLives > 0 ? (
                    <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginBottom: '8px', fontSize: '1.5rem' }}>
                      {Array.from({ length: roomState.config.testaLives }).map((_, i) => (
                        <span key={i} style={{ 
                          opacity: i < (currentPlayer?.testaLivesLeft || 0) ? 1 : 0.3, 
                          color: 'red',
                          textShadow: '0 0 4px rgba(255,0,0,0.4)',
                          lineHeight: 1
                        }}>❤️</span>
                      ))}
                    </div>
                  ) : null}

                  <div className={isDamaged ? 'damaged' : ''} style={{ position: 'relative', marginTop: '16px', display: 'inline-block' }}>
                    <AvatarDisplay avatar={currentPlayer?.avatar || ''} size="6rem" />
                    
                    <div style={{ 
                      position: 'absolute',
                      top: '-20px',
                      left: '50%',
                      transform: 'translateX(-50%) rotate(5deg)',
                      background: '#fff9c4',
                      color: '#000',
                      padding: '4px 12px',
                      fontFamily: 'var(--font-display)',
                      border: '2px solid #000',
                      fontSize: '1.2rem',
                      boxShadow: '2px 2px 0 rgba(0,0,0,0.2)',
                      minWidth: '80px',
                      maxWidth: '240px',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      textAlign: 'center',
                      minHeight: '32px'
                    }}>
                      {guess || '...'}
                      {isDamaged && (
                        <span style={{
                          position: 'absolute',
                          top: '50%', left: '50%',
                          transform: 'translate(-50%, -50%)',
                          color: 'red',
                          fontSize: '3rem',
                          fontWeight: 'bold',
                          textShadow: '2px 2px 0 #fff, -2px -2px 0 #fff, 2px -2px 0 #fff, -2px 2px 0 #fff'
                        }}>
                          ❌
                        </span>
                      )}
                    </div>
                  </div>

                  <form onSubmit={handleGuess} style={{ display: 'flex', flexDirection: 'column', gap: '8px', width: '100%', marginTop: 'auto' }}>
                    <label style={{ fontWeight: 900, fontSize: '1.1rem', textTransform: 'uppercase', textAlign: 'center' }}>O que está na minha testa?</label>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <input
                        type="text"
                        className="input"
                        value={guess}
                        onChange={(e) => setGuess(e.target.value)}
                        style={{ flex: 1, fontSize: '1.1rem' }}
                      />
                      <button type="submit" className="btn btn-primary" style={{ padding: '0 16px' }}>Chutar</button>
                    </div>
                    <button type="button" className="btn btn-ghost btn-sm w-full" onClick={handleGiveUp} style={{ marginTop: '4px' }}>
                      🏳️ Desistir
                    </button>
                  </form>
                </div>
              )}
            </div>
            
            {/* Right: Nota Pessoal */}
            <div className="card personal-note-section" style={{ flex: 1, display: 'flex', flexDirection: 'column', border: '4px dashed var(--text-primary)', padding: '16px', margin: 0, minHeight: '150px' }}>
              <h3 style={{ fontSize: '1rem', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span>📝</span> Nota Pessoal (Só você vê)
              </h3>
              <textarea
                className="input"
                value={personalNotes}
                onChange={(e) => setPersonalNotes(e.target.value)}
                placeholder="Anote dicas..."
                style={{ width: '100%', flex: 1, resize: 'none', padding: '12px' }}
              />
            </div>
          </div>

          {/* BOTTOM SECTION: Enemies */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, border: '4px solid var(--text-primary)', padding: '16px', borderRadius: '16px', overflow: 'hidden' }}>
            <h3 style={{ marginBottom: '16px', fontSize: '1.2rem', borderBottom: '3px solid var(--text-primary)', paddingBottom: '8px' }}>
              Na testa da galera:
            </h3>
            
            <div className="player-grid" style={{ flex: 1, overflowY: 'auto', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', alignContent: 'start', paddingRight: '8px' }}>
              {roomState.players.filter(p => p.id !== playerId).map(p => (
                <div key={p.id} className="card" style={{ 
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', 
                  opacity: !p.isConnected ? 0.5 : 1,
                  border: p.hasGuessedTesta ? '2px solid #ccc' : '2px solid var(--text-primary)',
                  background: p.hasGuessedTesta ? 'var(--bg-secondary)' : 'var(--bg-primary)',
                  position: 'relative',
                  padding: '16px',
                  margin: 0
                }}>
                  <KickPlayerButton playerId={p.id} playerName={p.name} />
                  {roomState.config.testaMode === 'survival' && roomState.config.testaLives && roomState.config.testaLives > 0 && !p.hasGuessedTesta ? (
                    <div style={{ marginBottom: '8px', fontSize: '1.2rem', display: 'flex', gap: '4px' }}>
                      {Array.from({ length: roomState.config.testaLives }).map((_, i) => (
                        <span key={i} style={{ 
                          opacity: i < (p.testaLivesLeft || 0) ? 1 : 0.3, 
                          color: 'red',
                          textShadow: '0 0 2px rgba(255,0,0,0.4)',
                          lineHeight: 1
                        }}>❤️</span>
                      ))}
                    </div>
                  ) : null}

                  <div style={{ position: 'relative', marginTop: '4px' }}>
                    <AvatarDisplay avatar={p.avatar} size="5rem" />
                    
                    {/* Post-it simulado na testa do Avatar */}
                    <div style={{ 
                      position: 'absolute',
                      top: '-20px',
                      left: '50%',
                      transform: 'translateX(-50%) rotate(5deg)',
                      background: p.hasGuessedTesta ? '#e0e0e0' : '#fff9c4',
                      color: p.hasGuessedTesta ? '#888' : '#000',
                      padding: '4px 12px',
                      fontFamily: 'var(--font-display)',
                      border: '2px solid #000',
                      fontSize: '1.2rem',
                      boxShadow: '2px 2px 0 rgba(0,0,0,0.2)',
                      maxWidth: '200px',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      textAlign: 'center'
                    }}>
                      {p.hasGuessedTesta ? 'Descobriu!' : p.testaWord}
                    </div>
                  </div>
                  
                  <h4 style={{ margin: '8px 0 0 0', textDecoration: p.hasGuessedTesta ? 'line-through' : 'none', fontSize: '1.4rem' }}>
                    {p.name}
                  </h4>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ─── RESULT PHASE ───────────────────────
  if (roomState.state === GameState.RESULT) {
    return (
      <div className="page fade-in text-center">
        <h1 style={{ fontSize: '2.5rem', marginBottom: '8px' }}>
          {roomState.abortedDueToDisconnect ? 'Jogo Cancelado!' : 'Fim de Jogo!'}
        </h1>
        <p className="text-muted" style={{ marginBottom: '24px' }}>
          {roomState.abortedDueToDisconnect 
            ? 'A partida foi encerrada porque não há jogadores suficientes.' 
            : 'Todos adivinharam (ou desistiram).'}
        </p>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', marginBottom: '24px', width: '100%', alignItems: 'flex-start' }}>
          <div className="card" style={{ flex: '1 1 300px', margin: 0 }}>
            <h2 style={{ marginBottom: '16px' }}>Palavras da Rodada:</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', textAlign: 'left' }}>
              {roomState.players.map(p => (
                <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px', background: 'var(--bg-glass)', borderRadius: 'var(--radius-sm)' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <AvatarDisplay avatar={p.avatar} size="1.5rem" />
                    {p.name} {p.id === playerId && '(Você)'}
                  </span>
                  <span style={{ fontFamily: 'var(--font-display)', fontWeight: 'bold' }}>
                    {p.testaWord}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="card" style={{ flex: '1 1 200px', margin: 0 }}>
            <h2 style={{ marginBottom: '16px' }}>🏆 Ranking</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', textAlign: 'left' }}>
              {[...roomState.players].sort((a, b) => b.score - a.score).map((p, i) => (
                <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '4px', borderBottom: '1px dashed var(--border)', fontSize: '0.95rem' }}>
                  <span style={{ fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '120px' }}>
                    {i + 1}. {p.name}
                  </span>
                  <span style={{ color: 'var(--primary)', fontWeight: 600 }}>{p.score} pts</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {isHost ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', width: '100%', maxWidth: '400px', margin: '0 auto' }}>
            {roomState.currentRound < (roomState.config.totalRounds || 1) ? (
              <button className="btn btn-primary btn-xl w-full" onClick={nextRound}>
                ▶ Próxima Rodada ({roomState.currentRound}/{roomState.config.totalRounds || 1})
              </button>
            ) : (
              <button className="btn btn-primary btn-xl w-full" onClick={playAgain}>
                🔄 Jogar Novamente
              </button>
            )}
          </div>
        ) : (
          <div className="status-badge waiting">
            ⏳ Aguardando host decidir...
          </div>
        )}

        <div className="spacer-4" />
        {(!isHost || roomState.currentRound >= (roomState.config.totalRounds || 1)) && (
          <button className="btn btn-ghost btn-sm w-full" onClick={leaveRoom}>
            🚪 Sair da sala
          </button>
        )}
      </div>
    );
  }

  return null;
}
