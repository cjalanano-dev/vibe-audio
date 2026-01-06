import { useRef, useState, useEffect, useCallback } from 'react';

export const useAudioAnalyzer = () => {
  const [isReady, setIsReady] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.5);

  const audioContext = useRef(null);
  const analyser = useRef(null);
  const gainNode = useRef(null);
  const dataArray = useRef(null);
  const source = useRef(null);

  const initAudio = useCallback(() => {
    if (!audioContext.current) {
      audioContext.current = new (window.AudioContext || window.webkitAudioContext)();
      analyser.current = audioContext.current.createAnalyser();
      analyser.current.fftSize = 512;

      gainNode.current = audioContext.current.createGain();
      gainNode.current.gain.value = volume;

      // Connect Gain -> Analyser -> Destination(Speakers)
      // When connecting source, we connect Source -> Gain
      gainNode.current.connect(analyser.current);
      analyser.current.connect(audioContext.current.destination);

      const bufferLength = analyser.current.frequencyBinCount;
      dataArray.current = new Uint8Array(bufferLength);

      setIsReady(true);
    }

    if (audioContext.current.state === 'suspended') {
      audioContext.current.resume();
    }
    setIsPlaying(true);
  }, [volume]);

  // Update gain when volume state changes
  useEffect(() => {
    if (gainNode.current) {
      gainNode.current.gain.value = volume;
    }
  }, [volume]);

  const togglePlay = () => {
    if (!audioContext.current) return;

    if (audioContext.current.state === 'running') {
      audioContext.current.suspend();
      setIsPlaying(false);
    } else if (audioContext.current.state === 'suspended') {
      audioContext.current.resume();
      setIsPlaying(true);
    }
  };

  const connectMicrophone = async () => {
    initAudio();
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
      if (source.current) {
        source.current.disconnect();
        // Note: Disconnecting mic source might need stream track stopping to fully release,
        // but for switching sources this is usually enough logic for AudioNodes.
      }
      source.current = audioContext.current.createMediaStreamSource(stream);
      // Mic -> Gain -> Analyser -> Speaker
      // Warning: Mic to Speaker triggers feedback loop. 
      // So for Mic, usually we DON'T want to connect to destination if we are in same room.

      // Let's disconnect analyser from destination for Mic to avoid feedback
      analyser.current.disconnect();
      // But we need to keep the graph alive. 
      // Usually Mic -> Analyser. 
      source.current.connect(gainNode.current);

      // Reconnect Gain -> Analyser
      // But DO NOT connect Analyser -> Destination for Mic.
      // We handle this via a flag or just by logic?
      // For simplicity, let's mute the gainNode for the "playback" part or disconnect destination
      // The Visualizer needs data from Analyser.
    } catch (err) {
      console.error('Error accessing microphone:', err);
      alert('Microphone access denied or not available.');
    }
    setIsPlaying(true);
  };

  const connectFile = (file) => {
    initAudio();
    const reader = new FileReader();
    reader.onload = function (e) {
      const arrayBuffer = e.target.result;
      audioContext.current.decodeAudioData(arrayBuffer, function (buffer) {
        if (source.current) {
          try { source.current.stop(); } catch (e) { }
          source.current.disconnect();
        }

        source.current = audioContext.current.createBufferSource();
        source.current.buffer = buffer;
        source.current.loop = true;

        // File -> Gain -> Analyser -> Destination (We want to hear the file)
        // Ensure Analyser is connected to destination (it might have been disconnected by Mic logic)
        try {
          analyser.current.connect(audioContext.current.destination);
        } catch (e) { /* already connected */ }

        source.current.connect(gainNode.current);
        source.current.start(0);
        setIsPlaying(true);
      });
    };
    reader.readAsArrayBuffer(file);
  };

  const getAudioData = () => {
    if (!analyser.current || !dataArray.current) return { bass: 0, mid: 0, treble: 0 };

    analyser.current.getByteFrequencyData(dataArray.current);
    const data = dataArray.current;

    const getAvg = (start, end) => {
      let sum = 0;
      for (let i = start; i < end; i++) sum += data[i];
      return sum / (end - start);
    };

    const bass = getAvg(0, 4) / 255.0;
    const mid = getAvg(4, 30) / 255.0;
    const treble = getAvg(30, 100) / 255.0;

    return { bass, mid, treble };
  };

  return {
    connectMicrophone,
    connectFile,
    getAudioData,
    isReady,
    isPlaying,
    togglePlay,
    volume,
    setVolume
  };
};
