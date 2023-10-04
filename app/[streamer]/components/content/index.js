import Links from "@/app/[streamer]/components/content/Links";
import Player from "@/app/[streamer]/components/content/Player";
import useSettings, { playerModes } from "@/store/useSettings";
import useVideoStore from "@/store/useVideoStore";
import { useEffect, useState } from "react";

export default function Content({ children }) {
  const mode = useSettings((state) => state.settings.mode);
  const videos = useVideoStore((state) => state.videos);
  const [playerMode, setPlayerMode] = useState(null);

  useEffect(() => {
    setPlayerMode(mode);
  }, [mode]);

  if (!playerMode || videos?.length === 0)
    return <div style={{ flex: "1" }}>{children}</div>;

  if (playerMode === playerModes.LINKS) return <Links />;
  if ([playerModes.VIDEO, playerModes.ENDLESS].includes(playerMode))
    return <Player />;
  return <div>{children}</div>;
}
