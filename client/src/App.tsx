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
  const { setDaylightMusic, setNightMusic, isMuted } = useAudio();
  const hasStartedRef = useRef(false);

  useEffect(() => {
    const base = import.meta.env.BASE_URL || "/";

    // 🌞 DAY = Smooth Criminal
    const dayMusic = new Audio(`${base}sounds/smoothcriminal.mp3`);
    dayMusic.loop = true;
    dayMusic.volume = 0.5;

    // 🌙 NIGHT = Billie Jean
    const nightMusic = new Audio(`${base}sounds/billiejean.mp3`);
    nightMusic.loop = true;
    nightMusic.volume = 0.5;

    setDaylightMusic(dayMusic);
    setNightMusic(nightMusic);

    return () => {
      dayMusic.pause();
      nightMusic.pause();
    };
  }, []);

  useEffect(() => {
    const start = () => {
      if (hasStartedRef.current) return;
      hasStartedRef.current = true;

      if (isMuted) return;

      const audio = useAudio.getState();

      if (isNightMode) {
        audio.playNightMusic();
      } else {
        audio.playDaylightMusic();
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
  }, [isNightMode, isMuted]);

  useEffect(() => {
    if (!hasStartedRef.current) return;

    const audio = useAudio.getState();

    if (isMuted) {
      audio.stopDaylightMusic();
      audio.stopNightMusic();
      return;
    }

    if (isNightMode) {
      audio.stopDaylightMusic();
      audio.playNightMusic();
    } else {
      audio.stopNightMusic();
      audio.playDaylightMusic();
    }
  }, [isNightMode, isMuted]);

  return null;
}
