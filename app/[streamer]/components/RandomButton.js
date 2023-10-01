"use client";
import { Button } from "@chakra-ui/react";
import useStreamer from "@/hooks/useStreamer";
import useVideoStore from "@/store/useVideoStore";
import useSettings from "@/store/useSettings";
import useTimer from "@/hooks/useTimer";

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
    if (settings.mode === "links") setIsVideoLoading(false);
    timer.stop();
  };

  let label = `Random ${streamer.name}`;
  if (settings.mode === "endless") label = `Endless ${streamer.name}`;

  return (
    <Button
      onClick={onClick}
      isLoading={isVideoLoading}
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
      {label}
    </Button>
  );
}
