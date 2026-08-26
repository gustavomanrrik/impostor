import React, { useEffect, useState } from 'react';
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
import { Chat } from './components/Chat';

import { isSoundsEnabled, toggleSound } from './services/sounds';

function AppContent({ toggleTheme, theme }: { toggleTheme: () => void, theme: string }) {
  const { page, toasts, showSuspense, isChatMinimized, roomState, playerId, leaveRoom } = useGame();
  const showChat = page === 'lobby' || page === 'game';
  const [soundEnabled, setSoundEnabled] = useState(isSoundsEnabled());

  // Botões globais no canto superior
  const GlobalToggles = () => {
    return (
      <div style={{ position: 'fixed', top: '16px', right: showChat && !isChatMinimized ? 'calc(350px + 16px)' : '16px', zIndex: 50, display: 'flex', gap: '8px', transition: 'right 0.3s ease' }}>
        {roomState && (
          <button 
            onClick={leaveRoom}
            style={{
              background: 'var(--bg-glass-strong)',
              border: 'none',
              borderRadius: 'var(--radius-sm)',
              padding: '0 16px',
              height: '40px',
              cursor: 'pointer',
              fontSize: '0.9rem',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              boxShadow: 'var(--shadow-md)',
              color: 'var(--text-primary)'
            }}
            title="Sair da Sala"
          >
            Sair
          </button>
        )}
        
        <button 
          onClick={() => {
            setSoundEnabled(toggleSound());
          }}
          style={{
            background: 'var(--bg-glass-strong)',
            border: 'none',
            borderRadius: '50%',
            width: '40px',
            height: '40px',
            cursor: 'pointer',
            fontSize: '1.2rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: 'var(--shadow-md)',
          }}
          title={soundEnabled ? 'Silenciar Sons' : 'Ativar Sons'}
        >
          {soundEnabled ? '🔊' : '🔇'}
        </button>
        <button 
          onClick={toggleTheme}
          style={{
            background: 'var(--bg-glass-strong)',
            border: 'none',
            borderRadius: '50%',
            width: '40px',
            height: '40px',
            cursor: 'pointer',
            fontSize: '1.2rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: 'var(--shadow-md)',
          }}
          title="Alternar tema"
        >
          {theme === 'light' ? '🌙' : '☀️'}
        </button>
      </div>
    );
  };

  return (
    <>
      <div className="bg-pattern" />
      <GlobalToggles />
      <ToastContainer toasts={toasts} />
      {showSuspense && <SuspenseReveal />}

      <div className={`app-layout ${showChat && !isChatMinimized ? 'with-chat' : ''}`}>
        <div className="main-content">
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
        </div>
        
        {showChat && (
          <div className={isChatMinimized ? '' : 'sidebar-content fade-in'}>
            <Chat />
          </div>
        )}
      </div>
    </>
  );
}
export default function App() {
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark');

  useEffect(() => {
    if (theme === 'dark') {
      document.body.classList.add('dark-theme');
    } else {
      document.body.classList.remove('dark-theme');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => setTheme(prev => prev === 'light' ? 'dark' : 'light');

  return (
    <GameProvider>
      <AppContent toggleTheme={toggleTheme} theme={theme} />
    </GameProvider>
  );
}
