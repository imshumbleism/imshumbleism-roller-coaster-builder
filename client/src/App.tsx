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
import { useAudio } from "./lib/stores/useAudio";\

function MusicController() {
  const { isNightMode } = useRollerCoaster();

  const {
    setDaylightMusic,
    setNightMusic,
    daylightMusic,
    nightMusic,
    isMuted,
  } = useAudio();

  const hasStartedRef = useRef(false);

  // Load both songs once
  useEffect(() => {
    console.log("Loading music system...");

    const day = new Audio("/sounds/music.mp3");
    day.loop = true;
    day.volume = 0.5;

    const night = new Audio("/sounds/lovelyday.mp3");
    night.loop = true;
    night.volume = 0.5;

    day.addEventListener("canplaythrough", () => {
      console.log("DAY MUSIC READY");
    });

    night.addEventListener("canplaythrough", () => {
      console.log("NIGHT MUSIC READY");
    });

    day.addEventListener("error", () => {
      console.error("DAY MUSIC FAILED");
    });

    night.addEventListener("error", () => {
      console.error("NIGHT MUSIC FAILED");
    });

    setDaylightMusic(day);
    setNightMusic(night);

    return () => {
      day.pause();
      night.pause();
    };
  }, [setDaylightMusic, setNightMusic]);

  // FIRST CLICK STARTS AUDIO (required by Chrome)
  useEffect(() => {
    const start = () => {
      if (hasStartedRef.current) return;
      hasStartedRef.current = true;

      console.log("USER STARTED AUDIO");

      const current = isNightMode ? nightMusic : daylightMusic;

      if (!current) {
        console.warn("Music not loaded yet");
        return;
      }

      current.currentTime = 0;

      current
        .play()
        .then(() => console.log("MUSIC PLAYING"))
        .catch((err) => console.error("PLAY BLOCKED:", err));
    };

    window.addEventListener("pointerdown", start, { once: true });

    return () => {
      window.removeEventListener("pointerdown", start);
    };
  }, [daylightMusic, nightMusic, isNightMode]);

  // SWITCH DAY / NIGHT MUSIC
  useEffect(() => {
    if (!hasStartedRef.current) return;

    const current = isNightMode ? nightMusic : daylightMusic;
    const previous = isNightMode ? daylightMusic : nightMusic;

    previous?.pause();
    if (previous) previous.currentTime = 0;

    if (current && !isMuted) {
      current
        .play()
        .then(() => console.log(isNightMode ? "NIGHT PLAYING" : "DAY PLAYING"))
        .catch((err) => console.error("SWITCH FAILED:", err));
    }
  }, [isNightMode, daylightMusic, nightMusic, isMuted]);

  // MUTE CONTROL
  useEffect(() => {
    if (isMuted) {
      daylightMusic?.pause();
      nightMusic?.pause();
    }
  }, [isMuted, daylightMusic, nightMusic]);

  return null;
}
