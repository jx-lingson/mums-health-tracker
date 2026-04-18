import { getSupabase } from "@/lib/supabase";
import { NextRequest, NextResponse } from "next/server";

const DATA_ID = "chinn-health-data";

export async function GET() {
  const supabase = getSupabase();
  if (!supabase) return NextResponse.json({ data: null });

  try {
    const { data, error } = await supabase
      .from("health_data")
      .select("data")
      .eq("id", DATA_ID)
      .single();

    if (error && error.code === "PGRST116") {
      return NextResponse.json({ data: null });
    }
    if (error) throw error;
    return NextResponse.json({ data: data.data });
  } catch (error) {
    console.error("GET error:", error);
    return NextResponse.json({ data: null }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const supabase = getSupabase();
  if (!supabase) return NextResponse.json({ ok: false }, { status: 503 });

  try {
    const body = await req.json();
    const { error } = await supabase
      .from("health_data")
      .upsert({ id: DATA_ID, data: body.data, updated_at: new Date().toISOString() });

    if (error) throw error;
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("POST error:", error);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
