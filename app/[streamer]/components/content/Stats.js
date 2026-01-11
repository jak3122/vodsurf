import StatsClient from "./StatsClient";
import stats from "@/db/stats";

export default function Stats() {
  return <StatsClient stats={stats()} />;
}
