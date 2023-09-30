"use client";
import Links from "@/app/[streamer]/components/content/Links";
import Player from "@/app/[streamer]/components/content/Player";
import Stats from "@/app/[streamer]/components/content/Stats";
import useSettings, { playerModes } from "@/store/useSettings";
import useVideoStore from "@/store/useVideoStore";
import { useEffect, useState } from "react";

export default function Content() {
  const mode = useSettings((state) => state.settings.mode);
  const videos = useVideoStore((state) => state.videos);
  const [playerMode, setPlayerMode] = useState(null);

  useEffect(() => {
    setPlayerMode(mode);
  }, [mode]);

  if (!playerMode) return null;
  if (playerMode === playerModes.LINKS) return <Links />;
  if (
    [playerModes.VIDEO, playerModes.ENDLESS].includes(playerMode) &&
    videos?.length > 0
  )
    return <Player />;
  return <Stats />;
}
