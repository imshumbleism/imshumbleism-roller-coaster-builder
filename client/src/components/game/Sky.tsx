import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { useRollerCoaster } from "@/lib/stores/useRollerCoaster";

export function Sky() {
  const { isNightMode } = useRollerCoaster();

  const parkLights = useMemo(() => {
    const lights: { x: number; z: number; height: number; color: string }[] = [];

    for (let i = 0; i < 30; i++) {
      const angle = (i / 30) * Math.PI * 2;
      const radius = 60 + (i * 7) % 100;

      lights.push({
        x: Math.cos(angle) * radius,
        z: Math.sin(angle) * radius,
        height: 8 + (i % 4),
        color: ["#FFD700", "#FF6B6B", "#4ECDC4", "#FF69B4", "#00CED1", "#FFFFFF"][i % 6]
      });
    }

    return lights;
  }, []);

  const stars = useMemo(() => {
    const s: { x: number; y: number; z: number; size: number }[] = [];

    for (let i = 0; i < 100; i++) {
      s.push({
        x: (i * 17 % 500) - 250,
        y: 60 + (i * 13 % 50),
        z: (i * 23 % 500) - 250,
        size: 0.15 + (i % 3) * 0.05
      });
    }

    return s;
  }, []);

  const ferrisWheel = useMemo(() => {
    const spokes: { angle: number; color: string }[] = [];

    for (let i = 0; i < 12; i++) {
      spokes.push({
        angle: (i / 12) * Math.PI * 2,
        color: ["#FF0000", "#FFFF00", "#00FF00", "#0000FF", "#FF00FF", "#00FFFF"][i % 6]
      });
    }

    return spokes;
  }, []);

  // ❄️ snow
  const snow = useRef(
    Array.from({ length: 200 }, () => ({
      x: (Math.random() - 0.5) * 400,
      y: Math.random() * 60 + 10,
      z: (Math.random() - 0.5) * 400,
      size: Math.random() * 0.3 + 0.1,
      speed: 0.6 + Math.random() * 1.2,
      drift: (Math.random() - 0.5) * 0.3
    }))
  );

  // 🌲 TREES (FIXED — MUCH CLOSER)
  const trees = useMemo(() => {
    const t: { x: number; z: number; scale: number; tilt: number }[] = [];

    for (let i = 0; i < 80; i++) {
      const angle = Math.random() * Math.PI * 2;

      // ✅ FIX: much smaller radius so you SEE them
      const radius = 30 + Math.random() * 70;

      t.push({
        x: Math.cos(angle) * radius,
        z: Math.sin(angle) * radius,
        scale: 0.9 + Math.random() * 1.3,
        tilt: (Math.random() - 0.5) * 0.2
      });
    }

    return t;
  }, []);

  const Tree = ({ x, z, scale, tilt }: any) => {
    return (
      <group position={[x, 1, z]} rotation={[tilt, 0, tilt]} scale={scale}>
        {/* trunk */}
        <mesh position={[0, 2, 0]}>
          <cylinderGeometry args={[0.4, 0.6, 4, 8]} />
          <meshStandardMaterial color="#5a3a1e" />
        </mesh>

        {/* leaves */}
        <mesh position={[0, 5, 0]}>
          <coneGeometry args={[2.5, 6, 10]} />
          <meshStandardMaterial color="#1f6b3a" />
        </mesh>

        {/* snow cap */}
        <mesh position={[0, 6.2, 0]}>
          <coneGeometry args={[2.6, 1.5, 10]} />
          <meshStandardMaterial color="#ffffff" />
        </mesh>
      </group>
    );
  };

  useFrame((_, delta) => {
    const wind = Math.sin(Date.now() * 0.0005) * 0.15;

    snow.current.forEach((flake) => {
      flake.y -= flake.speed * delta * 60;
      flake.x += (flake.drift + wind) * delta * 60;

      if (flake.y < 0) {
        flake.y = 60;
        flake.x = (Math.random() - 0.5) * 400;
        flake.z = (Math.random() - 0.5) * 400;
      }
    });
  });

  if (isNightMode) {
    return (
      <>
        <color attach="background" args={["#101025"]} />
        <fog attach="fog" args={["#0b0f1a", 60, 220]} />

        {/* snow */}
        {snow.current.map((flake, i) => (
          <mesh key={i} position={[flake.x, flake.y, flake.z]}>
            <sphereGeometry args={[flake.size, 6, 6]} />
            <meshBasicMaterial color="#FFFFFF" />
          </mesh>
        ))}

        {/* 🌲 trees (NOW VISIBLE) */}
        {trees.map((t, i) => (
          <Tree key={i} {...t} />
        ))}

        <mesh position={[50, 40, -50]}>
          <sphereGeometry args={[8, 32, 32]} />
          <meshBasicMaterial color="#FFFF88" />
        </mesh>

        {stars.map((star, i) => (
          <mesh key={i} position={[star.x, star.y, star.z]}>
            <sphereGeometry args={[star.size, 6, 6]} />
            <meshBasicMaterial color="#FFFFFF" />
          </mesh>
        ))}
      </>
    );
  }

  return (
    <>
      <color attach="background" args={["#DDEEFF"]} />
      <fog attach="fog" args={["#DDEEFF", 80, 260]} />

      {/* 🌲 trees (DAY MODE ALSO) */}
      {trees.map((t, i) => (
        <Tree key={i} {...t} />
      ))}

      <mesh position={[50, 40, -50]}>
        <sphereGeometry args={[8, 32, 32]} />
        <meshBasicMaterial color="#FFFF88" />
      </mesh>

      <ambientLight intensity={0.4} />

      <directionalLight
        position={[50, 50, 25]}
        intensity={1}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
      />

      <hemisphereLight args={["#DDEEFF", "#FFFFFF", 0.6]} />
    </>
  );
}
