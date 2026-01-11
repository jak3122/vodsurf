import StatsClient from "./StatsClient";
import stats from "@/db/stats";

export default async function Stats() {
  return <StatsClient stats={await stats()} />;
}
