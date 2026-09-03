import React from 'react';
import { useGame } from '../context/GameContext';

export function VoteSkipButton() {
  const { roomState, playerId, voteSkip } = useGame();
  
  if (!roomState || roomState.state === 'LOBBY' || roomState.state === 'RESULT' || roomState.state === 'REVEALING') {
    return null;
  }
  
  const me = roomState.players.find(p => p.id === playerId);
  if (!me || me.isWinner || me.hasBeenDiscovered || me.isSpectator) return null;
  
  return (
    <div className="vote-skip-wrapper">
      <button 
        onClick={() => voteSkip()}
        disabled={me.hasVotedSkip}
        className="btn"
        style={{
          cursor: me.hasVotedSkip ? 'not-allowed' : 'pointer',
          padding: '4px 12px',
          fontSize: '0.8rem',
          border: '2px dashed var(--text-primary)',
          borderRadius: '20px',
          background: 'var(--bg-primary)',
          color: 'var(--text-primary)',
        }}
        title="Pular / Anular Rodada (todos precisam votar)"
      >
        {me.hasVotedSkip ? '✅ Anulando...' : '⏭️ Anular Rodada'}
      </button>
    </div>
  );
}
