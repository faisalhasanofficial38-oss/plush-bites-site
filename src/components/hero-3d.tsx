import { Canvas, useFrame } from "@react-three/fiber";
import { Float, ContactShadows } from "@react-three/drei";
import { Suspense, useMemo, useRef, useEffect, useState, lazy } from "react";
import { motion } from "framer-motion";
import * as THREE from "three";

const CAMERA_LERP = 0.05;

type Segs = number;

function useMousePosition() {
  const mouse = useRef({ x: 0, y: 0 });
  const target = useRef({ x: 0, y: 0 });
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      target.current.x = (e.clientX / window.innerWidth - 0.5) * 2;
      target.current.y = -(e.clientY / window.innerHeight - 0.5) * 2;
    };
    window.addEventListener("mousemove", handler, { passive: true });
    return () => window.removeEventListener("mousemove", handler);
  }, []);
  return { mouse, target };
}

function useLowEndDevice() {
  const [lowEnd, setLowEnd] = useState(true);
  useEffect(() => {
    const isMobile = window.innerWidth < 768;
    const lowCPU = (navigator.hardwareConcurrency ?? 8) <= 4;
    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    setLowEnd(isMobile || lowCPU || prefersReduced);
  }, []);
  return lowEnd;
}

function CoffeeCup({ segs, position }: { segs: Segs; position: [number, number, number] }) {
  return (
    <group position={position}>
      <mesh position={[0, -0.6, 0]} castShadow>
        <cylinderGeometry args={[0.6, 0.5, 0.08, segs]} />
        <meshPhysicalMaterial color="#2a1f14" metalness={0.3} roughness={0.4} />
      </mesh>
      <mesh position={[0, -0.05, 0]} castShadow>
        <cylinderGeometry args={[0.28, 0.22, 0.5, segs]} />
        <meshPhysicalMaterial color="#1a1008" metalness={0.6} roughness={0.2} clearcoat={0.3} />
      </mesh>
      <mesh position={[0.28, 0.1, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
        <torusGeometry args={[0.15, 0.03, 8, segs, Math.PI]} />
        <meshPhysicalMaterial color="#1a1008" metalness={0.6} roughness={0.2} />
      </mesh>
      <mesh position={[0, 0.2, 0]}>
        <cylinderGeometry args={[0.25, 0.25, 0.02, segs]} />
        <meshPhysicalMaterial color="#3a2010" metalness={0.1} roughness={0.8} />
      </mesh>
      <points>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[new Float32Array([0, 0.35, 0, -0.05, 0.4, 0.05, 0.06, 0.38, -0.04]), 3]} />
        </bufferGeometry>
        <pointsMaterial size={0.015} color="#ffffff" transparent opacity={0.2} depthWrite={false} />
      </points>
    </group>
  );
}

function Burger({ segs, position }: { segs: Segs; position: [number, number, number] }) {
  return (
    <group position={position}>
      <mesh position={[0, 0.35, 0]} castShadow>
        <sphereGeometry args={[0.35, segs, segs, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshPhysicalMaterial color="#d4a043" roughness={0.7} metalness={0.05} />
      </mesh>
      {segs > 20 && (
        <group position={[0, 0.55, 0]}>
          {[[0.15, 0, 0.1], [-0.12, 0.03, -0.08], [0.05, -0.02, 0.15], [-0.08, 0.04, 0.05], [0.1, 0.02, -0.12]].map((p, i) => (
            <mesh key={i} position={p as [number, number, number]}>
              <sphereGeometry args={[0.025, 8, 8]} />
              <meshPhysicalMaterial color="#f0e0a0" roughness={0.5} />
            </mesh>
          ))}
        </group>
      )}
      <mesh position={[0, 0.15, 0]} castShadow>
        <cylinderGeometry args={[0.38, 0.38, 0.04, segs]} />
        <meshPhysicalMaterial color="#4a8a3a" roughness={0.9} metalness={0} />
      </mesh>
      <mesh position={[0, 0.08, 0]} castShadow>
        <cylinderGeometry args={[0.35, 0.35, 0.05, segs]} />
        <meshPhysicalMaterial color="#cc3333" roughness={0.6} metalness={0} />
      </mesh>
      <mesh position={[0, 0.0, 0]} castShadow>
        <cylinderGeometry args={[0.36, 0.36, 0.03, segs]} />
        <meshPhysicalMaterial color="#e8a820" roughness={0.5} metalness={0.1} />
      </mesh>
      <mesh position={[0, -0.08, 0]} castShadow>
        <cylinderGeometry args={[0.34, 0.34, 0.1, segs]} />
        <meshPhysicalMaterial color="#4a2a18" roughness={0.8} metalness={0} />
      </mesh>
      <mesh position={[0, -0.22, 0]} castShadow>
        <sphereGeometry args={[0.33, segs, segs, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2]} />
        <meshPhysicalMaterial color="#d4a043" roughness={0.7} metalness={0.05} />
      </mesh>
    </group>
  );
}

function PizzaSlice({ segs, position }: { segs: Segs; position: [number, number, number] }) {
  const shape = useMemo(() => {
    const s = new THREE.Shape();
    s.moveTo(0, 0);
    s.lineTo(0.5, 0);
    s.lineTo(0.3, 0.45);
    s.closePath();
    return s;
  }, []);

  return (
    <group position={position} rotation={[0, 0.3, 0.2]}>
      <mesh castShadow>
        <extrudeGeometry args={[shape, { depth: 0.03, bevelEnabled: true, bevelThickness: 0.02, bevelSize: 0.02, bevelSegments: segs > 20 ? 4 : 2 }]} />
        <meshPhysicalMaterial color="#d4a043" roughness={0.7} metalness={0.05} />
      </mesh>
      <mesh position={[0, 0.035, 0]}>
        <shapeGeometry args={[shape]} />
        <meshPhysicalMaterial color="#cc3333" roughness={0.8} metalness={0} side={THREE.DoubleSide} />
      </mesh>
      {segs > 20 && (
        <group position={[0, 0.04, 0]}>
          <mesh position={[0.2, 0, 0]}><sphereGeometry args={[0.03, 8, 8]} /><meshPhysicalMaterial color="#e8a820" roughness={0.5} /></mesh>
          <mesh position={[0.35, 0.05, 0]}><sphereGeometry args={[0.025, 8, 8]} /><meshPhysicalMaterial color="#e8a820" roughness={0.5} /></mesh>
          <mesh position={[0.15, 0.08, 0.12]}><sphereGeometry args={[0.02, 8, 8]} /><meshPhysicalMaterial color="#e8a820" roughness={0.5} /></mesh>
        </group>
      )}
      <mesh position={[0.2, 0.04, 0.08]}><cylinderGeometry args={[0.04, 0.04, 0.015, 8]} /><meshPhysicalMaterial color="#8a2a1a" roughness={0.7} /></mesh>
      <mesh position={[0.35, 0.04, -0.02]}><cylinderGeometry args={[0.035, 0.035, 0.015, 8]} /><meshPhysicalMaterial color="#8a2a1a" roughness={0.7} /></mesh>
      {segs > 20 && <mesh position={[0.15, 0.04, -0.1]}><cylinderGeometry args={[0.03, 0.03, 0.015, 8]} /><meshPhysicalMaterial color="#8a2a1a" roughness={0.7} /></mesh>}
    </group>
  );
}

function SparkleParticles({ count }: { count: number }) {
  const ref = useRef<THREE.Points>(null);
  const positions = useMemo(() => {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 14;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 10;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 10;
    }
    return pos;
  }, [count]);

  useFrame(({ clock }) => {
    if (!ref.current) return;
    const t = clock.elapsedTime;
    const positions = ref.current.geometry.attributes.position.array as Float32Array;
    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      positions[i3 + 1] += Math.sin(t + i) * 0.001;
      if (positions[i3 + 1] > 5) positions[i3 + 1] = -5;
    }
    ref.current.geometry.attributes.position.needsUpdate = true;
    ref.current.rotation.y = t * 0.02;
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial size={0.04} color="#e9c879" transparent opacity={0.6} sizeAttenuation depthWrite={false} />
    </points>
  );
}

function Scene({ lowEnd, segs }: { lowEnd: boolean; segs: Segs }) {
  const groupRef = useRef<THREE.Group>(null);
  const { mouse, target } = useMousePosition();

  useFrame(() => {
    mouse.current.x += (target.current.x - mouse.current.x) * CAMERA_LERP;
    mouse.current.y += (target.current.y - mouse.current.y) * CAMERA_LERP;
    if (groupRef.current) {
      groupRef.current.rotation.y = mouse.current.x * 0.4;
      groupRef.current.rotation.x = mouse.current.y * 0.15;
    }
  });

  return (
    <group ref={groupRef}>
      <ambientLight intensity={0.3} color="#f7d27a" />
      <directionalLight position={[5, 8, 5]} intensity={1.4} color="#f7d27a" castShadow={!lowEnd} />
      <directionalLight position={[-3, 4, -2]} intensity={0.7} color="#ff7a3d" />
      <directionalLight position={[0, -2, 4]} intensity={0.3} color="#caa066" />
      <pointLight position={[0, 3, 0]} intensity={0.4} color="#e9c879" />

      <Float speed={2.2} rotationIntensity={0.3} floatIntensity={1.6}>
        <CoffeeCup segs={segs} position={[-2.2, -0.5, -1]} />
      </Float>
      <Float speed={1.8} rotationIntensity={0.2} floatIntensity={1.3}>
        <Burger segs={segs} position={[2.4, 0.2, -0.5]} />
      </Float>
      <Float speed={2.4} rotationIntensity={0.4} floatIntensity={1.9}>
        <PizzaSlice segs={segs} position={[-0.3, -0.9, -2.8]} />
      </Float>

      <SparkleParticles count={lowEnd ? 60 : 140} />
      <ContactShadows position={[0, -2.5, 0]} opacity={0.45} scale={12} blur={2.5} far={4} />
    </group>
  );
}

export function Hero3D() {
  const lowEnd = useLowEndDevice();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
      className="absolute inset-0"
    >
      <Canvas
        dpr={lowEnd ? [1, 1] : [1, 1.5]}
        camera={{ position: [0, 0, 6], fov: lowEnd ? 55 : 45 }}
        gl={{ antialias: !lowEnd, alpha: true, powerPreference: "high-performance" }}
        shadows={!lowEnd}
        className="pointer-events-none"
      >
        <Suspense fallback={null}>
          <Scene lowEnd={lowEnd} segs={lowEnd ? 12 : 28} />
        </Suspense>
      </Canvas>
    </motion.div>
  );
}

export default Hero3D;
