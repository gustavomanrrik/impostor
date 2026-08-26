import React, { useState, useRef } from 'react';
import { useGame } from '../context/GameContext';
import { compressImage } from '../utils/image';

export function ReactionInput() {
  const { sendReaction } = useGame();
  const [customReaction, setCustomReaction] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const reactionImageInputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="card" style={{ marginBottom: '16px', padding: '12px' }}>
      <p className="text-muted" style={{ fontSize: '0.8rem', marginBottom: '8px', textAlign: 'center' }}>Reações Rápidas</p>
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', justifyContent: 'center', marginBottom: '12px' }}>
        {['🤔 Suspeito', '😱 Quem foi?', '👀 Tô de olho', '🤡 Ih, rapaz', '👍 Concordo', '👎 Discordo'].map(phrase => (
          <button
            key={phrase}
            className="btn btn-ghost btn-sm"
            style={{ background: 'var(--bg-glass)' }}
            onClick={() => sendReaction(phrase)}
          >
            {phrase}
          </button>
        ))}
      </div>
      
      <form 
        onSubmit={(e) => {
          e.preventDefault();
          if (customReaction.trim()) {
            sendReaction(customReaction.trim());
            setCustomReaction('');
          }
        }}
        style={{ display: 'flex', gap: '8px', position: 'relative' }}
      >
        <div style={{ position: 'relative', flex: 1, display: 'flex', gap: '4px' }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <button 
              type="button" 
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              style={{
                position: 'absolute',
                left: '8px',
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'none',
                border: 'none',
                color: 'var(--text-muted)',
                cursor: 'pointer',
                fontSize: '1.2rem',
                opacity: 0.7
              }}
            >
              😊
            </button>
            <input
              type="text"
              className="input"
              style={{ width: '100%', padding: '8px 40px', fontSize: '0.9rem' }}
              placeholder="Ou digite algo..."
              maxLength={30}
              value={customReaction}
              onChange={(e) => setCustomReaction(e.target.value)}
            />
            <button 
              type="button" 
              onClick={() => reactionImageInputRef.current?.click()}
              style={{
                position: 'absolute',
                right: '8px',
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'none',
                border: 'none',
                color: 'var(--text-muted)',
                cursor: 'pointer',
                fontSize: '1.2rem',
                opacity: 0.7
              }}
              title="Enviar Imagem"
            >
              📷
            </button>
          </div>
          <input
            type="file"
            ref={reactionImageInputRef}
            style={{ display: 'none' }}
            accept="image/*"
            onChange={async (e) => {
              const file = e.target.files?.[0];
              if (!file) return;
              try {
                const base64Image = await compressImage(file, 150);
                sendReaction(base64Image);
              } catch (err) {
                console.error('Falha ao processar imagem:', err);
                alert('Erro ao enviar imagem. Tente outra.');
              }
              if (reactionImageInputRef.current) {
                reactionImageInputRef.current.value = '';
              }
            }}
          />
        </div>
        <button 
          type="submit" 
          className="btn btn-primary btn-sm"
          disabled={!customReaction.trim()}
        >
          Enviar
        </button>

        {showEmojiPicker && (
          <div style={{
            position: 'absolute',
            bottom: '100%',
            left: 0,
            marginBottom: '8px',
            background: 'var(--bg-card)',
            border: '1px solid var(--bg-glass-strong)',
            padding: '8px',
            borderRadius: '8px',
            display: 'grid',
            gridTemplateColumns: 'repeat(5, 1fr)',
            gap: '4px',
            zIndex: 50,
            boxShadow: 'var(--shadow-lg)'
          }}>
            {['😆', '😂', '🤔', '🤡', '👀', '❤️', '🔥', '💀', '👎', '📷'].map(emoji => (
              <button
                key={emoji}
                type="button"
                onClick={() => {
                  setCustomReaction(prev => prev + emoji);
                  setShowEmojiPicker(false);
                }}
                style={{ background: 'transparent', border: 'none', fontSize: '1.2rem', cursor: 'pointer', padding: '4px' }}
              >
                {emoji}
              </button>
            ))}
          </div>
        )}
      </form>
    </div>
  );
}
