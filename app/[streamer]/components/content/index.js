"use client";
import Links from "@/app/[streamer]/components/content/Links";
import Player from "@/app/[streamer]/components/content/Player";
import Stats from "@/app/[streamer]/components/content/Stats";
import useSettings, { playerModes } from "@/store/useSettings";
import useVideoStore from "@/store/useVideoStore";

export default function Content() {
  const playerMode = useSettings((state) => state.settings.mode);
  const videos = useVideoStore((state) => state.videos);
  console.log("playerMode:", playerMode);
  console.log("videos:", videos);

  if (!playerMode) return null;
  if (playerMode === playerModes.LINKS) return <Links />;
  if (playerMode === playerModes.VIDEO && videos?.length > 0) return <Player />;
  return <Stats />;
}
