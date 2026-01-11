import connections from "@/db/connections";
import cache from "./cache";

const statsKey = "stats";

export default function stats() {
  let stats = cache.get(statsKey);
  if (!stats) {
    stats = _stats();
    cache.set(statsKey, stats);
  }

  return stats;
}

function _stats() {
  const stats = [];
  for (const connection in connections) {
    stats.push(...connections[connection].getStats());
  }

  return stats;
}
