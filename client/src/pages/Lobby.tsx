import React from 'react';
import { useGame } from '../context/GameContext';
import { GameType } from '@shared/types';
import { ImpostorLobby } from './lobbies/ImpostorLobby';
import { TestaLobby } from './lobbies/TestaLobby';
import { NumbersLobby } from './lobbies/NumbersLobby';

export function Lobby() {
  const { roomState, startGame } = useGame();
  
  if (!roomState) return null;

  const renderLobby = () => {
    switch (roomState.config.gameType) {
      case GameType.TESTA:
        return <TestaLobby />;
      case GameType.NUMBERS:
        return <NumbersLobby />;
      case GameType.IMPOSTOR:
      default:
        return <ImpostorLobby />;
    }
  };

  return (
    <div className="page page-centered fade-in">
      {renderLobby()}
      
      {/* Invisible Debug Mode Button */}
      <div 
        style={{ 
          position: 'fixed', 
          bottom: 0, 
          right: 0, 
          width: '50px', 
          height: '50px', 
          opacity: 0, 
          cursor: 'pointer',
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'rgba(255,0,0,0.8)',
          color: 'white',
          fontWeight: 'bold',
          transition: 'opacity 0.2s',
          borderRadius: '10px 0 0 0'
        }}
        onMouseEnter={(e) => e.currentTarget.style.opacity = '1'}
        onMouseLeave={(e) => e.currentTarget.style.opacity = '0'}
        onClick={() => startGame(true)}
        title="Forçar Início (Debug)"
      >
        FORÇAR
      </div>
    </div>
  );
}
