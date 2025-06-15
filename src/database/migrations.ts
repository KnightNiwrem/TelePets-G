import { sql, type Kysely } from "kysely";
import type { Database } from "./types.js";

/**
 * Database migration SQL for initial schema
 */

export const INITIAL_MIGRATION = `
-- Create users table
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    telegram_id BIGINT UNIQUE NOT NULL,
    username VARCHAR(255),
    first_name VARCHAR(255) NOT NULL,
    last_name VARCHAR(255),
    is_registered BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create pet_types table
CREATE TABLE IF NOT EXISTS pet_types (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    base_stats JSONB NOT NULL DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create pets table
CREATE TABLE IF NOT EXISTS pets (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    pet_type_id INTEGER REFERENCES pet_types(id) ON DELETE RESTRICT,
    name VARCHAR(255) NOT NULL,
    level INTEGER DEFAULT 1,
    experience INTEGER DEFAULT 0,
    happiness INTEGER DEFAULT 100,
    hunger INTEGER DEFAULT 100,
    energy INTEGER DEFAULT 100,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert initial pet types
INSERT INTO pet_types (name, description, base_stats) VALUES
    ('Cat', 'A playful and agile companion', '{"agility": 8, "strength": 5, "intelligence": 7}'),
    ('Dog', 'A loyal and energetic friend', '{"agility": 6, "strength": 7, "intelligence": 6}'),
    ('Bird', 'A colorful and intelligent pet', '{"agility": 9, "strength": 3, "intelligence": 9}')
ON CONFLICT DO NOTHING;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_users_telegram_id ON users(telegram_id);
CREATE INDEX IF NOT EXISTS idx_pets_user_id ON pets(user_id);
CREATE INDEX IF NOT EXISTS idx_pets_pet_type_id ON pets(pet_type_id);
`;

/**
 * Run database migrations
 */
export async function runMigrations(db: Kysely<Database>): Promise<void> {
  try {
    // For simplicity, we'll run the migration as a single SQL script
    // In a production app, you'd want proper migration tracking
    await sql`${sql.raw(INITIAL_MIGRATION)}`.execute(db);
    console.log("Database migrations completed successfully");
  } catch (error) {
    console.error("Error running database migrations:", error);
    throw error;
  }
}