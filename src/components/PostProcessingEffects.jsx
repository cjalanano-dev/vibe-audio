import { useRef, memo } from 'react';
import { useFrame } from '@react-three/fiber';
import { EffectComposer, Bloom, ChromaticAberration, Noise, Vignette } from '@react-three/postprocessing';

const PostProcessingEffects = memo(({ getAudioData }) => {
    const chromaticRef = useRef();

    useFrame(() => {
        if (!getAudioData) return;
        const { bass } = getAudioData();

        // Safety check for NaN
        const safeBass = Number.isFinite(bass) ? bass : 0;

        if (chromaticRef.current) {
            // Glitch effect on bass
            const offset = 0.002 + (safeBass * 0.005);

            // Handle both Vector2 (if initialized that way internally) or Array assignment fallback
            if (chromaticRef.current.offset && typeof chromaticRef.current.offset.set === 'function') {
                chromaticRef.current.offset.set(offset, offset);
            } else {
                // If the library keeps it as a uniform array or something else
                chromaticRef.current.offset = [offset, offset];
            }
        }
    });

    return (
        <EffectComposer disableNormalPass>
            <Bloom luminanceThreshold={0.2} luminanceSmoothing={0.9} height={300} intensity={1.5} />
            <ChromaticAberration
                ref={chromaticRef}
                offset={[0.002, 0.002]}
                radialModulation={false}
                modulationOffset={0}
            />
            <Noise opacity={0.05} />
            <Vignette eskil={false} offset={0.1} darkness={1.1} />
        </EffectComposer>
    );
});

export default PostProcessingEffects;
