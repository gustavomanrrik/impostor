import React, { useState, useRef, useEffect } from 'react';
import { useGame } from '../context/GameContext';
import { AvatarDisplay } from './AvatarDisplay';

export function Chat() {
  const { chatMessages, sendChatMessage, playerId, roomState } = useGame();
  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatMessages]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    sendChatMessage(inputText);
    setInputText('');
  };

  return (
    <div className="chat-container">
      <div className="chat-header">
        <h3 style={{ margin: 0, fontSize: '1rem' }}>chat da sala</h3>
      </div>
      
      <div className="chat-messages">
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
                  {msg.text}
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      <form className="chat-input-area" onSubmit={handleSend}>
        <input
          type="text"
          className="input chat-input"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="digite algo..."
          maxLength={200}
        />
        <button type="submit" className="btn btn-primary btn-sm chat-send-btn" disabled={!inputText.trim()}>
          enviar
        </button>
      </form>
    </div>
  );
}
