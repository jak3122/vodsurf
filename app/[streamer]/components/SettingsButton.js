"use client";
import { Button } from "@chakra-ui/react";
import { SettingsIcon } from "@chakra-ui/icons";

export default function SettingsButton({ modal }) {
  return (
    <Button
      onClick={modal.onOpen}
      alignItems="center"
      bg="transparent"
      border="0"
      color="white"
      cursor="pointer"
      display="flex"
      fontSize="2rem"
      h="full"
      margin="0"
      opacity="0.75"
      padding="5px"
      position="absolute"
      right="-40px"
    >
      <SettingsIcon boxSize={5} />
    </Button>
  );
}
