import { useRef, useEffect, useCallback, useState } from 'react';

export const useAudioAnalysis = (audioContextRef, sourceRef) => {
    const analyser = useRef(null);
    const gainNode = useRef(null);
    const dataArray = useRef(null);
    const [volume, setVolume] = useState(0.5);

    // Beat Detection State
    const audioValues = useRef({ bass: 0, mid: 0, treble: 0, isBeat: false });
    const beatState = useRef({
        instantEnergy: 0,
        localEnergyAverage: 0,
        historyBuffer: [],
    });

    const initAnalysis = useCallback(() => {
        if (!audioContextRef.current) return;

        if (!analyser.current) {
            analyser.current = audioContextRef.current.createAnalyser();
            analyser.current.fftSize = 512;
            analyser.current.smoothingTimeConstant = 0.8;

            gainNode.current = audioContextRef.current.createGain();
            gainNode.current.gain.value = volume;

            const bufferLength = analyser.current.frequencyBinCount;
            dataArray.current = new Uint8Array(bufferLength);
        }
    }, [audioContextRef, volume]);

    // Connect nodes when source changes
    useEffect(() => {
        if (sourceRef.current && audioContextRef.current && analyser.current && gainNode.current) {
            // SAFE PATTERN: Disconnect everything first to avoid errors and redundant connections
            try {
                analyser.current.disconnect();
                // Note: We don't disconnect the source here because it's managed by useAudioSource
                // but we might need to if we want to be 100% sure we don't have dupes.
                // However, sourceRef changing implies a new source node usually.
            } catch (e) {
                // Ignore disconnect errors if nothing was connected
                console.warn("Analyser disconnect warning:", e);
            }

            // Connect Chain: Source -> Gain -> Analyser
            try {
                sourceRef.current.connect(gainNode.current);
                gainNode.current.connect(analyser.current);
            } catch (err) {
                console.error("Audio Graph Connection Error:", err);
            }

            // Route to Speakers (Destination) ONLY for Files
            if (sourceRef.current.constructor.name === 'MediaElementAudioSourceNode') {
                try {
                    analyser.current.connect(audioContextRef.current.destination);
                } catch (err) {
                    console.error("Destination Connection Error:", err);
                }
            }
            // For Mic, we explicitly do NOT connect to destination to avoid feedback.
            // Since we ran disconnect() at the start, it is already disconnected.
        }

        // Cleanup on unmount or change
        return () => {
            if (analyser.current) {
                try { analyser.current.disconnect(); } catch (e) { }
            }
        };
    }, [sourceRef.current, audioContextRef.current]);

    useEffect(() => {
        if (gainNode.current) {
            gainNode.current.gain.value = volume;
        }
    }, [volume]);

    const getAudioData = useCallback(() => {
        if (!analyser.current || !dataArray.current || !audioContextRef.current) return audioValues.current;

        analyser.current.getByteFrequencyData(dataArray.current);
        const data = dataArray.current;
        const sampleRate = audioContextRef.current.sampleRate;
        const binCount = analyser.current.frequencyBinCount;
        const nyquist = sampleRate / 2;
        const binSize = nyquist / binCount;

        // Calculate ranges
        const bassEnd = Math.min(binCount, Math.round(250 / binSize));
        const midEnd = Math.min(binCount, Math.round(4000 / binSize));

        const getAvg = (start, end) => {
            let sum = 0;
            if (start >= end) return 0;
            for (let i = start; i < end; i++) sum += data[i];
            return sum / (end - start);
        };

        let bass = getAvg(0, bassEnd) / 255.0;
        let mid = getAvg(bassEnd, midEnd) / 255.0;
        let treble = getAvg(midEnd, binCount) / 255.0;

        // Safety Sanitize
        if (!Number.isFinite(bass)) bass = 0;
        if (!Number.isFinite(mid)) mid = 0;
        if (!Number.isFinite(treble)) treble = 0;

        // Beat Detection
        const instantEnergy = bass;
        const history = beatState.current.historyBuffer;
        history.push(instantEnergy);
        if (history.length > 60) history.shift();

        const localAvg = history.reduce((a, b) => a + b, 0) / history.length;
        const isBeat = instantEnergy > localAvg * 1.5 && instantEnergy > 0.3;

        audioValues.current.bass = bass;
        audioValues.current.mid = mid;
        audioValues.current.treble = treble;
        audioValues.current.isBeat = isBeat;

        return audioValues.current;
    }, [audioContextRef]);

    return {
        getAudioData,
        volume,
        setVolume,
        initAnalysis
    };
};
