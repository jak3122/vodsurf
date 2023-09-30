"use client";
import { create } from "zustand";
import useSettings from "@/store/useSettings";
import { timerSettingsToSeconds } from "@/util";

let intervalRef;

const timerStore = create((set, get) => ({
  timeLeft:
    timerSettingsToSeconds(useSettings.getState().settings.timer) * 1000,
  startedAt: null,
  isRunning: false,
  isPaused: false,
  onExpire: () => {},

  setTimeLeft: (timeLeft) => set({ timeLeft }),
  setStartedAt: (startedAt) => set({ startedAt }),
  setIsRunning: (isRunning) => set({ isRunning }),
  setIsPaused: (isPaused) => set({ isPaused }),
  setOnExpire: (callback) => set({ onExpire: callback }),

  start: () => {
    const initialSeconds = timerSettingsToSeconds(
      useSettings.getState().settings.timer
    );
    if (get().isPaused) {
      get().resume();
    } else {
      set({
        timeLeft: initialSeconds * 1000,
        startedAt: performance.now(),
        isRunning: true,
        isPaused: false,
      });
      get().setup();
    }
  },
  pause: () => {
    if (!get().isRunning) return;
    set({ isRunning: false, isPaused: true });
    clearInterval(intervalRef);
  },
  resume: () => {
    if (get().isRunning) return;
    set({ startedAt: performance.now() });
    get().setup();
    set({ isRunning: true, isPaused: false });
  },
  stop: () => {
    set({ isRunning: false, isPaused: false });
    clearInterval(intervalRef);
  },
  toggle: () => {
    if (get().isRunning) {
      get().pause();
    } else {
      get().resume();
    }
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

export default timerStore;
