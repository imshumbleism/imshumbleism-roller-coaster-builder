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
    daylightMusic,
    setNightMusic,
    nightMusic,
    isMuted,
  } = useAudio();

  const hasStartedRef = useRef(false);

  useEffect(() => {
    const base = import.meta.env.BASE_URL || '/';

    const dayMusic = new Audio(`${base}sounds/music.mp3`);
    dayMusic.loop = true;
    dayMusic.volume = 0.5;

    dayMusic.oncanplaythrough = () => {
      console.log("SONG1 LOADED");
    };

    dayMusic.onerror = () => {
      console.error("SONG1 FAILED");
    };

    setDaylightMusic(dayMusic);

    const nightMusicAudio = new Audio(`${base}sounds/lovelyday.mp3`);
    nightMusicAudio.loop = true;
    nightMusicAudio.volume = 0.5;

    nightMusicAudio.oncanplaythrough = () => {
      console.log("SONG2 LOADED");
    };

    nightMusicAudio.onerror = () => {
      console.error("SONG2 FAILED");
    };

    setNightMusic(nightMusicAudio);

    console.log("Audio objects created");

    return () => {
      dayMusic.pause();
      nightMusicAudio.pause();
    };
  }, [setDaylightMusic, setNightMusic]);

  useEffect(() => {
    const startMusicOnInteraction = () => {
      if (hasStartedRef.current) return;
      hasStartedRef.current = true;

      console.log("User interaction detected");

      if (isMuted) return;

      const music = isNightMode ? nightMusic : daylightMusic;

      if (!music) {
        console.warn("Music not ready yet");
        return;
      }

      music
        .play()
        .then(() => console.log("Music started"))
        .catch((err) => console.error("Play blocked:", err));

      document.removeEventListener("click", startMusicOnInteraction);
      document.removeEventListener("keydown", startMusicOnInteraction);
    };

    document.addEventListener("click", startMusicOnInteraction);
    document.addEventListener("keydown", startMusicOnInteraction);

    return () => {
      document.removeEventListener("click", startMusicOnInteraction);
      document.removeEventListener("keydown", startMusicOnInteraction);
    };
  }, [daylightMusic, nightMusic, isNightMode, isMuted]);

  useEffect(() => {
    if (!daylightMusic || !nightMusic || !hasStartedRef.current) return;

    if (isNightMode) {
      daylightMusic.pause();
      nightMusic.currentTime = 0;

      if (!isMuted) {
        nightMusic.play().catch(() => {});
      }
    } else {
      nightMusic.pause();
      daylightMusic.currentTime = 0;

      if (!isMuted) {
        daylightMusic.play().catch(() => {});
      }
    }
  }, [isNightMode, daylightMusic, nightMusic, isMuted]);

  useEffect(() => {
    if (!hasStartedRef.current) return;

    if (isMuted) {
      daylightMusic?.pause();
      nightMusic?.pause();
    } else {
      const music = isNightMode ? nightMusic : daylightMusic;
      music?.play().catch(() => {});
    }
  }, [isMuted, daylightMusic, nightMusic, isNightMode]);

  return null;
}
