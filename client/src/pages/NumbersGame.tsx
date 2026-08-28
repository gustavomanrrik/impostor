import React, { useState, useEffect } from 'react';
import { useGame } from '../context/GameContext';
import { GameState } from '@shared/types';
import { AvatarDisplay } from '../components/AvatarDisplay';
import { VoteSkipButton } from '../components/VoteSkipButton';

export function NumbersGame() {
  const { roomState, playerId, myWord, guessNumber, nextRound, playAgain, leaveRoom, addToast, myNumber } = useGame();
  const [guesses, setGuesses] = useState<Record<string, string>>({});
  const [damagedPlayers, setDamagedPlayers] = useState<Record<string, boolean>>({});
  const [personalNotes, setPersonalNotes] = useState('');

  // Reset local state whenever a new round/game starts
  useEffect(() => {
    setGuesses({});
    setDamagedPlayers({});
    setPersonalNotes('');
  }, [roomState?.round]);

  if (!roomState) return null;

  const currentPlayer = roomState.players.find(p => p.id === playerId);
  const isHost = roomState.hostId === playerId;

  const handleGuess = async (e: React.FormEvent, targetId: string) => {
    e.preventDefault();
    const guessVal = parseInt(guesses[targetId]);
    if (isNaN(guessVal)) return;

    const isCorrect = await guessNumber(targetId, guessVal);
    if (isCorrect === false) {
      setDamagedPlayers(prev => ({ ...prev, [targetId]: true }));
      setTimeout(() => {
        setDamagedPlayers(prev => ({ ...prev, [targetId]: false }));
      }, 500);
    }
    setGuesses(prev => ({ ...prev, [targetId]: '' }));
  };


  if (roomState.state === GameState.IN_GAME) {
    return (
      <div className="page" style={{ position: 'relative', overflow: 'hidden', display: 'flex', flexDirection: 'column', height: '100%', padding: '16px' }}>
        
        <div style={{ position: 'absolute', top: '16px', right: '16px', zIndex: 10 }}>
          <VoteSkipButton />
        </div>

        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
          <div className="status-badge error" style={{ background: 'var(--text-primary)', color: 'var(--bg-primary)', margin: 0 }}>
            🔢 JOGO DOS NÚMEROS
          </div>
          <h2 className="text-center" style={{ fontSize: '1.8rem', margin: 0 }}>Adivinhe os Números!</h2>
          <span className="status-badge" style={{ background: 'var(--bg-card)', color: 'var(--text-primary)', border: '2px solid var(--text-primary)', fontSize: '1rem', margin: 0 }}>
            🏆 {currentPlayer?.score || 0} pts
          </span>
        </div>

        {/* MAIN CONTENT AREA: Left (My Number + Note) / Right (Enemies) */}
        <div style={{ display: 'flex', gap: '24px', flex: 1, minHeight: 0 }}>
          
          {/* LEFT COLUMN */}
          <div style={{ flex: '0 0 320px', display: 'flex', flexDirection: 'column', gap: '16px', overflowY: 'auto' }}>
            
            {/* SEU NÚMERO */}
            <div className="card text-center" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', border: '4px solid var(--text-primary)', padding: '16px', margin: 0 }}>
              <h3 style={{ fontSize: '1.1rem', textTransform: 'uppercase', marginBottom: '12px' }}>O Seu Número Secreto é:</h3>
              <div style={{ 
                fontSize: '3.5rem', 
                fontFamily: 'monospace',
                fontWeight: 900,
                background: 'var(--bg-primary)',
                color: 'var(--text-primary)',
                border: '4px solid var(--text-primary)',
                padding: '4px 24px',
                display: 'inline-flex',
                boxShadow: '4px 4px 0px 0px var(--text-primary)',
                marginBottom: '12px'
              }}>
                {myNumber}
              </div>
              
              {currentPlayer?.hasBeenDiscovered && (
                <div style={{ margin: '0 auto', display: 'block', maxWidth: 'fit-content', background: '#333', color: 'white', padding: '4px 12px', borderRadius: '20px', fontWeight: 'bold' }}>
                  💀 Seu número foi descoberto!
                </div>
              )}
              {currentPlayer?.inSuddenDeath && (
                <div style={{ margin: '0 auto', display: 'block', maxWidth: 'fit-content', background: '#ff3333', color: 'white', padding: '4px 12px', borderRadius: '20px', fontWeight: 'bold', marginTop: '8px', textAlign: 'center' }}>
                  ☠️ MORTE SÚBITA! 1 palpite p/ salvar! ☠️
                </div>
              )}
              {roomState.players.some(p => p.inSuddenDeath) && !currentPlayer?.inSuddenDeath && !currentPlayer?.hasBeenDiscovered && (
                <div style={{ margin: '0 auto', display: 'block', maxWidth: 'fit-content', background: '#4CAF50', color: 'white', padding: '4px 12px', borderRadius: '20px', fontWeight: 'bold', marginTop: '8px', textAlign: 'center' }}>
                  🎉 Você sobreviveu! (Aguardando oponentes)
                </div>
              )}
              {roomState.config.numbersMode === 'survival' && roomState.config.numbersLives && roomState.config.numbersLives > 0 ? (
                <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginTop: '8px', fontSize: '1.2rem' }}>
                  {Array.from({ length: roomState.config.numbersLives }).map((_, i) => (
                    <span key={i} style={{ 
                      opacity: i < (currentPlayer?.numbersLivesLeft || 0) ? 1 : 0.3, 
                      filter: i < (currentPlayer?.numbersLivesLeft || 0) ? 'none' : 'grayscale(100%)',
                      color: 'red'
                    }}>❤️</span>
                  ))}
                </div>
              ) : null}
            </div>

            {/* NOTA PESSOAL */}
            <div className="card personal-note-section" style={{ flex: 1, display: 'flex', flexDirection: 'column', border: '4px dashed var(--text-primary)', padding: '16px', margin: 0, minHeight: '150px' }}>
              <h3 style={{ fontSize: '1rem', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span>📝</span> Nota Pessoal (Só você vê)
              </h3>
              <textarea
                className="input"
                value={personalNotes}
                onChange={(e) => setPersonalNotes(e.target.value)}
                placeholder="Ex: Fulano é menor que 50..."
                style={{ width: '100%', flex: 1, resize: 'none', padding: '12px' }}
              />
            </div>
          </div>

          {/* RIGHT COLUMN */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, border: '4px solid var(--text-primary)', padding: '16px', borderRadius: '16px', overflow: 'hidden' }}>
            <h3 style={{ marginBottom: '16px', fontSize: '1.2rem', borderBottom: '3px solid var(--text-primary)', paddingBottom: '8px' }}>
              Outros Jogadores
            </h3>
            
            {/* ENEMY GRID */}
            <div className="player-grid" style={{ flex: 1, overflowY: 'auto', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px', alignContent: 'start', paddingRight: '8px' }}>
              {roomState.players.filter(p => p.id !== playerId).map(p => (
                <div key={p.id} className="card" style={{ 
                  display: 'flex', flexDirection: 'column', gap: '8px', 
                  opacity: !p.isConnected ? 0.5 : 1,
                  border: p.hasBeenDiscovered ? '2px solid #ccc' : '3px solid var(--text-primary)',
                  background: p.hasBeenDiscovered ? 'var(--bg-secondary)' : 'var(--bg-primary)',
                  padding: '12px',
                  margin: 0
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <AvatarDisplay avatar={p.avatar} size="2rem" />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontWeight: 600, margin: 0, fontSize: '1.2rem', textDecoration: p.hasBeenDiscovered ? 'line-through' : 'none', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.name}</p>
                </div>
              </div>
              
              {p.inSuddenDeath && (
                <div style={{ background: '#ff3333', color: 'white', padding: '4px 8px', borderRadius: '12px', fontSize: '0.85rem', fontWeight: 'bold', textAlign: 'center', marginTop: '-4px' }}>
                  ☠️ Em Morte Súbita!
                </div>
              )}

              <div className={damagedPlayers[p.id] ? 'damaged' : ''} style={{ 
                background: 'var(--bg-primary)', 
                border: '3px solid var(--text-primary)',
                padding: '12px', 
                fontFamily: 'monospace',
                fontSize: '2.5rem',
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                boxShadow: '4px 4px 0px 0px rgba(0,0,0,0.1)',
                position: 'relative',
                minHeight: '80px',
                overflow: 'hidden'
              }}>
                {p.hasBeenDiscovered ? (
                  <span style={{ color: 'var(--text-primary)', fontWeight: 900 }}>{p.numberValue}</span>
                ) : (
                  <span className={guesses[p.id] ? 'text-primary' : 'text-muted'} style={{ fontWeight: 900, fontSize: guesses[p.id] ? '2rem' : '2.5rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{guesses[p.id] || '???'}</span>
                )}
                {damagedPlayers[p.id] && (
                  <span style={{
                    position: 'absolute',
                    top: '50%', left: '50%',
                    transform: 'translate(-50%, -50%)',
                    color: 'red',
                    fontSize: '4rem',
                    fontWeight: 'bold',
                    textShadow: '2px 2px 0 #fff, -2px -2px 0 #fff, 2px -2px 0 #fff, -2px 2px 0 #fff',
                    zIndex: 2
                  }}>
                    ❌
                  </span>
                )}
              </div>

              {roomState.config.numbersMode === 'survival' && roomState.config.numbersLives && roomState.config.numbersLives > 0 ? (
                <div style={{ display: 'flex', justifyContent: 'center', gap: '4px', fontSize: '1.2rem' }}>
                  {Array.from({ length: roomState.config.numbersLives }).map((_, i) => (
                    <span key={i} style={{ 
                      opacity: i < (p.numbersLivesLeft || 0) ? 1 : 0.3, 
                      filter: i < (p.numbersLivesLeft || 0) ? 'none' : 'grayscale(100%)',
                      color: 'red'
                    }}>❤️</span>
                  ))}
                </div>
              ) : null}

              {(!currentPlayer?.hasBeenDiscovered || currentPlayer?.inSuddenDeath) && (
                <form onSubmit={(e) => handleGuess(e, p.id)} style={{ display: 'flex', gap: '8px', marginTop: 'auto' }}>
                  <input
                    type="number"
                    className="input"
                    value={guesses[p.id] || ''}
                    onChange={(e) => setGuesses(prev => ({ ...prev, [p.id]: e.target.value }))}
                    placeholder="Chute"
                    disabled={p.hasBeenDiscovered}
                    style={{ flex: 1, fontFamily: 'monospace', fontSize: '1.1rem', fontWeight: 'bold' }}
                  />
                  <button type="submit" className="btn btn-primary" style={{ padding: '8px 12px' }} disabled={p.hasBeenDiscovered}>
                    Chutar
                  </button>
                </form>
              )}
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
            : 'Todos os números foram descobertos.'}
        </p>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', marginBottom: '24px', width: '100%', alignItems: 'flex-start' }}>
          <div className="card" style={{ flex: '1 1 300px', margin: 0 }}>
            <h2 style={{ marginBottom: '16px' }}>Números da Rodada:</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', textAlign: 'left' }}>
              {roomState.players.map(p => (
                <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px', background: 'var(--bg-glass)', borderRadius: 'var(--radius-sm)' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <AvatarDisplay avatar={p.avatar} size="1.5rem" />
                    {p.name} {p.id === playerId && '(Você)'}
                  </span>
                  <span style={{ fontFamily: 'var(--font-display)', fontWeight: 'bold', fontSize: '1.2rem' }}>
                    {p.numberValue}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div style={{ background: 'var(--bg-glass-strong)', padding: '16px', borderRadius: 'var(--radius-lg)' }}>
            <h3 className="text-center" style={{ marginBottom: '16px' }}>Jogadores</h3>
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
            {roomState.currentRound < (roomState.config.totalRounds || 3) ? (
              <button className="btn btn-primary btn-xl w-full" onClick={nextRound}>
                ▶️ Próxima Rodada ({roomState.currentRound}/{roomState.config.totalRounds || 3})
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
        {(!isHost || roomState.currentRound >= (roomState.config.totalRounds || 3)) && (
          <button className="btn btn-ghost btn-sm w-full" onClick={leaveRoom}>
            🚪 Sair da sala
          </button>
        )}
      </div>
    );
  }

  return null;
}
