"use client";
import { Flex } from "@chakra-ui/react";
import useStreamer from "@/hooks/useStreamer";
import Header from "@/app/[streamer]/components/Header";
import Content from "@/app/[streamer]/components/content";
import { notFound } from "next/navigation";

export default function Streamer({ children }) {
  const streamer = useStreamer();

  if (!streamer) {
    return notFound();
  }

  return (
    <Flex flexDir="column" h="full" w="full" bg={streamer.theme.bg}>
      <Header />
      <Content>{children}</Content>
    </Flex>
  );
}
