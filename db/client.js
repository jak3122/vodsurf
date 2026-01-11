import Database from "better-sqlite3";
import fs from "fs";
import path from "path";

export function createDbClient({ readonly = true, fileMustExist = true } = {}) {
  const dataDir = path.join(process.cwd(), "data");
  const dbPath = path.join(dataDir, "vodsurf.db");

  fs.mkdirSync(dataDir, { recursive: true });

  const db = new Database(dbPath, { readonly, fileMustExist });

  db.pragma("journal_mode = WAL");

  return db;
}
