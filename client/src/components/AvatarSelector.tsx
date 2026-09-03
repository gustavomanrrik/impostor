import React, { useState, useRef, useEffect } from 'react';
import { compressImage } from '../utils/image';
import { AvatarDisplay } from './AvatarDisplay';

const AVATARS = ['🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼', '🐨', '🐯', '🦁', '🐮', '🐷', '🐸', '🐵', '🦄', '🐙', '🦖', '🐢', '🐍'];

export function getRandomAvatar(): string {
  return AVATARS[Math.floor(Math.random() * AVATARS.length)];
}

interface Props {
  selected: string;
  onSelect: (avatar: string) => void;
}

export function AvatarSelector({ selected, onSelect }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      // Comprime e redimensiona a imagem para no máximo 96px
      const base64Image = await compressImage(file, 96);
      onSelect(base64Image);
      setIsOpen(false);
    } catch (err) {
      console.error('Falha ao processar imagem:', err);
      alert('Erro ao carregar imagem. Tente outra.');
    }
    
    // Reseta o input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div style={{ position: 'relative' }} ref={containerRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        style={{
          padding: '0',
          background: 'transparent',
          border: 'none',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: '48px',
          width: '54px',
          transition: 'transform 0.2s',
          overflow: 'hidden'
        }}
        title="Mudar Avatar"
      >
        <AvatarDisplay avatar={selected} size="48px" />
      </button>

      {isOpen && (
        <div style={{
          position: 'absolute',
          top: '100%',
          left: 0,
          marginTop: '8px',
          background: 'var(--bg-card)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          border: '1px solid var(--glass-border)',
          borderRadius: 'var(--radius-lg)',
          padding: '12px',
          boxShadow: 'var(--shadow-lg)',
          zIndex: 9999,
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
          width: '260px'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 500 }}>Escolha um avatar</span>
            <button className="btn btn-ghost btn-sm" style={{ padding: '2px 6px' }} onClick={() => setIsOpen(false)}>✕</button>
          </div>
          
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            style={{ width: '100%', display: 'flex', gap: '8px', justifyContent: 'center' }}
            onClick={() => fileInputRef.current?.click()}
          >
            📸 Fazer Upload de Imagem
          </button>
          <input
            type="file"
            ref={fileInputRef}
            style={{ display: 'none' }}
            accept="image/*"
            onChange={handleFileUpload}
          />

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(5, 1fr)',
            gap: '8px'
          }}>
            {AVATARS.map(avatar => (
              <button
                key={avatar}
                onClick={() => {
                  onSelect(avatar);
                  setIsOpen(false);
                }}
                style={{
                  fontSize: '1.5rem',
                  padding: '4px',
                  background: selected === avatar ? 'rgba(139, 92, 246, 0.2)' : 'transparent',
                  border: `1px solid ${selected === avatar ? 'var(--accent-primary)' : 'transparent'}`,
                  borderRadius: '8px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                {avatar}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
