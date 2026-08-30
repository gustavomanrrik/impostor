import React, { useState } from 'react';
import { useGame } from '../context/GameContext';
import { GameState } from '@shared/types';
import { AvatarDisplay } from '../components/AvatarDisplay';
import { VoteSkipButton } from '../components/VoteSkipButton';
import { KickPlayerButton } from '../components/KickPlayerButton';
import { Podium } from '../components/Podium';


export function TestaGame() {
  const { roomState, playerId, nextRound, playAgain, leaveRoom, addToast, guessTesta, giveUpTesta, themes, mobileTab } = useGame();
  const [guess, setGuess] = useState('');
  const [personalNotes, setPersonalNotes] = useState('');
  const [isNoteExpanded, setIsNoteExpanded] = useState(false);
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

  const noteModalContent = isNoteExpanded && (
    <div 
      style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }} 
      onClick={() => setIsNoteExpanded(false)}
    >
      <div className="card fade-in" onClick={e => e.stopPropagation()} style={{ width: '100%', maxWidth: '400px', display: 'flex', flexDirection: 'column', border: '4px dashed var(--text-primary)', padding: '16px', background: 'var(--bg-primary)' }}>
        <h3 style={{ fontSize: '1.2rem', margin: '0 0 16px 0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span>📝 Nota Pessoal (Só você vê)</span>
          <button onClick={() => setIsNoteExpanded(false)} className="btn btn-ghost btn-sm" style={{ padding: '4px 8px' }}>❌</button>
        </h3>
        <textarea
          className="input"
          value={personalNotes}
          onChange={(e) => setPersonalNotes(e.target.value)}
          placeholder="Ex: Fulano é tal personagem..."
          style={{ width: '100%', minHeight: '150px', resize: 'none', padding: '12px' }}
        />
      </div>
    </div>
  );

  if (roomState.state === GameState.IN_GAME) {
    return (
      <>
      <div className="page" style={{ position: 'relative', overflow: 'hidden', display: 'flex', flexDirection: 'column', height: '100%', padding: '16px' }}>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '12px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <VoteSkipButton />
            <button onClick={() => setIsNoteExpanded(true)} className="btn btn-ghost btn-sm" style={{ fontSize: '1.2rem', padding: '4px 8px' }} title="Notas Pessoais">
              📝
            </button>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', alignItems: 'center', gap: '8px' }}>
            <div className="status-badge voting" style={{ background: 'var(--text-primary)', color: 'var(--bg-primary)', margin: 0, padding: '2px 8px', fontSize: '0.8rem' }}>
              🧠 JOGO DA TESTA
            </div>
            <h2 className="text-center" style={{ fontSize: '1.4rem', margin: 0 }}>Quem sou eu?</h2>
            <div className="status-badge" style={{ background: 'var(--bg-glass-strong)', margin: 0, padding: '2px 8px', fontSize: '0.8rem' }}>
              Tema: {roomState.config.theme === 'custom' ? 'Customizado' : `${currentTheme?.icon || ''} ${currentTheme?.name || roomState.config.theme}`}
            </div>
          </div>
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
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', flex: 1, minHeight: 0, width: '100%' }}>
          


          {/* MIDDLE SECTION: My Card */}
          <div style={{ flexShrink: 0, minHeight: 0, maxWidth: '320px', margin: '0 auto', width: '100%' }}>
            
            {/* LEFT: Meu Personagem */}
            <div>
              {currentPlayer?.hasGuessedTesta ? (
                <div className="card text-center" style={{ border: '4px solid var(--text-primary)', padding: '16px', margin: 0, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
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
                <div className="card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', border: '4px solid var(--text-primary)', padding: '16px', margin: 0, height: '100%', position: 'relative' }}>
                  
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
                    <AvatarDisplay avatar={currentPlayer?.avatar || ''} size="3.5rem" />
                    
                    <div style={{ 
                      position: 'absolute',
                      top: '-15px',
                      left: '50%',
                      transform: 'translateX(-50%) rotate(5deg)',
                      background: '#fff9c4',
                      color: '#000',
                      padding: '2px 8px',
                      fontFamily: 'var(--font-display)',
                      border: '2px solid #000',
                      fontSize: '1rem',
                      boxShadow: '2px 2px 0 rgba(0,0,0,0.2)',
                      minWidth: '60px',
                      maxWidth: '180px',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      textAlign: 'center',
                      minHeight: '24px'
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

                  <form onSubmit={handleGuess} style={{ display: 'flex', flexDirection: 'column', gap: '4px', width: '100%', marginTop: 'auto' }}>
                    <div style={{ display: 'flex', gap: '4px' }}>
                      <input
                        type="text"
                        className="input"
                        placeholder="Seu palpite..."
                        value={guess}
                        onChange={(e) => setGuess(e.target.value)}
                        style={{ flex: 1, fontSize: '0.9rem', padding: '4px 8px' }}
                      />
                      <button type="submit" className="btn btn-primary btn-sm" style={{ padding: '0 12px' }}>➤</button>
                    </div>
                  </form>
                </div>
              )}
            </div>
          </div>

          {/* BOTTOM SECTION: Enemies */}
          <div className="card" style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, width: '100%', border: '4px solid var(--text-primary)', padding: '16px', margin: '16px 0 0 0' }}>
            <h3 style={{ marginBottom: '16px', fontSize: '1.2rem', borderBottom: '3px solid var(--text-primary)', paddingBottom: '8px' }}>
              na testa da galera:
            </h3>
            
            <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '16px', paddingRight: '8px' }}>
              {roomState.players.filter(p => p.id !== playerId).map(p => (
                <div key={p.id} className="card" style={{ 
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', 
                  opacity: !p.isConnected ? 0.5 : 1,
                  border: '2px solid var(--text-primary)',
                  background: p.hasGuessedTesta ? 'var(--bg-secondary)' : 'var(--bg-primary)',
                  position: 'relative',
                  padding: '16px 12px 24px 12px',
                  margin: 0,
                  flex: '1 1 140px',
                  maxWidth: '180px'
                }}>
                  <div style={{ position: 'absolute', bottom: '4px', right: '4px' }}>
                    <KickPlayerButton playerId={p.id} playerName={p.name} />
                  </div>

                  <div style={{ position: 'relative', flexShrink: 0, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <AvatarDisplay avatar={p.avatar} size="5rem" />
                    
                    <div style={{ 
                      background: p.hasGuessedTesta ? '#e0e0e0' : '#fff9c4',
                      color: p.hasGuessedTesta ? '#888' : '#000',
                      padding: '2px 8px',
                      fontFamily: 'var(--font-display)',
                      border: '2px solid #000',
                      fontSize: '1rem',
                      boxShadow: '2px 2px 0 rgba(0,0,0,0.2)',
                      maxWidth: '120px',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      textAlign: 'center',
                      minHeight: '24px',
                      marginTop: '-12px',
                      zIndex: 2,
                      transform: 'rotate(2deg)'
                    }}>
                      {p.hasGuessedTesta ? 'Descobriu!' : p.testaWord}
                    </div>
                  </div>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1, minWidth: 0, width: '100%', textAlign: 'center' }}>
                    <span style={{ fontWeight: 600, fontSize: '1.2rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', width: '100%', textDecoration: p.hasGuessedTesta ? 'line-through' : 'none' }}>
                      {p.name}
                    </span>
                    <span style={{ fontSize: '0.8rem', fontWeight: 'bold' }}>🏆 {p.score} pts</span>
                    
                    {roomState.config.testaMode === 'survival' && roomState.config.testaLives && roomState.config.testaLives > 0 && !p.hasGuessedTesta && (
                      <div style={{ display: 'flex', gap: '4px', marginTop: '4px', fontSize: '1rem', justifyContent: 'center' }}>
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
                    
                    {p.hasGuessedTesta && <span className="text-muted" style={{ fontSize: '0.9rem' }}>Acertou! 🎉</span>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      {noteModalContent}
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
      {noteModalContent}
      </>
    );
  }

  return null;
}
