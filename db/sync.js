import connections from "@/db/connections";

const updateOnly = process.argv
  .slice(2)
  .map((s) => s.trim())
  .includes("--update-only");

async function main() {
  console.log(
    updateOnly ? "updating with latest videos" : "populating database"
  );

  Object.values(connections).forEach((connection) => {
    connection.sync({ updateOnly });
  });
}

main().then(() => process.exit());
