const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

const dbPath = path.join(process.cwd(), "data", "vodsurf.db");
const dataDir = path.dirname(dbPath);

if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const DOWNLOAD_URL =
  "https://github.com/jak3122/vodsurf/releases/download/latest-data/vodsurf.db";

console.log("⬇️ Downloading latest database...");

try {
  execSync(`curl -L -o "${dbPath}" "${DOWNLOAD_URL}"`, { stdio: "inherit" });

  console.log("✅ Database downloaded successfully.");
} catch (error) {
  console.error(
    "❌ Failed to download database. Build may fail if DB is missing."
  );
  process.exit(1);
}
