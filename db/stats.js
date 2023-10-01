import connections from "@/db/connections";

export default function stats() {
  const stats = [];
  for (const connection in connections) {
    stats.push(...connections[connection].getStats());
  }

  return stats;
}
