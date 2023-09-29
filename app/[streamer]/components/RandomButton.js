"use client";
import { Button } from "@chakra-ui/react";
import useStreamer from "@/hooks/useStreamer";
import useVideoStore from "@/store/useVideoStore";

export default function RandomButton() {
  const streamer = useStreamer();
  const fetchVideos = useVideoStore((state) => state.fetchVideos);
  const onClick = () => fetchVideos(streamer.route);

  return (
    <Button
      onClick={onClick}
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
      transition="transform 0.05s, box-shadow 0.05s"
      _hover={{
        bg: streamer.theme.button.hover.bg,
      }}
      _active={{
        transform: "translateY(1px)",
        boxShadow: "1px 1px 3px rgba(0, 0, 0, 0.1)",
      }}
    >
      Random {streamer.name}
    </Button>
  );
}
