import { Canvas } from "@react-three/fiber";
import { Suspense, useEffect, useRef } from "react";
import "@fontsource/inter";
import { Ground } from "./components/game/Ground";
import { TrackBuilder } from "./components/game/TrackBuilder";
import { BuildCamera } from "./components/game/BuildCamera";
import { RideCamera } from "./components/game/RideCamera";
import { Sky } from "./components/game/Sky";
import { GameUI } from "./components/game/GameUI";
import { useRollerCoaster } from "./lib/stores/useRollerCoaster";
import { useAudio } from "./lib/stores/useAudio";

function MusicController() {
  const { isNightMode } = useRollerCoaster();
  const {
    setDaylightMusic,
    daylightMusic,
    setNightMusic,
    nightMusic,
    isMuted,
  } = useAudio();

  const hasStartedRef = useRef(false);

  // Load sounds once
  useEffect(() => {
    const base = import.meta.env.BASE_URL || "/";

    // 🌞 DAY MUSIC
    const dayMusic = new Audio(`${base}sounds/music.mp3`);
    dayMusic.loop = true;
    dayMusic.volume = 0.5;
    setDaylightMusic(dayMusic);

    // 🌙 NIGHT MUSIC (your file)
    const nightMusicAudio = new Audio(`${base}sounds/lovelyday.mp3`);
    nightMusicAudio.loop = true;
    nightMusicAudio.volume = 0.5;
    setNightMusic(nightMusicAudio);

    return () => {
      dayMusic.pause();
      nightMusicAudio.pause();
    };
  }, [setDaylightMusic, setNightMusic]);

  // Start music after user interaction (browser requirement)
  useEffect(() => {
    const start = () => {
      if (hasStartedRef.current) return;
      hasStartedRef.current = true;

      if (isMuted) return;

      if (isNightMode && nightMusic) {
        nightMusic.play().catch(() => {});
      } else if (!isNightMode && daylightMusic) {
        daylightMusic.play().catch(() => {});
      }

      document.removeEventListener("click", start);
      document.removeEventListener("keydown", start);
    };

    document.addEventListener("click", start);
    document.addEventListener("keydown", start);

    return () => {
      document.removeEventListener("click", start);
      document.removeEventListener("keydown", start);
    };
  }, [isNightMode, daylightMusic, nightMusic, isMuted]);

  // Switch music when mode changes
  useEffect(() => {
    if (!hasStartedRef.current) return;

    if (isMuted) {
      daylightMusic?.pause();
      nightMusic?.pause();
      return;
    }

    if (isNightMode) {
      daylightMusic?.pause();
      if (nightMusic) {
        nightMusic.currentTime = 0;
        nightMusic.play().catch(() => {});
      }
    } else {
      nightMusic?.pause();
      if (daylightMusic) {
        daylightMusic.currentTime = 0;
        daylightMusic.play().catch(() => {});
      }
    }
  }, [isNightMode, daylightMusic, nightMusic, isMuted]);

  return null;
}
