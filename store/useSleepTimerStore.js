"use client";
import { create } from "zustand";
import useSettings from "@/store/useSettings";
import { timerSettingsToSeconds } from "@/util";

let intervalRef;

const sleepTimerStore = create((set, get) => ({
  timeLeft:
    timerSettingsToSeconds(useSettings.getState().settings.sleepTimer) * 1000,
  startedAt: null,
  isRunning: false,
  isPaused: false,
  videoIsPlaying: false,
  onExpire: () => {},

  setTimeLeft: (timeLeft) => set({ timeLeft }),
  setOnExpire: (callback) => set({ onExpire: callback }),
  setVideoIsPlaying: (videoIsPlaying) => set({ videoIsPlaying }),

  start: () => {
    if (get().isRunning) return;
    if (get().isPaused) {
      get().resume();
      return;
    }
    const initialSeconds = timerSettingsToSeconds(
      useSettings.getState().settings.sleepTimer
    );
    if (initialSeconds <= 0) return;
    if (get().timeLeft <= 0) return; // already expired — re-arm via reset button
    set({
      timeLeft: initialSeconds * 1000,
      startedAt: performance.now(),
      isRunning: true,
      isPaused: false,
    });
    get().setup();
  },
  pause: () => {
    if (!get().isRunning) return;
    set({ isRunning: false, isPaused: true });
    clearInterval(intervalRef);
  },
  resume: () => {
    if (get().isRunning || get().timeLeft <= 0) return;
    set({ startedAt: performance.now() });
    get().setup();
    set({ isRunning: true, isPaused: false });
  },
  stop: () => {
    set({ isRunning: false, isPaused: false });
    clearInterval(intervalRef);
  },
  reset: () => {
    const initialSeconds = timerSettingsToSeconds(
      useSettings.getState().settings.sleepTimer
    );
    clearInterval(intervalRef);
    const shouldRun = get().videoIsPlaying && initialSeconds > 0;
    set({
      timeLeft: initialSeconds * 1000,
      startedAt: performance.now(),
      isRunning: shouldRun,
      isPaused: !shouldRun,
    });
    if (shouldRun) get().setup();
  },
  setup: () => {
    intervalRef = setInterval(() => {
      const now = performance.now();
      const elapsed = now - get().startedAt;
      const newTimeLeft = Math.max(get().timeLeft - elapsed, 0);
      set({ timeLeft: newTimeLeft, startedAt: now });
      if (newTimeLeft <= 0) {
        clearInterval(intervalRef);
        get().stop();
        get().onExpire();
      }
    }, 10);
  },
}));

export default sleepTimerStore;
