import { getCloudflareContext } from "@opennextjs/cloudflare";

interface AggregateStatsRow {
  unique_submissions: number;
  avg_request_tokens_46: number;
  avg_request_tokens_47: number;
  avg_request_pct: number;
  avg_cost_pct: number;
}

interface LeaderboardRow {
  submission_id: string;
  request_tokens_46: number;
  request_tokens_47: number;
  request_cost_46: number;
  request_cost_47: number;
  request_pct: number;
  cost_pct: number;
  created_at: string;
}

function getDb(): D1Database {
  return getCloudflareContext().env.DB;
}

export async function recordComparison(
  submissionId: string,
  model: string,
  requestTokens: number,
  requestCost: number
): Promise<void> {
  await getDb()
    .prepare(
      `INSERT OR IGNORE INTO comparisons (
        submission_id,
        model,
        request_tokens,
        request_cost
      ) VALUES (?, ?, ?, ?)`
    )
    .bind(submissionId, model, requestTokens, requestCost)
    .run();
}

export interface AggregateStats {
  uniqueSubmissions: number;
  avgRequestTokens46: number;
  avgRequestTokens47: number;
  avgRequestTokenPctChange: number;
  avgRequestCostPctChange: number;
}

export async function getAggregateStats(): Promise<AggregateStats | null> {
  const row = await getDb()
    .prepare(
      `SELECT
        COUNT(*) as unique_submissions,
        AVG(request_tokens_46) as avg_request_tokens_46,
        AVG(request_tokens_47) as avg_request_tokens_47,
        AVG(
          CASE
            WHEN request_tokens_46 > 0 THEN
              (request_tokens_47 - request_tokens_46) * 100.0 / request_tokens_46
            ELSE 0
          END
        ) as avg_request_pct,
        AVG(
          CASE
            WHEN request_cost_46 > 0 THEN
              (request_cost_47 - request_cost_46) * 100.0 / request_cost_46
            ELSE 0
          END
        ) as avg_cost_pct
      FROM (
        SELECT
          c46.submission_id,
          c46.request_tokens as request_tokens_46,
          c47.request_tokens as request_tokens_47,
          c46.request_cost as request_cost_46,
          c47.request_cost as request_cost_47
        FROM comparisons c46
        JOIN comparisons c47 ON c46.submission_id = c47.submission_id
        WHERE c46.model = 'claude-opus-4-6' AND c47.model = 'claude-opus-4-7'
      )`
    )
    .first<AggregateStatsRow>();

  if (!row || row.unique_submissions === 0) {
    return null;
  }

  return {
    uniqueSubmissions: row.unique_submissions,
    avgRequestTokens46: Math.round(row.avg_request_tokens_46),
    avgRequestTokens47: Math.round(row.avg_request_tokens_47),
    avgRequestTokenPctChange: row.avg_request_pct,
    avgRequestCostPctChange: row.avg_cost_pct,
  };
}

export interface LeaderboardEntry {
  submissionId: string;
  requestTokens46: number;
  requestTokens47: number;
  requestCost46: number;
  requestCost47: number;
  requestPct: number;
  costPct: number;
  createdAt: string;
}

export async function getLeaderboard(): Promise<LeaderboardEntry[]> {
  const result = await getDb()
    .prepare(
      `SELECT
        c46.submission_id,
        c46.request_tokens as request_tokens_46,
        c47.request_tokens as request_tokens_47,
        c46.request_cost as request_cost_46,
        c47.request_cost as request_cost_47,
        CASE
          WHEN c46.request_tokens > 0 THEN
            (c47.request_tokens - c46.request_tokens) * 100.0 / c46.request_tokens
          ELSE 0
        END as request_pct,
        CASE
          WHEN c46.request_cost > 0 THEN
            (c47.request_cost - c46.request_cost) * 100.0 / c46.request_cost
          ELSE 0
        END as cost_pct,
        c46.created_at
      FROM comparisons c46
      JOIN comparisons c47 ON c46.submission_id = c47.submission_id
      WHERE c46.model = 'claude-opus-4-6' AND c47.model = 'claude-opus-4-7'
      ORDER BY c46.created_at DESC
      LIMIT 50`
    )
    .all<LeaderboardRow>();

  return (result.results ?? []).map((row) => ({
    submissionId: row.submission_id,
    requestTokens46: row.request_tokens_46,
    requestTokens47: row.request_tokens_47,
    requestCost46: row.request_cost_46,
    requestCost47: row.request_cost_47,
    requestPct: row.request_pct,
    costPct: row.cost_pct,
    createdAt: row.created_at,
  }));
}
