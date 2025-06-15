/**
 * Database schema types for the TelePets game
 */

export interface Database {
  users: UserTable;
  pets: PetTable;
  pet_types: PetTypeTable;
}

export interface UserTable {
  id: Generated<number>;
  telegram_id: number;
  username: string | null;
  name: string;
  is_registered: Generated<boolean>;
  created_at: Generated<Date>;
  updated_at: Generated<Date>;
}

export interface PetTable {
  id: Generated<number>;
  user_id: number;
  pet_type_id: number;
  name: string;
  level: Generated<number>;
  experience: Generated<number>;
  happiness: Generated<number>;
  hunger: Generated<number>;
  energy: Generated<number>;
  created_at: Generated<Date>;
  updated_at: Generated<Date>;
}

export interface PetTypeTable {
  id: Generated<number>;
  name: string;
  description: string;
  base_stats: Record<string, number>;
  created_at: Generated<Date>;
  updated_at: Generated<Date>;
}

// Import Generated type from Kysely
import type { Generated } from "kysely";