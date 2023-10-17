"use client";
import { IconButton } from "@chakra-ui/react";
import { SettingsIcon } from "@chakra-ui/icons";

export default function SettingsButton({ modal }) {
  return (
    <IconButton
      onClick={modal.onOpen}
      variant="link"
      alignItems="center"
      cursor="pointer"
      display="flex"
      fontSize="2rem"
      h="full"
      margin="0"
      padding="5px"
      position="absolute"
      right="-40px"
      icon={<SettingsIcon boxSize={5} />}
    />
  );
}
