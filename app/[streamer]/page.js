import Streamer from "@/app/[streamer]/streamer";
import Stats from "@/app/[streamer]/components/content/Stats";

export default function Page() {
  return (
    <Streamer>
      <Stats />
    </Streamer>
  );
}
