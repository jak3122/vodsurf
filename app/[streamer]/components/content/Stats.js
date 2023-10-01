import StatsClient from "@/app/[streamer]/components/content/StatsClient";
import stats from "@/db/stats";

export default function Stats() {
  return <StatsClient stats={stats()} />;
}
