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
  const { page, toasts, showSuspense, isChatMinimized, roomState, playerId, voteSkip } = useGame();
  const showChat = page === 'lobby' || page === 'game';
  const [soundEnabled, setSoundEnabled] = useState(isSoundsEnabled());

  // Botões globais no canto superior
  const GlobalToggles = () => {
    const isIngame = roomState && (roomState.state === 'IN_GAME' || roomState.state === 'WORD_REVEAL' || roomState.state === 'DISCUSSION');
    const me = roomState?.players.find(p => p.id === playerId);
    
    return (
      <div style={{ position: 'fixed', top: '16px', right: '16px', zIndex: 50, display: 'flex', gap: '8px' }}>
        {isIngame && me && !me.isWinner && !me.hasBeenDiscovered && (
          <button 
            onClick={() => voteSkip()}
            disabled={me.hasVotedSkip}
            style={{
              background: me.hasVotedSkip ? 'var(--accent-primary)' : 'var(--bg-glass-strong)',
              color: me.hasVotedSkip ? 'var(--bg-primary)' : 'inherit',
              border: '2px dashed var(--text-primary)',
              borderRadius: 'var(--radius-sm)',
              padding: '0 16px',
              height: '40px',
              cursor: me.hasVotedSkip ? 'not-allowed' : 'pointer',
              fontSize: '0.9rem',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: 'var(--shadow-md)',
            }}
            title="Pular / Desistir (todos precisam votar)"
          >
            {me.hasVotedSkip ? 'Votado!' : 'Pular Rodada'}
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
