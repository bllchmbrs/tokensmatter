import { getCloudflareContext } from "@opennextjs/cloudflare";
import { NextResponse } from "next/server";
import { getAggregateStats, getLeaderboard } from "@/lib/db";

export const runtime = "nodejs";

const CACHE_CONTROL = "public, s-maxage=30, stale-while-revalidate=120";

function getRateLimitKey(request: Request): string {
  const clientIp = request.headers.get("cf-connecting-ip");
  if (clientIp) {
    return `ip:${clientIp}`;
  }

  return "ip:unknown";
}

export async function GET(request: Request) {
  const env = getCloudflareContext().env;
  const rateLimit = await env.STATS_LIMITER.limit({
    key: getRateLimitKey(request),
  });
  if (!rateLimit.success) {
    return NextResponse.json(
      { error: "Rate limit exceeded. Try again in a minute." },
      {
        status: 429,
        headers: {
          "Cache-Control": "no-store",
        },
      }
    );
  }

  try {
    const stats = await getAggregateStats();
    const entries = await getLeaderboard();
    return NextResponse.json(
      { stats, entries },
      {
        headers: {
          "Cache-Control": CACHE_CONTROL,
        },
      }
    );
  } catch (error) {
    console.error(
      "Stats error:",
      error instanceof Error ? error.message : error
    );
    return NextResponse.json(
      { stats: null, entries: [] },
      {
        status: 500,
        headers: {
          "Cache-Control": "no-store",
        },
      }
    );
  }
}
