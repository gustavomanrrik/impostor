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
          borderRadius: '50%',
          objectFit: 'cover',
          display: 'inline-block',
          verticalAlign: 'middle',
          backgroundColor: 'var(--bg-glass-strong)'
        }}
      />
    );
  }

  // Se for emoji (padrão)
  return <span style={{ fontSize: size }}>{avatar}</span>;
}
