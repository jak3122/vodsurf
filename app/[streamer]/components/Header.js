"use client";
import { Flex, useDisclosure } from "@chakra-ui/react";
import RandomButton from "./RandomButton";
import SettingsButton from "./SettingsButton";
import Countdown from "./Countdown";
import useStreamer from "@/hooks/useStreamer";
import Settings from "@/app/[streamer]/components/Settings";

export default function Header() {
  const streamer = useStreamer();
  const settingsModal = useDisclosure();

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
        <SettingsButton modal={settingsModal} />
        <Countdown />
      </Flex>
      <Settings modal={settingsModal} />
    </Flex>
  );
}
