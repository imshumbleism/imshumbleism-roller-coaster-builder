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

  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    console.log("MusicController loaded");

    const audio = new Audio("/sounds/song1.mp3");
    audio.loop = true;
    audio.volume = 0.5;

    audioRef.current = audio;

    audio.addEventListener("canplaythrough", () => {
      console.log("SONG LOADED");
    });

    audio.addEventListener("error", () => {
      console.error("SONG FAILED TO LOAD");
    });

    return () => {
      audio.pause();
    };
  }, []);

  useEffect(() => {
    const forcePlay = () => {
      console.log("FORCE PLAY CLICKED");

      if (!audioRef.current) {
        console.warn("No audio found");
        return;
      }

      audioRef.current.currentTime = 0;

      audioRef.current
        .play()
        .then(() => {
          console.log("AUDIO IS PLAYING");
        })
        .catch((err) => {
          console.error("PLAY BLOCKED BY BROWSER:", err);
        });
    };

    window.addEventListener("pointerdown", forcePlay, { once: true });

    return () => {
      window.removeEventListener("pointerdown", forcePlay);
    };
  }, []);

  return null;
}
