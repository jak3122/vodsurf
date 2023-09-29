"use client";
import { create } from "zustand";

const timerStore = create((set) => ({
  timeLeft: 0,
  setTimeLeft: (timeLeft) => set({ timeLeft }),

  startedAt: null,
  setStartedAt: (startedAt) => set({ startedAt }),

  isRunning: false,
  setIsRunning: (isRunning) => set({ isRunning }),

  isPaused: false,
  setIsPaused: (isPaused) => set({ isPaused }),
}));

export default timerStore;
