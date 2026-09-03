import React, { useState, useRef, useCallback } from 'react';
import { useGame } from '../context/GameContext';
import { GameState } from '@shared/types';
import { AvatarDisplay } from '../components/AvatarDisplay';
import { PlayerActions } from '../components/PlayerActions';
import { PlayerReactions } from '../components/PlayerReactions';
import { VoteSkipButton } from '../components/VoteSkipButton';
import { Podium } from '../components/Podium';

export function NumbersGame() {
  const { roomState, playerId, lockNumbersGuesses, nextRound, playAgain, myNumber, mobileTab } = useGame();
  const [guesses, setGuesses] = useState<Record<string, string>>({});
  const [personalNotes, setPersonalNotes] = useState('');
  const notesRef = useRef<HTMLTextAreaElement>(null);

  // Reset local state whenever a new round/game starts
  const prevRound = useRef(roomState?.currentRound);
  if (roomState?.currentRound !== prevRound.current) {
    prevRound.current = roomState?.currentRound;
    setGuesses({});
    setPersonalNotes('');
  }

  const autoGrowNotes = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setPersonalNotes(e.target.value);
    const el = e.target;
    el.style.height = 'auto';
    el.style.height = el.scrollHeight + 'px';
  }, []);

  if (!roomState) return null;

  const currentPlayer = roomState.players.find(p => p.id === playerId);
  const isHost = roomState.hostId === playerId;
  const otherPlayers = roomState.players.filter(p => p.id !== playerId && !p.isSpectator);
  const myLocked = currentPlayer?.numbersGuessesLocked;

  const handleLockGuesses = () => {
    const validGuesses: Record<string, number> = {};
    for (const pId of Object.keys(guesses)) {
      if (guesses[pId] !== undefined && guesses[pId] !== '') {
        const val = Number(guesses[pId]);
        if (!isNaN(val)) validGuesses[pId] = val;
      }
    }
    lockNumbersGuesses(validGuesses);
  };

  // ─── IN GAME ───────────────────────────────────────────────────────────────
  if (roomState.state === GameState.IN_GAME) {
    return (
      <div
        className="page"
        style={{
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
          padding: '12px',
          gap: '12px',
          overflow: 'hidden',
          boxSizing: 'border-box',
        }}
      >
        <VoteSkipButton />

        {/* ── HEADER ── */}
        <div style={{ flexShrink: 0, display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <div className="status-badge error" style={{ background: 'var(--text-primary)', color: 'var(--bg-primary)', margin: 0 }}>
              🔢 JOGO DOS NÚMEROS
            </div>
            <h2 style={{ fontSize: '1.5rem', margin: 0, fontWeight: 900 }}>Adivinhe os Números!</h2>
            <span style={{ marginLeft: 'auto', fontWeight: 700, fontSize: '0.9rem' }}>
              🏆 {currentPlayer?.score || 0} pts
            </span>
          </div>
        </div>

        {/* ── TOP HALF: Meu número + Notas (mesma altura) ── */}
        <div
          style={{
            flexShrink: 0,
            display: 'flex',
            gap: '12px',
            alignItems: 'stretch',
          }}
        >
          {/* Meu Número */}
          <div
            className="card"
            style={{
              flex: '0 0 auto',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              border: '4px solid var(--text-primary)',
              padding: '16px',
              margin: 0,
              gap: '12px',
              minWidth: '180px',
            }}
          >
            <p style={{ margin: 0, fontWeight: 700, fontSize: '0.85rem', textTransform: 'uppercase' }}>
              Meu Número Secreto:
            </p>
            <div style={{
              fontSize: '3.5rem',
              fontFamily: 'monospace',
              fontWeight: 900,
              background: 'var(--bg-primary)',
              color: 'var(--text-primary)',
              border: '4px solid var(--text-primary)',
              padding: '4px 24px',
              boxShadow: '4px 4px 0px 0px var(--text-primary)',
            }}>
              {myNumber}
            </div>

            {myLocked ? (
              <div style={{ background: '#4CAF50', color: 'white', padding: '6px 12px', fontWeight: 'bold', fontSize: '0.85rem', border: '2px solid #000', textAlign: 'center' }}>
                ✅ Confirmado! Aguardando...
              </div>
            ) : (
              <button
                className="btn btn-primary"
                style={{ width: '100%', padding: '8px', fontSize: '1rem', boxShadow: '3px 3px 0 var(--border-main)' }}
                onClick={handleLockGuesses}
              >
                Confirmar Palpites
              </button>
            )}
          </div>

          {/* Nota Pessoal — sempre visível, mesma altura */}
          <div
            className="card"
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              border: '4px dashed var(--text-primary)',
              padding: '12px',
              margin: 0,
              minHeight: '140px',
            }}
          >
            <p style={{ margin: '0 0 8px 0', fontWeight: 700, fontSize: '0.85rem' }}>📝 Nota Pessoal (só você vê)</p>
            <textarea
              ref={notesRef}
              className="input"
              value={personalNotes}
              onChange={autoGrowNotes}
              placeholder="Ex: Beto é menor que 50, Maria cheira a 80..."
              style={{
                flex: 1,
                resize: 'none',
                padding: '8px',
                fontSize: '0.9rem',
                minHeight: '80px',
                overflow: 'hidden',
                width: '100%',
                boxSizing: 'border-box',
              }}
            />
          </div>
        </div>

        {/* ── BOTTOM HALF: Outros Jogadores ── */}
        <div
          className="card"
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            border: '4px solid var(--text-primary)',
            padding: '12px',
            margin: 0,
            minHeight: 0,
            overflow: 'hidden',
          }}
        >
          <h3 style={{ margin: '0 0 12px 0', fontSize: '1rem', fontWeight: 900, borderBottom: '3px solid var(--text-primary)', paddingBottom: '6px' }}>
            Outros Jogadores
          </h3>
          <div style={{
            flex: 1,
            overflowY: 'auto',
            display: 'flex',
            flexWrap: 'wrap',
            gap: '12px',
            justifyContent: 'center',
            alignContent: 'flex-start',
          }}>
            {otherPlayers.map(p => (
              <div
                key={p.id}
                data-player-id={p.id}
                className="card"
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '6px',
                  opacity: !p.isConnected ? 0.5 : 1,
                  border: '2px solid var(--text-primary)',
                  padding: '12px 10px',
                  margin: 0,
                  width: '130px',
                  flexShrink: 0,
                  position: 'relative',
                }}
              >
                <PlayerReactions playerId={p.id} />

                {/* Avatar + adesivo de palpite */}
                <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  {/* Sticky note with guess input */}
                  <div style={{
                    background: myLocked ? (p.numbersGuessesLocked ? '#e0e0e0' : '#fff9c4') : '#fff9c4',
                    color: '#000',
                    border: '2px solid #000',
                    padding: '4px 8px',
                    textAlign: 'center',
                    boxShadow: '2px 2px 0 rgba(0,0,0,0.2)',
                    minWidth: '80px',
                    marginBottom: '-10px',
                    zIndex: 2,
                    transform: 'rotate(2deg)',
                    position: 'relative',
                  }}>
                    <div style={{ fontSize: '0.7rem', fontWeight: 'bold', marginBottom: '2px' }}>Palpite:</div>
                    <input
                      type="number"
                      className="input"
                      value={guesses[p.id] || ''}
                      onChange={(e) => setGuesses(prev => ({ ...prev, [p.id]: e.target.value }))}
                      style={{
                        width: '60px',
                        padding: '2px 4px',
                        textAlign: 'center',
                        fontSize: '1.1rem',
                        fontWeight: 'bold',
                        border: '2px solid #000',
                        margin: 0,
                        background: 'transparent',
                      }}
                      min={roomState.config.numbersMin || 1}
                      max={roomState.config.numbersMax || 100}
                      disabled={!!myLocked}
                    />
                  </div>

                  <AvatarDisplay avatar={p.avatar} size="4rem" />
                </div>

                {/* Nome e status */}
                <p style={{ fontWeight: 700, margin: 0, fontSize: '0.95rem', textAlign: 'center', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '110px' }}>
                  {p.name}
                </p>
                <span style={{ fontSize: '0.75rem', fontWeight: 'bold' }}>🏆 {p.score} pts</span>

                {p.numbersGuessesLocked && (
                  <div style={{ background: '#4CAF50', color: 'white', padding: '1px 6px', border: '2px solid black', fontSize: '0.7rem', fontWeight: 'bold' }}>
                    ✅ Confirmou
                  </div>
                )}

                <PlayerActions playerId={p.id} playerName={p.name} />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ─── RESULT ───────────────────────────────────────────────────────────────
  if (roomState.state === GameState.RESULT) {
    return (
      <div className="page fade-in text-center" style={{ overflowY: 'auto', padding: '24px' }}>
        <h1 style={{ fontSize: '2.5rem', marginBottom: '8px' }}>
          {roomState.abortedDueToDisconnect ? '❌ Jogo Cancelado!' : '🔢 Fim de Rodada!'}
        </h1>
        <p className="text-muted" style={{ marginBottom: '24px' }}>
          {roomState.abortedDueToDisconnect
            ? 'A partida foi encerrada porque não há jogadores suficientes.'
            : 'Confira os números de cada um:'}
        </p>

        {!roomState.abortedDueToDisconnect && <Podium players={roomState.players} />}

        <div className="card" style={{ maxWidth: '600px', margin: '0 auto 24px', padding: '20px' }}>
          <h2 style={{ marginBottom: '16px', borderBottom: '3px solid var(--text-primary)', paddingBottom: '8px' }}>
            Números da Rodada
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', textAlign: 'left' }}>
            {roomState.players.filter(p => !p.isSpectator).map(p => (
              <div
                key={p.id}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '10px 14px',
                  background: p.isWinner ? 'var(--bg-secondary)' : 'var(--bg-glass)',
                  border: '2px solid var(--text-primary)',
                  boxShadow: p.isWinner ? '3px 3px 0 var(--text-primary)' : 'none',
                }}
              >
                <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <AvatarDisplay avatar={p.avatar} size="2rem" />
                  <span style={{ fontWeight: 600 }}>
                    {p.name}{p.id === playerId ? ' (Você)' : ''}
                  </span>
                  {p.isWinner && (
                    <span style={{ fontSize: '0.8rem', background: '#f59e0b', color: 'white', padding: '2px 8px', fontWeight: 'bold' }}>
                      👑 Vencedor
                    </span>
                  )}
                </span>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                  <span style={{ fontWeight: 700, color: '#4CAF50' }}>{p.score} pts</span>
                  <div style={{
                    fontFamily: 'var(--font-display)',
                    fontWeight: 900,
                    fontSize: '2rem',
                    background: '#fff9c4',
                    padding: '4px 14px',
                    border: '2px solid #000',
                    transform: 'rotate(-2deg)',
                    display: 'inline-block',
                  }}>
                    {p.numberValue ?? '?'}
                  </div>
                </div>
              </div>
            ))}
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
          <div className="status-badge waiting">⏳ Aguardando host decidir...</div>
        )}

        <div className="spacer-4" />
      </div>
    );
  }

  return null;
}
