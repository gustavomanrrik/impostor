import React, { useState, useCallback, useRef } from 'react';
import { useGame } from '../context/GameContext';
import { GameState } from '@shared/types';
import { AvatarDisplay } from '../components/AvatarDisplay';
import { VoteSkipButton } from '../components/VoteSkipButton';
import { PlayerActions } from '../components/PlayerActions';
import { PlayerReactions } from '../components/PlayerReactions';
import { Podium } from '../components/Podium';

export function TestaGame() {
  const {
    roomState, playerId, nextRound, playAgain, addToast,
    guessTesta, giveUpTesta, themes, mobileTab, activeTestaGuesses
  } = useGame();

  const [guess, setGuess] = useState('');
  const [personalNotes, setPersonalNotes] = useState('');
  const [isDamaged, setIsDamaged] = useState(false);
  const [isMyMenuOpen, setIsMyMenuOpen] = useState(false);
  const notesRef = useRef<HTMLTextAreaElement>(null);

  const autoGrowNotes = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
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
    if (window.confirm('Tem certeza que deseja desistir?')) {
      giveUpTesta();
    }
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
          gap: '10px',
          overflow: 'hidden',
          boxSizing: 'border-box',
        }}
      >
        {/* ── HEADER ── */}
        <div style={{ flexShrink: 0, display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <div className="status-badge voting" style={{ background: 'var(--text-primary)', color: 'var(--bg-primary)', margin: 0 }}>
              🧠 JOGO DA TESTA
            </div>
            <VoteSkipButton />
          </div>
          <h2 style={{ fontSize: '1.5rem', margin: 0, fontWeight: 900 }}>Quem sou eu?</h2>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>
            Tema: {roomState.config.theme === 'custom' ? 'Customizado' : `${currentTheme?.icon || ''} ${currentTheme?.name || roomState.config.theme}`}
          </div>
        </div>

        {/* Aviso morte súbita */}
        {currentPlayer?.inSuddenDeath && (
          <div style={{
            flexShrink: 0,
            background: '#ff4444', color: '#fff',
            border: '4px solid #000',
            padding: '8px 16px',
            fontWeight: 900, textTransform: 'uppercase',
            boxShadow: '4px 4px 0 #000',
            fontSize: '1rem', textAlign: 'center'
          }}>
            ⚠️ MORTE SÚBITA! Apenas 1 palpite para se salvar! ⚠️
          </div>
        )}

        {/* ── TOP HALF: Meu Card + Notas Pessoais (mesma altura) ── */}
        <div
          style={{
            flexShrink: 0,
            display: 'flex',
            gap: '12px',
            alignItems: 'stretch',
          }}
        >
          {/* Meu Card (esquerda) */}
          <div style={{ flex: '0 0 auto', minWidth: '220px', maxWidth: '280px' }}>
            {currentPlayer?.hasGuessedTesta ? (
              <div className="card text-center" style={{ border: '4px solid var(--text-primary)', padding: '16px', margin: 0, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', gap: '8px' }}>
                <p style={{ margin: 0, fontWeight: 700, fontSize: '0.85rem', textTransform: 'uppercase' }}>A palavra na sua testa era:</p>
                <div style={{
                  fontSize: '2rem',
                  fontFamily: 'var(--font-display)',
                  fontWeight: 900,
                  background: '#fff9c4',
                  color: '#000',
                  padding: '8px 20px',
                  border: '2px solid #000',
                  display: 'inline-block',
                  transform: 'rotate(-2deg)',
                }}>
                  {currentPlayer.testaWord}
                </div>
                {roomState.config.testaMode === 'survival' && (
                  <p style={{ fontWeight: 900, margin: 0, fontSize: '1rem' }}>
                    {currentPlayer.testaGuessedCorrectly ? '🎉 Você sobreviveu!' : '💀 Você foi eliminado!'}
                  </p>
                )}
                {roomState.config.testaMode === 'points' && currentPlayer.testaGuessedCorrectly && (
                  <p style={{ fontWeight: 700, margin: 0 }}>Acertou em {currentPlayer.testaGuessOrder}º lugar!</p>
                )}
                <p className="text-muted" style={{ margin: 0, fontSize: '0.85rem' }}>Aguardando os outros...</p>
              </div>
            ) : (
              <div className="card" style={{ border: '4px solid var(--text-primary)', padding: '12px', margin: 0, height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', position: 'relative' }}>
                {/* Menu */}
                <div style={{ position: 'absolute', top: '6px', right: '6px', zIndex: 10 }}>
                  <button onClick={() => setIsMyMenuOpen(!isMyMenuOpen)} className="btn btn-ghost btn-sm" style={{ padding: '2px 6px' }}>⋮</button>
                  {isMyMenuOpen && (
                    <div style={{ position: 'absolute', top: '100%', right: 0, background: 'var(--bg-primary)', border: '2px solid var(--text-primary)', padding: '4px', display: 'flex', flexDirection: 'column', gap: '4px', zIndex: 20 }}>
                      <button type="button" className="btn btn-ghost btn-sm" onClick={() => { handleGiveUp(); setIsMyMenuOpen(false); }} style={{ color: 'var(--error)', whiteSpace: 'nowrap', padding: '4px 8px' }}>
                        🏳️ Desistir
                      </button>
                    </div>
                  )}
                </div>

                {/* Vidas */}
                {roomState.config.testaMode === 'survival' && roomState.config.testaLives && roomState.config.testaLives > 0 && (
                  <div style={{ display: 'flex', gap: '2px', fontSize: '1rem' }}>
                    {Array.from({ length: roomState.config.testaLives }).map((_, i) => (
                      <span key={i} style={{ opacity: i < (currentPlayer?.testaLivesLeft || 0) ? 1 : 0.25, color: 'red' }}>❤️</span>
                    ))}
                  </div>
                )}

                {/* Avatar + label da palavra */}
                <div className={isDamaged ? 'damaged' : ''} style={{ position: 'relative', display: 'inline-block' }}>
                  <AvatarDisplay avatar={currentPlayer?.avatar || ''} size="6rem" />
                  <PlayerReactions playerId={playerId!} />
                  {activeTestaGuesses.filter(g => g.playerId === playerId).map(g => (
                    <div key={g.id} className={`floating-guess ${g.correct ? 'correct' : 'incorrect'}`}>{g.guess}</div>
                  ))}
                  <div style={{
                    position: 'absolute',
                    top: '-22px',
                    left: '50%',
                    transform: 'translateX(-50%) rotate(5deg)',
                    background: '#fff9c4',
                    color: '#000',
                    padding: '3px 10px',
                    fontFamily: 'var(--font-display)',
                    border: '2px solid #000',
                    fontSize: '1.1rem',
                    boxShadow: '2px 2px 0 rgba(0,0,0,0.2)',
                    minWidth: '80px',
                    maxWidth: '200px',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    textAlign: 'center',
                    zIndex: 5,
                  }}>
                    {guess || '...'}
                    {isDamaged && (
                      <span style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', color: 'red', fontSize: '2.5rem', fontWeight: 'bold', textShadow: '2px 2px 0 #fff, -2px -2px 0 #fff, 2px -2px 0 #fff, -2px 2px 0 #fff' }}>❌</span>
                    )}
                  </div>
                </div>

                {/* Form de palpite */}
                <form onSubmit={handleGuess} style={{ display: 'flex', gap: '4px', width: '100%', marginTop: 'auto' }}>
                  <input
                    type="text"
                    className="input"
                    placeholder="Seu palpite..."
                    value={guess}
                    onChange={(e) => setGuess(e.target.value)}
                    style={{ flex: 1, fontSize: '0.95rem', padding: '6px 10px' }}
                  />
                  <button type="submit" className="btn btn-primary" style={{ padding: '0 12px' }}>➤</button>
                </form>
              </div>
            )}
          </div>

          {/* Notas Pessoais (direita) — sempre visíveis, mesma altura */}
          <div
            className="card"
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              border: '4px dashed var(--text-primary)',
              padding: '12px',
              margin: 0,
              minHeight: '180px',
            }}
          >
            <p style={{ margin: '0 0 8px 0', fontWeight: 700, fontSize: '0.85rem' }}>📝 Nota Pessoal (só você vê)</p>
            <textarea
              ref={notesRef}
              className="input"
              value={personalNotes}
              onChange={autoGrowNotes}
              placeholder="Anote suas deduções aqui..."
              style={{
                flex: 1,
                resize: 'none',
                padding: '8px',
                fontSize: '0.9rem',
                minHeight: '120px',
                overflow: 'hidden',
                width: '100%',
                boxSizing: 'border-box',
              }}
            />
          </div>
        </div>

        {/* ── BOTTOM HALF: Na testa da galera ── */}
        <div
          className={`card ${mobileTab === 'me' ? 'hide-on-mobile' : ''}`}
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
          <h3 style={{ margin: '0 0 10px 0', fontSize: '1rem', fontWeight: 900, borderBottom: '3px solid var(--text-primary)', paddingBottom: '6px' }}>
            Na testa da galera:
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
                  background: p.hasGuessedTesta ? 'var(--bg-secondary)' : 'var(--bg-primary)',
                  padding: '14px 10px 10px',
                  margin: 0,
                  width: '120px',
                  flexShrink: 0,
                  position: 'relative',
                }}
              >
                {/* Avatar + palavra na testa */}
                <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: '16px' }}>
                  {/* Vidas do jogador (survival) */}
                  {roomState.config.testaMode === 'survival' && roomState.config.testaLives && roomState.config.testaLives > 0 && !p.hasGuessedTesta && (
                    <div style={{ position: 'absolute', top: '-38px', left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: '1px', fontSize: '0.7rem' }}>
                      {Array.from({ length: roomState.config.testaLives }).map((_, i) => (
                        <span key={i} style={{ opacity: i < (p.testaLivesLeft || 0) ? 1 : 0.25, color: 'red' }}>❤️</span>
                      ))}
                    </div>
                  )}

                  {/* Label da palavra */}
                  <div style={{
                    position: 'absolute',
                    top: '-18px',
                    left: '50%',
                    transform: 'translateX(-50%) rotate(2deg)',
                    background: p.hasGuessedTesta ? '#e0e0e0' : '#fff9c4',
                    color: p.hasGuessedTesta ? '#888' : '#000',
                    padding: '2px 8px',
                    fontFamily: 'var(--font-display)',
                    border: '2px solid #000',
                    fontSize: '0.85rem',
                    boxShadow: '2px 2px 0 rgba(0,0,0,0.2)',
                    textAlign: 'center',
                    zIndex: 10,
                    whiteSpace: 'nowrap',
                    maxWidth: '110px',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}>
                    {p.hasGuessedTesta ? 'Descobriu! ✅' : p.testaWord}
                  </div>

                  <AvatarDisplay avatar={p.avatar} size="3.5rem" />
                  <PlayerReactions playerId={p.id} />

                  {activeTestaGuesses.filter(g => g.playerId === p.id).map(g => (
                    <div key={g.id} className={`floating-guess ${g.correct ? 'correct' : 'incorrect'}`}>{g.guess}</div>
                  ))}
                </div>

                {/* Nome e pontos */}
                <p style={{ fontWeight: 700, margin: 0, fontSize: '0.9rem', textAlign: 'center', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', width: '100%', textDecoration: p.hasGuessedTesta ? 'line-through' : 'none' }}>
                  {p.name}
                </p>
                <span style={{ fontSize: '0.72rem', fontWeight: 700 }}>⭐ {p.score} pts</span>

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
          {roomState.abortedDueToDisconnect ? '❌ Jogo Cancelado!' : '🧠 Fim de Rodada!'}
        </h1>
        <p className="text-muted" style={{ marginBottom: '24px' }}>
          {roomState.abortedDueToDisconnect
            ? 'A partida foi encerrada porque não há jogadores suficientes.'
            : 'Confira as palavras de cada um:'}
        </p>

        {!roomState.abortedDueToDisconnect && <Podium players={roomState.players} />}

        <div className="card" style={{ maxWidth: '600px', margin: '0 auto 24px', padding: '20px' }}>
          <h2 style={{ marginBottom: '16px', borderBottom: '3px solid var(--text-primary)', paddingBottom: '8px' }}>
            Palavras da Rodada
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', textAlign: 'left' }}>
            {roomState.players.map(p => (
              <div
                key={p.id}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '8px 12px',
                  background: p.hasGuessedTesta ? 'var(--bg-secondary)' : 'var(--bg-glass)',
                  border: '2px solid var(--text-primary)',
                }}
              >
                <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <AvatarDisplay avatar={p.avatar} size="1.8rem" />
                  <span style={{ fontWeight: 600, textDecoration: p.hasGuessedTesta ? 'line-through' : 'none' }}>
                    {p.name}{p.id === playerId ? ' (Você)' : ''}
                  </span>
                  {p.hasGuessedTesta ? (
                    <span style={{ fontSize: '0.72rem', background: '#33cc33', color: 'white', padding: '2px 6px', fontWeight: 'bold' }}>✅ Descobriu</span>
                  ) : (
                    <span style={{ fontSize: '0.72rem', background: '#ff3333', color: 'white', padding: '2px 6px', fontWeight: 'bold' }}>❌ Não descobriu</span>
                  )}
                </span>
                <span style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: '1.2rem', color: p.hasGuessedTesta ? 'var(--text-muted)' : 'inherit', textDecoration: p.hasGuessedTesta ? 'line-through' : 'none' }}>
                  {p.testaWord}
                </span>
              </div>
            ))}
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
          <div className="status-badge waiting">⏳ Aguardando host decidir...</div>
        )}

        <div className="spacer-4" />
      </div>
    );
  }

  return null;
}
