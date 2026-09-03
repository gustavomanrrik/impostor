import React, { useState, useEffect } from 'react';
import { useGame } from '../context/GameContext';
import { GameState } from '@shared/types';
import { AvatarDisplay } from '../components/AvatarDisplay';
import { PlayerActions } from '../components/PlayerActions';
import { PlayerReactions } from '../components/PlayerReactions';
import { VoteSkipButton } from '../components/VoteSkipButton';
import { Podium } from '../components/Podium';

export function NumbersGame() {
  const { roomState, playerId, guessNumber, nextRound, playAgain, leaveRoom, myNumber, mobileTab } = useGame();
  const [guesses, setGuesses] = useState<Record<string, string>>({});
  const [damagedPlayers, setDamagedPlayers] = useState<Record<string, boolean>>({});
  const [personalNotes, setPersonalNotes] = useState('');
  const [isNoteExpanded, setIsNoteExpanded] = useState(false);

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
        
        <VoteSkipButton />

        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
          <div className="status-badge error" style={{ background: 'var(--text-primary)', color: 'var(--bg-primary)', margin: 0 }}>
            🔢 JOGO DOS NÚMEROS
          </div>
          <h2 className="text-center" style={{ fontSize: '1.8rem', margin: 0 }}>Adivinhe os Números!</h2>
          <span className="status-badge" style={{ background: 'var(--bg-card)', color: 'var(--text-primary)', border: '2px solid var(--text-primary)', fontSize: '1rem', margin: 0 }}>
            🏆 {currentPlayer?.score || 0} pts
          </span>
        </div>



        {/* TOP SECTION: My Card (Left) and Notes (Right) */}
        <div className="responsive-row" style={{ flexShrink: 0, minHeight: 0 }}>
          
          {/* LEFT: Seu Número */}
          <div className="responsive-col-left card text-center" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', border: '4px solid var(--text-primary)', padding: '16px', margin: 0 }}>
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

          {/* RIGHT: Nota Pessoal */}
          <div className="personal-note-section" style={{ flex: 1, display: 'flex', flexDirection: 'column', margin: 0, minHeight: isNoteExpanded ? '150px' : 'auto' }}>
            {!isNoteExpanded ? (
              <button className="btn btn-ghost fade-in" onClick={() => setIsNoteExpanded(true)} style={{ width: '100%', border: '4px dashed var(--text-primary)', height: '100%', minHeight: '60px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                📝 Abrir Nota Pessoal
              </button>
            ) : (
              <div className="card fade-in" style={{ flex: 1, display: 'flex', flexDirection: 'column', border: '4px dashed var(--text-primary)', padding: '16px', margin: 0, height: '100%' }}>
                <h3 onClick={() => setIsNoteExpanded(false)} style={{ fontSize: '1rem', cursor: 'pointer', margin: 0, display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'space-between' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>📝 Nota Pessoal (Só você vê)</span>
                  <span>▼</span>
                </h3>
                <textarea
                  className="input"
                  value={personalNotes}
                  onChange={(e) => setPersonalNotes(e.target.value)}
                  placeholder="Ex: Fulano é menor que 50..."
                  style={{ width: '100%', flex: 1, resize: 'none', padding: '12px', marginTop: '12px' }}
                />
              </div>
            )}
          </div>
        </div>

        {/* BOTTOM SECTION: Outros Jogadores */}
        <div className="card" style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, width: '100%', border: '4px solid var(--text-primary)', padding: '16px', margin: '16px 0 0 0' }}>
          <h3 style={{ marginBottom: '16px', fontSize: '1.2rem', borderBottom: '3px solid var(--text-primary)', paddingBottom: '8px' }}>
            Outros Jogadores
          </h3>
          <div style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '16px', paddingRight: '8px' }}>
            {roomState.players.filter(p => p.id !== playerId).map(p => (
              <div key={p.id} className="card" style={{ 
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', 
                opacity: !p.isConnected ? 0.5 : 1,
                border: '2px solid var(--text-primary)',
                background: p.hasBeenDiscovered ? 'var(--bg-secondary)' : 'var(--bg-primary)',
                position: 'relative',
                padding: '16px 12px 24px 12px',
                margin: 0,
                flex: '1 1 140px',
                maxWidth: '180px'
              }}>
                
                
                <div style={{ position: 'relative', flexShrink: 0, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <AvatarDisplay avatar={p.avatar} size="5rem" />
                  <PlayerReactions playerId={p.id} />
                  
                  <div className={damagedPlayers[p.id] ? 'damaged' : ''} style={{ 
                    position: 'relative',
                    background: p.hasBeenDiscovered ? '#e0e0e0' : '#fff9c4', 
                    color: p.hasBeenDiscovered ? '#888' : '#000', 
                    border: '2px solid #000',
                    padding: '2px 8px', 
                    textAlign: 'center',
                    boxShadow: '2px 2px 0 rgba(0,0,0,0.2)', 
                    width: '120px',
                    minHeight: '24px',
                    marginTop: '-12px',
                    zIndex: 2,
                    transform: 'rotate(2deg)'
                  }}>
                    {p.hasBeenDiscovered ? (
                      <div style={{ fontWeight: 900, fontSize: '1.2rem', padding: '0px' }}>{p.numberValue}</div>
                    ) : (
                      <form onSubmit={(e) => handleGuess(e, p.id)} style={{ display: 'flex', alignItems: 'center', gap: '4px', margin: 0, justifyContent: 'center' }}>
                        <input
                          type="number"
                          className="input"
                          value={guesses[p.id] || ''}
                          onChange={(e) => setGuesses(prev => ({ ...prev, [p.id]: e.target.value }))}
                          style={{ width: '40px', padding: '2px', textAlign: 'center', fontSize: '0.9rem', border: '2px solid #000', margin: 0 }}
                          min={roomState.config.numbersMin || 1}
                          max={roomState.config.numbersMax || 100}
                        />
                        <button type="submit" className="btn btn-primary" style={{ padding: '2px 8px', fontSize: '0.75rem', margin: 0 }}>Enviar</button>
                      </form>
                    )}
                    {damagedPlayers[p.id] && (
                      <span style={{
                        position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
                        color: 'red', fontSize: '2.5rem', fontWeight: 'bold', textShadow: '2px 2px 0 #fff'
                      }}>❌</span>
                    )}
                  </div>
                </div>
                
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', textAlign: 'center' }}>
                  <p style={{ fontWeight: 600, margin: 0, fontSize: '1.2rem', textDecoration: p.hasBeenDiscovered ? 'line-through' : 'none', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '100%', textAlign: 'center' }}>
                    {p.name}
                  </p>
                  <span style={{ fontSize: '0.8rem', fontWeight: 'bold' }}>🏆 {p.score} pts</span>
                  
                  {roomState.config.numbersMode === 'survival' && roomState.config.numbersLives && roomState.config.numbersLives > 0 && !p.hasBeenDiscovered && (
                    <div style={{ display: 'flex', gap: '2px', marginTop: '4px' }}>
                      {Array.from({ length: roomState.config.numbersLives }).map((_, i) => (
                        <span key={i} style={{ 
                          opacity: i < (p.numbersLivesLeft || 0) ? 1 : 0.3, 
                          filter: i < (p.numbersLivesLeft || 0) ? 'none' : 'grayscale(100%)',
                          color: 'red', fontSize: '1rem'
                        }}>❤️</span>
                      ))}
                    </div>
                  )}

                  {p.inSuddenDeath && (
                    <div style={{ 
                      background: '#ff3333', color: 'white', padding: '2px 6px', border: '2px solid black',
                      borderRadius: '255px 15px 225px 15px/15px 225px 15px 255px', fontSize: '0.75rem', 
                      fontWeight: 'bold', display: 'inline-block', marginTop: '4px'
                    }}>
                      ☠️ Morte Súbita!
                    </div>
                  )}
                </div>
              </div>
            ))}
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
            : 'Resultados da rodada:'}
        </p>

        {!roomState.abortedDueToDisconnect && <Podium players={roomState.players} />}

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', marginBottom: '24px', width: '100%', alignItems: 'center', justifyContent: 'center' }}>
          <div className="card" style={{ flex: '1 1 100%', margin: 0, maxWidth: '600px' }}>
            <h2 style={{ marginBottom: '16px' }}>Números da Rodada:</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', textAlign: 'left' }}>
              {roomState.players.map(p => (
                <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px', background: p.hasBeenDiscovered ? 'var(--bg-secondary)' : 'var(--bg-glass)', border: '2px solid var(--text-primary)' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <AvatarDisplay avatar={p.avatar} size="1.5rem" />
                    <span style={{ fontWeight: 600, textDecoration: p.hasBeenDiscovered ? 'line-through' : 'none' }}>
                      {p.name} {p.id === playerId && '(Você)'}
                    </span>
                    {p.hasBeenDiscovered ? (
                      <span style={{ fontSize: '0.75rem', background: '#ff3333', color: 'white', padding: '2px 6px', borderRadius: '4px', fontWeight: 'bold' }}>❌ Descoberto</span>
                    ) : (
                      <span style={{ fontSize: '0.75rem', background: '#33cc33', color: 'white', padding: '2px 6px', borderRadius: '4px', fontWeight: 'bold' }}>✅ Sobreviveu</span>
                    )}
                  </span>
                  <span style={{ fontFamily: 'var(--font-display)', fontWeight: 'bold', fontSize: '1.2rem', textDecoration: p.hasBeenDiscovered ? 'line-through' : 'none', color: p.hasBeenDiscovered ? 'var(--text-muted)' : 'inherit' }}>
                    {p.numberValue}
                  </span>
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
      </div>
    );
  }

  return null;
}



