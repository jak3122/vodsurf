"use client";
import timerStore from "@/store/useTimerStore";

export default function useTimer() {
  return {
    millis: timerStore((state) => state.timeLeft),
    setTimeLeft: timerStore((state) => state.setTimeLeft),
    isRunning: timerStore((state) => state.isRunning),
    setOnExpire: timerStore((state) => state.setOnExpire),
    start: timerStore((state) => state.start),
    stop: timerStore((state) => state.stop),
    pause: timerStore((state) => state.pause),
    resume: timerStore((state) => state.resume),
    toggle: timerStore((state) => state.toggle),
  };
}
