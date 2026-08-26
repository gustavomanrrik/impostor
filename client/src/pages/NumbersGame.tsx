import React, { useState, useEffect } from 'react';
import { useGame } from '../context/GameContext';
import { GameState } from '@shared/types';
import { AvatarDisplay } from '../components/AvatarDisplay';
import { VoteSkipButton } from '../components/VoteSkipButton';

export function NumbersGame() {
  const { roomState, playerId, nextRound, leaveRoom, addToast, guessNumber, myNumber } = useGame();
  const [guesses, setGuesses] = useState<Record<string, string>>({});
  const [personalNotes, setPersonalNotes] = useState('');

  if (!roomState) return null;

  const currentPlayer = roomState.players.find(p => p.id === playerId);
  const isHost = roomState.hostId === playerId;

  const handleGuess = (e: React.FormEvent, targetId: string) => {
    e.preventDefault();
    const guessVal = parseInt(guesses[targetId]);
    if (isNaN(guessVal)) return;

    guessNumber(targetId, guessVal);
    setGuesses(prev => ({ ...prev, [targetId]: '' }));
  };

  if (roomState.state === GameState.IN_GAME) {
    return (
      <div className="page" style={{ position: 'relative', overflowX: 'hidden' }}>
        <div className="status-badge voting" style={{ marginBottom: '12px', background: 'var(--text-primary)', color: 'var(--bg-primary)' }}>
          🔢 JOGO DOS NÚMEROS
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--bg-card)', padding: '8px 16px', borderRadius: '8px', border: '2px solid var(--text-primary)', marginBottom: '16px' }}>
          <span>Sua pontuação:</span>
          <span style={{ fontWeight: 'bold', fontSize: '1.2rem', color: 'var(--primary)' }}>{currentPlayer?.score || 0} pts</span>
        </div>

        <h2 className="text-center" style={{ fontSize: '2.5rem' }}>Adivinhe os Números!</h2>
        <p className="text-muted text-center" style={{ marginTop: '8px', fontSize: '1rem', marginBottom: '24px', maxWidth: '600px' }}>
          O servidor sorteou um número secreto para cada um de vocês. Façam perguntas ("seu número é maior que 50?") e tentem descobrir o número exato dos outros!
        </p>

        <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap', alignItems: 'stretch', marginBottom: '32px' }}>
          <div className="card text-center" style={{ flex: '1 1 300px', margin: 0, border: '4px dashed var(--text-primary)' }}>
            <h3 style={{ fontSize: '1.2rem', textTransform: 'uppercase' }}>O seu número secreto é:</h3>
            <div style={{ 
              margin: '16px auto', 
              fontSize: '4rem', 
              fontFamily: 'monospace',
              fontWeight: 900,
              background: 'var(--text-primary)',
              color: 'var(--bg-primary)',
              padding: '16px 32px',
              borderRadius: 'var(--radius-sm)',
              display: 'inline-block',
              transform: 'rotate(-2deg)'
            }}>
              {myNumber}
            </div>
            {currentPlayer?.hasBeenDiscovered && (
              <div className="status-badge error" style={{ margin: '16px auto 0', display: 'block', maxWidth: 'fit-content', background: 'var(--text-primary)', color: 'white' }}>
                💥 Descobriram o seu número!
              </div>
            )}
            {roomState.config.numbersMode === 'survival' && roomState.config.numbersLives && roomState.config.numbersLives > 0 ? (
              <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginTop: '16px', fontSize: '1.5rem' }}>
                {Array.from({ length: roomState.config.numbersLives }).map((_, i) => (
                  <span key={i} style={{ 
                    opacity: i < (currentPlayer?.testaLivesLeft || 0) ? 1 : 0.3, 
                    filter: i < (currentPlayer?.testaLivesLeft || 0) ? 'none' : 'grayscale(100%)',
                    color: 'red',
                    textShadow: '0 0 2px rgba(255,0,0,0.5)'
                  }}>❤️</span>
                ))}
              </div>
            ) : null}
          </div>

          <div style={{ flex: '1 1 250px', display: 'flex', flexDirection: 'column', borderLeft: '2px dashed var(--glass-border)', paddingLeft: '24px' }} className="personal-note-section">
            <h3 style={{ fontSize: '1rem', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span>📝</span> Nota Pessoal (Só você vê)
            </h3>
            <textarea
              className="input"
              value={personalNotes}
              onChange={(e) => setPersonalNotes(e.target.value)}
              placeholder="Anote dicas..."
              style={{ width: '100%', flex: 1, minHeight: '120px', resize: 'vertical' }}
            />
          </div>
        </div>

        <h3 style={{ marginBottom: '16px', fontSize: '1.5rem', borderBottom: '3px solid var(--text-primary)', paddingBottom: '8px', width: '100%' }}>Outros Jogadores:</h3>
        <div className="player-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))' }}>
          {roomState.players.filter(p => p.id !== playerId).map(p => (
            <div key={p.id} className="card" style={{ 
              display: 'flex', flexDirection: 'column', gap: '12px', 
              opacity: !p.isConnected ? 0.5 : 1,
              border: p.hasBeenDiscovered ? '3px solid #ccc' : '3px solid var(--text-primary)',
              background: p.hasBeenDiscovered ? 'var(--bg-secondary)' : 'var(--bg-primary)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <AvatarDisplay avatar={p.avatar} size="2.5rem" />
                <div style={{ flex: 1 }}>
                  <p style={{ fontWeight: 600, margin: 0, fontSize: '1.2rem', textDecoration: p.hasBeenDiscovered ? 'line-through' : 'none' }}>{p.name}</p>
                </div>
              </div>

              <div style={{ 
                background: 'var(--bg-primary)', 
                border: '3px solid var(--text-primary)',
                padding: '16px', 
                borderRadius: '0', 
                fontFamily: 'monospace',
                fontSize: '2.5rem',
                fontWeight: 900,
                textAlign: 'center',
                minHeight: '80px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: 'inset 4px 4px 0px 0px rgba(0,0,0,0.1)'
              }}>
                {p.hasBeenDiscovered ? (
                  <span style={{ color: 'var(--text-primary)' }}>{p.numberValue}</span>
                ) : (
                  <span className="text-muted">???</span>
                )}
              </div>

              {roomState.config.numbersMode === 'survival' && roomState.config.numbersLives && roomState.config.numbersLives > 0 ? (
                <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginTop: '8px', fontSize: '1.2rem' }}>
                  {Array.from({ length: roomState.config.numbersLives }).map((_, i) => (
                    <span key={i} style={{ 
                      opacity: i < (p.testaLivesLeft || 0) ? 1 : 0.3, 
                      filter: i < (p.testaLivesLeft || 0) ? 'none' : 'grayscale(100%)',
                      color: 'red',
                      textShadow: '0 0 2px rgba(255,0,0,0.5)'
                    }}>❤️</span>
                  ))}
                </div>
              ) : null}

              {!p.hasBeenDiscovered && (
                <form onSubmit={(e) => handleGuess(e, p.id)} style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                  <input
                    type="number"
                    className="input"
                    value={guesses[p.id] || ''}
                    onChange={(e) => setGuesses(prev => ({ ...prev, [p.id]: e.target.value }))}
                    placeholder="Chute"
                    style={{ flex: 1, fontFamily: 'monospace', fontSize: '1.2rem', fontWeight: 'bold' }}
                  />
                  <button type="submit" className="btn btn-primary" style={{ padding: '8px 16px' }}>Chutar</button>
                </form>
              )}
            </div>
          ))}
        </div>
        <VoteSkipButton />
      </div>
    );
  }

  // ─── RESULT PHASE ───────────────────────
  if (roomState.state === GameState.RESULT) {
    return (
      <div className="page fade-in text-center">
        <h1 style={{ fontSize: '2.5rem', marginBottom: '8px' }}>Fim de Jogo!</h1>
        <p className="text-muted" style={{ marginBottom: '24px' }}>Todos os números foram descobertos.</p>

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
          <button className="btn btn-primary btn-xl w-full" onClick={nextRound}>
            🔄 Jogar Novamente
          </button>
        ) : (
          <div className="status-badge waiting">
            ⏳ Aguardando host iniciar nova rodada...
          </div>
        )}

        <div className="spacer-4" />
        <button className="btn btn-ghost btn-sm w-full" onClick={leaveRoom}>
          🚪 Sair da sala
        </button>
      </div>
    );
  }

  return null;
}
