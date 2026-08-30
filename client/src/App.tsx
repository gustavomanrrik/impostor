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
import { ReactionsOverlay } from './components/ReactionsOverlay';
import { BottomNav } from './components/BottomNav';

import { isSoundsEnabled, toggleSound } from './services/sounds';

function AppContent({ toggleTheme, theme }: { toggleTheme: () => void, theme: string }) {
  const { page, navigate, toasts, showSuspense, mobileTab, isChatMinimized, roomState, playerId, leaveRoom } = useGame();
  const showChat = page === 'lobby' || page === 'game';
  const [soundEnabled, setSoundEnabled] = useState(isSoundsEnabled());

  // Top bar sticky — não usa position: fixed para não cobrir conteúdo
  const TopBar = () => (
    <div style={{
      position: 'sticky',
      top: 0,
      zIndex: 50,
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      gap: '8px',
      padding: '8px 12px',
      background: 'var(--bg-primary)',
      borderBottom: '2px solid var(--glass-border)',
      minHeight: '48px',
      flexShrink: 0,
    }}>
      {page !== 'home' ? (
        <div
          key={page}
          className="logo-drop-in hide-on-mobile"
          onClick={() => { if (!roomState) navigate('home'); }}
          style={{
            position: 'absolute',
            left: '50%',
            top: '50%',
            fontFamily: 'var(--font-display)',
            fontWeight: 800,
            fontSize: '1.4rem',
            cursor: roomState ? 'default' : 'pointer',
            pointerEvents: 'auto',
            whiteSpace: 'nowrap',
          }}
          title={roomState ? '' : 'Voltar ao Início'}
        >
          joguinhos bacanudos
        </div>
      ) : <div />}

      <div style={{ display: 'flex', gap: '6px', alignItems: 'center', flexShrink: 0 }}>
        {roomState && (
          <button
            onClick={leaveRoom}
            style={{
              background: 'var(--bg-glass-strong)',
              border: '2px solid var(--text-primary)',
              borderRadius: 'var(--radius-sm)',
              padding: '0 8px',
              height: '32px',
              cursor: 'pointer',
              fontSize: '0.85rem',
              fontFamily: 'var(--font-display)',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              color: 'var(--text-primary)',
              boxShadow: 'var(--shadow-sm)',
            }}
            title="Sair da Sala"
          >
            sair
          </button>
        )}

        <button
          onClick={() => { setSoundEnabled(toggleSound()); }}
          style={{
            background: 'var(--bg-glass-strong)',
            border: '2px solid var(--text-primary)',
            borderRadius: '50%',
            width: '32px',
            height: '32px',
            cursor: 'pointer',
            fontSize: '0.9rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
          title={soundEnabled ? 'Silenciar Sons' : 'Ativar Sons'}
        >
          {soundEnabled ? '🔊' : '🔇'}
        </button>

        <button
          onClick={toggleTheme}
          style={{
            background: 'var(--bg-glass-strong)',
            border: '2px solid var(--text-primary)',
            borderRadius: '50%',
            width: '32px',
            height: '32px',
            cursor: 'pointer',
            fontSize: '0.9rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
          title="Alternar tema"
        >
          {theme === 'light' ? '🌙' : '☀️'}
        </button>
      </div>
    </div>
  );

  return (
    <div className="app-container">
      <div className="bg-pattern" />
      <TopBar />
      <ToastContainer toasts={toasts} />
      {showSuspense && <SuspenseReveal />}

      <div className={`app-layout ${showChat ? 'with-chat' : ''}`}>
        <div className={`main-content ${showChat && mobileTab === 'chat' ? 'hide-on-mobile' : ''}`}>
          <ReactionsOverlay />
          <div key={page} className="page-transition" style={{ height: '100%', width: '100%' }}>
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
        </div>
        
        {showChat && (
          <div className={`sidebar-content ${isChatMinimized ? 'minimized' : ''} ${mobileTab === 'chat' ? 'show-on-mobile' : ''}`}>
            <Chat />
          </div>
        )}
      </div>
      {showChat && <BottomNav />}
    </div>
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
