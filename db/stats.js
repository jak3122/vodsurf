import connections from "@/db/connections";
import cache from "./cache";

const statsKey = "stats";

export default async function stats() {
  let cachedStats = cache.get(statsKey);
  if (cachedStats) {
    return cachedStats;
  }

  const allStats = await _stats();
  cache.set(statsKey, allStats);
  return allStats;
}

async function _stats() {
  const stats = [];
  for (const connection in connections) {
    const connectionStats = await connections[connection].getStats();
    stats.push(...connectionStats);
  }
  return stats;
}
