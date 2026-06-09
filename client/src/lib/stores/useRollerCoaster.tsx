import { create } from "zustand";
import * as THREE from "three";
import { useAudio } from "./useAudio";

export type CoasterMode = "build" | "ride" | "preview";

export interface LoopSegment {
  id: string;
  entryPointId: string;
  radius: number;
  pitch: number;
}

export interface TrackPoint {
  id: string;
  position: THREE.Vector3;
  tilt: number;
  hasLoop?: boolean;
}

interface SerializedLoopSegment {
  id: string;
  entryPointId: string;
  radius: number;
  pitch: number;
}

interface SerializedTrackPoint {
  id: string;
  position: [number, number, number];
  tilt: number;
  hasLoop?: boolean;
}

export interface SavedCoaster {
  id: string;
  name: string;
  timestamp: number;
  trackPoints: SerializedTrackPoint[];
  loopSegments: SerializedLoopSegment[];
  isLooped: boolean;
  hasChainLift: boolean;
  showWoodSupports: boolean;
}

function serializeVector3(v: THREE.Vector3): [number, number, number] {
  return [v.x, v.y, v.z];
}

function deserializeVector3(arr: [number, number, number]): THREE.Vector3 {
  return new THREE.Vector3(arr[0], arr[1], arr[2]);
}

function serializeTrackPoint(point: TrackPoint): SerializedTrackPoint {
  return {
    id: point.id,
    position: serializeVector3(point.position),
    tilt: point.tilt,
    hasLoop: point.hasLoop,
  };
}

function deserializeTrackPoint(serialized: SerializedTrackPoint): TrackPoint {
  return {
    id: serialized.id,
    position: deserializeVector3(serialized.position),
    tilt: serialized.tilt,
    hasLoop: serialized.hasLoop,
  };
}

function serializeLoopSegment(segment: LoopSegment): SerializedLoopSegment {
  return {
    id: segment.id,
    entryPointId: segment.entryPointId,
    radius: segment.radius,
    pitch: segment.pitch,
  };
}

function deserializeLoopSegment(serialized: SerializedLoopSegment): LoopSegment {
  return {
    id: serialized.id,
    entryPointId: serialized.entryPointId,
    radius: serialized.radius,
    pitch: serialized.pitch ?? 12,
  };
}

const STORAGE_KEY = "roller_coaster_saves";

function loadSavedCoasters(): SavedCoaster[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

function persistSavedCoasters(coasters: SavedCoaster[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(coasters));
}

interface RollerCoasterState {
  mode: CoasterMode;
  trackPoints: TrackPoint[];
  loopSegments: LoopSegment[];
  selectedPointId: string | null;
  rideProgress: number;
  isRiding: boolean;
  rideSpeed: number;
  isDraggingPoint: boolean;
  isAddingPoints: boolean;
  isLooped: boolean;
  hasChainLift: boolean;
  showWoodSupports: boolean;
  isNightMode: boolean;
  cameraTarget: THREE.Vector3 | null;
  savedCoasters: SavedCoaster[];
  currentCoasterName: string | null;

  setMode: (mode: CoasterMode) => void;
  setCameraTarget: (target: THREE.Vector3 | null) => void;
  addTrackPoint: (position: THREE.Vector3) => void;
  updateTrackPoint: (id: string, position: THREE.Vector3) => void;
  updateTrackPointTilt: (id: string, tilt: number) => void;
  removeTrackPoint: (id: string) => void;
  createLoopAtPoint: (id: string) => void;
  selectPoint: (id: string | null) => void;
  clearTrack: () => void;
  setRideProgress: (progress: number) => void;
  setIsRiding: (riding: boolean) => void;
  setRideSpeed: (speed: number) => void;
  setIsDraggingPoint: (dragging: boolean) => void;
  setIsAddingPoints: (adding: boolean) => void;
  setIsLooped: (looped: boolean) => void;
  setHasChainLift: (hasChain: boolean) => void;
  setShowWoodSupports: (show: boolean) => void;
  setIsNightMode: (night: boolean) => void;
  startRide: () => void;
  stopRide: () => void;

  saveCoaster: (name: string) => void;
  loadCoaster: (id: string) => void;
  deleteCoaster: (id: string) => void;
  exportCoaster: (id: string) => string | null;
  importCoaster: (jsonString: string) => boolean;
  refreshSavedCoasters: () => void;
}

let pointCounter = 0;

export const useRollerCoaster = create<RollerCoasterState>((set, get) => ({
  mode: "build",
  trackPoints: [],
  loopSegments: [],
  selectedPointId: null,
  rideProgress: 0,
  isRiding: false,
  rideSpeed: 1.0,
  isDraggingPoint: false,
  isAddingPoints: false,
  isLooped: false,
  hasChainLift: true,
  showWoodSupports: true,

  // default NIGHT MODE ON (and Billie Jean loaded)
  isNightMode: true,

  cameraTarget: null,
  savedCoasters: loadSavedCoasters(),
  currentCoasterName: null,

  setMode: (mode) => set({ mode }),
  setCameraTarget: (target) => set({ cameraTarget: target }),
  setIsDraggingPoint: (dragging) => set({ isDraggingPoint: dragging }),
  setIsAddingPoints: (adding) => set({ isAddingPoints: adding }),
  setIsLooped: (looped) => set({ isLooped: looped }),
  setHasChainLift: (hasChain) => set({ hasChainLift: hasChain }),
  setShowWoodSupports: (show) => set({ showWoodSupports: show }),

  // 🌙 NIGHT MODE + MUSIC SWITCH
  setIsNightMode: (night) => {
    set({ isNightMode: night });

    const audio = useAudio.getState();

    if (night) {
      audio.stopDaylightMusic();

      // 🎵 Billie Jean (Michael Jackson)
      if (audio.nightMusic) {
        audio.nightMusic.src = "/billie_jean.mp3";
        audio.nightMusic.load();
      }

      audio.playNightMusic();
    } else {
      audio.stopNightMusic();
      audio.playDaylightMusic();
    }
  },

  addTrackPoint: (position) => {
    const id = `point-${++pointCounter}`;
    set((state) => ({
      trackPoints: [...state.trackPoints, { id, position: position.clone(), tilt: 0 }],
    }));
  },

  updateTrackPoint: (id, position) => {
    set((state) => ({
      trackPoints: state.trackPoints.map((point) =>
        point.id === id ? { ...point, position: position.clone() } : point
      ),
    }));
  },

  updateTrackPointTilt: (id, tilt) => {
    set((state) => ({
      trackPoints: state.trackPoints.map((point) =>
        point.id === id ? { ...point, tilt } : point
      ),
    }));
  },

  removeTrackPoint: (id) => {
    set((state) => ({
      trackPoints: state.trackPoints.filter((point) => point.id !== id),
      selectedPointId: state.selectedPointId === id ? null : state.selectedPointId,
    }));
  },

  createLoopAtPoint: (id) => {
    set((state) => {
      const pointIndex = state.trackPoints.findIndex((p) => p.id === id);
      if (pointIndex === -1) return state;

      const loopSegment: LoopSegment = {
        id: `loop-${Date.now()}`,
        entryPointId: id,
        radius: 5,
        pitch: 12,
      };

      return {
        trackPoints: state.trackPoints.map((p) =>
          p.id === id ? { ...p, hasLoop: true } : p
        ),
        loopSegments: [...state.loopSegments, loopSegment],
      };
    });
  },

  selectPoint: (id) => set({ selectedPointId: id }),

  clearTrack: () =>
    set({
      trackPoints: [],
      loopSegments: [],
      selectedPointId: null,
      rideProgress: 0,
      isRiding: false,
    }),

  setRideProgress: (progress) => set({ rideProgress: progress }),
  setIsRiding: (riding) => set({ isRiding: riding }),
  setRideSpeed: (speed) => set({ rideSpeed: speed }),

  startRide: () => {
    const { trackPoints } = get();
    if (trackPoints.length >= 2) {
      set({ mode: "ride", isRiding: true, rideProgress: 0 });
    }
  },

  stopRide: () => set({ mode: "build", isRiding: false, rideProgress: 0 }),

  saveCoaster: (name: string) => {
    const state = get();
    const id = `coaster-${Date.now()}`;

    const saved: SavedCoaster = {
      id,
      name,
      timestamp: Date.now(),
      trackPoints: state.trackPoints.map(serializeTrackPoint),
      loopSegments: state.loopSegments.map(serializeLoopSegment),
      isLooped: state.isLooped,
      hasChainLift: state.hasChainLift,
      showWoodSupports: state.showWoodSupports,
    };

    const coasters = loadSavedCoasters();
    coasters.push(saved);
    persistSavedCoasters(coasters);

    set({ savedCoasters: coasters, currentCoasterName: name });
  },

  loadCoaster: (id: string) => {
    const coasters = loadSavedCoasters();
    const coaster = coasters.find((c) => c.id === id);
    if (!coaster) return;

    set({
      trackPoints: coaster.trackPoints.map(deserializeTrackPoint),
      loopSegments: coaster.loopSegments.map(deserializeLoopSegment),
      isLooped: coaster.isLooped,
      hasChainLift: coaster.hasChainLift,
      showWoodSupports: coaster.showWoodSupports,
      mode: "build",
      isRiding: false,
      rideProgress: 0,
    });
  },

  deleteCoaster: (id: string) => {
    const coasters = loadSavedCoasters().filter((c) => c.id !== id);
    persistSavedCoasters(coasters);
    set({ savedCoasters: coasters });
  },

  exportCoaster: (id: string) => {
    const coasters = loadSavedCoasters();
    const coaster = coasters.find((c) => c.id === id);
    return coaster ? JSON.stringify(coaster, null, 2) : null;
  },

  importCoaster: (json: string) => {
    try {
      const coaster = JSON.parse(json);
      const coasters = loadSavedCoasters();
      coasters.push(coaster);
      persistSavedCoasters(coasters);
      set({ savedCoasters: coasters });
      return true;
    } catch {
      return false;
    }
  },

  refreshSavedCoasters: () => {
    set({ savedCoasters: loadSavedCoasters() });
  },
}));
