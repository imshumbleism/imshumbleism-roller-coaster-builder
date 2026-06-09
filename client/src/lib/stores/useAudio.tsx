import { create } from "zustand";

interface AudioState {
  backgroundMusic: HTMLAudioElement | null;
  daylightMusic: HTMLAudioElement | null;
  nightMusic: HTMLAudioElement | null;
  hitSound: HTMLAudioElement | null;
  successSound: HTMLAudioElement | null;

  isMuted: boolean;
  isDaylightMusicPlaying: boolean;
  isNightMusicPlaying: boolean;

  setBackgroundMusic: (music: HTMLAudioElement) => void;
  setDaylightMusic: (music: HTMLAudioElement) => void;
  setNightMusic: (music: HTMLAudioElement) => void;
  setHitSound: (sound: HTMLAudioElement) => void;
  setSuccessSound: (sound: HTMLAudioElement) => void;

  toggleMute: () => void;
  playHit: () => void;
  playSuccess: () => void;
  playDaylightMusic: () => void;
  stopDaylightMusic: () => void;
  playNightMusic: () => void;
  stopNightMusic: () => void;
}

export const useAudio = create<AudioState>((set, get) => ({
  backgroundMusic: null,
  daylightMusic: null,
  nightMusic: null,
  hitSound: null,
  successSound: null,

  isMuted: false,
  isDaylightMusicPlaying: false,
  isNightMusicPlaying: false,

  setBackgroundMusic: (music) => set({ backgroundMusic: music }),
  setDaylightMusic: (music) => set({ daylightMusic: music }),
  setNightMusic: (music) => set({ nightMusic: music }),
  setHitSound: (sound) => set({ hitSound: sound }),
  setSuccessSound: (sound) => set({ successSound: sound }),

  toggleMute: () => {
    set({ isMuted: !get().isMuted });
  },

  playHit: () => {
    const { hitSound, isMuted } = get();
    if (!hitSound || isMuted) return;

    const s = hitSound.cloneNode() as HTMLAudioElement;
    s.volume = 0.3;
    s.play().catch(() => {});
  },

  playSuccess: () => {
    const { successSound, isMuted } = get();
    if (!successSound || isMuted) return;

    successSound.currentTime = 0;
    successSound.play().catch(() => {});
  },

  playDaylightMusic: () => {
    const { daylightMusic, isMuted, isDaylightMusicPlaying } = get();

    if (!daylightMusic || isDaylightMusicPlaying) return;

    daylightMusic.loop = true;
    daylightMusic.volume = 0.5;

    if (!isMuted) {
      daylightMusic.play().catch(() => {});
    }

    set({ isDaylightMusicPlaying: true });
  },

  stopDaylightMusic: () => {
    const { daylightMusic } = get();

    if (!daylightMusic) return;

    daylightMusic.pause();
    daylightMusic.currentTime = 0;

    set({ isDaylightMusicPlaying: false });
  },

  playNightMusic: () => {
    const { nightMusic, isMuted, isNightMusicPlaying } = get();

    if (!nightMusic || isNightMusicPlaying) return;

    nightMusic.loop = true;
    nightMusic.volume = 0.5;

    if (!isMuted) {
      nightMusic.play().catch(() => {});
    }

    set({ isNightMusicPlaying: true });
  },

  stopNightMusic: () => {
    const { nightMusic } = get();

    if (!nightMusic) return;

    nightMusic.pause();
    nightMusic.currentTime = 0;

    set({ isNightMusicPlaying: false });
  }
}));
