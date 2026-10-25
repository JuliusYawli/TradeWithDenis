import { createHash } from "crypto";
import { NextResponse } from "next/server";
import { createAdminSupabaseClient } from "@/lib/supabase-admin";
import { hasSupabaseEnv } from "@/lib/supabase-env";

const allowedEvents = new Set(["page_view", "catalog_view", "product_view", "booking_started"]);

export async function POST(request: Request) {
  if (!hasSupabaseEnv() || !process.env.SUPABASE_SERVICE_ROLE_KEY) return new NextResponse(null, { status: 204 });
  try {
    const body = await request.json() as { event?: string; path?: string };
    if (!body.event || !allowedEvents.has(body.event) || !body.path?.startsWith("/") || body.path.length > 200) {
      return NextResponse.json({ error: "Invalid event." }, { status: 400 });
    }
    const rawIp = request.headers.get("x-vercel-forwarded-for")?.split(",")[0]?.trim() || "unknown";
    const visitorHash = createHash("sha256").update(`${process.env.SUPABASE_SERVICE_ROLE_KEY}:${rawIp}`).digest("hex");
    const supabase = createAdminSupabaseClient();
    const since = new Date(Date.now() - 60_000).toISOString();
    const { count } = await supabase.from("analytics_events").select("id", { count: "exact", head: true }).eq("visitor_hash", visitorHash).gte("created_at", since);
    if ((count ?? 0) >= 60) return NextResponse.json({ error: "Too many events." }, { status: 429 });
    const { error } = await supabase.from("analytics_events").insert({ event_name: body.event, path: body.path, visitor_hash: visitorHash });
    if (error) throw error;
  } catch {
    return NextResponse.json({ error: "Invalid event." }, { status: 400 });
  }
  return new NextResponse(null, { status: 204 });
}
