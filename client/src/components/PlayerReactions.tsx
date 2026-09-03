import React from 'react';
import { useGame } from '../context/GameContext';

interface Props {
  playerId?: string;
  globalMode?: boolean;
}

export function PlayerReactions({ playerId, globalMode }: Props) {
  const { activeReactions } = useGame();
  
  const myReactions = globalMode 
    ? activeReactions 
    : activeReactions.filter(r => r.playerId === playerId);
  
  if (myReactions.length === 0) return null;

  return (
    <div style={{ 
      position: globalMode ? 'fixed' : 'absolute', 
      bottom: globalMode ? '20px' : 'auto',
      top: globalMode ? 'auto' : 0, 
      left: '50%', 
      transform: 'translateX(-50%)', 
      zIndex: 99999, 
      pointerEvents: 'none', 
      display: 'flex', 
      justifyContent: 'center' 
    }}>
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
              <img src={r.reaction} alt="Reaction" style={{ maxHeight: '48px', maxWidth: '48px', borderRadius: '8px', objectFit: 'contain', filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))' }} />
            ) : (
              <span style={{ fontSize: '2rem', filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))' }}>{r.reaction}</span>
            )}
          </div>
        );
      })}
    </div>
  );
}
