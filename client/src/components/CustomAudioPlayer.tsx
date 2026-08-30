import React, { useState, useRef, useEffect } from 'react';

interface CustomAudioPlayerProps {
  src: string;
}

export function CustomAudioPlayer({ src }: CustomAudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const setAudioData = () => {
      setDuration(audio.duration);
    };

    const setAudioTime = () => {
      setProgress(audio.currentTime);
    };

    const handleEnded = () => {
      setIsPlaying(false);
      setProgress(0);
    };

    audio.addEventListener('loadedmetadata', setAudioData);
    audio.addEventListener('timeupdate', setAudioTime);
    audio.addEventListener('ended', handleEnded);

    if (audio.readyState >= 1) {
      setAudioData();
    }

    return () => {
      audio.removeEventListener('loadedmetadata', setAudioData);
      audio.removeEventListener('timeupdate', setAudioTime);
      audio.removeEventListener('ended', handleEnded);
    };
  }, [src]);

  const togglePlayPause = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
    } else {
      audio.play().catch(e => console.error("Error playing audio", e));
    }
    setIsPlaying(!isPlaying);
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const audio = audioRef.current;
    if (!audio) return;
    const newTime = Number(e.target.value);
    audio.currentTime = newTime;
    setProgress(newTime);
  };

  const formatTime = (time: number) => {
    if (isNaN(time) || !isFinite(time)) return "0:00";
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      background: 'var(--bg-primary)',
      border: '2px solid var(--text-primary)',
      borderRadius: '255px 15px 225px 15px/15px 225px 15px 255px',
      padding: '4px 12px',
      minWidth: '200px',
      maxWidth: '100%',
      marginTop: '8px'
    }}>
      <audio ref={audioRef} src={src} preload="metadata" />
      
      <button 
        type="button"
        onClick={togglePlayPause}
        className="btn btn-ghost"
        style={{
          width: '32px',
          height: '32px',
          borderRadius: '50%',
          border: '2px solid var(--text-primary)',
          background: 'var(--bg-card)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 0,
          cursor: 'pointer',
          flexShrink: 0
        }}
      >
        <span style={{ transform: isPlaying ? 'none' : 'translateX(2px)' }}>
          {isPlaying ? '⏸' : '▶'}
        </span>
      </button>

      <span style={{ fontSize: '0.8rem', fontWeight: 'bold', minWidth: '35px', textAlign: 'right' }}>
        {formatTime(progress)}
      </span>

      <input 
        type="range"
        min="0"
        max={duration || 100}
        value={progress}
        onChange={handleSeek}
        style={{
          flex: 1,
          height: '4px',
          WebkitAppearance: 'none',
          background: 'var(--text-primary)',
          borderRadius: '2px',
          cursor: 'pointer'
        }}
      />

      <span style={{ fontSize: '0.8rem', minWidth: '35px' }}>
        {formatTime(duration)}
      </span>
    </div>
  );
}
