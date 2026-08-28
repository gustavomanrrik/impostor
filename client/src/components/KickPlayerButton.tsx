import React from 'react';
import { useGame } from '../context/GameContext';

export function KickPlayerButton({ playerId, playerName }: { playerId: string, playerName: string }) {
  const { roomState, playerId: myId, kickPlayer } = useGame();
  
  if (roomState?.hostId !== myId || playerId === myId) return null;

  return (
    <div style={{ position: 'absolute', top: '8px', right: '8px', zIndex: 10 }}>
      <button 
        className="btn btn-ghost" 
        style={{ padding: '4px', fontSize: '1.2rem', lineHeight: 1, minWidth: 'auto', background: 'transparent' }}
        title="Expulsar jogador"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          if (window.confirm(`Expulsar ${playerName}?`)) {
            kickPlayer(playerId);
          }
        }}
      >
        ⋮
      </button>
    </div>
  );
}
