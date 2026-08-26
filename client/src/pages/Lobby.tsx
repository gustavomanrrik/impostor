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
      return <TestaLobby />;
    case GameType.NUMBERS:
      return <NumbersLobby />;
    case GameType.IMPOSTOR:
    default:
      return <ImpostorLobby />;
  }
}
