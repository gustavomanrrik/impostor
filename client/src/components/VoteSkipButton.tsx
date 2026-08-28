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
    <div style={{ position: 'absolute', top: '16px', right: '16px', zIndex: 10 }}>
      <button 
        onClick={() => voteSkip()}
        disabled={me.hasVotedSkip}
        className="btn btn-ghost"
        style={{
          cursor: me.hasVotedSkip ? 'not-allowed' : 'pointer',
          padding: '8px 12px',
          fontSize: '0.9rem',
        }}
        title="Pular / Anular Rodada (todos precisam votar)"
      >
        {me.hasVotedSkip ? '✅ Votado para anular' : '⏭️ Anular Rodada'}
      </button>
    </div>
  );
}
