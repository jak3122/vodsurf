import Database from "better-sqlite3";
import path from "path";

export function createDbClient() {
  const dbPath = path.join(process.cwd(), "data", "vodsurf.db");

  const db = new Database(dbPath, {
    readonly: true,
    fileMustExist: true,
  });

  db.pragma("journal_mode = WAL");

  return db;
}
