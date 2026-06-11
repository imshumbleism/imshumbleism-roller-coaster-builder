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

  useEffect(() => {
    const dayMusic = new Audio("/sounds/song1.mp3");
    dayMusic.loop = true;
    dayMusic.volume = 0.5;

    dayMusic.oncanplaythrough = () => {
      alert("SONG1 LOADED");
    };

    dayMusic.onerror = () => {
      alert("SONG1 FAILED");
    };

    setDaylightMusic(dayMusic);

    const nightMusicAudio = new Audio("/sounds/song2.mp3");
    nightMusicAudio.loop = true;
    nightMusicAudio.volume = 0.5;

    nightMusicAudio.oncanplaythrough = () => {
      alert("SONG2 LOADED");
    };

    nightMusicAudio.onerror = () => {
      alert("SONG2 FAILED");
    };

    setNightMusic(nightMusicAudio);

    alert("Audio objects created");

    return () => {
      dayMusic.pause();
      dayMusic.src = "";

      nightMusicAudio.pause();
      nightMusicAudio.src = "";
    };
  }, [setDaylightMusic, setNightMusic]);

  useEffect(() => {
    const startMusicOnInteraction = () => {
      if (hasStartedRef.current) return;

      hasStartedRef.current = true;

      if (!isMuted) {
        if (isNightMode && nightMusic) {
          alert("Trying to play NIGHT music");

          nightMusic
            .play()
            .then(() => alert("Night music started"))
            .catch(() => alert("Night music failed"));
        } else if (!isNightMode && daylightMusic) {
          alert("Trying to play DAY music");

          daylightMusic
            .play()
            .then(() => alert("Day music started"))
            .catch(() => alert("Day music failed"));
        }
      }

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
        nightMusic
          .play()
          .catch(() => alert("Night music switch failed"));
      }
    } else {
      nightMusic.pause();
      daylightMusic.currentTime = 0;

      if (!isMuted) {
        daylightMusic
          .play()
          .catch(() => alert("Day music switch failed"));
      }
    }
  }, [isNightMode, daylightMusic, nightMusic, isMuted]);

  useEffect(() => {
    if (!hasStartedRef.current) return;

    if (isMuted) {
      if (daylightMusic) daylightMusic.pause();
      if (nightMusic) nightMusic.pause();
    } else {
      if (isNightMode && nightMusic) {
        nightMusic
          .play()
          .catch(() => alert("Night music unmute failed"));
      } else if (!isNightMode && daylightMusic) {
        daylightMusic
          .play()
          .catch(() => alert("Day music unmute failed"));
      }
    }
  }, [isMuted, daylightMusic, nightMusic, isNightMode]);

  return null;
}
