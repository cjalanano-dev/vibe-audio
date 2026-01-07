import { useRef, useState, useCallback } from 'react';

export const useAudioSource = (audioContextRef) => {
    const source = useRef(null);
    const mediaStream = useRef(null);
    const audioEl = useRef(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [duration, setDuration] = useState(0);
    const [currentTime, setCurrentTime] = useState(0);
    const [isLoading, setIsLoading] = useState(false);

    const disconnect = useCallback(() => {
        if (mediaStream.current) {
            mediaStream.current.getTracks().forEach(track => track.stop());
            mediaStream.current = null;
        }
        if (audioEl.current) {
            audioEl.current.pause();
            audioEl.current.src = '';
            audioEl.current = null;
        }
        if (source.current) {
            source.current.disconnect();
            source.current = null;
        }
        setIsPlaying(false);
        setDuration(0);
        setCurrentTime(0);
        setIsLoading(false);
    }, []);

    const connectMicrophone = useCallback(async () => {
        disconnect();
        setIsLoading(true);
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
            mediaStream.current = stream;

            if (audioContextRef.current) {
                source.current = audioContextRef.current.createMediaStreamSource(stream);
                setIsPlaying(true);
            }
        } catch (err) {
            console.error('Error accessing microphone:', err);
        } finally {
            setIsLoading(false);
        }
        return source.current;
    }, [audioContextRef, disconnect]);

    const connectFile = useCallback((file) => {
        disconnect();
        setIsLoading(true);

        const url = URL.createObjectURL(file);
        const audio = new Audio(url);
        audio.loop = true;
        // Volume will be handled by the specialized hook or externally, 
        // but audio element volume handles local playback volume if not routed purely through WebAudio.
        // For visualizers, we usually route Element -> Source -> Gain -> Destination.

        audioEl.current = audio;

        audio.addEventListener('loadedmetadata', () => {
            setDuration(audio.duration);
        });

        audio.addEventListener('canplay', () => {
            setIsPlaying(true);
            setIsLoading(false);
            audio.play();
        }, { once: true });

        if (audioContextRef.current) {
            source.current = audioContextRef.current.createMediaElementSource(audio);
        }

        return source.current;
    }, [audioContextRef, disconnect]);

    const togglePlay = useCallback(() => {
        if (audioEl.current) {
            if (audioEl.current.paused) {
                audioEl.current.play();
                setIsPlaying(true);
            } else {
                audioEl.current.pause();
                setIsPlaying(false);
            }
        } else if (audioContextRef.current && mediaStream.current) {
            // For mic, toggling play usually means suspending context or disconnecting
            // But context is global. We might just rely on global context suspend/resume 
            // handled by parent or useAudioContext.
        }
    }, [audioContextRef]);

    const seek = useCallback((time) => {
        if (audioEl.current) {
            audioEl.current.currentTime = time;
            setCurrentTime(time);
        }
    }, []);

    // Helper to sync time externally if needed, or use a raf in the component
    const updateTime = useCallback(() => {
        if (audioEl.current) {
            setCurrentTime(audioEl.current.currentTime);
        }
    }, []);

    return {
        source,
        connectMicrophone,
        connectFile,
        disconnect,
        isPlaying,
        isLoading,
        duration,
        currentTime,
        seek,
        togglePlay,
        updateTime,
        audioEl // Expose if needed for volume control direct
    };
};
