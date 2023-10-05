"use client";
import { Box, Button } from "@chakra-ui/react";
import { useHotkeys } from "react-hotkeys-hook";

import BeatLoader from "react-spinners/BeatLoader";

import useStreamer from "@/hooks/useStreamer";
import useTimer from "@/hooks/useTimer";
import useSettings from "@/store/useSettings";
import useVideoStore from "@/store/useVideoStore";

export default function RandomButton() {
  const streamer = useStreamer();
  const settings = useSettings((state) => state.settings);
  const timer = useTimer();
  const fetchVideos = useVideoStore((state) => state.fetchVideos);
  const isVideoLoading = useVideoStore((state) => state.isVideoLoading);
  const setIsVideoLoading = useVideoStore((state) => state.setIsVideoLoading);
  const onClick = async () => {
    setIsVideoLoading(true);
    await fetchVideos({ streamer: streamer.route, settings });
    const timerId = setTimeout(
      () => {
        setIsVideoLoading(false);
      },
      settings.mode === "links" ? 100 : 300
    );
    timer.stop();
    return () => clearTimeout(timerId);
  };
  useHotkeys("r", () => {
    onClick();
  });

  const Loader = (
    <BeatLoader.default
      color={streamer.theme.button.text}
      size={6}
      cssOverride={{
        opacity: 0.5,
      }}
    />
  );

  return (
    <Button
      onClick={onClick}
      isLoading={isVideoLoading}
      spinner={Loader}
      cursor="pointer"
      size="sm"
      width="14rem"
      padding="0.3rem 1rem"
      borderRadius="1px"
      color={streamer.theme.button.text}
      bg={streamer.theme.button.bg}
      border="1px solid"
      borderColor={streamer.theme.button.border}
      boxShadow="3px 3px 5px rgba(0, 0, 0, 0.2)"
      _hover={{
        bg: streamer.theme.button.hover.bg,
      }}
      _active={{
        transform: "translateX(1px) translateY(1px)",
        boxShadow: "1px 1px 3px rgba(0, 0, 0, 0.1)",
      }}
    >
      <Box as="span" textDecor="underline">
        R
      </Box>
      andom {streamer.name}
    </Button>
  );
}
