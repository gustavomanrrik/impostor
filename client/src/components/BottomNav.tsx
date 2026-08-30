import React from 'react';
import { useGame } from '../context/GameContext';
import { User, Users, MessageSquare } from 'lucide-react';

export function BottomNav() {
  const { mobileTab, setMobileTab, hasUnreadChat } = useGame();

  return (
    <div className="bottom-nav hide-on-desktop">
      <button className={`nav-btn ${mobileTab === 'me' ? 'active' : ''}`} onClick={() => setMobileTab('me')}>
        <User size={24} strokeWidth={2.5} />
        <span>Meu Painel</span>
      </button>
      <button className={`nav-btn ${mobileTab === 'others' ? 'active' : ''}`} onClick={() => setMobileTab('others')}>
        <Users size={24} strokeWidth={2.5} />
        <span>A Galera</span>
      </button>
      <button className={`nav-btn ${mobileTab === 'chat' ? 'active' : ''}`} onClick={() => setMobileTab('chat')} style={{ position: 'relative' }}>
        <MessageSquare size={24} strokeWidth={2.5} />
        <span>Chat</span>
        {hasUnreadChat && (
          <span className="unread-badge"></span>
        )}
      </button>
    </div>
  );
}
