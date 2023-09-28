"use client";
import { Flex } from "@chakra-ui/react";
import RandomButton from "./RandomButton";
import SettingsButton from "./SettingsButton";
import Countdown from "./Countdown";
import useStreamer from "@/hooks/useStreamer";

export default function Header() {
  const streamer = useStreamer();

  return (
    <Flex
      h="3rem"
      w="full"
      top="0"
      position="sticky"
      justifyContent="center"
      bg={streamer.theme.primary}
      borderBottom="5px solid"
      borderBottomColor={streamer.theme.accent}
    >
      <Flex alignItems="center" h="full" position="relative">
        <RandomButton />
        <SettingsButton />
        <Countdown />
      </Flex>
    </Flex>
  );
}
