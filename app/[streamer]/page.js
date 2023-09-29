"use client";
import { Flex } from "@chakra-ui/react";
import { notFound } from "next/navigation";
import useStreamer from "@/hooks/useStreamer";
import Header from "@/app/[streamer]/components/Header";
import Content from "@/app/[streamer]/components/content";

export default function Streamer() {
  const streamer = useStreamer();

  if (!streamer) {
    return notFound();
  }

  return (
    <Flex flexDir="column" h="full" w="full" bg={streamer.theme.bg}>
      <Header />
      <Content />
    </Flex>
  );
}
