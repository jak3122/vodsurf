"use client";
import { Container, Center, HStack } from "@chakra-ui/react";
import { Link } from "@chakra-ui/next-js";
import streamers from "@/streamers";

export default function Home() {
  return (
    <Container maxWidth="container.xl" h="100vh">
      <Center h="full" w="full">
        <HStack spacing={4}>
          {streamers.map(({ name, route }) => (
            <Link href={`/${route}`} key={route}>
              {name}
            </Link>
          ))}
        </HStack>
      </Center>
    </Container>
  );
}
