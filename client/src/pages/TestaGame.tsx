import React, { useState } from 'react';
import { useGame } from '../context/GameContext';
import { GameState } from '@shared/types';
import { AvatarDisplay } from '../components/AvatarDisplay';
import { VoteSkipButton } from '../components/VoteSkipButton';
import { PlayerActions } from '../components/PlayerActions';
import { PlayerReactions } from '../components/PlayerReactions';
import { Podium } from '../components/Podium';


export function TestaGame() {
  const { roomState, playerId, nextRound, playAgain, leaveRoom, addToast, guessTesta, giveUpTesta, themes, mobileTab, activeTestaGuesses } = useGame();
  const [guess, setGuess] = useState('');
  const [personalNotes, setPersonalNotes] = useState('');
  const [isDamaged, setIsDamaged] = useState(false);
  const [isMyMenuOpen, setIsMyMenuOpen] = useState(false);

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

  // Notepad is now integrated into the layout

  if (roomState.state === GameState.IN_GAME) {
    return (
      <>
      <div className="page" style={{ position: 'relative', display: 'flex', flexDirection: 'column', height: '100%', padding: '16px', overflowY: 'auto' }}>
        
        <div className={mobileTab === 'others' ? 'hide-on-mobile' : ''} style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '16px', marginBottom: '16px', flexShrink: 0 }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '12px' }}>
            <div className="status-badge voting" style={{ background: 'var(--text-primary)', color: 'var(--bg-primary)', margin: 0, padding: '4px 12px', fontSize: '0.9rem', fontWeight: 'bold' }}>
              🧠 JOGO DA TESTA
            </div>
            <h2 className="text-center" style={{ fontSize: '1.6rem', margin: 0, fontWeight: 900 }}>Quem sou eu?</h2>
            <div className="status-badge" style={{ background: 'var(--bg-glass-strong)', margin: 0, padding: '4px 12px', fontSize: '0.8rem' }}>
              Tema: {roomState.config.theme === 'custom' ? 'Customizado' : `${currentTheme?.icon || ''} ${currentTheme?.name || roomState.config.theme}`}
            </div>
          </div>
          <VoteSkipButton />
        </div>

        {currentPlayer?.inSuddenDeath && (
          <div className="card" style={{ 
            margin: '0 auto 16px', 
            display: 'inline-block', 
            background: '#ff4444', 
            color: '#fff', 
            border: '4px solid #000', 
            borderRadius: '255px 15px 225px 15px/15px 225px 15px 255px', 
            transform: 'rotate(-2deg)', 
            padding: '12px 24px', 
            fontWeight: 900, 
            textTransform: 'uppercase', 
            boxShadow: '4px 4px 0 #000',
            fontSize: '1.2rem',
            textAlign: 'center'
          }}>
            ⚠️ MORTE SÚBITA! Você tem apenas 1 palpite para se salvar! ⚠️
          </div>
        )}

        {/* MAIN CONTENT AREA */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', flex: 1, width: '100%' }}>
          
          {/* TOP HALF: My Card & Notepad */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', width: '100%', alignItems: 'stretch' }}>
            
            {/* LEFT: Meu Personagem */}
            <div style={{ flex: '1 1 300px', display: 'flex', flexDirection: 'column' }}>
              {currentPlayer?.hasGuessedTesta ? (
                <div className="card text-center" style={{ border: '4px solid var(--text-primary)', padding: '16px', margin: 0, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
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
                <div className="card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', border: '4px solid var(--text-primary)', padding: '16px', margin: 0, position: 'relative' }}>
                  
                  {/* Menu do Jogador */}
                  <div style={{ position: 'absolute', top: '8px', right: '8px', zIndex: 10 }}>
                    <button onClick={() => setIsMyMenuOpen(!isMyMenuOpen)} className="btn btn-ghost btn-sm" style={{ padding: '4px 8px' }}>⋮</button>
                    {isMyMenuOpen && (
                      <div style={{ position: 'absolute', top: '100%', right: 0, background: 'var(--bg-primary)', border: '2px solid var(--text-primary)', padding: '4px', display: 'flex', flexDirection: 'column', gap: '4px', zIndex: 20 }}>
                        <button type="button" className="btn btn-ghost btn-sm" onClick={() => { handleGiveUp(); setIsMyMenuOpen(false); }} style={{ color: 'var(--error)', whiteSpace: 'nowrap', padding: '4px 8px' }}>
                          🏳️ Desistir
                        </button>
                      </div>
                    )}
                  </div>

                  {roomState.config.testaMode === 'survival' && roomState.config.testaLives && roomState.config.testaLives > 0 ? (
                    <div style={{ display: 'flex', justifyContent: 'center', gap: '4px', marginBottom: '8px', fontSize: '1.2rem' }}>
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

                  <div className={isDamaged ? 'damaged' : ''} style={{ position: 'relative', marginTop: '4px', display: 'inline-block' }}>
                    <AvatarDisplay avatar={currentPlayer?.avatar || ''} size="6rem" />
                    <PlayerReactions playerId={playerId!} />
                    {activeTestaGuesses.filter(g => g.playerId === playerId).map(g => (
                      <div key={g.id} className={`floating-guess ${g.correct ? 'correct' : 'incorrect'}`}>
                        {g.guess}
                      </div>
                    ))}
                    
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
                      maxWidth: '220px',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      textAlign: 'center',
                      minHeight: '28px'
                    }}>
                      {guess || '...'}
                      {isDamaged && (
                        <span style={{
                          position: 'absolute',
                          top: '50%', left: '50%',
                          transform: 'translate(-50%, -50%)',
                          color: 'red',
                          fontSize: '3.5rem',
                          fontWeight: 'bold',
                          textShadow: '2px 2px 0 #fff, -2px -2px 0 #fff, 2px -2px 0 #fff, -2px 2px 0 #fff'
                        }}>
                          ❌
                        </span>
                      )}
                    </div>
                  </div>

                  <form onSubmit={handleGuess} style={{ display: 'flex', flexDirection: 'column', gap: '4px', width: '100%', marginTop: 'auto', paddingTop: '24px' }}>
                    <div style={{ display: 'flex', gap: '4px' }}>
                      <input
                        type="text"
                        className="input"
                        placeholder="Seu palpite..."
                        value={guess}
                        onChange={(e) => setGuess(e.target.value)}
                        style={{ flex: 1, fontSize: '1rem', padding: '8px 12px' }}
                      />
                      <button type="submit" className="btn btn-primary" style={{ padding: '0 16px' }}>➤</button>
                    </div>
                  </form>
                </div>
              )}
            </div>

            {/* RIGHT: Bloco de Notas */}
            <div style={{ flex: '1 1 300px', display: 'flex', flexDirection: 'column' }}>
              <div className="card" style={{ display: 'flex', flexDirection: 'column', border: '4px dashed var(--text-primary)', padding: '16px', margin: 0 }}>
                <h3 style={{ fontSize: '1.2rem', margin: '0 0 16px 0', display: 'flex', alignItems: 'center' }}>
                  <span>📝 Nota Pessoal (Só você vê)</span>
                </h3>
                <textarea
                  className="input"
                  value={personalNotes}
                  onChange={(e) => setPersonalNotes(e.target.value)}
                  placeholder="Anote suas deduções aqui..."
                  style={{ width: '100%', flex: 1, minHeight: '120px', resize: 'none', padding: '12px' }}
                />
              </div>
            </div>

          </div>

          {/* BOTTOM SECTION: Enemies */}
          <div className={`card ${mobileTab === 'me' ? 'hide-on-mobile' : ''}`} style={{ display: 'flex', flexDirection: 'column', minWidth: 0, width: '100%', border: '4px solid var(--text-primary)', padding: '16px', margin: '0' }}>
            <h3 style={{ marginBottom: '16px', fontSize: '1.2rem', borderBottom: '3px solid var(--text-primary)', paddingBottom: '8px' }}>
              na testa da galera:
            </h3>
            
            <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '16px' }}>
              {roomState.players.filter(p => p.id !== playerId).map(p => (
                <div key={p.id} className="card" style={{ 
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', 
                  opacity: !p.isConnected ? 0.5 : 1,
                  border: '2px solid var(--text-primary)',
                  background: p.hasGuessedTesta ? 'var(--bg-secondary)' : 'var(--bg-primary)',
                  position: 'relative',
                  padding: '16px 12px 12px 12px',
                  margin: 0,
                  width: '140px',
                  flexShrink: 0
                }}>
                  

                  <div style={{ position: 'relative', flexShrink: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: '16px' }}>
                    
                    <div style={{ 
                      position: 'absolute',
                      top: '-20px',
                      left: '50%',
                      background: p.hasGuessedTesta ? '#e0e0e0' : '#fff9c4',
                      color: p.hasGuessedTesta ? '#888' : '#000',
                      padding: '2px 8px',
                      fontFamily: 'var(--font-display)',
                      border: '2px solid #000',
                      fontSize: '0.9rem',
                      boxShadow: '2px 2px 0 rgba(0,0,0,0.2)',
                      textAlign: 'center',
                      zIndex: 10,
                      transform: 'translateX(-50%) rotate(2deg)',
                      whiteSpace: 'nowrap',
                      maxWidth: '120px',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis'
                    }}>
                      {p.hasGuessedTesta ? 'Descobriu!' : p.testaWord}
                    </div>
                    
                    <AvatarDisplay avatar={p.avatar} size="3.5rem" />
                    <PlayerReactions playerId={p.id} />
                    
                    {activeTestaGuesses.filter(g => g.playerId === p.id).map(g => (
                      <div key={g.id} className={`floating-guess ${g.correct ? 'correct' : 'incorrect'}`}>
                        {g.guess}
                      </div>
                    ))}
                  </div>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1, minWidth: 0, width: '100%', textAlign: 'center' }}>
                    <span style={{ fontWeight: 600, fontSize: '1rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', width: '100%', textDecoration: p.hasGuessedTesta ? 'line-through' : 'none' }}>
                      {p.name}
                    </span>
                    <span style={{ fontSize: '0.75rem', fontWeight: 'bold' }}>⭐ {p.score} pts</span>
                    
                    <PlayerActions playerId={p.id} playerName={p.name} />
                    
                    {roomState.config.testaMode === 'survival' && roomState.config.testaLives && roomState.config.testaLives > 0 && !p.hasGuessedTesta && (
                      <div style={{ display: 'flex', gap: '2px', marginTop: '4px', fontSize: '0.8rem', justifyContent: 'center' }}>
                        {Array.from({ length: roomState.config.testaLives }).map((_, i) => (
                          <span key={i} style={{ 
                            opacity: i < (p.testaLivesLeft || 0) ? 1 : 0.3, 
                            color: 'red',
                            textShadow: '0 0 2px rgba(255,0,0,0.4)',
                            lineHeight: 1
                          }}>❤️</span>
                        ))}
                      </div>
                    )}
                    
                    {p.hasGuessedTesta && <span className="text-muted" style={{ fontSize: '0.8rem' }}>Acertou! 🎉</span>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      </>
    );
  }

  // ─── RESULT PHASE ───────────────────────
  if (roomState.state === GameState.RESULT) {
    return (
      <>
      <div className="page fade-in text-center">
        <h1 style={{ fontSize: '2.5rem', marginBottom: '8px' }}>
          {roomState.abortedDueToDisconnect ? 'Jogo Cancelado!' : 'Fim de Rodada!'}
        </h1>
        <p className="text-muted" style={{ marginBottom: '24px' }}>
          {roomState.abortedDueToDisconnect 
            ? 'A partida foi encerrada porque não há jogadores suficientes.' 
            : 'Resultados da rodada:'}
        </p>

        {!roomState.abortedDueToDisconnect && <Podium players={roomState.players} />}

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', marginBottom: '24px', width: '100%', alignItems: 'center', justifyContent: 'center' }}>
          <div className="card" style={{ flex: '1 1 100%', margin: 0, maxWidth: '600px' }}>
            <h2 style={{ marginBottom: '16px' }}>Palavras da Rodada:</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', textAlign: 'left' }}>
              {roomState.players.map(p => (
                <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px', background: p.hasGuessedTesta ? 'var(--bg-secondary)' : 'var(--bg-glass)', border: '2px solid var(--text-primary)' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <AvatarDisplay avatar={p.avatar} size="1.5rem" />
                    <span style={{ fontWeight: 600, textDecoration: p.hasGuessedTesta ? 'line-through' : 'none' }}>
                      {p.name} {p.id === playerId && '(Você)'}
                    </span>
                    {p.hasGuessedTesta ? (
                      <span style={{ fontSize: '0.75rem', background: '#33cc33', color: 'white', padding: '2px 6px', borderRadius: '4px', fontWeight: 'bold' }}>✅ Descobriu</span>
                    ) : (
                      <span style={{ fontSize: '0.75rem', background: '#ff3333', color: 'white', padding: '2px 6px', borderRadius: '4px', fontWeight: 'bold' }}>❌ Não descobriu</span>
                    )}
                  </span>
                  <span style={{ fontFamily: 'var(--font-display)', fontWeight: 'bold', fontSize: '1.2rem', textDecoration: p.hasGuessedTesta ? 'line-through' : 'none', color: p.hasGuessedTesta ? 'var(--text-muted)' : 'inherit' }}>
                    {p.testaWord}
                  </span>
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


      </div>
      </>
    );
  }

  return null;
}


