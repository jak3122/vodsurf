"use client";
import { Box } from "@chakra-ui/react";
import useTimer from "@/hooks/useTimer";
import useSettings from "@/store/useSettings";
import { useEffect } from "react";
import { timerSettingsToSeconds } from "@/util";

export default function Countdown() {
  const timer = useTimer();
  const settingsTimer = useSettings((state) => state.settings.timer);
  const date = new Date(parseInt(timer.millis, 10));
  const millis = date.getUTCMilliseconds();
  const tenths = Math.floor(millis / 100);
  const seconds = date.getUTCSeconds();
  const minutes = date.getUTCMinutes();
  const hours = date.getUTCHours();

  const showHours = hours > 0;
  const showTenths = timer.millis > 0 && timer.millis < 4000;
  const isInfinite = timerSettingsToSeconds(settingsTimer) <= 0;

  const h = hours < 10 ? `0${hours}` : `${hours}`;
  const m = minutes < 10 && showHours ? `0${minutes}` : `${minutes}`;
  const s = seconds < 10 ? `0${seconds}` : `${seconds}`;
  let timeString = showHours ? `${h}:${m}:${s}` : `${m}:${s}`;
  if (showTenths) timeString += `.${tenths}`;
  if (isInfinite) timeString = "∞";

  useEffect(() => {
    if (!timer.isRunning)
      timer.setTimeLeft(timerSettingsToSeconds(settingsTimer) * 1000);
  }, [JSON.stringify(settingsTimer)]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <Box
      bgColor={showTenths ? "#FF2E2E9C" : "transparent"}
      borderRadius="4px"
      cursor="default"
      fontFamily={isInfinite ? "body" : "monospace"}
      fontSize={isInfinite ? "2rem" : "1.2rem"}
      lineHeight="100%"
      opacity={timer.isRunning ? 1 : 0.4}
      padding="0.2rem 0.5rem"
      position="absolute"
      left={{
        base: "unset",
        md: "18rem",
      }}
      right={{
        base: "11.5rem",
        md: "unset",
      }}
    >
      {timeString}
    </Box>
  );
}
