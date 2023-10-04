"use client";
import useStreamer from "@/hooks/useStreamer";
import useSettings from "@/store/useSettings";
import { sumStats } from "@/util";
import {
  Box,
  Center,
  Flex,
  Skeleton,
  Stat,
  StatLabel,
  StatNumber,
  VStack,
} from "@chakra-ui/react";
import { useEffect, useState } from "react";

const { format } = new Intl.NumberFormat();

export default function StatsClient({ stats }) {
  const streamer = useStreamer();
  const selectedChannels = useSettings((state) => state.settings.channels);
  stats = sumStats(stats, selectedChannels[streamer.route]);
  const { views, videos, hours, channels } = stats;

  return (
    <Center h="full" w="full">
      <VStack spacing={1} w="240px">
        <StatItem value={views} label="views" color="blue.500" />
        <StatItem value={hours} label="hours" color="red.500" />
        <StatItem value={videos} label="videos" color="green.500" />
        <StatItem value={channels} label="channels" color="purple.500" />
      </VStack>
    </Center>
  );
}

function StatItem({ value, label, color }) {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  return (
    <Box mx={2} p={4} w="full">
      <Stat>
        <StatLabel color={color} bg="whiteAlpha.200" pl={1}>
          {label}
        </StatLabel>
        <Skeleton
          isLoaded={isClient}
          fadeDuration={0.1}
          startColor="whiteAlpha.100"
          endColor="blackAlpha.400"
          display="flex"
          justifyContent="flex-end"
        >
          <StatNumber color="white">
            {isClient ? format(value) : "0"}
          </StatNumber>
        </Skeleton>
      </Stat>
    </Box>
  );
}
