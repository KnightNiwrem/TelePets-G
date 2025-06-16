import { test, expect, beforeEach, afterEach } from "bun:test";

// Store original environment variable
let originalDatabaseUrl: string | undefined;

beforeEach(async () => {
  originalDatabaseUrl = process.env.DATABASE_URL;
});

afterEach(async () => {
  // Clean up database connections
  try {
    const { closeDatabase } = await import("./connection.js");
    await closeDatabase();
  } catch {
    // Ignore cleanup errors
  }
  
  // Restore original environment
  if (originalDatabaseUrl) {
    process.env.DATABASE_URL = originalDatabaseUrl;
  } else {
    delete process.env.DATABASE_URL;
  }
});

test("initializeDatabase should throw error when DATABASE_URL is missing", async () => {
  delete process.env.DATABASE_URL;
  
  const { initializeDatabase } = await import("./connection.js");
  expect(() => initializeDatabase()).toThrow("DATABASE_URL environment variable is required");
});

test("initializeDatabase should return database instance when DATABASE_URL is set", async () => {
  process.env.DATABASE_URL = "postgresql://test:test@localhost:5432/test";
  
  const { initializeDatabase } = await import("./connection.js");
  const db = initializeDatabase();
  expect(db).toBeDefined();
  expect(typeof db.selectFrom).toBe("function");
});

test("initializeDatabase should return same instance on multiple calls", async () => {
  process.env.DATABASE_URL = "postgresql://test:test@localhost:5432/test";
  
  const { initializeDatabase } = await import("./connection.js");
  const db1 = initializeDatabase();
  const db2 = initializeDatabase();
  
  expect(db1).toBe(db2);
});

test("getDatabase should throw error when not initialized", async () => {
  const { getDatabase } = await import("./connection.js");
  
  expect(() => getDatabase()).toThrow("Database not initialized. Call initializeDatabase() first.");
});

test("getDatabase should return database instance when initialized", async () => {
  process.env.DATABASE_URL = "postgresql://test:test@localhost:5432/test";
  
  const { initializeDatabase, getDatabase } = await import("./connection.js");
  const db1 = initializeDatabase();
  const db2 = getDatabase();
  
  expect(db1).toBe(db2);
});

test("closeDatabase should close connection gracefully", async () => {
  process.env.DATABASE_URL = "postgresql://test:test@localhost:5432/test";
  
  const { initializeDatabase, getDatabase, closeDatabase } = await import("./connection.js");
  initializeDatabase();
  await closeDatabase();
  
  // After closing, getDatabase should throw error
  expect(() => getDatabase()).toThrow("Database not initialized. Call initializeDatabase() first.");
});

test("closeDatabase should not throw when called without initialization", async () => {
  const { closeDatabase } = await import("./connection.js");
  await expect(closeDatabase()).resolves.toBeUndefined();
});