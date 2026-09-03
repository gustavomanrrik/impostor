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
import { PublicRooms } from './pages/PublicRooms';
import { ToastContainer } from './components/ui/Toast';
import { SuspenseReveal } from './components/SuspenseReveal';
import { Chat } from './components/Chat';
import { BottomNav } from './components/BottomNav';
import { ArrowLeft } from 'lucide-react';

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
      flexWrap: 'wrap',
      justifyContent: 'space-between',
      alignItems: 'center',
      gap: '8px',
      padding: '8px 12px',
      background: 'var(--bg-primary)',
      borderBottom: '2px solid var(--glass-border)',
      minHeight: '48px',
      flexShrink: 0,
    }}>
      <div style={{ display: 'flex', gap: '12px', alignItems: 'center', pointerEvents: 'auto' }}>
        {roomState ? (
          <button
            onClick={leaveRoom}
            style={{
              background: 'var(--bg-glass-strong)',
              border: '2px solid var(--text-primary)',
              borderRadius: 'var(--radius-sm)',
              padding: '0 12px',
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
        ) : page !== 'home' && (
          <button
            onClick={() => navigate('home')}
            style={{
              background: 'transparent',
              border: 'none',
              padding: '0',
              cursor: 'pointer',
              fontSize: '1rem',
              fontFamily: 'var(--font-display)',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              color: 'var(--text-primary)',
            }}
            title="Voltar"
          >
            <ArrowLeft size={18} strokeWidth={2.5} /> Voltar
          </button>
        )}

        <div 
          className="fade-in topbar-title"
          onClick={() => {
            if (!roomState && page !== 'home') navigate('home');
          }}
          style={{ 
            fontFamily: 'var(--font-display)', 
            fontWeight: 900, 
            fontSize: 'clamp(1.1rem, 4vw, 1.25rem)',
            textShadow: '2px 2px 0px rgba(0,0,0,0.2)',
            cursor: (!roomState && page !== 'home') ? 'pointer' : 'default',
            pointerEvents: 'auto',
            whiteSpace: 'nowrap',
          }}
          title={(!roomState && page !== 'home') ? 'Voltar ao Início' : ''}
        >
          mfp games
        </div>
      </div>

      <div style={{ display: 'flex', gap: '6px', alignItems: 'center', flexShrink: 0, pointerEvents: 'auto' }}>

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

      <div className={`app-layout ${showChat ? 'with-chat with-bottom-nav' : ''}`}>
        <div className={`main-content ${showChat && mobileTab === 'chat' ? 'hide-on-mobile' : ''}`}>
          <div key={page} className="page-transition" style={{ height: '100%', width: '100%' }}>
            {page === 'home' && <Home />}
            {page === 'online-create' && <OnlineCreate />}
            {page === 'online-join' && <OnlineJoin />}
            {page === 'public-rooms' && <PublicRooms />}
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
