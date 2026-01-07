import { useEffect } from 'react';
import { useAudioContext } from './useAudioContext';
import { useAudioSource } from './useAudioSource';
import { useAudioAnalysis } from './useAudioAnalysis';

export const useAudioAnalyzer = () => {
  const { audioContext, isReady: isContextReady, init: initContext } = useAudioContext();
  const {
    source,
    connectMicrophone: connectMicSource,
    connectFile: connectFileSource,
    disconnect: disconnectSource,
    isPlaying,
    isLoading,
    duration,
    currentTime,
    seek,
    togglePlay: toggleSourcePlay,
    updateTime,
    audioEl
  } = useAudioSource(audioContext);

  const {
    getAudioData,
    volume,
    setVolume,
    initAnalysis
  } = useAudioAnalysis(audioContext, source);

  // Sync volume to audio element if it exists (for file playback volume)
  useEffect(() => {
    if (audioEl.current) {
      audioEl.current.volume = volume;
    }
  }, [volume, audioEl]);

  // Sync current time (optional, relying on useAudioSource internally, but we trigger it here if needed)
  useEffect(() => {
    let rafId;
    const loop = () => {
      if (isPlaying) {
        updateTime();
        rafId = requestAnimationFrame(loop);
      }
    };
    if (isPlaying) loop();
    return () => cancelAnimationFrame(rafId);
  }, [isPlaying, updateTime]);


  // Wrapper functions to ensure Context is initialized synchronously (iOS Fix)
  const connectMicrophone = async () => {
    initContext(); // Synchronous init
    initAnalysis(); // Prepare analyser nodes
    await connectMicSource();
  };

  const connectFile = (file) => {
    initContext(); // Synchronous init
    initAnalysis(); // Prepare analyser nodes
    connectFileSource(file);
  };

  const togglePlay = () => {
    // Also ensure context is resumed if it was suspended
    if (audioContext.current && audioContext.current.state === 'suspended') {
      audioContext.current.resume();
    }
    toggleSourcePlay();
  };

  const disconnectAudio = () => {
    disconnectSource();
  };

  return {
    connectMicrophone,
    connectFile,
    disconnectAudio,
    getAudioData,
    isReady: isContextReady,
    isPlaying,
    isLoading,
    togglePlay,
    volume,
    setVolume,
    duration,
    currentTime,
    seek
  };
};

