import Database from "better-sqlite3";
import path from "path";

export function createDbClient({ readonly = true, fileMustExist = true } = {}) {
  const dbPath = path.join(process.cwd(), "data", "vodsurf.db");

  const db = new Database(dbPath, { readonly, fileMustExist });

  db.pragma("journal_mode = WAL");

  return db;
}
