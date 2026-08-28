import React from 'react';
import { useGame } from '../context/GameContext';
import { GameType } from '@shared/types';
import { ImpostorLobby } from './lobbies/ImpostorLobby';
import { TestaLobby } from './lobbies/TestaLobby';
import { NumbersLobby } from './lobbies/NumbersLobby';

export function Lobby() {
  const { roomState } = useGame();
  
  if (!roomState) return null;

  switch (roomState.config.gameType) {
    case GameType.TESTA:
      return <div className="page fade-in"><TestaLobby /></div>;
    case GameType.NUMBERS:
      return <div className="page fade-in"><NumbersLobby /></div>;
    case GameType.IMPOSTOR:
    default:
      return <div className="page fade-in"><ImpostorLobby /></div>;
  }
}
