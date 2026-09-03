import React from 'react';
import { useGame } from '../context/GameContext';

interface Props {
  playerId: string;
}

export function PlayerReactions({ playerId }: Props) {
  const { activeReactions } = useGame();
  
  const myReactions = activeReactions.filter(r => r.playerId === playerId);
  
  if (myReactions.length === 0) return null;

  return (
    <div style={{ position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)', zIndex: 100, pointerEvents: 'none', display: 'flex', justifyContent: 'center' }}>
      {myReactions.map(r => {
        const isImage = r.reaction.startsWith('data:image/');
        return (
          <div
            key={r.id}
            style={{
              position: 'absolute',
              animation: 'floatReaction 4s ease-out forwards',
              whiteSpace: 'nowrap'
            }}
          >
            {isImage ? (
              <img src={r.reaction} alt="Reaction" style={{ maxHeight: '80px', maxWidth: '80px', borderRadius: '8px', objectFit: 'contain', filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.3))' }} />
            ) : (
              <span style={{ fontSize: '3rem', filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.3))' }}>{r.reaction}</span>
            )}
          </div>
        );
      })}
    </div>
  );
}
