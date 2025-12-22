'use client';

import { useEffect, useRef, useState } from 'react';
import { useAppSelector } from '@/store/hooks';

export default function AudioPlayer() {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [error, setError] = useState<string | null>(null);
  const { currentTrack, isPlaying } = useAppSelector((state) => state.tracks);

  useEffect(() => {
    const audioElement = audioRef.current;
    if (!audioElement || !currentTrack) return;

    const handleAudio = async () => {
      try {
        setError(null);

        if (!currentTrack.track_file) {
          setError('У трека отсутствует аудиофайл');
          return;
        }

        const currentSrc = audioElement.src;
        const newSrc = currentTrack.track_file;
        
        if (currentSrc !== newSrc) {
          audioElement.pause();
          audioElement.src = newSrc;
          audioElement.load();
          
          // Ждем, пока трек загрузится
          audioElement.addEventListener('loadeddata', () => {
            if (isPlaying) {
              audioElement.play().catch(() => {
                setError('Ошибка воспроизведения');
              });
            }
          }, { once: true });
        } else {
          if (isPlaying) {
            await audioElement.play();
          } else {
            audioElement.pause();
          }
        }
      } catch {
        setError('Ошибка аудио');
      }
    };

    handleAudio();

    const handleAudioError = () => {
      setError('Ошибка загрузки аудиофайла');
    };

    audioElement.addEventListener('error', handleAudioError);
    
    return () => {
      audioElement.removeEventListener('error', handleAudioError);
    };
  }, [isPlaying, currentTrack]);

  return (
    <audio
      ref={audioRef}
      style={{ display: 'none' }}
      preload="metadata"
      controls={false}
    />
  );
}