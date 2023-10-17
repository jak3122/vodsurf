"use client";
import { Flex, useDisclosure } from "@chakra-ui/react";
import RandomButton from "./RandomButton";
import SettingsButton from "./SettingsButton";
import Countdown from "./Countdown";
import useStreamer from "@/hooks/useStreamer";
import Settings from "@/app/[streamer]/components/Settings";
import useSettings from "@/store/useSettings";
import { useEffect, useState } from "react";
import History from "@/app/[streamer]/components/History";

export default function Header() {
  const streamer = useStreamer();
  const mode = useSettings((state) => state.settings.mode);
  const settingsModal = useDisclosure();
  const [showCountdown, setShowCountdown] = useState(false);

  useEffect(() => {
    if (mode === "endless") {
      setShowCountdown(true);
    } else {
      setShowCountdown(false);
    }
  }, [mode]);

  return (
    <Flex
      h="46px"
      minH="46px"
      w="full"
      justifyContent="flex-end"
      position="relative"
      bg={streamer.theme.primary}
      borderBottom="5px solid"
      borderBottomColor={streamer.theme.accent}
    >
      <Flex
        alignItems="center"
        h="full"
        position="absolute"
        top="50%"
        left="50%"
        transform="translate(-50%, -50%)"
      >
        <RandomButton />
        <SettingsButton modal={settingsModal} />
        {showCountdown && <Countdown />}
      </Flex>
      <History />
      <Settings modal={settingsModal} />
    </Flex>
  );
}
