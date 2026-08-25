import React, { useState, useEffect, useRef } from 'react';
import { useGame } from '../context/GameContext';
import { GameState } from '@shared/types';
import { AvatarDisplay } from '../components/AvatarDisplay';
import { compressImage } from '../utils/image';

export function Game() {
  const { roomState, playerId, myWord, isImpostor, gameResult, markWordSeen, requestVote, submitVote, voteSkip, nextRound, changeTheme, leaveRoom, addToast, sendReaction, activeReactions, themes } = useGame();
  const [wordVisible, setWordVisible] = useState(false);
  const [wordSeen, setWordSeen] = useState(false);
  const [selectedVote, setSelectedVote] = useState<string | null>(null);
  const [hasVoted, setHasVoted] = useState(false);
  const [hasRequestedVote, setHasRequestedVote] = useState(false);
  const [showConfirmVoteRequest, setShowConfirmVoteRequest] = useState(false);
  const [isAnimatingJudgement, setIsAnimatingJudgement] = useState(false);
  const [customReaction, setCustomReaction] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const reactionImageInputRef = useRef<HTMLInputElement>(null);

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
            <div className="word-display word-visible text-gradient">
              {myWord || '...'}
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
              ••••••••
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
      </div>
    );
  }

  // ─── DISCUSSION PHASE ───────────────────────
  if (roomState.state === GameState.DISCUSSION) {
    return (
      <div className="page" style={{ position: 'relative', overflowX: 'hidden' }}>
        {/* Floating Reactions overlay */}
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, pointerEvents: 'none', zIndex: 100 }}>
          {activeReactions.map(r => {
            const isMe = r.playerId === playerId;
            const player = roomState.players.find(p => p.id === r.playerId);
            const isImage = r.reaction.startsWith('data:image/');
            return (
              <div
                key={r.id}
                style={{
                  position: 'absolute',
                  top: `${r.top}%`,
                  left: isMe ? 'auto' : '10px',
                  right: isMe ? '10px' : 'auto',
                  animation: 'floatUp 4s ease-out forwards',
                }}
                className="reaction-bubble"
              >
                <div className="avatar" style={{ display: 'flex', alignItems: 'center' }}>
                  <AvatarDisplay avatar={player?.avatar || ''} size="1.5rem" />
                </div>
                {isImage ? (
                  <img src={r.reaction} alt="Reaction" style={{ maxHeight: '100px', maxWidth: '100px', borderRadius: '8px', objectFit: 'contain' }} />
                ) : (
                  <span className="text">{r.reaction}</span>
                )}
              </div>
            );
          })}
        </div>
        
        {/* Top actions bar */}
        <div style={{ width: '100%', display: 'flex', justifyContent: 'flex-end', marginBottom: '8px' }}>
          <button 
            className="btn btn-ghost btn-sm"
            style={{ color: currentPlayer?.hasVotedSkip ? 'var(--accent-primary)' : 'var(--text-muted)' }}
            onClick={() => {
              if (!currentPlayer?.hasVotedSkip) {
                voteSkip();
              }
            }}
            disabled={currentPlayer?.hasVotedSkip}
            title="Pular rodada (todos precisam votar)"
          >
            {currentPlayer?.hasVotedSkip ? '❗️ Votou para Pular' : '❕ Pular Rodada'}
          </button>
        </div>

        <div className="status-badge voting" style={{ marginBottom: '12px' }}>
          💬 FASE DE DISCUSSÃO
        </div>

        <h2 className="text-center">Hora de discutir!</h2>
        <p className="text-muted text-center" style={{ marginTop: '8px', fontSize: '0.9rem' }}>
          Façam perguntas uns aos outros e tentem descobrir quem recebeu uma palavra diferente.
        </p>

        {roomState.config.showImpostorCount && (
          <p className="text-muted text-center" style={{ fontSize: '0.85rem', marginTop: '4px' }}>
            Há {roomState.config.customImpostorCount} impostor{roomState.config.customImpostorCount > 1 ? 'es' : ''} entre vocês.
          </p>
        )}

        <div className="spacer-4" />

        {/* Word peek */}
        <div className="card" style={{ textAlign: 'center', marginBottom: '16px' }}>
          <p className="text-muted" style={{ fontSize: '0.8rem', marginBottom: '4px' }}>Sua palavra:</p>
          {wordVisible ? (
            <>
              <p style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.5rem' }}>{myWord}</p>
              <button className="btn btn-ghost btn-sm" onClick={() => setWordVisible(false)} style={{ marginTop: '8px' }}>
                👁 Esconder
              </button>
            </>
          ) : (
            <button className="btn btn-ghost btn-sm" onClick={() => setWordVisible(true)}>
              👁 Ver palavra
            </button>
          )}
        </div>

        {/* Vote request progress */}
        <div className="card" style={{ marginBottom: '16px' }}>
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

          {/* Players who requested */}
          <div style={{ marginTop: '8px' }}>
            {roomState.players.filter(p => p.hasRequestedVote).map(p => (
              <span key={p.id} style={{ fontSize: '0.9rem', color: 'var(--accent-primary)', marginRight: '8px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                🗳️ <AvatarDisplay avatar={p.avatar} size="1.2rem" /> {p.name}
              </span>
            ))}
          </div>
        </div>

        {/* Quick Chat / Reactions */}
        <div className="card" style={{ marginBottom: '16px', padding: '12px' }}>
          <p className="text-muted" style={{ fontSize: '0.8rem', marginBottom: '8px', textAlign: 'center' }}>Reações Rápidas</p>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', justifyContent: 'center', marginBottom: '12px' }}>
            {['🤔 Suspeito', '😱 Quem foi?', '👀 Tô de olho', '🤡 Ih, rapaz', '👍 Concordo', '👎 Discordo'].map(phrase => (
              <button
                key={phrase}
                className="btn btn-ghost btn-sm"
                style={{ background: 'var(--bg-glass)' }}
                onClick={() => sendReaction(phrase)}
              >
                {phrase}
              </button>
            ))}
          </div>
          
          <form 
            onSubmit={(e) => {
              e.preventDefault();
              if (customReaction.trim()) {
                sendReaction(customReaction.trim());
                setCustomReaction('');
              }
            }}
            style={{ display: 'flex', gap: '8px', position: 'relative' }}
          >
            <div style={{ position: 'relative', flex: 1, display: 'flex', gap: '4px' }}>
              <div style={{ position: 'relative', flex: 1 }}>
                <button 
                  type="button" 
                  onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                  style={{
                    position: 'absolute',
                    left: '8px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    color: 'var(--text-muted)',
                    cursor: 'pointer',
                    fontSize: '1.2rem',
                    opacity: 0.7
                  }}
                >
                  😊
                </button>
                <input
                  type="text"
                  className="input"
                  style={{ width: '100%', padding: '8px 40px', fontSize: '0.9rem' }}
                  placeholder="Ou digite algo..."
                  maxLength={30}
                  value={customReaction}
                  onChange={(e) => setCustomReaction(e.target.value)}
                />
                <button 
                  type="button" 
                  onClick={() => reactionImageInputRef.current?.click()}
                  style={{
                    position: 'absolute',
                    right: '8px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    color: 'var(--text-muted)',
                    cursor: 'pointer',
                    fontSize: '1.2rem',
                    opacity: 0.7
                  }}
                  title="Enviar Imagem"
                >
                  📸
                </button>
              </div>
              <input
                type="file"
                ref={reactionImageInputRef}
                style={{ display: 'none' }}
                accept="image/*"
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  try {
                    const base64Image = await compressImage(file, 150);
                    sendReaction(base64Image);
                  } catch (err) {
                    console.error('Falha ao processar imagem:', err);
                    alert('Erro ao enviar imagem. Tente outra.');
                  }
                  if (reactionImageInputRef.current) {
                    reactionImageInputRef.current.value = '';
                  }
                }}
              />
            </div>
            <button 
              type="submit" 
              className="btn btn-primary btn-sm"
              disabled={!customReaction.trim()}
            >
              Enviar
            </button>

            {showEmojiPicker && (
              <div style={{
                position: 'absolute',
                bottom: '100%',
                left: 0,
                marginBottom: '8px',
                background: 'var(--bg-card)',
                border: '1px solid var(--bg-glass-strong)',
                padding: '8px',
                borderRadius: '8px',
                display: 'grid',
                gridTemplateColumns: 'repeat(5, 1fr)',
                gap: '4px',
                zIndex: 50,
                boxShadow: 'var(--shadow-lg)'
              }}>
                {['😂', '😱', '🤔', '🤡', '💀', '❤️', '👀', '👍', '👎', '🔥'].map(emoji => (
                  <button
                    key={emoji}
                    type="button"
                    onClick={() => {
                      setCustomReaction(prev => prev + emoji);
                      setShowEmojiPicker(false);
                    }}
                    style={{ background: 'transparent', border: 'none', fontSize: '1.2rem', cursor: 'pointer', padding: '4px' }}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            )}
          </form>
        </div>

        {/* Request vote button */}
        {!hasRequestedVote ? (
          <>
            {showConfirmVoteRequest ? (
              <div className="card">
                <p className="text-center" style={{ marginBottom: '12px' }}>Quer iniciar uma votação?</p>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button className="btn btn-ghost" style={{ flex: 1 }} onClick={() => setShowConfirmVoteRequest(false)}>
                    Cancelar
                  </button>
                  <button className="btn btn-primary" style={{ flex: 1 }} onClick={() => {
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
                className="btn btn-secondary btn-lg w-full"
                onClick={() => setShowConfirmVoteRequest(true)}
              >
                🗳️ Pedir votação
              </button>
            )}
          </>
        ) : (
          <div className="status-badge ready">
            ✅ Você pediu votação
          </div>
        )}
      </div>
    );
  }

  // ─── VOTING PHASE ───────────────────────
  if (roomState.state === GameState.VOTING) {
    const otherPlayers = roomState.players.filter(p => p.id !== playerId);

    if (hasVoted) {
      return (
        <div className="page">
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
      <div className="page">
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
  if (roomState.state === GameState.REVEALING) {
    return (
      <div className="page">
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
    const eliminatedAvatar = eliminated ? roomState.players.find(p => p.id === eliminated.id)?.avatar : '❓';

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
          {gameResult.impostorsFound
            ? 'VOCÊS DESCOBRIRAM O IMPOSTOR!'
            : 'O IMPOSTOR ESCAPOU!'
          }
        </div>

        <div className="result-subtitle">
          {playerWon ? '🏆 Você ganhou!' : '💀 Você perdeu!'}
          {isImpostor && !gameResult.impostorsFound && ' Você era o impostor.'}
        </div>

        {/* Votes */}
        <div className="card" style={{ marginTop: '20px' }}>
          <p style={{ fontWeight: 600, marginBottom: '12px' }}>Resultado da votação</p>
          {gameResult.votes.map((v, i) => (
            <div key={v.playerId} className="vote-result">
              <span style={{ minWidth: '80px', fontSize: '0.9rem', fontWeight: 500 }}>
                {v.playerName}
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

        {/* Reveal */}
        <div className="result-words">
          <div className="card">
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
          <div className="flex flex-col gap-3 w-full">
            <button className="btn btn-primary btn-xl" onClick={nextRound}>
              🔄 Jogar novamente
            </button>
            <button className="btn btn-secondary btn-lg w-full" onClick={changeTheme}>
              🎯 Escolher outro tema
            </button>
            <button className="btn btn-ghost" onClick={leaveRoom}>
              🚪 Sair da sala
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-3 w-full">
            <div className="status-badge waiting">
              ⏳ Aguardando o host decidir...
            </div>
            <button className="btn btn-ghost" onClick={leaveRoom}>
              🚪 Sair da sala
            </button>
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
