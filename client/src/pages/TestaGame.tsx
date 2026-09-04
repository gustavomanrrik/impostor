import React, { useState, useRef, useCallback } from 'react';
import { useGame } from '../context/GameContext';
import { GameState } from '@shared/types';
import { AvatarDisplay } from '../components/AvatarDisplay';
import { VoteSkipButton } from '../components/VoteSkipButton';
import { PlayerActions } from '../components/PlayerActions';
import { PlayerReactions } from '../components/PlayerReactions';
import { Podium } from '../components/Podium';

const GAME_CONTAINER = { height: '100%', display: 'flex', flexDirection: 'column' as const, gap: '12px', padding: '16px', boxSizing: 'border-box' as const, overflow: 'hidden' };

const BOTTOM_ROW = { flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' as const };

export function TestaGame() {
  const {
    roomState, playerId, nextRound, playAgain,
    guessTesta, giveUpTesta, themes, activeTestaGuesses
  } = useGame();

  const [guess, setGuess] = useState('');
  const [personalNotes, setPersonalNotes] = useState('');
  const [isDamaged, setIsDamaged] = useState(false);
  const [isMyMenuOpen, setIsMyMenuOpen] = useState(false);
  const [notesModalOpen, setNotesModalOpen] = useState(false);
  const notesRef = useRef<HTMLTextAreaElement>(null);

  const autoGrow = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setPersonalNotes(e.target.value);
    const el = e.target;
    el.style.height = 'auto';
    el.style.height = el.scrollHeight + 'px';
  }, []);

  if (!roomState) return null;

  const currentPlayer = roomState.players.find(p => p.id === playerId);
  const isHost = roomState.hostId === playerId;
  const currentTheme = themes.find(t => t.id === roomState.config.theme);
  const otherPlayers = roomState.players.filter(p => p.id !== playerId);
  const isMobile = window.innerWidth < 768;

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
    if (window.confirm('Tem certeza que deseja desistir?')) giveUpTesta();
  };

  // ─── IN GAME ───────────────────────────────────────────────────────────────
  if (roomState.state === GameState.IN_GAME) {
    return (
      <div className="page" style={GAME_CONTAINER}>

        {/* ── HEADER ── */}
        <div style={{ flexShrink: 0, display: 'flex', flexDirection: 'column', gap: '2px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
            <span className="status-badge voting" style={{ background: 'var(--bg-card)', color: 'var(--text-primary)', margin: 0, fontSize: '0.8rem', border: '2px solid var(--text-primary)', borderRadius: '16px' }}>🧠 TESTA</span>
            <VoteSkipButton />
          </div>
          <h2 style={{ margin: 0, fontSize: '1.8rem', fontWeight: 900, lineHeight: 1.1, textAlign: 'center' }}>Quem sou eu?</h2>
          <p style={{ margin: 0, fontSize: '1rem', color: 'var(--text-muted)', fontWeight: 600, textAlign: 'center' }}>
            Tema: {roomState.config.theme === 'custom' ? 'Customizado' : `${currentTheme?.icon || ''} ${currentTheme?.name || roomState.config.theme}`}
          </p>
          {currentPlayer?.inSuddenDeath && (
            <div style={{ background: '#ff4444', color: '#fff', border: '3px solid #000', padding: '4px 10px', fontWeight: 900, fontSize: '0.85rem', textTransform: 'uppercase', boxShadow: '3px 3px 0 #000' }}>
              ⚠️ MORTE SÚBITA! 1 palpite para se salvar!
            </div>
          )}
        </div>

        {/* ── TOP ROW: Meu Card + Notas ── */}
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)', gap: '12px', flex: 1, minHeight: 0, width: '100%' }}>

          {/* Meu Card */}
          <div className="card" style={{ border: '4px solid var(--text-primary)', padding: '10px', margin: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-start', gap: '6px', overflow: 'hidden', position: 'relative' }}>

            {/* Menu Desistir */}
            {!currentPlayer?.hasGuessedTesta && (
              <div style={{ position: 'absolute', top: '6px', right: '6px', zIndex: 10 }}>
                <button onClick={() => setIsMyMenuOpen(!isMyMenuOpen)} className="btn btn-ghost btn-sm" style={{ padding: '2px 6px' }}>⋮</button>
                {isMyMenuOpen && (
                  <div style={{ position: 'absolute', top: '100%', right: 0, background: 'var(--bg-primary)', border: '2px solid var(--text-primary)', padding: '4px', zIndex: 20 }}>
                    <button type="button" className="btn btn-ghost btn-sm" onClick={() => { handleGiveUp(); setIsMyMenuOpen(false); }} style={{ color: 'var(--error)', whiteSpace: 'nowrap' }}>🏳️ Desistir</button>
                  </div>
                )}
              </div>
            )}

            {currentPlayer?.hasGuessedTesta ? (
              /* Acertou — mostra palavra */
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flex: 1, gap: '6px', textAlign: 'center' }}>
                <p style={{ margin: 0, fontWeight: 700, fontSize: '0.75rem', textTransform: 'uppercase' }}>Sua palavra era:</p>
                <div style={{ fontSize: 'clamp(1.2rem, 4vw, 1.8rem)', fontFamily: 'var(--font-display)', fontWeight: 900, background: '#fff9c4', color: '#000', padding: '6px 16px', border: '2px solid #000', transform: 'rotate(-2deg)' }}>
                  {currentPlayer.testaWord}
                </div>
                {roomState.config.testaMode === 'survival' && <p style={{ fontWeight: 900, margin: 0, fontSize: '0.9rem' }}>{currentPlayer.testaGuessedCorrectly ? '🎉 Sobreviveu!' : '💀 Eliminado!'}</p>}
                {roomState.config.testaMode === 'points' && currentPlayer.testaGuessedCorrectly && <p style={{ fontWeight: 700, margin: 0, fontSize: '0.8rem' }}>Acertou em {currentPlayer.testaGuessOrder}º lugar!</p>}
                <p className="text-muted" style={{ margin: 0, fontSize: '0.75rem' }}>Aguardando os outros...</p>
              </div>
            ) : (
              /* Ainda tentando */
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', flex: 1, gap: '6px' }}>
                {/* Vidas */}
                {roomState.config.testaMode === 'survival' && roomState.config.testaLives && roomState.config.testaLives > 0 && (
                  <div style={{ display: 'flex', gap: '2px', fontSize: '0.9rem' }}>
                    {Array.from({ length: roomState.config.testaLives }).map((_, i) => (
                      <span key={i} style={{ opacity: i < (currentPlayer?.testaLivesLeft || 0) ? 1 : 0.25, color: 'red' }}>❤️</span>
                    ))}
                  </div>
                )}

                {/* Avatar + label da palavra */}
                <div className={isDamaged ? 'damaged' : ''} style={{ position: 'relative', display: 'inline-block', marginTop: '16px', flexShrink: 0 }}>
                  <AvatarDisplay avatar={currentPlayer?.avatar || ''} size="7.5rem" />
                  <PlayerReactions playerId={playerId!} />
                  {activeTestaGuesses.filter(g => g.playerId === playerId).map(g => (
                    <div key={g.id} className={`floating-guess ${g.correct ? 'correct' : 'incorrect'}`}>{g.guess}</div>
                  ))}
                  {/* Sticky note da palavra */}
                  <div style={{ position: 'absolute', top: '-20px', left: '50%', transform: 'translateX(-50%) rotate(4deg)', background: '#fff9c4', color: '#000', padding: '3px 10px', fontFamily: 'var(--font-display)', border: '2px solid #000', fontSize: '1rem', boxShadow: '2px 2px 0 rgba(0,0,0,0.2)', minWidth: '70px', maxWidth: '180px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', textAlign: 'center', zIndex: 5 }}>
                    {guess || '...'}
                    {isDamaged && <span style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', color: 'red', fontSize: '2rem', fontWeight: 'bold', textShadow: '2px 2px 0 #fff, -2px -2px 0 #fff, 2px -2px 0 #fff, -2px 2px 0 #fff' }}>❌</span>}
                  </div>
                </div>

                {/* Input de palpite */}
                <form onSubmit={handleGuess} style={{ display: 'flex', gap: '4px', width: '100%', marginTop: 'auto' }}>
                  <input type="text" className="input" placeholder="Seu palpite..." value={guess} onChange={(e) => setGuess(e.target.value)} style={{ flex: 1, fontSize: '0.9rem', padding: '6px 8px' }} />
                  <button type="submit" className="btn btn-primary" style={{ padding: '0 10px' }}>➤</button>
                </form>
              </div>
            )}
          </div>

          {/* Nota Pessoal — modal no mobile, inline no desktop */}
          {isMobile ? (
            <div className="card" style={{ border: '4px dashed var(--text-primary)', padding: '10px', margin: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
              <button className="btn btn-ghost" style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '6px', border: 'none' }} onClick={() => setNotesModalOpen(true)}>
                <span style={{ fontSize: '1.8rem' }}>📝</span>
                <span style={{ fontWeight: 700, fontSize: '0.85rem' }}>Nota Pessoal</span>
                {personalNotes && <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textAlign: 'center' }}>{personalNotes.slice(0, 30)}...</span>}
              </button>
            </div>
          ) : (
            <div className="card" style={{ border: '4px dashed var(--text-primary)', padding: '16px', margin: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
              <p style={{ margin: '0 0 12px 0', fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-primary)' }}>📝 Nota Pessoal (só você vê)</p>
              <textarea
                ref={notesRef}
                value={personalNotes}
                onChange={autoGrow}
                placeholder="Anote suas deduções..."
                style={{ flex: 1, resize: 'none', padding: 0, fontSize: '0.9rem', overflow: 'auto', width: '100%', boxSizing: 'border-box', minHeight: 0, background: 'transparent', border: 'none', color: 'var(--text-primary)', outline: 'none', fontFamily: 'inherit' }}
              />
            </div>
          )}
        </div>

        {/* ── BOTTOM ROW: Na testa da galera ── */}
        <div className="card" style={{ ...BOTTOM_ROW, border: '4px solid var(--text-primary)', padding: '10px', margin: 0 }}>
          <h3 style={{ margin: '0 0 8px 0', fontSize: '0.95rem', fontWeight: 900, borderBottom: '3px solid var(--text-primary)', paddingBottom: '6px', flexShrink: 0 }}>
            Na testa da galera:
          </h3>
          <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexWrap: 'wrap', gap: '10px', justifyContent: 'center', alignContent: 'flex-start', paddingBottom: '4px' }}>
            {otherPlayers.map(p => (
              <div
                key={p.id}
                data-player-id={p.id}
                className="card"
                style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', opacity: !p.isConnected ? 0.5 : 1, border: '2px solid var(--text-primary)', background: p.hasGuessedTesta ? 'var(--bg-secondary)' : 'var(--bg-primary)', padding: '12px 8px 8px', margin: 0, width: '110px', flexShrink: 0, position: 'relative' }}
              >
                {/* Avatar + sticky note da palavra */}
                <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: '18px' }}>
                  {/* Vidas */}
                  {roomState.config.testaMode === 'survival' && roomState.config.testaLives && roomState.config.testaLives > 0 && !p.hasGuessedTesta && (
                    <div style={{ position: 'absolute', top: '-34px', left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: '1px', fontSize: '0.65rem' }}>
                      {Array.from({ length: roomState.config.testaLives }).map((_, i) => (
                        <span key={i} style={{ opacity: i < (p.testaLivesLeft || 0) ? 1 : 0.25, color: 'red' }}>❤️</span>
                      ))}
                    </div>
                  )}
                  {/* Sticky note */}
                  <div style={{ position: 'absolute', top: '-16px', left: '50%', transform: 'translateX(-50%) rotate(2deg)', background: p.hasGuessedTesta ? '#e0e0e0' : '#fff9c4', color: p.hasGuessedTesta ? '#888' : '#000', padding: '2px 6px', fontFamily: 'var(--font-display)', border: '2px solid #000', fontSize: '0.8rem', boxShadow: '2px 2px 0 rgba(0,0,0,0.2)', textAlign: 'center', zIndex: 10, whiteSpace: 'nowrap', maxWidth: '100px', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {p.hasGuessedTesta ? '✅ Descobriu' : p.testaWord}
                  </div>
                  <AvatarDisplay avatar={p.avatar} size="3rem" />
                  <PlayerReactions playerId={p.id} />
                  {activeTestaGuesses.filter(g => g.playerId === p.id).map(g => (
                    <div key={g.id} className={`floating-guess ${g.correct ? 'correct' : 'incorrect'}`}>{g.guess}</div>
                  ))}
                </div>

                <p style={{ fontWeight: 700, margin: 0, fontSize: '0.8rem', textAlign: 'center', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', width: '100%', textDecoration: p.hasGuessedTesta ? 'line-through' : 'none' }}>
                  {p.name}
                </p>
                <span style={{ fontSize: '0.68rem', fontWeight: 700 }}>⭐ {p.score} pts</span>
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

  // ─── RESULT ───────────────────────────────────────────────────────────────
  if (roomState.state === GameState.RESULT) {
    return (
      <div className="page fade-in text-center" style={{ overflowY: 'auto', padding: '24px' }}>
        <h1 style={{ fontSize: '2.5rem', marginBottom: '8px' }}>
          {roomState.abortedDueToDisconnect ? '❌ Jogo Cancelado!' : '🧠 Fim de Rodada!'}
        </h1>
        <p className="text-muted" style={{ marginBottom: '24px' }}>
          {roomState.abortedDueToDisconnect ? 'A partida foi encerrada por falta de jogadores.' : 'Confira as palavras de cada um:'}
        </p>
        {!roomState.abortedDueToDisconnect && <Podium players={roomState.players} />}
        <div className="card" style={{ maxWidth: '600px', margin: '0 auto 24px', padding: '20px' }}>
          <h2 style={{ marginBottom: '16px', borderBottom: '3px solid var(--text-primary)', paddingBottom: '8px' }}>Palavras da Rodada</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', textAlign: 'left' }}>
            {roomState.players.map(p => (
              <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', background: p.hasGuessedTesta ? 'var(--bg-secondary)' : 'var(--bg-glass)', border: '2px solid var(--text-primary)' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <AvatarDisplay avatar={p.avatar} size="1.8rem" />
                  <span style={{ fontWeight: 600, textDecoration: p.hasGuessedTesta ? 'line-through' : 'none' }}>{p.name}{p.id === playerId ? ' (Você)' : ''}</span>
                  {p.hasGuessedTesta ? <span style={{ fontSize: '0.7rem', background: '#33cc33', color: 'white', padding: '2px 6px', fontWeight: 'bold' }}>✅</span> : <span style={{ fontSize: '0.7rem', background: '#ff3333', color: 'white', padding: '2px 6px', fontWeight: 'bold' }}>❌</span>}
                </span>
                <span style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: '1.1rem', color: p.hasGuessedTesta ? 'var(--text-muted)' : 'inherit', textDecoration: p.hasGuessedTesta ? 'line-through' : 'none' }}>{p.testaWord}</span>
              </div>
            ))}
          </div>
        </div>
        {isHost ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', width: '100%', maxWidth: '400px', margin: '0 auto' }}>
            {roomState.currentRound < (roomState.config.totalRounds || 1) ? (
              <button className="btn btn-primary btn-xl w-full" onClick={nextRound}>▶ Próxima Rodada ({roomState.currentRound}/{roomState.config.totalRounds || 1})</button>
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
