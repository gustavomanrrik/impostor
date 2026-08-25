import React from 'react';
import { GameProvider, useGame } from './context/GameContext';
import { Home } from './pages/Home';
import { OnlineCreate } from './pages/OnlineCreate';
import { OnlineJoin } from './pages/OnlineJoin';
import { Lobby } from './pages/Lobby';
import { Game } from './pages/Game';
import { LocalSetup } from './pages/LocalSetup';
import { LocalGame } from './pages/LocalGame';
import { HowToPlay } from './pages/HowToPlay';
import { Settings } from './pages/Settings';
import { History } from './pages/History';
import { ToastContainer } from './components/ui/Toast';
import { SuspenseReveal } from './components/SuspenseReveal';

function AppContent() {
  const { page, toasts, showSuspense } = useGame();

  return (
    <>
      <div className="bg-pattern" />
      <ToastContainer toasts={toasts} />
      {showSuspense && <SuspenseReveal />}

      {page === 'home' && <Home />}
      {page === 'online-create' && <OnlineCreate />}
      {page === 'online-join' && <OnlineJoin />}
      {page === 'lobby' && <Lobby />}
      {page === 'game' && <Game />}
      {page === 'local-setup' && <LocalSetup />}
      {page === 'local-game' && <LocalGame />}
      {page === 'how-to-play' && <HowToPlay />}
      {page === 'settings' && <Settings />}
      {page === 'history' && <History />}
    </>
  );
}

export default function App() {
  return (
    <GameProvider>
      <AppContent />
    </GameProvider>
  );
}
