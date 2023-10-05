import yargs from "yargs";
import { hideBin } from "yargs/helpers";
import connections from "./connections.js";

async function main() {
  const args = yargs(hideBin(process.argv))
    .option("full", {
      type: "boolean",
      describe: "Update with the latest videos",
      default: false,
    })
    .option("limit", {
      type: "number",
      describe: "Limit the number of videos",
      default: null,
    })
    .help()
    .alias("help", "h").argv;

  console.log(
    args["full"] ? "Doing full database sync..." : "Doing database update..."
  );

  for (const connection of Object.values(connections)) {
    await connection.sync({
      full: args["full"],
      limit: args.limit,
    });
  }
}

main().then(() => process.exit());
