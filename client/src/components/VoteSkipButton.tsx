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
    <div style={{ marginTop: '24px', display: 'flex', justifyContent: 'center' }}>
      <button 
        onClick={() => voteSkip()}
        disabled={me.hasVotedSkip}
        className="btn"
        style={{
          border: '2px dashed var(--text-primary)',
          cursor: me.hasVotedSkip ? 'not-allowed' : 'pointer',
        }}
        title="Pular / Desistir (todos precisam votar)"
      >
        {me.hasVotedSkip ? '✅ Voto Registrado para Pular' : '⏭️ Pular / Anular Rodada'}
      </button>
    </div>
  );
}
