import React, { useEffect, useState } from 'react';
import { PublicPlayer } from '@shared/types';
import { AvatarDisplay } from './AvatarDisplay';

interface PodiumProps {
  players: PublicPlayer[];
}

export function Podium({ players }: PodiumProps) {
  // Sort players by score just in case, but usually they come sorted
  const sorted = [...players].sort((a, b) => b.score - a.score);
  const top3 = sorted.slice(0, 3);
  const [show, setShow] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setShow(true), 300);
    return () => clearTimeout(t);
  }, []);

  const first = top3[0];
  const second = top3[1];
  const third = top3[2];

  const renderSpot = (player: PublicPlayer | undefined, place: 1 | 2 | 3, height: string, color: string) => {
    if (!player) return <div style={{ flex: 1, minWidth: '80px' }} />;
    
    return (
        <div style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'flex-end',
          position: 'relative',
          minWidth: '70px',
          maxWidth: '120px',
          transform: show ? 'translateY(0)' : 'translateY(100%)',
          opacity: show ? 1 : 0,
          transition: `all 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275) ${place === 1 ? '0.6s' : place === 2 ? '0.3s' : '0s'}`,
        }}>
        <div style={{ 
          marginBottom: '8px', 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center',
          animation: place === 1 && show ? 'bounce 2s infinite' : 'none',
          position: 'relative',
          zIndex: 10
        }}>
          {place === 1 && <span style={{ fontSize: '2rem', position: 'absolute', top: '-30px' }}>👑</span>}
          <AvatarDisplay avatar={player.avatar} size={place === 1 ? '5.5rem' : '4.5rem'} />
          <span style={{ 
            fontWeight: 900, 
            marginTop: '8px',
            fontSize: place === 1 ? '1.1rem' : '0.9rem',
            textAlign: 'center',
            textOverflow: 'ellipsis',
            overflow: 'hidden',
            maxWidth: '100%',
            whiteSpace: 'nowrap',
            fontFamily: 'var(--font-display)',
            textTransform: 'uppercase',
            color: 'var(--text-primary)',
            background: 'var(--bg-primary)',
            padding: '2px 8px',
            borderRadius: '4px',
            border: '2px solid var(--text-primary)'
          }}>
            {player.name}
          </span>
          <span style={{ fontWeight: 900, color: 'var(--bg-primary)', background: 'var(--text-primary)', padding: '2px 8px', borderRadius: '4px', marginTop: '4px', fontSize: '0.85rem' }}>
            {player.score} pts
          </span>
        </div>
        
        {/* The block */}
        <div style={{
          width: '100%',
          height: height,
          background: color,
          border: '4px solid var(--text-primary)',
          borderRadius: '8px 8px 0 0',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'flex-start',
          paddingTop: '16px',
          fontSize: '2.5rem',
          fontWeight: 900,
          fontFamily: 'var(--font-display)',
          boxShadow: 'inset 0 15px 0 rgba(255,255,255,0.3)',
          position: 'relative'
        }}>
          {place}
        </div>
      </div>
    );
  };

  return (
    <div style={{ 
      display: 'flex', 
      alignItems: 'flex-end', 
      justifyContent: 'center', 
      gap: '0', 
      height: '320px',
      width: '100%',
      maxWidth: '600px',
      margin: '0 auto 32px',
      overflow: 'hidden',
      paddingTop: '40px',
      borderBottom: '4px solid var(--text-primary)'
    }}>
      {renderSpot(second, 2, '120px', '#e0e0e0')}
      {renderSpot(first, 1, '180px', '#ffd700')}
      {renderSpot(third, 3, '80px', '#cd7f32')}
    </div>
  );
}
