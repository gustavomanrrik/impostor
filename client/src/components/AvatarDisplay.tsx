import React from 'react';

interface Props {
  avatar: string;
  size?: number | string;
}

export function AvatarDisplay({ avatar, size = '1.2rem' }: Props) {
  if (!avatar) return <span style={{ fontSize: size }}>👤</span>;

  // Se for uma imagem (base64 ou URL)
  if (avatar.startsWith('data:image/') || avatar.startsWith('http')) {
    const pxSize = typeof size === 'number' ? `${size}px` : size;
    return (
      <img
        src={avatar}
        alt="Avatar"
        style={{
          width: pxSize,
          height: pxSize,
          borderRadius: 'var(--radius-full)',
          border: '3px solid var(--text-primary)',
          objectFit: 'cover',
          display: 'block',
          backgroundColor: 'var(--bg-glass-strong)'
        }}
      />
    );
  }

  // Se for emoji (padrão)
  const pxSize = typeof size === 'number' ? `${size}px` : size;
  return (
    <div
      style={{
        width: pxSize,
        height: pxSize,
        borderRadius: 'var(--radius-full)',
        border: '3px solid var(--text-primary)',
        backgroundColor: 'var(--bg-glass-strong)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: `calc(${pxSize} * 0.6)`
      }}
    >
      {avatar}
    </div>
  );
}
