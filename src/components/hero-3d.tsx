import { Canvas, useFrame } from "@react-three/fiber";
import { Float, Sphere, MeshDistortMaterial } from "@react-three/drei";
import { Suspense, useMemo, useRef } from "react";
import type { Points } from "three";

function Particles({ count = 120 }: { count?: number }) {
  const ref = useRef<Points>(null);
  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      arr[i * 3] = (Math.random() - 0.5) * 12;
      arr[i * 3 + 1] = (Math.random() - 0.5) * 8;
      arr[i * 3 + 2] = (Math.random() - 0.5) * 8;
    }
    return arr;
  }, [count]);
  useFrame((state) => {
    if (!ref.current) return;
    ref.current.rotation.y = state.clock.elapsedTime * 0.04;
    ref.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.2) * 0.1;
  });
  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial size={0.04} color="#e9c879" transparent opacity={0.8} sizeAttenuation depthWrite={false} />
    </points>
  );
}

function Orb({ position, color, scale = 1, speed = 1 }: { position: [number, number, number]; color: string; scale?: number; speed?: number }) {
  return (
    <Float speed={speed} rotationIntensity={0.4} floatIntensity={1.2}>
      <Sphere args={[scale, 64, 64]} position={position}>
        <MeshDistortMaterial color={color} distort={0.35} speed={1.4} roughness={0.15} metalness={0.6} />
      </Sphere>
    </Float>
  );
}

export function Hero3D() {
  return (
    <Canvas
      dpr={[1, 1.5]}
      camera={{ position: [0, 0, 6], fov: 50 }}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      className="pointer-events-none"
    >
      <Suspense fallback={null}>
        <ambientLight intensity={0.45} />
        <directionalLight position={[5, 5, 5]} intensity={1.1} color="#f7d27a" />
        <directionalLight position={[-5, -3, 2]} intensity={0.5} color="#ff7a3d" />
        <Orb position={[2.6, 0.4, -1]} color="#caa066" scale={1.1} speed={1.1} />
        <Orb position={[-2.8, -0.8, -0.5]} color="#7a3a1a" scale={0.8} speed={0.8} />
        <Orb position={[0.5, 1.6, -3]} color="#3a2418" scale={1.4} speed={0.6} />
        <Particles count={140} />
      </Suspense>
    </Canvas>
  );
}

export default Hero3D;