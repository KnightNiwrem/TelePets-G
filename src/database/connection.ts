import { Kysely, PostgresDialect } from "kysely";
import { Pool } from "pg";
import type { Database } from "./types.js";

let db: Kysely<Database> | null = null;

/**
 * Initialize database connection
 */
export function initializeDatabase(): Kysely<Database> {
  if (db) {
    return db;
  }

  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error("DATABASE_URL environment variable is required");
  }

  const pool = new Pool({
    connectionString: databaseUrl,
  });

  db = new Kysely<Database>({
    dialect: new PostgresDialect({
      pool,
    }),
  });

  return db;
}

/**
 * Get database instance
 */
export function getDatabase(): Kysely<Database> {
  if (!db) {
    throw new Error("Database not initialized. Call initializeDatabase() first.");
  }
  return db;
}

/**
 * Close database connection
 */
export async function closeDatabase(): Promise<void> {
  if (db) {
    await db.destroy();
    db = null;
  }
}