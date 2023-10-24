import { GithubIcon } from "@/icons/github";
import streamers from "@/streamers";
import {
  Center,
  Container,
  Icon,
  Link,
  LinkBox,
  LinkOverlay,
  Stack,
  Text,
} from "@chakra-ui/react";
import NextLink from "next/link";

export default function Home() {
  return (
    <Container maxWidth="container.xl" h="100vh">
      <Center h="full" w="full">
        <Stack spacing={8} flexWrap="wrap" direction="row">
          {streamers.map(({ name, route, theme }) => (
            <LinkBox
              key={route}
              as="article"
              role="group"
              display="flex"
              justifyContent="flex-end"
              alignItems="flex-end"
              w={{
                base: "full",
                md: "300px",
              }}
              h="100px"
              p={2}
              rounded="md"
              border="2px solid"
              borderColor={theme.accent}
              bgGradient={`linear(to-b, ${theme.primary}, ${theme.button.bg})`}
              _hover={{
                bgGradient: `linear(to-b, ${theme.primary}, ${theme.button.hover.bg})`,
              }}
              transition="all 2s ease-in-out"
            >
              <LinkOverlay as={NextLink} href={`/${route}`} px={2}>
                <Text
                  color={theme.button.text}
                  fontSize="lg"
                  letterSpacing={1}
                  fontWeight="medium"
                  _groupHover={{
                    color: theme.button.text,
                  }}
                >
                  {name}
                </Text>
              </LinkOverlay>
            </LinkBox>
          ))}
        </Stack>
      </Center>
      <Link
        isExternal
        position="fixed"
        top={4}
        right={4}
        p={1}
        aria-label="GitHub"
        role="group"
        href="https://github.com/jak3122/vodsurf"
      >
        <Icon
          as={GithubIcon}
          display="block"
          w={5}
          h={5}
          opacity={0.3}
          _groupHover={{ opacity: 0.7 }}
          transition="opacity 0.1s ease-in-out"
        />
      </Link>
    </Container>
  );
}
