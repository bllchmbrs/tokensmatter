import { NextResponse } from "next/server";
import { getAggregateStats, getLeaderboard } from "@/lib/db";

export const runtime = "nodejs";

export async function GET() {
  try {
    const stats = await getAggregateStats();
    const entries = await getLeaderboard();
    return NextResponse.json({ stats, entries });
  } catch (error) {
    console.error(
      "Stats error:",
      error instanceof Error ? error.message : error
    );
    return NextResponse.json({ stats: null, entries: [] }, { status: 500 });
  }
}
