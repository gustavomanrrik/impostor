import React, { useState, useRef, useEffect } from 'react';

const AVATARS = ['🐵', '🐶', '🐺', '🐱', '🦁', '🐯', '🦒', '🦊', '🦝', '🐻', '🐼', '🐨', '🐸', '🐔', '🐧', '🦉', '🦄', '🐝', '🐢', '🦖'];

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

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div style={{ position: 'relative' }} ref={containerRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        style={{
          fontSize: '1.5rem',
          padding: '0',
          background: 'var(--bg-glass)',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: 'var(--radius-md)',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: '46px',
          width: '54px',
          transition: 'background 0.2s',
        }}
        title="Mudar Avatar"
      >
        {selected}
      </button>

      {isOpen && (
        <div style={{
          position: 'absolute',
          top: '100%',
          left: 0,
          marginTop: '8px',
          background: 'var(--bg-card)',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: 'var(--radius-lg)',
          padding: '12px',
          boxShadow: 'var(--shadow-lg)',
          zIndex: 100,
          display: 'grid',
          gridTemplateColumns: 'repeat(5, 1fr)',
          gap: '8px',
          width: '260px'
        }}>
          <div style={{ gridColumn: '1 / -1', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 500 }}>Escolha um avatar</span>
            <button className="btn btn-ghost btn-sm" style={{ padding: '2px 6px' }} onClick={() => setIsOpen(false)}>✕</button>
          </div>
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
      )}
    </div>
  );
}
