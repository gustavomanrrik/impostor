import React, { useState, useRef, useCallback } from 'react';
import { useGame } from '../context/GameContext';
import { GameState } from '@shared/types';
import { AvatarDisplay } from '../components/AvatarDisplay';
import { PlayerActions } from '../components/PlayerActions';
import { PlayerReactions } from '../components/PlayerReactions';
import { VoteSkipButton } from '../components/VoteSkipButton';
import { Podium } from '../components/Podium';

/* ─── Shared layout styles ─────────────────────────────────────── */
const GAME_CONTAINER = { height: '100%', display: 'flex', flexDirection: 'column' as const, gap: '12px', padding: '16px', boxSizing: 'border-box' as const, overflow: 'hidden', width: '100%' };
const BOTTOM_ROW = { flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' as const };

export function NumbersGame() {
  const { roomState, playerId, lockNumbersGuesses, nextRound, playAgain, myNumber, mobileTab } = useGame();
  const [guesses, setGuesses] = useState<Record<string, string>>({});
  const [personalNotes, setPersonalNotes] = useState('');
  const [notesModalOpen, setNotesModalOpen] = useState(false);
  const notesRef = useRef<HTMLTextAreaElement>(null);

  const prevRound = useRef(roomState?.currentRound);
  if (roomState?.currentRound !== prevRound.current) {
    prevRound.current = roomState?.currentRound;
    setGuesses({});
    setPersonalNotes('');
  }

  const autoGrow = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
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
  const isMobile = window.innerWidth < 768;

  const handleLockGuesses = () => {
    const validGuesses: Record<string, number> = {};
    for (const pId of Object.keys(guesses)) {
      const val = Number(guesses[pId]);
      if (guesses[pId] !== '' && !isNaN(val)) validGuesses[pId] = val;
    }
    lockNumbersGuesses(validGuesses);
  };

  if (roomState.state === GameState.IN_GAME) {
    return (
      <div className="page" style={GAME_CONTAINER}>

        {/* ── HEADER ── */}
        <div style={{ flexShrink: 0, display: 'flex', flexDirection: 'column', gap: '8px', position: 'relative' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span className="status-badge error" style={{ background: 'var(--bg-card)', color: 'var(--text-primary)', margin: 0, fontSize: '0.8rem', border: '2px solid var(--text-primary)', borderRadius: '255px 15px 225px 15px/15px 225px 15px 255px' }}>🔢 NÚMEROS</span>
          </div>
          <div style={{ position: 'absolute', right: 0, top: 0 }}>
            <VoteSkipButton />
          </div>
          <h2 style={{ margin: 0, fontSize: '1.8rem', fontWeight: 900, lineHeight: 1.1, textAlign: 'center' }}>Adivinhe os Números!</h2>
          <p style={{ margin: 0, fontSize: '1rem', color: 'var(--text-muted)', fontWeight: 600, textAlign: 'center' }}>
            🏆 {currentPlayer?.score || 0} pts &nbsp;·&nbsp; intervalo: {roomState.config.numbersMin || 1}–{roomState.config.numbersMax || 100}
          </p>
        </div>

        {/* ── TOP ROW: Meu Número + Notas ── */}
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)', gap: '12px', flex: 1, minHeight: 0, width: '100%' }}>

          {/* Meu Número */}
          <div className="card" style={{ border: '4px solid var(--text-primary)', padding: '12px', margin: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '10px', overflow: 'hidden' }}>
            <p style={{ margin: 0, fontWeight: 700, fontSize: '0.8rem', textTransform: 'uppercase', textAlign: 'center' }}>Meu Número Secreto</p>
            <div style={{ fontSize: 'clamp(2.5rem, 8vw, 4rem)', fontFamily: 'monospace', fontWeight: 900, background: 'var(--bg-primary)', color: 'var(--text-primary)', border: '4px solid var(--text-primary)', padding: '4px 20px', boxShadow: '4px 4px 0px var(--text-primary)' }}>
              {myNumber}
            </div>
            {myLocked ? (
              <div style={{ background: '#4CAF50', color: 'white', padding: '6px 12px', fontWeight: 'bold', fontSize: '0.8rem', border: '2px solid #000', textAlign: 'center' }}>
                ✅ Confirmado! Aguardando...
              </div>
            ) : (
              <button className="btn btn-primary" style={{ width: '100%', padding: '8px', fontSize: '0.9rem', boxShadow: '3px 3px 0 var(--border-main)' }} onClick={handleLockGuesses}>
                Confirmar Palpites
              </button>
            )}
          </div>

          {/* Nota Pessoal — modal no mobile, inline no desktop */}
          {isMobile ? (
            <div className="card" style={{ border: '4px dashed var(--text-primary)', padding: '12px', margin: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
              <button className="btn btn-ghost" style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '6px', border: 'none' }} onClick={() => setNotesModalOpen(true)}>
                <span style={{ fontSize: '1.8rem' }}>📝</span>
                <span style={{ fontWeight: 700, fontSize: '0.85rem' }}>Nota Pessoal</span>
                {personalNotes && <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{personalNotes.slice(0, 30)}...</span>}
              </button>
            </div>
          ) : (
            <div className="card" style={{ border: '4px dashed var(--text-primary)', padding: '16px', margin: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
              <p style={{ margin: '0 0 12px 0', fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-primary)' }}>📝 Nota Pessoal (só você vê)</p>
              <textarea
                ref={notesRef}
                value={personalNotes}
                onChange={autoGrow}
                placeholder="Ex: Beto é menor que 50..."
                style={{ flex: 1, resize: 'none', padding: 0, fontSize: '0.9rem', overflow: 'auto', width: '100%', boxSizing: 'border-box', minHeight: 0, background: 'transparent', border: 'none', color: 'var(--text-primary)', outline: 'none', fontFamily: 'inherit' }}
              />
            </div>
          )}
        </div>

        {/* ── BOTTOM ROW: Outros Jogadores ── */}
        <div className="card" style={{ ...BOTTOM_ROW, border: '4px solid var(--text-primary)', padding: '10px', margin: 0 }}>
          <h3 style={{ margin: '0 0 8px 0', fontSize: '0.95rem', fontWeight: 900, borderBottom: '3px solid var(--text-primary)', paddingBottom: '6px', flexShrink: 0 }}>
            Outros Jogadores
          </h3>
          <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexWrap: 'wrap', gap: '10px', justifyContent: 'center', alignContent: 'flex-start', paddingBottom: '4px' }}>
            {otherPlayers.map(p => (
              <div key={p.id} data-player-id={p.id} className="card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', opacity: !p.isConnected ? 0.5 : 1, border: '2px solid var(--text-primary)', padding: '10px 8px', margin: 0, width: '110px', flexShrink: 0, position: 'relative' }}>
                <PlayerReactions playerId={p.id} />

                {/* Sticky note de palpite acima do avatar */}
                <div style={{ background: myLocked && !p.numbersGuessesLocked ? '#ffe0e0' : '#fff9c4', color: '#000', border: '2px solid #000', padding: '3px 6px', textAlign: 'center', boxShadow: '2px 2px 0 rgba(0,0,0,0.2)', width: '80px', transform: 'rotate(1.5deg)', marginBottom: '-8px', zIndex: 2, position: 'relative' }}>
                  <div style={{ fontSize: '0.65rem', fontWeight: 'bold', marginBottom: '1px' }}>Palpite:</div>
                  <input
                    type="number"
                    className="input"
                    value={guesses[p.id] || ''}
                    onChange={(e) => setGuesses(prev => ({ ...prev, [p.id]: e.target.value }))}
                    style={{ width: '60px', padding: '1px 4px', textAlign: 'center', fontSize: '1rem', fontWeight: 'bold', border: '2px solid #000', margin: 0, background: 'transparent' }}
                    min={roomState.config.numbersMin || 1}
                    max={roomState.config.numbersMax || 100}
                    disabled={!!myLocked}
                  />
                </div>

                <AvatarDisplay avatar={p.avatar} size="3.5rem" />
                <p style={{ fontWeight: 700, margin: 0, fontSize: '0.85rem', textAlign: 'center', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '100px' }}>{p.name}</p>
                <span style={{ fontSize: '0.7rem', fontWeight: 'bold' }}>🏆 {p.score} pts</span>
                {p.numbersGuessesLocked && <div style={{ background: '#4CAF50', color: 'white', padding: '1px 5px', border: '1px solid black', fontSize: '0.65rem', fontWeight: 'bold' }}>✅ Confirmou</div>}
                <PlayerActions playerId={p.id} playerName={p.name} />
              </div>
            ))}
          </div>
        </div>

        {/* ── MODAL NOTAS (mobile) ── */}
        {notesModalOpen && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 9999, display: 'flex', alignItems: 'flex-end' }} onClick={() => setNotesModalOpen(false)}>
            <div style={{ background: 'var(--bg-primary)', border: '4px solid var(--text-primary)', width: '100%', padding: '16px', boxSizing: 'border-box', borderBottom: 'none', maxHeight: '70vh', display: 'flex', flexDirection: 'column' }} onClick={e => e.stopPropagation()}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <h3 style={{ margin: 0 }}>📝 Nota Pessoal</h3>
                <button className="btn btn-ghost btn-sm" onClick={() => setNotesModalOpen(false)}>✕ Fechar</button>
              </div>
              <textarea className="input" value={personalNotes} onChange={e => setPersonalNotes(e.target.value)} placeholder="Anote suas deduções..." style={{ flex: 1, resize: 'none', minHeight: '150px', padding: '10px', fontSize: '1rem' }} />
            </div>
          </div>
        )}
      </div>
    );
  }

  // ─── RESULT ───────────────────────────────────
  if (roomState.state === GameState.RESULT) {
    return (
      <div className="page fade-in text-center" style={{ overflowY: 'auto', padding: '24px' }}>
        <h1 style={{ fontSize: '2.5rem', marginBottom: '8px' }}>
          {roomState.abortedDueToDisconnect ? '❌ Jogo Cancelado!' : '🔢 Fim de Rodada!'}
        </h1>
        <p className="text-muted" style={{ marginBottom: '24px' }}>
          {roomState.abortedDueToDisconnect ? 'A partida foi encerrada por falta de jogadores.' : 'Confira os números de cada um:'}
        </p>
        {!roomState.abortedDueToDisconnect && <Podium players={roomState.players} />}
        <div className="card" style={{ maxWidth: '600px', margin: '0 auto 24px', padding: '20px' }}>
          <h2 style={{ marginBottom: '16px', borderBottom: '3px solid var(--text-primary)', paddingBottom: '8px' }}>Números da Rodada</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', textAlign: 'left' }}>
            {roomState.players.filter(p => !p.isSpectator).map(p => (
              <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', background: p.isWinner ? 'var(--bg-secondary)' : 'var(--bg-glass)', border: '2px solid var(--text-primary)', boxShadow: p.isWinner ? '3px 3px 0 var(--text-primary)' : 'none' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <AvatarDisplay avatar={p.avatar} size="1.8rem" />
                  <span style={{ fontWeight: 600 }}>{p.name}{p.id === playerId ? ' (Você)' : ''}</span>
                  {p.isWinner && <span style={{ fontSize: '0.75rem', background: '#f59e0b', color: 'white', padding: '2px 8px', fontWeight: 'bold' }}>👑 Vencedor</span>}
                </span>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                  <span style={{ fontWeight: 700, color: '#4CAF50' }}>{p.score} pts</span>
                  <div style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: '2rem', background: '#fff9c4', padding: '4px 14px', border: '2px solid #000', transform: 'rotate(-2deg)', display: 'inline-block' }}>
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
              <button className="btn btn-primary btn-xl w-full" onClick={nextRound}>▶️ Próxima Rodada ({roomState.currentRound}/{roomState.config.totalRounds || 3})</button>
            ) : (
              <button className="btn btn-primary btn-xl w-full" onClick={playAgain}>🔄 Jogar Novamente</button>
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
