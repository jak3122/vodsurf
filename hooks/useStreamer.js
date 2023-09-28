import { useParams } from "next/navigation";
import streamers from "@/streamers";

export default function useStreamer() {
  const params = useParams();
  const { streamer: route } = params;

  const streamer = streamers.find((streamer) =>
    streamer?.supportedRoutes?.includes(route)
  );

  return streamer;
}
