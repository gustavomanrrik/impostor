import React, { useState } from 'react';
import { useGame } from '../context/GameContext';
import { VolumeX, Volume2, MessageCircle } from 'lucide-react';
import { KickPlayerButton } from './KickPlayerButton';

interface PlayerActionsProps {
  playerId: string;
  playerName: string;
}

export function PlayerActions({ playerId, playerName }: PlayerActionsProps) {
  const { mutedPlayers, toggleMutePlayer, sendWhisper, playerId: myId, roomState } = useGame();
  const [isWhispering, setIsWhispering] = useState(false);
  const [whisperText, setWhisperText] = useState('');

  if (playerId === myId) return null;

  const isMuted = mutedPlayers.includes(playerId);
  const isHost = roomState?.hostId === myId;

  const handleWhisper = (e: React.FormEvent) => {
    e.preventDefault();
    if (!whisperText.trim()) return;
    sendWhisper(playerId, whisperText.trim());
    setWhisperText('');
    setIsWhispering(false);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', width: '100%', marginTop: '4px' }}>
      {isWhispering ? (
        <form onSubmit={handleWhisper} style={{ display: 'flex', gap: '4px', width: '100%' }}>
          <input 
            type="text" 
            autoFocus 
            className="input" 
            style={{ padding: '2px 6px', fontSize: '0.8rem', minWidth: 0, flex: 1 }}
            placeholder={`Para ${playerName}...`}
            value={whisperText}
            onChange={e => setWhisperText(e.target.value)}
          />
          <button type="submit" className="btn btn-primary" style={{ padding: '2px 6px', fontSize: '0.8rem' }}>Enviar</button>
          <button type="button" className="btn btn-ghost" style={{ padding: '2px 6px', fontSize: '0.8rem' }} onClick={() => setIsWhispering(false)}>X</button>
        </form>
      ) : (
        <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
          {isHost && <KickPlayerButton playerId={playerId} playerName={playerName} />}
          <button 
            type="button"
            className="btn btn-ghost btn-sm btn-icon"
            onClick={(e) => {
              e.stopPropagation();
              setIsWhispering(true);
            }}
            title="Sussurrar"
          >
            <MessageCircle size={16} strokeWidth={2.5} />
          </button>
          
          <button 
            type="button"
            className={`btn ${isMuted ? 'btn-primary' : 'btn-ghost'} btn-sm btn-icon`}
            style={{ background: isMuted ? 'var(--error)' : 'transparent', color: isMuted ? 'white' : 'var(--text-primary)', border: isMuted ? '2px solid black' : 'none' }}
            onClick={(e) => {
              e.stopPropagation();
              toggleMutePlayer(playerId);
            }}
            title={isMuted ? 'Desmutar Chat' : 'Mutar Chat'}
          >
            {isMuted ? <VolumeX size={16} strokeWidth={2.5} /> : <Volume2 size={16} strokeWidth={2.5} />}
          </button>
        </div>
      )}
    </div>
  );
}

