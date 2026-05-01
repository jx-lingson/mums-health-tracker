import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL!);

let tableReady = false;

export async function ensureTable() {
  if (tableReady) return;
  await sql`
    CREATE TABLE IF NOT EXISTS health_data (
      id TEXT PRIMARY KEY,
      data JSONB,
      updated_at TIMESTAMPTZ DEFAULT now()
    )
  `;
  tableReady = true;
}

export { sql };
