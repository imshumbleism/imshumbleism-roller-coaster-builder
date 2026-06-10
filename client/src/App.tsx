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

  // Create audio ONCE
  useEffect(() => {
    const base = import.meta.env.BASE_URL || "/";

    const day = new Audio(`${base}sounds/I see you.mp3`);
    day.loop = true;
    day.volume = 0.5;

    const night = new Audio(`${base}sounds/onlybill.mp3`);
    night.loop = true;
    night.volume = 0.5;

    setDaylightMusic(day);
    setNightMusic(night);

    return () => {
      day.pause();
      night.pause();
      day.src = "";
      night.src = "";
    };
  }, [setDaylightMusic, setNightMusic]);

  // Start music once user interacts
  useEffect(() => {
    const start = () => {
      if (hasStartedRef.current) return;
      hasStartedRef.current = true;

      const { daylightMusic, nightMusic } = useAudio.getState();
      const isNight = useRollerCoaster.getState().isNightMode;

      if (isMuted) return;

      if (isNight) {
        nightMusic?.play().catch(() => {});
      } else {
        daylightMusic?.play().catch(() => {});
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
  }, [isMuted]);

  // Switch music cleanly
  useEffect(() => {
    if (!hasStartedRef.current) return;

    const { daylightMusic, nightMusic } = useAudio.getState();

    if (isMuted) {
      daylightMusic?.pause();
      nightMusic?.pause();
      return;
    }

    if (isNightMode) {
      if (daylightMusic) {
        daylightMusic.pause();
        daylightMusic.currentTime = 0;
      }
      if (nightMusic) {
        nightMusic.currentTime = 0;
        nightMusic.play().catch(() => {});
      }
    } else {
      if (nightMusic) {
        nightMusic.pause();
        nightMusic.currentTime = 0;
      }
      if (daylightMusic) {
        daylightMusic.currentTime = 0;
        daylightMusic.play().catch(() => {});
      }
    }
  }, [isNightMode, isMuted]);

  return null;
}
