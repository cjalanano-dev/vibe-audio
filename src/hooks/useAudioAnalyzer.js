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
  const mediaStream = useRef(null);

  const initAudio = useCallback(() => {
    if (!audioContext.current) {
      audioContext.current = new (window.AudioContext || window.webkitAudioContext)();
      analyser.current = audioContext.current.createAnalyser();
      analyser.current.fftSize = 512;

      gainNode.current = audioContext.current.createGain();
      gainNode.current.gain.value = volume;

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

  const disconnectAudio = () => {
    if (mediaStream.current) {
      mediaStream.current.getTracks().forEach(track => track.stop());
      mediaStream.current = null;
    }
    if (source.current) {
      try { source.current.stop(); } catch (e) { }
      source.current.disconnect();
      source.current = null;
    }
    setIsPlaying(false);
  };

  const connectMicrophone = async () => {
    disconnectAudio();
    initAudio();
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
      mediaStream.current = stream;

      source.current = audioContext.current.createMediaStreamSource(stream);
      analyser.current.disconnect();
      source.current.connect(gainNode.current);
    } catch (err) {
      console.error('Error accessing microphone:', err);
      alert('Microphone access denied or not available.');
    }
    setIsPlaying(true);
  };

  const connectFile = (file) => {
    disconnectAudio();
    initAudio();
    const reader = new FileReader();
    reader.onload = function (e) {
      const arrayBuffer = e.target.result;
      audioContext.current.decodeAudioData(arrayBuffer, function (buffer) {
        source.current = audioContext.current.createBufferSource();
        source.current.buffer = buffer;
        source.current.loop = true;

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
    disconnectAudio,
    getAudioData,
    isReady,
    isPlaying,
    togglePlay,
    volume,
    setVolume
  };
};
