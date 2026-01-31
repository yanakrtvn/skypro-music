'use client';

import { useEffect, useRef, useCallback, useState } from 'react';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { setCurrentTime, setDuration, nextTrack } from '@/store/features/trackSlice';

export default function AudioPlayer() {
  const audioRef = useRef<HTMLAudioElement>(null);
  const { currentTrack, isPlaying, loop, volume } = useAppSelector((state) => state.tracks);
  const dispatch = useAppDispatch();
  const [isLoading, setIsLoading] = useState(false);

  const handleTrackEnded = useCallback(() => {
    if (loop) {
      const audioElement = audioRef.current;
      if (audioElement) {
        audioElement.currentTime = 0;
        setTimeout(() => {
          audioElement.play().catch((error) => {
            console.warn('Ошибка при повторном воспроизведении:', error);
          });
        }, 100);
      }
    } else {
      setTimeout(() => {
        dispatch(nextTrack());
      }, 300);
    }
  }, [loop, dispatch]);

  useEffect(() => {
    const audioElement = audioRef.current;
    if (!audioElement || !currentTrack) return;

    let isMounted = true;
    let playPromise: Promise<void> | null = null;

    const handleAudio = async () => {
      if (!isMounted) return;

      try {
        if (!currentTrack.track_file || currentTrack.track_file.trim() === '') {
          console.warn('У трека отсутствует аудиофайл:', currentTrack.name);
          
          if (!loop) {
            setTimeout(() => {
              if (isMounted) {
                dispatch(nextTrack());
              }
            }, 1000);
          }
          return;
        }

        const currentSrc = audioElement.src;
        const newSrc = currentTrack.track_file;
        
        if (currentSrc !== newSrc) {
          if (playPromise) {
            try {
              await playPromise;
            } catch (e) {
            }
          }

          setIsLoading(true);
          audioElement.pause();
          audioElement.src = newSrc;
          audioElement.load();
          
          audioElement.volume = volume;
          audioElement.loop = loop;
          
          const onLoadedData = () => {
            if (!isMounted) return;
            
            if (!isNaN(audioElement.duration)) {
              dispatch(setDuration(audioElement.duration));
            }
            
            if (isPlaying) {
              setTimeout(() => {
                if (isMounted) {
                  playPromise = audioElement.play();
                  playPromise
                    .then(() => {
                      setIsLoading(false);
                    })
                    .catch((error) => {
                      setIsLoading(false);
                      if (error.name !== 'AbortError') {
                        console.error('Ошибка воспроизведения:', error);
                      }
                      if (!loop && isMounted) {
                        setTimeout(() => {
                          dispatch(nextTrack());
                        }, 1000);
                      }
                    });
                }
              }, 100);
            } else {
              setIsLoading(false);
            }
          };
          
          audioElement.addEventListener('loadeddata', onLoadedData, { once: true });
        } else {
          audioElement.volume = volume;
          audioElement.loop = loop;
          
          if (isPlaying) {
            if (playPromise) {
              try {
                await playPromise;
              } catch (e) {
              }
            }

            setTimeout(() => {
              if (isMounted) {
                playPromise = audioElement.play();
                playPromise
                  .catch((error) => {
                    if (error.name !== 'AbortError') {
                      console.error('Ошибка воспроизведения:', error);
                    }
                    if (!loop && isMounted) {
                      setTimeout(() => {
                        dispatch(nextTrack());
                      }, 1000);
                    }
                  });
              }
            }, 50);
          } else {
            audioElement.pause();
          }
        }
      } catch (error) {
        console.error('Ошибка аудио:', error);
        
        if (!loop && isMounted) {
          setTimeout(() => {
            dispatch(nextTrack());
          }, 1000);
        }
      }
    };

    const timer = setTimeout(() => {
      handleAudio();
    }, 50);

    const handleTimeUpdate = () => {
      if (isMounted) {
        dispatch(setCurrentTime(audioElement.currentTime));
      }
    };

    const handleLoadedMetadata = () => {
      if (isMounted && !isNaN(audioElement.duration)) {
        dispatch(setDuration(audioElement.duration));
      }
    };

    const handleEnded = () => {
      if (isMounted) {
        handleTrackEnded();
      }
    };

    audioElement.addEventListener('timeupdate', handleTimeUpdate);
    audioElement.addEventListener('loadedmetadata', handleLoadedMetadata);
    audioElement.addEventListener('ended', handleEnded);

    return () => {
      isMounted = false;
      clearTimeout(timer);
      if (playPromise) {
        playPromise.catch(() => {
        });
      }
      
      audioElement.removeEventListener('timeupdate', handleTimeUpdate);
      audioElement.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audioElement.removeEventListener('ended', handleEnded);
    };
  }, [isPlaying, currentTrack, volume, loop, dispatch, handleTrackEnded]);

  useEffect(() => {
    const audioElement = audioRef.current;
    if (audioElement) {
      audioElement.loop = loop;
    }
  }, [loop]);

  useEffect(() => {
    const audioElement = audioRef.current;
    if (audioElement) {
      audioElement.volume = volume;
    }
  }, [volume]);

  return (
    <audio
      ref={audioRef}
      style={{ display: 'none' }}
      preload="auto"
      controls={false}
    />
  );
}