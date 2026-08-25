import React, { useState } from 'react';
import { useGame } from '../context/GameContext';
import { GameState } from '@shared/types';

export function Game() {
  const { roomState, playerId, myWord, isImpostor, gameResult, markWordSeen, requestVote, submitVote, voteSkip, nextRound, changeTheme, leaveRoom, addToast } = useGame();
  const [wordVisible, setWordVisible] = useState(false);
  const [wordSeen, setWordSeen] = useState(false);
  const [selectedVote, setSelectedVote] = useState<string | null>(null);
  const [hasVoted, setHasVoted] = useState(false);
  const [hasRequestedVote, setHasRequestedVote] = useState(false);
  const [showConfirmVoteRequest, setShowConfirmVoteRequest] = useState(false);

  if (!roomState) return null;

  const currentPlayer = roomState.players.find(p => p.id === playerId);
  const isHost = roomState.hostId === playerId;

  // ─── WORD REVEAL PHASE ───────────────────────
  if (roomState.state === GameState.WORD_REVEAL || (roomState.state === GameState.DISCUSSION && !wordSeen)) {
    return (
      <div className="page">
        <h3 className="text-center" style={{ marginBottom: '8px' }}>Sua palavra é:</h3>

        {wordVisible ? (
          <>
            <div className="word-display word-visible text-gradient">
              {myWord || '...'}
            </div>
            <p className="text-muted text-center" style={{ fontSize: '0.85rem', marginBottom: '16px' }}>
              🤫 Não mostre sua palavra para ninguém.
            </p>
            <button
              className="btn btn-secondary"
              onClick={() => setWordVisible(false)}
            >
              👁 Esconder palavra
            </button>
          </>
        ) : (
          <>
            <div className="word-display word-hidden" aria-hidden="true" style={{ color: 'var(--text-muted)' }}>
              ••••••••
            </div>
            <p className="text-muted text-center" style={{ fontSize: '0.85rem', marginBottom: '16px' }}>
              Palavra escondida
            </p>
            <button
              className="btn btn-primary"
              onClick={() => setWordVisible(true)}
            >
              👁 Mostrar palavra
            </button>
          </>
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
      <div className="page" style={{ position: 'relative' }}>
        <button 
          className="btn btn-ghost"
          style={{ position: 'absolute', top: 0, right: 0, padding: '8px', color: currentPlayer?.hasVotedSkip ? 'var(--accent-primary)' : 'var(--text-muted)' }}
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

        <div className="status-badge voting" style={{ marginBottom: '12px', marginTop: '32px' }}>
          💬 FASE DE DISCUSSÃO
        </div>

        <h2 className="text-center">Hora de discutir!</h2>
        <p className="text-muted text-center" style={{ marginTop: '8px', fontSize: '0.9rem' }}>
          Façam perguntas uns aos outros e tentem descobrir quem recebeu uma palavra diferente.
        </p>

        {roomState.config.showImpostorCount && (
          <p className="text-muted text-center" style={{ fontSize: '0.85rem', marginTop: '4px' }}>
            Há {roomState.config.impostorMode === 'AUTO'
              ? (roomState.totalPlayers <= 4 ? '1 impostor' : '2 impostores')
              : `${roomState.config.customImpostorCount} impostor${roomState.config.customImpostorCount > 1 ? 'es' : ''}`
            } entre vocês.
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
              <span key={p.id} style={{ fontSize: '0.8rem', color: 'var(--accent-primary)', marginRight: '8px' }}>
                🗳️ {p.name}
              </span>
            ))}
          </div>
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
              <span key={p.id} style={{ marginRight: '8px' }}>• {p.name}</span>
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

    return (
      <div className="page">
        <div className="result-emoji">
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
