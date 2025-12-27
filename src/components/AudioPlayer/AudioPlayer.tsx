'use client';

import { useEffect, useRef, useCallback } from 'react';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { setCurrentTime, setDuration, nextTrack } from '@/store/features/trackSlice';

export default function AudioPlayer() {
  const audioRef = useRef<HTMLAudioElement>(null);
  const { currentTrack, isPlaying, loop, volume } = useAppSelector((state) => state.tracks);
  const dispatch = useAppDispatch();

  const handleTrackEnded = useCallback(() => {
    if (loop) {
      const audioElement = audioRef.current;
      if (audioElement) {
        audioElement.currentTime = 0;
        audioElement.play().catch(console.error);
      }
    } else {
      setTimeout(() => {
        dispatch(nextTrack());
      }, 100);
    }
  }, [loop, dispatch]);

  useEffect(() => {
    const audioElement = audioRef.current;
    if (!audioElement || !currentTrack) return;

    const handleAudio = async () => {
      try {
        if (!currentTrack.track_file) {
          console.error('У трека отсутствует аудиофайл');
          return;
        }

        const currentSrc = audioElement.src;
        const newSrc = currentTrack.track_file;
        
        if (currentSrc !== newSrc) {
          audioElement.pause();
          audioElement.src = newSrc;
          audioElement.load();
          
          audioElement.volume = volume;
          audioElement.loop = loop;
          
          const onLoadedData = () => {
            if (!isNaN(audioElement.duration)) {
              dispatch(setDuration(audioElement.duration));
            }
            if (isPlaying) {
              audioElement.play().catch((error) => {
                console.error('Ошибка воспроизведения:', error);
              });
            }
          };
          
          audioElement.addEventListener('loadeddata', onLoadedData, { once: true });
        } else {
          audioElement.volume = volume;
          audioElement.loop = loop;
          
          if (isPlaying) {
            await audioElement.play();
          } else {
            audioElement.pause();
          }
        }
      } catch (error) {
        console.error('Ошибка аудио:', error);
      }
    };

    handleAudio();

    const handleTimeUpdate = () => {
      dispatch(setCurrentTime(audioElement.currentTime));
    };

    const handleLoadedMetadata = () => {
      if (!isNaN(audioElement.duration)) {
        dispatch(setDuration(audioElement.duration));
      }
    };

    const handleEnded = () => {
      handleTrackEnded();
    };

    audioElement.addEventListener('timeupdate', handleTimeUpdate);
    audioElement.addEventListener('loadedmetadata', handleLoadedMetadata);
    audioElement.addEventListener('ended', handleEnded);

    return () => {
      audioElement.removeEventListener('timeupdate', handleTimeUpdate);
      audioElement.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audioElement.removeEventListener('ended', handleEnded);
    };
  }, [isPlaying, currentTrack, volume, loop, dispatch, handleTrackEnded]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.loop = loop;
    }
  }, [loop]);

  return (
    <audio
      ref={audioRef}
      style={{ display: 'none' }}
      preload="metadata"
      controls={false}
    />
  );
}