import React, { useState, useRef, useEffect } from 'react';
import { useGame } from '../context/GameContext';
import { AvatarDisplay } from './AvatarDisplay';

export function Chat() {
  const { chatMessages, sendChatMessage, sendChatImage, playerId, roomState, addToast, isChatMinimized: isMinimized, setIsChatMinimized: setIsMinimized, hasUnreadChat: hasUnread, setHasUnreadChat: setHasUnread, sendReaction } = useGame();
  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const prevMessagesLength = useRef(chatMessages.length);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isMinimized && chatMessages.length > prevMessagesLength.current) {
      setHasUnread(true);
    }
    prevMessagesLength.current = chatMessages.length;
    
    if (!isMinimized) {
      scrollToBottom();
    }
  }, [chatMessages, isMinimized]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    sendChatMessage(inputText);
    setInputText('');
  };

  const toggleMinimize = () => {
    if (isMinimized) {
      setHasUnread(false);
    }
    setIsMinimized(!isMinimized);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      addToast('error', 'Imagem muito grande (máx 5MB)');
      return;
    }

    const reader = new FileReader();
    reader.onload = (ev) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;
        const maxDim = 800;

        if (width > height && width > maxDim) {
          height *= maxDim / width;
          width = maxDim;
        } else if (height > maxDim) {
          width *= maxDim / height;
          height = maxDim;
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);
        
        const compressedBase64 = canvas.toDataURL('image/jpeg', 0.7);
        sendChatImage(compressedBase64);
      };
      img.src = ev.target?.result as string;
    };
    reader.readAsDataURL(file);

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  if (isMinimized) {
    return (
      <div 
        className="chat-container minimized" 
        onClick={toggleMinimize}
        style={{ 
          cursor: 'pointer', 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          padding: '12px 16px',
          height: 'auto',
          backgroundColor: 'var(--bg-secondary)',
          borderTop: '2px solid var(--border-color)',
          borderLeft: '2px solid var(--border-color)',
          borderRight: '2px solid var(--border-color)',
          borderTopLeftRadius: 'var(--radius-lg)',
          borderTopRightRadius: 'var(--radius-lg)',
          position: 'fixed',
          bottom: 0,
          right: '20px',
          width: '200px',
          zIndex: 1000
        }}
      >
        <h3 style={{ margin: 0, fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
          💬 Chat
          {hasUnread && (
            <span style={{ 
              width: '10px', 
              height: '10px', 
              backgroundColor: 'var(--error)', 
              borderRadius: '50%',
              display: 'inline-block'
            }} />
          )}
        </h3>
        <button className="btn btn-ghost btn-sm" style={{ padding: '0 4px', color: 'var(--text-secondary)' }}>
          ▲
        </button>
      </div>
    );
  }

  return (
    <div className="chat-container">
      <div className="chat-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3 style={{ margin: 0, fontSize: '1rem' }}>💬 chat da sala</h3>
        <button 
          className="btn btn-ghost btn-sm" 
          onClick={toggleMinimize}
          style={{ padding: '4px 8px', fontSize: '0.9rem', color: 'var(--text-secondary)' }}
          title="Minimizar chat"
        >
          ▼
        </button>
      </div>
      
      <div className="chat-messages" style={{ flex: 1, overflowY: 'auto' }}>
        {chatMessages.length === 0 ? (
          <div className="chat-empty text-muted">nenhuma mensagem ainda...</div>
        ) : (
          chatMessages.map((msg) => {
            const isMe = msg.playerId === playerId;
            return (
              <div key={msg.id} className={`chat-message ${isMe ? 'chat-message-me' : ''}`}>
                {!isMe && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                    <AvatarDisplay avatar={roomState?.players.find(p => p.id === msg.playerId)?.avatar || '👤'} size="20px" />
                    <span className="chat-message-name" style={{ paddingLeft: 0, marginBottom: 0 }}>{msg.playerName}</span>
                  </div>
                )}
                <div className="chat-message-bubble">
                  {msg.text && <div>{msg.text}</div>}
                  {msg.imageUrl && (
                    <img 
                      src={msg.imageUrl} 
                      alt="imagem enviada" 
                      style={{ 
                        maxWidth: '100%', 
                        borderRadius: 'var(--radius-sm)', 
                        marginTop: msg.text ? '8px' : '0',
                        cursor: 'pointer' 
                      }} 
                      onClick={() => window.open(msg.imageUrl, '_blank')}
                    />
                  )}
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Predefined Reactions */}
      <div style={{ padding: '8px 16px 0', display: 'flex', gap: '4px', flexWrap: 'wrap', justifyContent: 'center' }}>
        {['🤔 Suspeito', '😱 Quem foi?', '👀 Tô de olho', '🤡 Ih, rapaz', '👍 Concordo', '👎 Discordo'].map(phrase => (
          <button
            key={phrase}
            className="btn btn-ghost"
            style={{ 
              fontSize: '0.75rem', 
              padding: '4px 8px', 
              border: '1px solid var(--glass-border)',
              borderRadius: 'var(--radius-sm)'
            }}
            onClick={() => sendReaction(phrase)}
          >
            {phrase}
          </button>
        ))}
      </div>

      <form className="chat-input-area" style={{ display: 'flex', gap: '8px', alignItems: 'center', padding: '16px' }} onSubmit={handleSend}>
        <button 
          type="button" 
          className="btn btn-ghost btn-sm" 
          style={{ padding: '4px 8px', fontSize: '1.2rem', color: 'var(--text-primary)' }}
          onClick={() => fileInputRef.current?.click()}
          title="Enviar imagem"
        >
          📷
        </button>
        <input 
          type="file" 
          accept="image/*" 
          style={{ display: 'none' }} 
          ref={fileInputRef}
          onChange={handleImageUpload}
        />
        <input
          type="text"
          className="input chat-input"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="digite algo..."
          maxLength={200}
          style={{ flex: 1 }}
        />
        <button type="submit" className="btn btn-primary btn-sm chat-send-btn" disabled={!inputText.trim()}>
          enviar
        </button>
      </form>
    </div>
  );
}
