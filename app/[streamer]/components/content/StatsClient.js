"use client";
import useStreamer from "@/hooks/useStreamer";
import useSettings from "@/store/useSettings";
import { sumStats } from "@/util";
import { Center, UnorderedList, ListItem } from "@chakra-ui/react";

const { format } = new Intl.NumberFormat();

export default function StatsClient({ stats }) {
  const streamer = useStreamer();
  const selectedChannels = useSettings((state) => state.settings.channels);
  stats = sumStats(stats, selectedChannels[streamer.route]);
  const { views, videos, hours, channels } = stats;

  return (
    <Center h="full" w="full">
      <UnorderedList color="white">
        <Stat value={views} label="view" />
        <Stat value={videos} label="video" />
        <Stat value={hours} label="hour" />
        <Stat value={channels} label="channel" />
      </UnorderedList>
    </Center>
  );
}

function Stat({ value, label }) {
  label = value > 1 ? `${label}s` : label;

  return (
    <ListItem>
      {format(value)} {label}
    </ListItem>
  );
}
