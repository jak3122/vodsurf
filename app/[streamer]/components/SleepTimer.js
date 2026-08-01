"use client";
import { Box, Flex, IconButton } from "@chakra-ui/react";
import { MoonIcon, RepeatIcon } from "@chakra-ui/icons";
import { useEffect } from "react";
import useSleepTimer from "@/hooks/useSleepTimer";
import useSettings from "@/store/useSettings";
import { timerSettingsToSeconds } from "@/util";

export default function SleepTimer() {
  const sleepTimer = useSleepTimer();
  const settingsSleepTimer = useSettings((state) => state.settings.sleepTimer);
  const configured = timerSettingsToSeconds(settingsSleepTimer);

  const totalSeconds = Math.floor(sleepTimer.millis / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  const showHours = hours > 0;
  const h = hours < 10 ? `0${hours}` : `${hours}`;
  const m = minutes < 10 && showHours ? `0${minutes}` : `${minutes}`;
  const s = seconds < 10 ? `0${seconds}` : `${seconds}`;
  const timeString = showHours ? `${h}:${m}:${s}` : `${m}:${s}`;

  useEffect(() => {
    if (configured <= 0) {
      sleepTimer.stop();
      sleepTimer.setTimeLeft(0);
      return;
    }
    sleepTimer.setTimeLeft(configured * 1000);
    if (sleepTimer.videoIsPlaying) {
      sleepTimer.start();
    }
  }, [JSON.stringify(settingsSleepTimer)]); // eslint-disable-line react-hooks/exhaustive-deps

  if (configured <= 0) return null;

  return (
    <Flex
      alignItems="center"
      bg="#2D1B4ECC"
      border="1px solid"
      borderColor="#B197FC"
      borderRadius="999px"
      gap={1.5}
      lineHeight="100%"
      opacity={sleepTimer.isRunning ? 1 : 0.5}
      padding="0.1rem 0.15rem 0.1rem 0.6rem"
      position="absolute"
      right="3rem"
      top="50%"
      transform="translateY(-50%)"
      zIndex={1}
    >
      <Box
        fontFamily="monospace"
        fontSize="0.95rem"
        whiteSpace="nowrap"
        display="flex"
        alignItems="center"
        gap={1}
      >
        <MoonIcon boxSize={3} />
        {timeString}
      </Box>
      <IconButton
        aria-label="Reset sleep timer"
        icon={<RepeatIcon boxSize={3} />}
        onClick={sleepTimer.reset}
        size="xs"
        variant="ghost"
        minW="1.4rem"
        h="1.4rem"
        _hover={{ bg: "whiteAlpha.200" }}
      />
    </Flex>
  );
}
