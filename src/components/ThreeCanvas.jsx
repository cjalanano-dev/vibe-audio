import { Canvas } from '@react-three/fiber';
import VisualizerScene from './VisualizerScene';
import { OrbitControls } from '@react-three/drei';
import { EffectComposer, Bloom } from '@react-three/postprocessing';

const ThreeCanvas = ({ getAudioData }) => {
    return (
        <Canvas
            camera={{ position: [0, 0, 8], fov: 45 }}
            style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', background: '#050505' }}
        >
            <VisualizerScene getAudioData={getAudioData} />
            <OrbitControls enableZoom={false} autoRotate autoRotateSpeed={0.5} />

            <EffectComposer>
                <Bloom luminanceThreshold={0.2} luminanceSmoothing={0.9} height={300} intensity={1.5} />
            </EffectComposer>
        </Canvas>
    );
};

export default ThreeCanvas;
