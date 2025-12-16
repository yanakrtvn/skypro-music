'use client';

import { useEffect, useRef } from 'react';
import { useAppSelector } from '@/store/hooks';

export default function AudioPlayer() {
  const audioRef = useRef<HTMLAudioElement>(null);
  const { currentTrack, isPlaying } = useAppSelector((state) => state.tracks);

  useEffect(() => {
    const audioElement = audioRef.current;
    if (!audioElement || !currentTrack) return;

    const handleAudio = async () => {
      try {
        if (!currentTrack.track_file) return;

        if (audioElement.src !== currentTrack.track_file) {
          audioElement.pause();
          audioElement.src = currentTrack.track_file;
        }

        if (isPlaying) {
          await audioElement.play();
        } else {
          audioElement.pause();
        }
      } catch (error) {
        console.error('Audio error:', error);
      }
    };

    handleAudio();
  }, [isPlaying, currentTrack]);

  return (
    <audio
      ref={audioRef}
      style={{ display: 'none' }}
    />
  );
}