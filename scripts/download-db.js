import { existsSync, mkdirSync } from "fs";
import { join, dirname } from "path";
import { execSync } from "child_process";

const dbPath = join(process.cwd(), "data", "vodsurf.db");
const dataDir = dirname(dbPath);

if (!existsSync(dataDir)) {
  mkdirSync(dataDir, { recursive: true });
}

const DOWNLOAD_URL =
  "https://github.com/jak3122/vodsurf/releases/download/latest-data/vodsurf.db";

console.log("⬇️ Downloading latest database...");

try {
  const dlOutput = execSync(`curl -L -o "${dbPath}" "${DOWNLOAD_URL}"`, {
    stdio: "inherit",
  });

  console.log("curl output:");
  console.log(dlOutput);
  console.log("✅ Database downloaded successfully.");
} catch (error) {
  console.error(
    "❌ Failed to download database. Build may fail if DB is missing."
  );
  process.exit(1);
}
