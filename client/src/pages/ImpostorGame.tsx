import React, { useState, useEffect, useRef } from 'react';
import { useGame } from '../context/GameContext';
import { GameState } from '@shared/types';
import { AvatarDisplay } from '../components/AvatarDisplay';
import { VoteSkipButton } from '../components/VoteSkipButton';
import { KickPlayerButton } from '../components/KickPlayerButton';

export function ImpostorGame() {
  const { roomState, playerId, myWord, isImpostor, gameResult, markWordSeen, requestVote, cancelVoteRequest, submitVote, voteSkip, nextRound, playAgain, changeTheme, leaveRoom, addToast, themes, sendWhisper, activeWhispers, mobileTab } = useGame();
  const [wordVisible, setWordVisible] = useState(false);
  const [personalNotes, setPersonalNotes] = useState('');
  const [wordSeen, setWordSeen] = useState(false);
  const [selectedVote, setSelectedVote] = useState<string | null>(null);
  const [hasVoted, setHasVoted] = useState(false);
  const [hasRequestedVote, setHasRequestedVote] = useState(false);
  const [showConfirmVoteRequest, setShowConfirmVoteRequest] = useState(false);
  const [isAnimatingJudgement, setIsAnimatingJudgement] = useState(false);
  const [customReaction, setCustomReaction] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [whisperingTo, setWhisperingTo] = useState<string | null>(null);
  const [whisperInput, setWhisperInput] = useState<string>('');
  const reactionImageInputRef = useRef<HTMLInputElement>(null);

  const handleWhisperSubmit = (e: React.FormEvent, targetId: string) => {
    e.preventDefault();
    if (whisperInput.trim()) {
      sendWhisper(targetId, whisperInput.trim());
    }
    setWhisperingTo(null);
    setWhisperInput('');
  };

  // Reset local state whenever a new round/game starts
  useEffect(() => {
    if (roomState?.state === GameState.WORD_REVEAL) {
      setWordVisible(false);
      setWordSeen(false);
      setSelectedVote(null);
      setHasVoted(false);
      setHasRequestedVote(false);
      setShowConfirmVoteRequest(false);
      setPersonalNotes('');
    }
  }, [roomState?.round, roomState?.state]);

  useEffect(() => {
    if (roomState?.state === GameState.RESULT && gameResult) {
      // Começa a animar o julgamento assim que o resultado chegar
      setIsAnimatingJudgement(true);
      const timer = setTimeout(() => {
        setIsAnimatingJudgement(false);
      }, 4500); // 4.5 segundos de suspense
      return () => clearTimeout(timer);
    }
  }, [roomState?.state, gameResult]);

  if (!roomState) return null;

  const currentPlayer = roomState.players.find(p => p.id === playerId);
  const isHost = roomState.hostId === playerId;
  
  const themeName = roomState.config.theme === 'custom' 
    ? 'Colaborativo' 
    : themes.find(t => t.id === roomState.config.theme)?.name || 'Desconhecido';

  // ─── WORD REVEAL PHASE ───────────────────────
  if (roomState.state === GameState.WORD_REVEAL || (roomState.state === GameState.DISCUSSION && !wordSeen)) {
    return (
      <div className="page">
        <h3 className="text-center" style={{ marginBottom: '4px' }}>Sua palavra é:</h3>
        
        <p className="text-muted text-center" style={{ fontSize: '0.9rem', marginBottom: '24px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          Tema: <strong>{themeName}</strong>
        </p>

        {wordVisible ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', alignItems: 'center' }}>
            <div className="word-display word-visible text-gradient" style={(!myWord && isImpostor) ? { fontSize: '1.2rem', padding: '16px' } : undefined}>
              {myWord || (isImpostor ? 'Você não recebeu nenhuma palavra (apenas o tema). Tente se misturar!' : '...')}
            </div>
            <p className="text-muted text-center" style={{ fontSize: '0.85rem' }}>
              🤫 Não mostre sua palavra para ninguém.
            </p>
            <button
              className="btn btn-secondary"
              onClick={() => setWordVisible(false)}
            >
              👁 Esconder palavra
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', alignItems: 'center' }}>
            <div className="word-display word-hidden" aria-hidden="true" style={{ color: 'var(--text-muted)' }}>
              {myWord || '••••••••'}
            </div>
            <p className="text-muted text-center" style={{ fontSize: '0.85rem' }}>
              Palavra escondida
            </p>
            <button
              className="btn btn-primary"
              onClick={() => setWordVisible(true)}
            >
              👁 Mostrar palavra
            </button>
          </div>
        )}

        {!wordSeen && (
          <>
            <div className="spacer-6" />
            <button
              className="btn btn-primary btn-lg"
              onClick={() => {
                setWordSeen(true);
                setWordVisible(false);
                markWordSeen();
              }}
            >
              ✅ Pronto, já vi minha palavra
            </button>
          </>
        )}

        {wordSeen && roomState.state === GameState.WORD_REVEAL && (
          <div className="spacer-4" style={{ textAlign: 'center' }}>
            <div className="status-badge waiting">
              ⏳ Aguardando outros jogadores verem suas palavras...
            </div>
            <p className="text-muted" style={{ fontSize: '0.85rem', marginTop: '8px' }}>
              {roomState.players.filter(p => p.hasSeenWord).length}/{roomState.totalPlayers} prontos
            </p>
          </div>
        )}
        <VoteSkipButton />
      </div>
    );
  }

  // ─── DISCUSSION PHASE ───────────────────────
  if (roomState.state === GameState.DISCUSSION) {
    return (
      <div className="page" style={{ position: 'relative', overflow: 'hidden', display: 'flex', flexDirection: 'column', height: '100%', padding: '16px' }}>
        <VoteSkipButton />
        
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
          <div className="status-badge discussion" style={{ margin: 0 }}>
            💬 HORA DE DISCUTIR!
          </div>
          <h2 className="text-center" style={{ fontSize: '1.8rem', margin: 0 }}>Descubram o Impostor!</h2>
        </div>
        
        {roomState.config.showImpostorCount && (
          <p className="text-muted text-center" style={{ fontSize: '0.9rem', marginTop: 0, marginBottom: '16px' }}>
            Há {roomState.config.customImpostorCount} impostor{roomState.config.customImpostorCount > 1 ? 'es' : ''} entre vocês.
          </p>
        )}

        {/* MAIN CONTENT AREA */}


        <div className="responsive-row" style={{ flex: 1, minHeight: 0 }}>
          
          {/* LEFT COLUMN */}
          <div className={`responsive-col-left fixed-width ${mobileTab !== 'me' ? 'hide-on-mobile' : ''}`} style={{ overflowY: 'auto', paddingRight: '4px' }}>
            
            <div className="card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', border: '4px solid var(--text-primary)', padding: '16px', margin: 0 }}>
              <p className="text-muted text-center" style={{ fontSize: '0.9rem', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Tema: <strong>{themeName}</strong>
              </p>
              <p className="text-muted" style={{ fontSize: '0.8rem', marginBottom: '4px' }}>Sua palavra:</p>
              <p 
                className={wordVisible ? 'word-visible' : 'word-hidden'}
                style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.5rem', margin: 0, color: wordVisible ? 'inherit' : 'var(--text-muted)', transition: 'none' }}
              >
                {myWord || '••••••••'}
              </p>
              <button 
                className="btn btn-ghost btn-sm" 
                onClick={() => setWordVisible(!wordVisible)} 
                style={{ marginTop: '12px' }}
              >
                {wordVisible ? '👁 Esconder' : '👁 Ver palavra'}
              </button>
            </div>

            <div className="card" style={{ padding: '16px', margin: 0 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span style={{ fontWeight: 500, fontSize: '0.9rem' }}>Pedidos de votação</span>
                <span className="text-muted" style={{ fontSize: '0.85rem' }}>
                  {roomState.voteRequestCount}/{roomState.voteRequestsNeeded}
                </span>
              </div>
              <div className="progress-bar">
                <div
                  className="progress-fill"
                  style={{ width: `${(roomState.voteRequestCount / roomState.voteRequestsNeeded) * 100}%` }}
                />
              </div>

              <div style={{ marginTop: '8px' }}>
                {roomState.players.filter(p => p.hasRequestedVote).map(p => (
                  <span key={p.id} style={{ fontSize: '0.9rem', color: 'var(--accent-primary)', marginRight: '8px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                    🗳️ <AvatarDisplay avatar={p.avatar} size="1.2rem" /> {p.name}
                  </span>
                ))}
              </div>
              
              <div style={{ marginTop: '12px' }}>
                {!hasRequestedVote ? (
                  <>
                    {showConfirmVoteRequest ? (
                      <div>
                        <p className="text-center" style={{ marginBottom: '8px', fontSize: '0.9rem' }}>Iniciar votação?</p>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button className="btn btn-ghost btn-sm" style={{ flex: 1 }} onClick={() => setShowConfirmVoteRequest(false)}>
                            Cancelar
                          </button>
                          <button className="btn btn-primary btn-sm" style={{ flex: 1 }} onClick={() => {
                            requestVote();
                            setHasRequestedVote(true);
                            setShowConfirmVoteRequest(false);
                          }}>
                            Confirmar
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button
                        className="btn btn-secondary w-full"
                        onClick={() => setShowConfirmVoteRequest(true)}
                      >
                        🗳️ Pedir votação
                      </button>
                    )}
                  </>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                    <div className="status-badge ready" style={{ margin: 0, padding: '4px 12px', fontSize: '0.85rem' }}>
                      ✅ Votação solicitada
                    </div>
                    <button 
                      className="btn btn-ghost btn-sm" 
                      style={{ padding: '4px 12px', fontSize: '0.85rem' }}
                      onClick={() => {
                        cancelVoteRequest();
                        setHasRequestedVote(false);
                      }}
                    >
                      Cancelar pedido
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div className="card personal-note-section" style={{ flex: 1, display: 'flex', flexDirection: 'column', border: '4px dashed var(--text-primary)', padding: '16px', margin: 0, minHeight: '120px' }}>
              <h3 style={{ fontSize: '1rem', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span>📝</span> Nota Pessoal (Só você vê)
              </h3>
              <textarea
                className="input"
                value={personalNotes}
                onChange={(e) => setPersonalNotes(e.target.value)}
                placeholder="Anote dicas..."
                style={{ width: '100%', flex: 1, minHeight: '80px', resize: 'none', padding: '12px' }}
              />
            </div>
          </div>

          {/* RIGHT COLUMN */}
          <div className={mobileTab !== 'others' ? 'hide-on-mobile' : ''} style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, border: '4px solid var(--text-primary)', padding: '16px', borderRadius: '16px', overflow: 'hidden' }}>
            <h3 style={{ marginBottom: '16px', fontSize: '1.2rem', borderBottom: '3px solid var(--text-primary)', paddingBottom: '8px' }}>
              Outros Jogadores
            </h3>
            
            <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '16px', paddingRight: '8px' }}>
              {roomState.players.filter(p => p.id !== playerId).map(p => (
                <div key={p.id} className="card" style={{ 
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', 
                  opacity: !p.isConnected ? 0.5 : 1,
                  border: '2px solid var(--text-primary)',
                  background: 'var(--bg-primary)',
                  position: 'relative',
                  padding: '16px 12px 24px 12px',
                  margin: 0,
                  flex: '1 1 140px',
                  maxWidth: '180px',
                  cursor: hasRequestedVote ? 'pointer' : 'default'
                }}
                onClick={() => {
                  if (hasRequestedVote) setSelectedVote(p.id);
                }}>
                  <div style={{ position: 'absolute', bottom: '4px', right: '4px' }}>
                    <KickPlayerButton playerId={p.id} playerName={p.name} />
                  </div>

                  <div style={{ position: 'relative', flexShrink: 0, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <AvatarDisplay avatar={p.avatar} size="5rem" />
                    {selectedVote === p.id && (
                      <div style={{
                        position: 'absolute', top: -5, right: -5, background: 'var(--primary)',
                        color: 'var(--bg-primary)', borderRadius: '50%', width: '24px', height: '24px',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '14px', zIndex: 3
                      }}>✓</div>
                    )}
                    {/* Whisper Bubble */}
                    {activeWhispers.filter(w => w.senderId === p.id).map((w, index) => (
                      <div key={`${w.timestamp}-${index}`} style={{
                        position: 'absolute', top: '-30px', left: '50%', transform: 'translateX(-50%)',
                        background: 'var(--primary)', color: 'var(--bg-primary)', padding: '4px 8px',
                        borderRadius: '12px', borderBottomLeftRadius: '0', fontWeight: 'bold', fontSize: '0.9rem',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.2)', zIndex: 20, whiteSpace: 'nowrap',
                        animation: 'bounceIn 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
                      }}>
                        {w.text}
                      </div>
                    ))}
                  </div>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', textAlign: 'center' }}>
                    <p style={{ fontWeight: 600, margin: 0, fontSize: '1.2rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '100%' }}>{p.name}</p>
                    <div style={{ display: 'flex', gap: '4px', fontSize: '1rem', marginTop: '4px', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.8rem', fontWeight: 'bold', whiteSpace: 'nowrap', marginRight: '4px' }}>🏆 {p.score} pts</span>
                      {p.isWinner && <span title="Vencedor">👑</span>}
                      {p.id === roomState.hostId && <span title="Host">⭐</span>}
                    </div>
                  </div>

                  {!hasRequestedVote && (
                    <button 
                      className="btn btn-secondary btn-sm"
                      style={{ padding: '4px 8px', fontSize: '0.8rem', minHeight: 'auto', position: 'absolute', top: '4px', right: '4px' }}
                      onClick={(e) => {
                        e.stopPropagation();
                        setWhisperingTo(whisperingTo === p.id ? null : p.id);
                        setWhisperInput('');
                      }}
                    >
                      💬
                    </button>
                  )}
                </div>

                  {/* Whisper Input */}
                  {whisperingTo === p.id && (
                    <form 
                      onSubmit={(e) => handleWhisperSubmit(e, p.id)} 
                      style={{ display: 'flex', width: '100%', gap: '4px', marginTop: '8px' }}
                    >
                      <input
                        autoFocus
                        type="text"
                        className="input"
                        placeholder="Sussurro secreto..."
                        value={whisperInput}
                        onChange={e => setWhisperInput(e.target.value)}
                        style={{ flex: 1, padding: '4px 8px', fontSize: '0.9rem' }}
                        onBlur={() => setTimeout(() => setWhisperingTo(null), 150)}
                      />
                      <button type="submit" className="btn btn-primary" style={{ padding: '4px 12px', fontSize: '0.9rem', minHeight: 'auto' }}>Enviar</button>
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

  // ─── VOTING PHASE ───────────────────────
  if (roomState.state === GameState.VOTING) {
    const otherPlayers = roomState.players.filter(p => p.id !== playerId);

    if (hasVoted) {
      return (
        <div className="page" style={{ position: 'relative', margin: '0 auto' }}>
          <VoteSkipButton />

          <div className="status-badge voting" style={{ marginBottom: '12px' }}>
            🗳️ VOTAÇÃO
          </div>
          <h3 className="text-center">Voto registrado!</h3>
          <p className="text-muted text-center" style={{ marginTop: '8px' }}>
            Aguardando todos votarem...
          </p>
          <div className="spacer-4" />
          <p className="text-muted text-center" style={{ fontSize: '0.9rem' }}>
            {roomState.votesRegistered}/{roomState.totalPlayers} votos registrados
          </p>
          <div className="progress-bar" style={{ marginTop: '8px' }}>
            <div
              className="progress-fill"
              style={{ width: `${(roomState.votesRegistered / roomState.totalPlayers) * 100}%` }}
            />
          </div>
          <div className="spacer-4" />
          <div className="text-muted" style={{ fontSize: '0.85rem', textAlign: 'center' }}>
            <p style={{ marginBottom: '4px' }}>Aguardando:</p>
            {roomState.players.filter(p => !p.hasVoted).map(p => (
              <span key={p.id} style={{ marginRight: '8px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                • <AvatarDisplay avatar={p.avatar} size="1rem" /> {p.name}
              </span>
            ))}
          </div>
        </div>
      );
    }

    return (
      <div className="page" style={{ position: 'relative' }}>
        <VoteSkipButton />
        <div className="status-badge voting" style={{ marginBottom: '12px' }}>
          🗳️ VOTAÇÃO
        </div>
        <h2 className="text-center">Quem é o impostor?</h2>
        <p className="text-muted text-center" style={{ marginTop: '4px', marginBottom: '16px' }}>
          Selecione quem você acha que é o impostor
        </p>

        <div className="flex flex-col gap-3 w-full">
          {otherPlayers.map(player => (
            <div
              key={player.id}
              className={`vote-option ${selectedVote === player.id ? 'selected' : ''}`}
              onClick={() => setSelectedVote(player.id)}
              role="radio"
              aria-checked={selectedVote === player.id}
              tabIndex={0}
              onKeyDown={e => e.key === 'Enter' && setSelectedVote(player.id)}
            >
              <div className="vote-radio">
                <div className="vote-radio-inner" />
              </div>
              <AvatarDisplay avatar={player.avatar} size="1.5rem" />
              <span style={{ fontWeight: 500 }}>{player.name}</span>
            </div>
          ))}
        </div>

        <div className="spacer-6" />

        <button
          className="btn btn-primary btn-xl"
          disabled={!selectedVote}
          onClick={() => {
            if (selectedVote) {
              submitVote(selectedVote);
              setHasVoted(true);
            }
          }}
        >
          ✅ Confirmar voto
        </button>

        <p className="text-muted text-center" style={{ fontSize: '0.8rem', marginTop: '8px' }}>
          ⚠️ Seu voto não pode ser alterado depois de confirmar.
        </p>
      </div>
    );
  }

  // ─── REVEALING PHASE ───────────────────────
  if (roomState.state === GameState.IN_GAME) {
    return (
      <div className="page fade-in" style={{ position: 'relative' }}>
        <VoteSkipButton />
        <div className="spinner" style={{ margin: '40px auto' }} />
        <p className="text-muted text-center">Contabilizando votos...</p>
      </div>
    );
  }

  // ─── RESULT PHASE ───────────────────────
  if (roomState.state === GameState.RESULT && gameResult) {
    const playerWon = isImpostor ? !gameResult.impostorsFound : gameResult.impostorsFound;
    const maxVotes = Math.max(...gameResult.votes.map(v => v.voteCount), 1);
    const eliminated = gameResult.eliminatedPlayer;
    const eliminatedAvatar = eliminated ? roomState.players.find(p => p.id === eliminated.id)?.avatar || '' : '❓';

    if (isAnimatingJudgement && eliminated) {
      const wasImpostor = gameResult.impostors.some(i => i.id === eliminated.id);
      return (
        <div className="page" style={{ 
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', 
          background: wasImpostor ? 'radial-gradient(circle, rgba(16,185,129,0.2) 0%, rgba(15,23,42,1) 100%)' : 'radial-gradient(circle, rgba(239,68,68,0.2) 0%, rgba(15,23,42,1) 100%)' 
        }}>
          <h2 className="text-center" style={{ marginBottom: '40px', fontSize: '1.5rem', animation: 'fadeIn 1s ease-in' }}>
            O grupo decidiu...
          </h2>
          
          <div style={{ position: 'relative', width: '150px', height: '150px', animation: 'shake 0.5s infinite alternate' }}>
            <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <AvatarDisplay avatar={eliminatedAvatar} size="6rem" />
            </div>
            {/* Grades da prisão (CSS simples) */}
            <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', background: 'repeating-linear-gradient(90deg, transparent, transparent 30px, #333 30px, #333 40px)', animation: 'slideDown 1s ease-out forwards', opacity: 0.8 }} />
          </div>

          <h3 style={{ marginTop: '20px', animation: 'fadeIn 2s ease-in' }}>{eliminated.name}</h3>

          <div style={{ marginTop: '30px', animation: 'fadeIn 3.5s ease-in', fontSize: '1.5rem', fontWeight: 'bold', color: wasImpostor ? 'var(--success)' : 'var(--danger)' }}>
            {wasImpostor ? 'ERA UM IMPOSTOR!' : 'NÃO ERA O IMPOSTOR...'}
          </div>
        </div>
      );
    }

    if (isAnimatingJudgement && !eliminated) {
      return (
        <div className="page" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
          <h2 className="text-center" style={{ animation: 'fadeIn 1s ease-in' }}>Empate! Ninguém foi eliminado.</h2>
        </div>
      );
    }

    return (
      <div className="page">
        <div className="result-emoji" style={{ animation: playerWon ? 'bounce 2s infinite' : 'shake 1s' }}>
          {gameResult.impostorsFound ? '🎉' : '😈'}
        </div>

        <div className="result-title">
          {roomState.abortedDueToDisconnect
            ? 'JOGO CANCELADO'
            : (gameResult.impostorsFound ? 'VOCÊS DESCOBRIRAM O IMPOSTOR!' : 'O IMPOSTOR ESCAPOU!')
          }
        </div>

        <div className="result-subtitle">
          {roomState.abortedDueToDisconnect
            ? 'A partida foi encerrada porque não há jogadores suficientes.'
            : (playerWon ? '🏆 Você ganhou!' : '💀 Você perdeu!')
          }
          {!roomState.abortedDueToDisconnect && isImpostor && !gameResult.impostorsFound && ' Você era o impostor.'}
        </div>

        {/* Result Cards Container */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', marginTop: '20px', width: '100%', alignItems: 'stretch' }}>
          {/* Votes */}
          <div className="card" style={{ flex: '1 1 280px', margin: 0 }}>
            <p style={{ fontWeight: 600, marginBottom: '12px' }}>Resultado da votação</p>
            {gameResult.votes.map((v, i) => (
              <div key={v.playerId} className="vote-result">
                <span style={{ minWidth: '80px', fontSize: '0.9rem', fontWeight: 500 }}>
                  {v.playerName}
                  {roomState.players.find(p => p.id === v.playerId)?.isWinner && <span title="Vencedor" style={{ marginLeft: '4px' }}>👑</span>}
                </span>
                <div className="vote-bar-container">
                  <div
                    className={`vote-bar ${i === 0 && v.voteCount > 0 ? 'winner' : ''}`}
                    style={{ width: `${(v.voteCount / maxVotes) * 100}%` }}
                  />
                </div>
                <span className="vote-count">
                  {v.voteCount} voto{v.voteCount !== 1 ? 's' : ''}
                </span>
              </div>
            ))}
          </div>

          <div className="card" style={{ flex: '1 1 100%', margin: 0, padding: 'var(--space-4)', maxWidth: '600px' }}>
            <div style={{ marginBottom: '12px' }}>
              <span className="result-word-label">Tema</span>
              <p className="result-word" style={{ color: 'var(--text)' }}>
                {gameResult.themeName}
              </p>
            </div>
            
            <div style={{ marginBottom: '12px' }}>
              <span className="result-word-label">
                {gameResult.totalImpostors > 1 ? 'Os impostores eram:' : 'O impostor era:'}
              </span>
              <p className="result-word" style={{ color: 'var(--danger)' }}>
                {gameResult.impostors.map(i => i.name).join(', ')}
              </p>
            </div>

            <div style={{ display: 'flex', gap: '16px' }}>
              <div>
                <span className="result-word-label">Palavra dos jogadores</span>
                <p className="result-word" style={{ color: 'var(--success)' }}>{gameResult.normalWord}</p>
              </div>
              <div>
                <span className="result-word-label">Palavra do impostor</span>
                <p className="result-word" style={{ color: 'var(--danger)' }}>{gameResult.impostorWord}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="spacer-6" />

        {/* Actions */}
        {isHost ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', width: '100%', maxWidth: '400px', margin: '0 auto' }}>
            {roomState.currentRound < (roomState.config.totalRounds || 3) ? (
              <button className="btn btn-primary btn-xl" onClick={nextRound}>
                ▶ Próxima Rodada ({roomState.currentRound}/{roomState.config.totalRounds || 3})
              </button>
            ) : (
              <>
                <button className="btn btn-primary btn-xl" onClick={playAgain}>
                  🔄 Jogar novamente
                </button>
                <div style={{ display: 'flex', gap: '12px' }}>
                  <button className="btn btn-secondary" style={{ flex: 2, height: '44px' }} onClick={changeTheme}>
                    🎨 Novo tema
                  </button>
                  <button className="btn btn-ghost" style={{ flex: 1, height: '44px' }} onClick={leaveRoom}>
                    🚪 Sair
                  </button>
                </div>
              </>
            )}
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', width: '100%', maxWidth: '400px', margin: '0 auto' }}>
            <div className="status-badge waiting">
              ⏳ Aguardando o host decidir...
            </div>
            {roomState.currentRound >= (roomState.config.totalRounds || 3) && (
              <button className="btn btn-ghost" onClick={leaveRoom}>
                🚪 Sair da sala
              </button>
            )}
          </div>
        )}
      </div>
    );
  }

  // ─── FALLBACK ───────────────────────
  return (
    <div className="page">
      <div className="spinner" style={{ margin: '40px auto' }} />
      <p className="text-muted text-center">Carregando...</p>
    </div>
  );
}
