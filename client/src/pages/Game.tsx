import React from 'react';
import { useGame } from '../context/GameContext';
import { GameType } from '@shared/types';
import { ImpostorGame } from './ImpostorGame';
import { TestaGame } from './TestaGame';
import { NumbersGame } from './NumbersGame';
import { ReactionsOverlay } from '../components/ReactionsOverlay';

export function Game() {
  const { roomState } = useGame();

  if (!roomState) return null;

  return (
    <>
      <ReactionsOverlay />
      <div key={roomState.state} className="page-transition" style={{ height: '100%', width: '100%' }}>
        {roomState.config.gameType === GameType.TESTA && <TestaGame />}
        {roomState.config.gameType === GameType.NUMBERS && <NumbersGame />}
        {(!roomState.config.gameType || roomState.config.gameType === GameType.IMPOSTOR) && <ImpostorGame />}
      </div>
    </>
  );
}
