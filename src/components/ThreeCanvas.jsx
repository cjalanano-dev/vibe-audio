import { Canvas } from '@react-three/fiber';
import VisualizerScene from './VisualizerScene';
import { OrbitControls } from '@react-three/drei';
import PostProcessingEffects from './PostProcessingEffects';

const ThreeCanvas = ({ getAudioData, theme }) => {
    return (
        <Canvas
            camera={{ position: [0, 0, 8], fov: 45 }}
            style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', background: '#050505' }}
        >
            <VisualizerScene getAudioData={getAudioData} theme={theme} />
            <OrbitControls enableZoom={false} autoRotate autoRotateSpeed={0.5} />

            <PostProcessingEffects getAudioData={getAudioData} />
        </Canvas>
    );
};

export default ThreeCanvas;
