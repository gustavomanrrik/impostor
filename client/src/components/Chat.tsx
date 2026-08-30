import React, { useState, useRef, useEffect } from 'react';
import { useGame } from '../context/GameContext';
import { AvatarDisplay } from './AvatarDisplay';
import { CustomAudioPlayer } from './CustomAudioPlayer';

export function Chat() {
  const { chatMessages, sendChatMessage, sendChatImage, sendChatAudio, playerId, roomState, addToast, isChatMinimized: isMinimized, setIsChatMinimized: setIsMinimized, hasUnreadChat: hasUnread, setHasUnreadChat: setHasUnread, sendReaction, reactToChatMessage } = useGame();
  const [inputText, setInputText] = useState('');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [activeReactionPicker, setActiveReactionPicker] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [audioPreviewUrl, setAudioPreviewUrl] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const prevMessagesLength = useRef(chatMessages.length);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<BlobPart[]>([]);

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

  useEffect(() => {
    const handleClickOutside = () => {
      setActiveReactionPicker(null);
    };
    if (activeReactionPicker) {
      window.addEventListener('click', handleClickOutside);
    }
    return () => {
      window.removeEventListener('click', handleClickOutside);
    };
  }, [activeReactionPicker]);

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

  const toggleRecording = async () => {
    if (isRecording) {
      if (mediaRecorderRef.current) {
        mediaRecorderRef.current.stop();
        setIsRecording(false);
      }
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const reader = new FileReader();
        reader.onloadend = () => {
          if (typeof reader.result === 'string') {
            setAudioPreviewUrl(reader.result);
          }
        };
        reader.readAsDataURL(audioBlob);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (err) {
      console.error("Error accessing microphone:", err);
      addToast('error', 'Erro ao acessar o microfone.');
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      addToast('error', 'Arquivo muito grande (máx 5MB)');
      return;
    }

    if (file.type.startsWith('audio/')) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        if (typeof ev.target?.result === 'string') {
          sendChatAudio(ev.target.result);
        }
      };
      reader.readAsDataURL(file);
      return;
    } else if (file.type.startsWith('image/')) {
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
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <>
      <div className={`chat-container ${isMinimized ? 'minimized' : ''}`}>
        <div className="chat-header" style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px' }}>
          <button 
            className="btn btn-ghost btn-sm hide-on-mobile" 
            onClick={toggleMinimize}
            style={{ padding: '4px 8px', fontSize: '1.2rem', color: 'var(--text-primary)', border: 'none', background: 'transparent' }}
            title={isMinimized ? 'Abrir chat' : 'Fechar chat'}
          >
            {isMinimized ? '◀' : '▶'}
          </button>
          {!isMinimized && (
            <div style={{ display: 'flex', alignItems: 'center', flex: 1, justifyContent: 'space-between' }}>
              <h3 style={{ margin: 0, fontSize: '1rem', whiteSpace: 'nowrap' }}>💬 chat da sala</h3>
              {hasUnread && (
                <span style={{ 
                  width: '10px', 
                  height: '10px', 
                  backgroundColor: 'var(--error)', 
                  borderRadius: '50%',
                  display: 'inline-block'
                }} />
              )}
            </div>
          )}
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
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '-10px', zIndex: 2, position: 'relative', marginLeft: '4px' }}>
                    <AvatarDisplay avatar={roomState?.players.find(p => p.id === msg.playerId)?.avatar || '👤'} size="36px" />
                    <span className="chat-message-name" style={{ paddingLeft: 0, marginBottom: '10px' }}>{msg.playerName}</span>
                  </div>
                )}
                <div 
                  className="chat-message-bubble" 
                  style={{ 
                    position: 'relative',
                    ...((!msg.text && (msg.imageUrl || msg.audioUrl)) ? {
                      background: 'transparent',
                      border: 'none',
                      boxShadow: 'none',
                      padding: 0
                    } : {})
                  }}
                  onContextMenu={(e) => {
                    e.preventDefault();
                    setActiveReactionPicker(activeReactionPicker === msg.id ? null : msg.id);
                  }}
                >
                  {msg.text && <div>{msg.text}</div>}
                  {msg.imageUrl && (
                    <img 
                      src={msg.imageUrl} 
                      alt="imagem enviada" 
                      style={{ 
                        maxWidth: '100%', 
                        borderRadius: '255px 15px 225px 15px/15px 225px 15px 255px', 
                        marginTop: msg.text ? '8px' : '0',
                        cursor: 'pointer',
                        border: '2px solid var(--text-primary)',
                        display: 'block'
                      }} 
                      onClick={() => setSelectedImage(msg.imageUrl || null)}
                    />
                  )}
                  {msg.audioUrl && (
                    <CustomAudioPlayer src={msg.audioUrl} />
                  )}
                  
                  {/* Floating Reaction Trigger */}
                  <div 
                    className="chat-reaction-trigger"
                    style={{ 
                      position: 'absolute', 
                      right: '-8px', 
                      bottom: '-8px', 
                      cursor: 'pointer', 
                      background: 'var(--bg-primary)', 
                      border: '2px solid var(--text-primary)', 
                      borderRadius: '50%', 
                      width: '28px', 
                      height: '28px', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center', 
                      fontSize: '0.8rem',
                      boxShadow: '2px 2px 0 rgba(0,0,0,1)',
                      zIndex: 5,
                      opacity: 1,
                      transition: 'transform 0.1s'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.opacity = '1';
                      e.currentTarget.style.transform = 'scale(1.1)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.opacity = '0.8';
                      e.currentTarget.style.transform = 'scale(1)';
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveReactionPicker(activeReactionPicker === msg.id ? null : msg.id);
                    }}
                    title="Adicionar reação (ou botão direito na mensagem)"
                  >
                    <span style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: '1.2rem', marginTop: '-2px', color: 'var(--text-primary)' }}>+</span>
                  </div>
                  
                  {/* Reaction Picker Popover */}
                  {activeReactionPicker === msg.id && (
                    <div style={{
                      position: 'absolute',
                      left: isMe ? 'auto' : '0',
                      right: isMe ? '0' : 'auto',
                      top: '100%',
                      background: 'var(--bg-primary)',
                      border: '2px solid var(--text-primary)',
                      borderRadius: 'var(--radius-sm)',
                      padding: '4px',
                      display: 'flex',
                      gap: '4px',
                      zIndex: 10,
                      boxShadow: '2px 2px 0px rgba(0,0,0,1)'
                    }}>
                      {['👍', '👎', '😂', '💀', '👀', '🤡'].map(emoji => (
                        <button
                          key={emoji}
                          className="btn btn-ghost"
                          style={{ padding: '4px' }}
                          onClick={(e) => {
                            e.stopPropagation(); // Prevent closing immediately if inside bubble
                            reactToChatMessage(msg.id, emoji);
                            setActiveReactionPicker(null);
                          }}
                        >
                          {emoji}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                
                {/* Render active reactions */}
                {msg.reactions && Object.keys(msg.reactions).length > 0 && (
                  <div style={{ display: 'flex', gap: '4px', marginTop: '4px', flexWrap: 'wrap', justifyContent: isMe ? 'flex-end' : 'flex-start', alignItems: 'center' }}>
                    {Object.entries(msg.reactions).map(([emoji, userIds]) => (
                      <button
                        key={emoji}
                        className="btn btn-ghost"
                        style={{
                          padding: '2px 6px',
                          fontSize: '0.8rem',
                          borderRadius: '12px',
                          border: userIds.includes(playerId || '') ? '2px solid var(--text-primary)' : '1px solid var(--glass-border)',
                          background: userIds.includes(playerId || '') ? 'var(--bg-card)' : 'transparent',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px'
                        }}
                        onClick={() => reactToChatMessage(msg.id, emoji)}
                      >
                        <span>{emoji}</span>
                        <span style={{ fontSize: '0.75rem', fontWeight: 'bold' }}>{userIds.length}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="chat-input-area" style={{ flexDirection: 'column', padding: 0 }}>
        {/* Predefined Reactions */}
        <div style={{ padding: '8px 16px', display: 'flex', gap: '4px', flexWrap: 'wrap', justifyContent: 'center', paddingBottom: '8px' }}>
          {['👀 Suspeito', '🤔 Quem foi?', '🤨 Tô de olho', '🚨 Ih, rapaz', '👍 Concordo', '👎 Discordo'].map(phrase => (
            <button
              key={phrase}
              className="btn btn-ghost"
              style={{ 
                fontSize: '0.75rem', 
                padding: '4px 8px', 
                border: '1px solid var(--glass-border)',
                borderRadius: 'var(--radius-sm)',
                whiteSpace: 'nowrap',
                flex: '0 0 auto'
              }}
              onClick={() => sendReaction(phrase)}
            >
              {phrase}
            </button>
          ))}
        </div>

        <form style={{ display: 'flex', gap: '8px', alignItems: 'center', padding: '16px', paddingTop: 0 }} onSubmit={handleSend}>
          {audioPreviewUrl ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', width: '100%' }}>
              <button 
                type="button" 
                className="btn btn-ghost btn-sm"
                onClick={() => setAudioPreviewUrl(null)}
                title="Descartar áudio"
                style={{ padding: '4px 8px', fontSize: '1.2rem', color: 'var(--error)' }}
              >
                🗑️
              </button>
              <div style={{ flex: 1, overflow: 'hidden' }}>
                <CustomAudioPlayer src={audioPreviewUrl} />
              </div>
              <button 
                type="button" 
                className="btn btn-ghost btn-sm"
                onClick={() => {
                  sendChatAudio(audioPreviewUrl);
                  setAudioPreviewUrl(null);
                }}
                title="Enviar áudio"
                style={{ padding: '4px 8px', fontSize: '1.2rem', color: 'var(--text-primary)', flexShrink: 0, border: 'none', background: 'transparent' }}
              >
                ➤
              </button>
            </div>
          ) : (
            <>
              <button 
                type="button" 
                className="btn btn-ghost btn-sm" 
                style={{ padding: '4px 8px', fontSize: '1.2rem', color: 'var(--text-primary)', flexShrink: 0 }}
                onClick={() => fileInputRef.current?.click()}
                title="Enviar imagem ou áudio"
              >
                <span style={{ display: 'inline-block', transform: 'translateY(-2px)' }}>📎</span>
              </button>
              <button 
                type="button" 
                className="btn btn-ghost btn-sm" 
                style={{ 
                  padding: '4px 8px', 
                  fontSize: '1.2rem', 
                  color: isRecording ? 'var(--bg-primary)' : 'var(--text-primary)',
                  background: isRecording ? 'var(--text-primary)' : 'transparent',
                  flexShrink: 0,
                  animation: isRecording ? 'pulse 1s infinite' : 'none'
                }}
                onClick={toggleRecording}
                title={isRecording ? "Parar e visualizar gravação" : "Gravar áudio"}
              >
                <span style={{ display: 'inline-block', transform: 'translateY(-2px)' }}>
                  {isRecording ? '⏹' : '🎙️'}
                </span>
              </button>
              <input 
                type="file" 
                accept="image/*,audio/*" 
                style={{ display: 'none' }} 
                ref={fileInputRef}
                onChange={handleFileUpload}
              />
              <input
                type="text"
                className="input chat-input"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="digite algo..."
                maxLength={200}
                style={{ flex: 1, minWidth: '50px' }}
              />
              <button type="submit" className="btn btn-ghost btn-sm chat-send-btn" disabled={!inputText.trim()} style={{ flexShrink: 0, padding: '4px 8px', fontSize: '1.2rem', color: 'var(--text-primary)', border: 'none', background: 'transparent' }}>
                ➤
              </button>
            </>
          )}
        </form>
      </div>

      {/* Image Modal */}
      {selectedImage && (
        <div 
          style={{
            position: 'fixed',
            top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.8)',
            zIndex: 99999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '24px'
          }}
          onClick={() => setSelectedImage(null)}
        >
          <div 
            style={{
              position: 'relative',
              background: 'var(--bg-primary)',
              padding: '16px',
              border: '4px solid var(--text-primary)',
              boxShadow: '8px 8px 0px rgba(0,0,0,1)',
              maxWidth: '90vw',
              maxHeight: '90vh',
              display: 'flex',
              flexDirection: 'column'
            }}
            onClick={(e) => e.stopPropagation()} // prevent closing when clicking inside modal
          >
            <button 
              className="btn btn-ghost"
              style={{
                position: 'absolute',
                top: '-20px',
                right: '-20px',
                background: 'var(--text-primary)',
                color: 'var(--bg-primary)',
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                border: '4px solid var(--bg-primary)',
                fontWeight: 'bold',
                fontSize: '1.2rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                zIndex: 2
              }}
              onClick={() => setSelectedImage(null)}
            >
              X
            </button>
            <img 
              src={selectedImage} 
              alt="imagem ampliada" 
              style={{ maxWidth: '100%', maxHeight: 'calc(90vh - 32px)', objectFit: 'contain' }} 
            />
          </div>
        </div>
      )}
    </div>
    </>
  );
}
