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

  // 🌲 BETTER TREE SPACING (NO CLUMPING)
  const trees = useMemo(() => {
    const t: { x: number; z: number; scale: number; tilt: number }[] = [];

    const MIN_DISTANCE = 8;

    const positions: [number, number][] = [];

    for (let i = 0; i < 80; i++) {
      let tries = 0;
      let x = 0;
      let z = 0;
      let ok = false;

      while (!ok && tries < 20) {
        const angle = Math.random() * Math.PI * 2;
        const radius = 40 + Math.random() * 110;

        x = Math.cos(angle) * radius;
        z = Math.sin(angle) * radius;

        ok = positions.every(([px, pz]) => {
          const dx = px - x;
          const dz = pz - z;
          return Math.sqrt(dx * dx + dz * dz) > MIN_DISTANCE;
        });

        tries++;
      }

      positions.push([x, z]);

      t.push({
        x,
        z,
        scale: 0.9 + Math.random() * 1.4,
        tilt: (Math.random() - 0.5) * 0.2
      });
    }

    return t;
  }, []);

  const Tree = ({ x, z, scale, tilt }: any) => {
    return (
      <group position={[x, 0, z]} rotation={[tilt, 0, tilt]} scale={scale}>
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

  return (
    <>
      <color attach="background" args={isNightMode ? ["#101025"] : ["#DDEEFF"]} />
      <fog attach="fog" args={isNightMode ? ["#0b0f1a", 60, 220] : ["#DDEEFF", 80, 260]} />

      {/* snow */}
      {isNightMode &&
        snow.current.map((flake, i) => (
          <mesh key={i} position={[flake.x, flake.y, flake.z]}>
            <sphereGeometry args={[flake.size, 6, 6]} />
            <meshBasicMaterial color="#FFFFFF" />
          </mesh>
        ))}

      {/* 🌲 trees */}
      {trees.map((t, i) => (
        <Tree key={i} {...t} />
      ))}

      {isNightMode && (
        <>
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
      )}

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
