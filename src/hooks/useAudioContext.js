import { useRef, useState, useCallback } from 'react';

export const useAudioContext = () => {
    const audioContext = useRef(null);
    const [isReady, setIsReady] = useState(false);

    const init = useCallback(() => {
        if (!audioContext.current) {
            audioContext.current = new (window.AudioContext || window.webkitAudioContext)();
            setIsReady(true);
        }
        if (audioContext.current.state === 'suspended') {
            audioContext.current.resume();
        }
        return audioContext.current;
    }, []);

    const suspend = useCallback(() => {
        if (audioContext.current && audioContext.current.state === 'running') {
            audioContext.current.suspend();
        }
    }, []);

    const resume = useCallback(() => {
        if (audioContext.current && audioContext.current.state === 'suspended') {
            audioContext.current.resume();
        }
    }, []);

    return {
        audioContext,
        isReady,
        init,
        suspend,
        resume
    };
};
