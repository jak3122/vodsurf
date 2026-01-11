import yargs from "yargs";
import { hideBin } from "yargs/helpers";
import streamers from "../streamers/index.js";
import Connection from "./Connection.js";
import { createDbClient } from "./client.js";

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

  if (args["full"]) {
    const db = createDbClient({ readonly: false, fileMustExist: false });
    db.prepare("DROP TABLE IF EXISTS videos").run();
    db.prepare("DROP TABLE IF EXISTS channels").run();
    db.close();
  }

  for (const streamer of streamers) {
    const connection = new Connection(streamer.route, {
      readonly: false,
      fileMustExist: false,
    });
    await connection.sync({
      full: args["full"],
      limit: args.limit,
    });
    connection.closeDb();
  }
}

main().then(() => process.exit());
