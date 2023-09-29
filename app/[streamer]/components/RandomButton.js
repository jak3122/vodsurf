"use client";
import { Button } from "@chakra-ui/react";
import useStreamer from "@/hooks/useStreamer";
import useVideoStore from "@/store/useVideoStore";

export default function RandomButton() {
  const streamer = useStreamer();
  const fetchVideos = useVideoStore((state) => state.fetchVideos);
  const onClick = () => fetchVideos(streamer.name);

  return (
    <Button
      onClick={onClick}
      cursor="pointer"
      size="sm"
      width="14rem"
      padding="0.3rem 1rem"
      borderRadius="1px"
      transition="filter 0.05s ease-out"
      color={streamer.theme.button.text}
      bg={streamer.theme.button.bg}
      border="1px solid"
      borderColor={streamer.theme.button.border}
      _hover={{
        filter: "drop-shadow(0.6px 0.6px 0.6px #000)",
        bg: streamer.theme.button.hover.bg,
      }}
      _active={{
        filter: "drop-shadow(0px 0px 0.1px #000)",
      }}
    >
      Random {streamer.name}
    </Button>
  );
}
