import React from 'react';
import { useGame } from '../context/GameContext';
import { GameType } from '@shared/types';
import { ImpostorGame } from './ImpostorGame';
import { TestaGame } from './TestaGame';
import { NumbersGame } from './NumbersGame';

export function Game() {
  const { roomState } = useGame();

  if (!roomState) return null;

  switch (roomState.config.gameType) {
    case GameType.TESTA:
      return <TestaGame />;
    case GameType.NUMBERS:
      return <NumbersGame />;
    case GameType.IMPOSTOR:
    default:
      return <ImpostorGame />;
  }
}
