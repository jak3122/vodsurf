"use client";
import { useCallback, useEffect, useRef } from "react";
import timerStore from "@/store/useTimerStore";

export default function useTimer({
  onExpire,
  initialSeconds = 0,
  intervalMillis = 10,
}) {
  const savedCallback = useRef(onExpire);
  const intervalRef = useRef(null);

  const timeLeft = timerStore((state) => state.timeLeft);
  const setTimeLeft = timerStore((state) => state.setTimeLeft);

  const startedAt = timerStore((state) => state.startedAt);
  const setStartedAt = timerStore((state) => state.setStartedAt);

  const isRunning = timerStore((state) => state.isRunning);
  const setIsRunning = timerStore((state) => state.setIsRunning);

  const isPaused = timerStore((state) => state.isPaused);
  const setIsPaused = timerStore((state) => state.setIsPaused);

  useEffect(() => {
    savedCallback.current = onExpire;
  }, [onExpire]);

  useEffect(() => {
    stop();
    setTimeLeft(initialSeconds * 1000);
  }, [initialSeconds]);

  const start = useCallback(() => {
    if (isPaused) {
      resume();
    } else {
      setTimeLeft(initialSeconds * 1000);
      setStartedAt(performance.now());
      setIsRunning(true);
      setIsPaused(false);
      teardown();
      setup();
      console.time("clock");
    }
  }, [isPaused, initialSeconds]);

  const pause = () => {
    if (!isRunning) return;
    setIsRunning(false);
    setIsPaused(true);
    teardown();
  };

  const resume = () => {
    if (isRunning) return;
    setStartedAt(performance.now());
    teardown();
    setup();
    setIsRunning(true);
    setIsPaused(false);
  };

  const stop = () => {
    setIsRunning(false);
    setIsPaused(false);
    teardown();
  };

  const toggle = () => {
    if (isRunning) pause();
    else resume();
  };

  const setup = () => {
    intervalRef.current = setTimeout(() => {
      const now = performance.now();
      const elapsed = now - startedAt;
      setStartedAt(now);
      setTimeLeft(Math.max(timeLeft - elapsed, 0));
    }, intervalMillis);
  };

  const teardown = () => {
    if (intervalRef.current) clearTimeout(intervalRef.current);
  };

  useEffect(() => {
    if (!isRunning || isPaused) return;

    if (timeLeft <= 0) {
      console.timeEnd("clock");
      stop();
      onExpire();
      return stop;
    }

    teardown();
    setup();

    return teardown;
  }, [timeLeft, isRunning]);

  return { millis: timeLeft, isRunning, start, stop, pause, resume, toggle };
}
