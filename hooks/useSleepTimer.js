"use client";
import sleepTimerStore from "@/store/useSleepTimerStore";

export default function useSleepTimer() {
  return {
    millis: sleepTimerStore((state) => state.timeLeft),
    setTimeLeft: sleepTimerStore((state) => state.setTimeLeft),
    isRunning: sleepTimerStore((state) => state.isRunning),
    videoIsPlaying: sleepTimerStore((state) => state.videoIsPlaying),
    setOnExpire: sleepTimerStore((state) => state.setOnExpire),
    start: sleepTimerStore((state) => state.start),
    pause: sleepTimerStore((state) => state.pause),
    resume: sleepTimerStore((state) => state.resume),
    stop: sleepTimerStore((state) => state.stop),
    reset: sleepTimerStore((state) => state.reset),
  };
}
