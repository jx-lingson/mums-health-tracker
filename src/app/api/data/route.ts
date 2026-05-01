import { sql, ensureTable } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

const DATA_ID = "chinn-health-data";

export async function GET() {
  try {
    await ensureTable();
    const rows = await sql`SELECT data FROM health_data WHERE id = ${DATA_ID}`;
    return NextResponse.json({ data: rows[0]?.data ?? null });
  } catch (error) {
    console.error("GET error:", error);
    return NextResponse.json({ data: null }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    await ensureTable();
    const body = await req.json();
    await sql`
      INSERT INTO health_data (id, data, updated_at)
      VALUES (${DATA_ID}, ${JSON.stringify(body.data)}, ${new Date().toISOString()})
      ON CONFLICT (id) DO UPDATE SET data = ${JSON.stringify(body.data)}, updated_at = ${new Date().toISOString()}
    `;
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("POST error:", error);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
