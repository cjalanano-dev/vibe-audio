import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Sphere, Box, Torus, Stars } from '@react-three/drei';
import * as THREE from 'three';

const VisualizerScene = ({ getAudioData, theme }) => {
    const meshRef = useRef();
    const bassMeshRef = useRef();
    const midMeshRef = useRef();
    const trebleGroupRef = useRef();

    // Refs for treble boxes to animate individually if needed, 
    // but for now we animate the group and material.
    const boxRefs = useRef([]);

    const tempColor = useMemo(() => new THREE.Color(), []);

    useFrame((state, delta) => {
        const audioData = getAudioData();
        const bass = Number.isFinite(audioData.bass) ? audioData.bass : 0;
        const mid = Number.isFinite(audioData.mid) ? audioData.mid : 0;
        const treble = Number.isFinite(audioData.treble) ? audioData.treble : 0;

        // 1. Bass -> Scale (Big movement) on Central Sphere
        if (bassMeshRef.current) {
            const scale = 1 + bass * 1.5; // Adjusted scale factor
            bassMeshRef.current.scale.setScalar(scale);
            bassMeshRef.current.rotation.y += delta * 0.5;

            // Pulse color
            tempColor.set(theme.primary);
            // Boost lightness on bass hit
            bassMeshRef.current.material.color.lerp(new THREE.Color(theme.primary).multiplyScalar(1 + bass), 0.1);
            bassMeshRef.current.material.emissive.set(theme.primary);
            bassMeshRef.current.material.emissiveIntensity = 0.5 + bass * 2.0;
        }

        // 2. Mids -> Rotation Speed (Flow) on Torus
        if (midMeshRef.current) {
            // Mids modify rotation speed
            midMeshRef.current.rotation.z += delta * (0.5 + mid * 5);
            midMeshRef.current.rotation.x += delta * (0.2 + mid * 2);

            const midScale = 2.5 + mid * 0.5; // Slight scale reaction
            midMeshRef.current.scale.setScalar(midScale);

            midMeshRef.current.material.color.set(theme.secondary);
            midMeshRef.current.material.emissive.set(theme.secondary);
            midMeshRef.current.material.emissiveIntensity = 0.5 + mid;
        }

        // 3. Treble -> Emissive Intensity / Color Brightness (Sparkle) on Boxes
        if (trebleGroupRef.current) {
            // Slowly rotate the group
            trebleGroupRef.current.rotation.y -= delta * 0.2;

            // Animate children (boxes)
            trebleGroupRef.current.children.forEach((child, i) => {
                // Jitter or bounce based on treble?
                // Simple: Scale and Emissive flash
                const t = treble * (1 + (i % 3) * 0.2); // variation
                child.scale.setScalar(0.3 + t * 0.5);

                child.material.color.set(theme.tertiary);
                child.material.emissive.set(theme.tertiary);
                child.material.emissiveIntensity = t * 5.0; // Flash high on treble
            });
        }
    });

    return (
        <>
            <ambientLight intensity={0.2} />
            <pointLight position={[10, 10, 10]} intensity={1.5} />
            <spotLight position={[-10, -10, -10]} angle={0.3} />

            {/* Central Bass Sphere */}
            <Sphere ref={bassMeshRef} args={[1, 64, 64]} position={[0, 0, 0]}>
                <meshStandardMaterial
                    roughness={0.1}
                    metalness={0.8}
                    color={theme.primary}
                />
            </Sphere>

            {/* Mid Frequency Ring */}
            <Torus ref={midMeshRef} args={[1, 0.05, 16, 100]} position={[0, 0, 0]}> {/* Radius will be scaled */}
                <meshStandardMaterial
                    color={theme.secondary}
                    wireframe
                    emissive={theme.secondary}
                />
            </Torus>

            {/* Treble Group */}
            <group ref={trebleGroupRef}>
                <Box args={[1, 1, 1]} position={[3, 2, 0]}>
                    <meshStandardMaterial color={theme.tertiary} />
                </Box>
                <Box args={[1, 1, 1]} position={[-3, -2, 1]}>
                    <meshStandardMaterial color={theme.tertiary} />
                </Box>
                <Box args={[1, 1, 1]} position={[1, 3, -1]}>
                    <meshStandardMaterial color={theme.tertiary} />
                </Box>
                <Box args={[1, 1, 1]} position={[-2, 1, 3]}>
                    <meshStandardMaterial color={theme.tertiary} />
                </Box>
                <Box args={[1, 1, 1]} position={[2, -2, -2]}>
                    <meshStandardMaterial color={theme.tertiary} />
                </Box>
            </group>

            <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
        </>
    );
};

export default VisualizerScene;
