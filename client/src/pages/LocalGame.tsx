import React, { useState } from 'react';
import { useGame } from '../context/GameContext';
import { addHistoryEntry } from '../services/localStorage';
import { playWinSound, playLoseSound, playSuspenseSound } from '../services/sounds';
import type { GameResult, VoteResult, GameHistoryEntry } from '@shared/types';

export function LocalGame() {
  const { localState, setLocalState, navigate, addToast } = useGame();
  const [wordVisible, setWordVisible] = useState(false);
  const [selectedVote, setSelectedVote] = useState<string | null>(null);
  const [showSuspense, setShowSuspense] = useState(false);

  if (!localState) {
    navigate('home');
    return null;
  }

  const { phase, players, currentPlayerIndex } = localState;
  const currentPlayer = players[currentPlayerIndex];

  // ─── WORD REVEAL ───────────────────────
  if (phase === 'word-reveal') {
    if (!currentPlayer) {
      // All players have seen their words -> discussion
      setLocalState({ ...localState, phase: 'discussion' });
      return null;
    }

    if (currentPlayer.hasSeenWord) {
      // Move to next player
      const nextIndex = currentPlayerIndex + 1;
      if (nextIndex >= players.length) {
        setLocalState({ ...localState, phase: 'discussion', currentPlayerIndex: 0 });
      } else {
        setLocalState({ ...localState, currentPlayerIndex: nextIndex });
        setWordVisible(false);
      }
      return null;
    }

    return (
      <div className="page">
        {!wordVisible ? (
          <>
            <div style={{ fontSize: '3rem', marginBottom: '16px' }}>🎭</div>
            <h2 className="text-center">Passe o dispositivo para</h2>
            <h1 className="text-gradient" style={{ marginTop: '8px' }}>{currentPlayer.name}</h1>
            <p className="text-muted text-center" style={{ marginTop: '12px', fontSize: '0.9rem' }}>
              Jogador {currentPlayerIndex + 1} de {players.length}
            </p>

            <div className="spacer-8" />

            <button
              className="btn btn-primary btn-xl"
              onClick={() => setWordVisible(true)}
            >
              👁 Mostrar minha palavra
            </button>

            <p className="text-muted text-center" style={{ marginTop: '8px', fontSize: '0.8rem' }}>
              Certifique-se de que ninguém mais está olhando!
            </p>
          </>
        ) : (
          <>
            <p className="text-muted" style={{ marginBottom: '4px', fontSize: '0.9rem' }}>{currentPlayer.name}, sua palavra é:</p>
            <div className="word-display text-gradient">
              {currentPlayer.word}
            </div>
            <p className="text-muted text-center" style={{ fontSize: '0.85rem', marginBottom: '24px' }}>
              🤫 Memorize e não mostre para ninguém.
            </p>

            <button
              className="btn btn-primary btn-xl"
              onClick={() => {
                const updatedPlayers = [...players];
                updatedPlayers[currentPlayerIndex] = { ...currentPlayer, hasSeenWord: true };
                setWordVisible(false);

                const nextIndex = currentPlayerIndex + 1;
                if (nextIndex >= players.length) {
                  setLocalState({ ...localState, players: updatedPlayers, phase: 'discussion', currentPlayerIndex: 0 });
                } else {
                  setLocalState({ ...localState, players: updatedPlayers, currentPlayerIndex: nextIndex });
                }
              }}
            >
              ✅ Próximo jogador
            </button>
          </>
        )}
      </div>
    );
  }

  // ─── DISCUSSION ───────────────────────
  if (phase === 'discussion') {
    return (
      <div className="page">
        <div className="status-badge voting" style={{ marginBottom: '12px' }}>
          💬 FASE DE DISCUSSÃO
        </div>

        <h2 className="text-center">Hora de discutir!</h2>
        <p className="text-muted text-center" style={{ marginTop: '8px', fontSize: '0.9rem' }}>
          Façam perguntas uns aos outros e tentem descobrir quem é o impostor.
        </p>

        <div className="spacer-4" />

        <div className="card" style={{ marginBottom: '16px' }}>
          <p className="text-muted" style={{ fontSize: '0.8rem', marginBottom: '8px' }}>Jogadores nesta partida:</p>
          <div className="player-list">
            {players.map(p => (
              <div key={p.id} className="player-item">
                <div className="player-dot" />
                <span className="player-name">{p.name}</span>
              </div>
            ))}
          </div>
        </div>

        <button
          className="btn btn-primary btn-xl"
          onClick={() => setLocalState({ ...localState, phase: 'voting', currentPlayerIndex: 0 })}
        >
          🗳️ Iniciar votação
        </button>
      </div>
    );
  }

  // ─── VOTING ───────────────────────
  if (phase === 'voting') {
    if (!currentPlayer) {
      // All voted -> calculate result
      calculateLocalResult();
      return null;
    }

    if (currentPlayer.hasVoted) {
      const nextIndex = currentPlayerIndex + 1;
      if (nextIndex >= players.length) {
        calculateLocalResult();
      } else {
        setLocalState({ ...localState, currentPlayerIndex: nextIndex });
        setSelectedVote(null);
      }
      return null;
    }

    const otherPlayers = players.filter(p => p.id !== currentPlayer.id);

    return (
      <div className="page">
        {!selectedVote || selectedVote === '__choosing__' ? (
          <>
            <div style={{ fontSize: '3rem', marginBottom: '16px' }}>🗳️</div>
            {selectedVote !== '__choosing__' ? (
              <>
                <h2 className="text-center">Passe o dispositivo para</h2>
                <h1 className="text-gradient" style={{ marginTop: '8px' }}>{currentPlayer.name}</h1>
                <p className="text-muted text-center" style={{ marginTop: '12px', fontSize: '0.9rem' }}>
                  Voto {currentPlayerIndex + 1} de {players.length}
                </p>

                <div className="spacer-8" />

                <button
                  className="btn btn-primary btn-xl"
                  onClick={() => setSelectedVote('__choosing__')}
                >
                  🗳️ Votar secretamente
                </button>
              </>
            ) : (
              <>
                <h2 className="text-center">{currentPlayer.name}, quem é o impostor?</h2>
                <div className="spacer-4" />

                <div className="flex flex-col gap-3 w-full">
                  {otherPlayers.map(p => (
                    <div
                      key={p.id}
                      className="vote-option"
                      onClick={() => {
                        setSelectedVote(p.id);
                        // Register vote
                        const updatedPlayers = [...players];
                        updatedPlayers[currentPlayerIndex] = { ...currentPlayer, hasVoted: true };
                        const newVotes = new Map(localState.votes);
                        newVotes.set(currentPlayer.id, p.id);

                        setTimeout(() => {
                          const nextIndex = currentPlayerIndex + 1;
                          if (nextIndex >= players.length) {
                            setLocalState({
                              ...localState,
                              players: updatedPlayers,
                              votes: newVotes,
                              currentPlayerIndex: nextIndex,
                            });
                            setSelectedVote(null);
                          } else {
                            setLocalState({
                              ...localState,
                              players: updatedPlayers,
                              votes: newVotes,
                              currentPlayerIndex: nextIndex,
                            });
                            setSelectedVote(null);
                          }
                        }, 800);
                      }}
                    >
                      <div className="vote-radio">
                        <div className="vote-radio-inner" />
                      </div>
                      <span style={{ fontWeight: 500 }}>{p.name}</span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </>
        ) : (
          <div className="page">
            <div style={{ fontSize: '3rem' }}>✅</div>
            <h3 className="text-center" style={{ marginTop: '8px' }}>Voto registrado!</h3>
            <p className="text-muted text-center" style={{ marginTop: '4px' }}>Passe o dispositivo para o próximo jogador.</p>
          </div>
        )}
      </div>
    );
  }

  // ─── SUSPENSE ───────────────────────
  if (showSuspense) {
    return (
      <div className="suspense-screen">
        <div className="suspense-text">OS VOTOS FORAM CONTADOS...</div>
        <div className="suspense-dots">
          <div className="suspense-dot" />
          <div className="suspense-dot" />
          <div className="suspense-dot" />
        </div>
      </div>
    );
  }

  // ─── RESULT ───────────────────────
  if (phase === 'result' && localState.result) {
    const result = localState.result;
    const maxVotes = Math.max(...result.votes.map(v => v.voteCount), 1);

    return (
      <div className="page">
        <div className="result-emoji">
          {result.impostorsFound ? '🎉' : '😈'}
        </div>

        <div className="result-title">
          {result.impostorsFound
            ? 'VOCÊS DESCOBRIRAM O IMPOSTOR!'
            : 'O IMPOSTOR ESCAPOU!'
          }
        </div>

        {/* Votes */}
        <div className="card" style={{ marginTop: '20px' }}>
          <p style={{ fontWeight: 600, marginBottom: '12px' }}>Votos</p>
          {result.votes.map((v, i) => (
            <div key={v.playerId} className="vote-result">
              <span style={{ minWidth: '80px', fontSize: '0.9rem', fontWeight: 500 }}>{v.playerName}</span>
              <div className="vote-bar-container">
                <div
                  className={`vote-bar ${i === 0 && v.voteCount > 0 ? 'winner' : ''}`}
                  style={{ width: `${(v.voteCount / maxVotes) * 100}%` }}
                />
              </div>
              <span className="vote-count">{v.voteCount}</span>
            </div>
          ))}
        </div>

        <div className="card" style={{ marginTop: '12px' }}>
          <div style={{ marginBottom: '12px' }}>
            <span className="result-word-label">O impostor era:</span>
            <p className="result-word" style={{ color: 'var(--danger)' }}>
              {result.impostors.map(i => i.name).join(', ')}
            </p>
          </div>
          <div style={{ display: 'flex', gap: '16px' }}>
            <div>
              <span className="result-word-label">Palavra normal</span>
              <p className="result-word" style={{ color: 'var(--success)' }}>{result.normalWord}</p>
            </div>
            <div>
              <span className="result-word-label">Palavra impostor</span>
              <p className="result-word" style={{ color: 'var(--danger)' }}>{result.impostorWord}</p>
            </div>
          </div>
        </div>

        <div className="spacer-6" />

        <button className="btn btn-primary btn-xl" onClick={() => navigate('local-setup')}>
          🔄 Jogar novamente
        </button>
        <div className="spacer-3" />
        <button className="btn btn-ghost" onClick={() => navigate('home')}>
          🏠 Voltar ao início
        </button>
      </div>
    );
  }

  return null;

  // ─── Helper ───────────────────────
  function calculateLocalResult() {
    setShowSuspense(true);
    playSuspenseSound();

    setTimeout(() => {
      const votes = localState!.votes;
      const voteCounts = new Map<string, number>();

      for (const votedFor of votes.values()) {
        voteCounts.set(votedFor, (voteCounts.get(votedFor) || 0) + 1);
      }

      const voteResults: VoteResult[] = players.map(p => ({
        playerId: p.id,
        playerName: p.name,
        voteCount: voteCounts.get(p.id) || 0,
      })).sort((a, b) => b.voteCount - a.voteCount);

      const maxVotes = voteResults[0]?.voteCount || 0;
      const mostVoted = voteResults.filter(v => v.voteCount === maxVotes);

      let eliminatedPlayer: { id: string; name: string } | null = null;
      if (mostVoted.length === 1 && maxVotes > 0) {
        eliminatedPlayer = { id: mostVoted[0].playerId, name: mostVoted[0].playerName };
      }

      const impostors = players.filter(p => p.isImpostor).map(p => ({ id: p.id, name: p.name }));
      let impostorsDiscovered = 0;
      if (eliminatedPlayer) {
        const isImpostor = players.find(p => p.id === eliminatedPlayer!.id)?.isImpostor;
        if (isImpostor) impostorsDiscovered = 1;
      }

      const impostorsFound = impostorsDiscovered === impostors.length;

      const result: GameResult = {
        impostorsFound,
        impostors,
        normalWord: localState!.normalWord,
        impostorWord: localState!.impostorWord,
        themeName: localState!.config.themeName,
        votes: voteResults,
        eliminatedPlayer,
        impostorsDiscovered,
        totalImpostors: impostors.length,
      };

      if (impostorsFound) playWinSound(); else playLoseSound();

      // Save to history
      const historyEntry: GameHistoryEntry = {
        id: Date.now().toString(),
        date: new Date().toISOString(),
        theme: localState!.config.themeName,
        normalWord: localState!.normalWord,
        impostorWord: localState!.impostorWord,
        playerCount: players.length,
        wasImpostor: false,
        won: impostorsFound,
        groupId: localState!.groupId,
      };
      addHistoryEntry(historyEntry);

      setShowSuspense(false);
      setLocalState({ ...localState!, phase: 'result', result });
    }, 3500);
  }
}
