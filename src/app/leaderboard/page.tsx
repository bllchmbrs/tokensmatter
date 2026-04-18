"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

interface LeaderboardEntry {
  submissionId: string;
  requestTokens46: number;
  requestTokens47: number;
  requestCost46: number;
  requestCost47: number;
  requestPct: number;
  costPct: number;
  createdAt: string;
}

interface AggregateStats {
  uniqueSubmissions: number;
  avgRequestTokens46: number;
  avgRequestTokens47: number;
  avgRequestTokenPctChange: number;
  avgRequestCostPctChange: number;
}

function diffColor(pct: number): string {
  const clamped = Math.max(-50, Math.min(50, pct));
  const intensity = Math.abs(clamped) / 50;

  if (clamped < 0) {
    const r = Math.round(30 + (1 - intensity) * 70);
    const g = Math.round(120 + intensity * 135);
    const b = Math.round(50 + (1 - intensity) * 50);
    return `rgb(${r}, ${g}, ${b})`;
  }

  if (clamped > 0) {
    const r = Math.round(120 + intensity * 135);
    const g = Math.round(50 + (1 - intensity) * 50);
    const b = Math.round(30 + (1 - intensity) * 70);
    return `rgb(${r}, ${g}, ${b})`;
  }

  return "#e6edf3";
}

function formatPct(pct: number): string {
  const sign = pct > 0 ? "+" : "";
  return `${sign}${pct.toFixed(1)}%`;
}

function formatCost(cost: number): string {
  if (cost < 0.01) return `$${cost.toFixed(6)}`;
  return `$${cost.toFixed(4)}`;
}

export default function Leaderboard() {
  const [stats, setStats] = useState<AggregateStats | null>(null);
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/stats")
      .then((response) => response.json())
      .then((data) => {
        setStats(data.stats);
        setEntries(data.entries || []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const thStyle: React.CSSProperties = {
    padding: "0.5rem 0.75rem",
    textAlign: "right",
    borderBottom: "1px solid #1e2533",
    color: "#8b949e",
    fontSize: "11px",
    fontWeight: 600,
    letterSpacing: "0.04em",
    textTransform: "uppercase",
    whiteSpace: "nowrap",
  };

  const tdStyle: React.CSSProperties = {
    padding: "0.45rem 0.75rem",
    textAlign: "right",
    borderBottom: "1px solid #1e2533",
    color: "#e6edf3",
    fontSize: "13px",
    fontVariantNumeric: "tabular-nums",
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#0a0e17",
        color: "#e6edf3",
        fontFamily:
          "'SF Mono', 'Cascadia Code', 'Fira Code', Menlo, Consolas, monospace",
        fontSize: "14px",
        padding: 0,
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          gap: "1.5rem",
          padding: "0.75rem 1rem",
          borderBottom: "1px solid #1e2533",
          background: "#111827",
        }}
      >
        <Link
          href="/"
          style={{ color: "#8b949e", textDecoration: "none", fontSize: "13px" }}
        >
          Calculate
        </Link>
        <span style={{ color: "#e5a536", fontWeight: 700, fontSize: "13px" }}>
          Community Averages
        </span>
        <Link
          href="/about"
          style={{ color: "#8b949e", textDecoration: "none", fontSize: "13px" }}
        >
          About
        </Link>
      </div>

      <div
        style={{
          maxWidth: 900,
          margin: "0 auto",
          padding: "2.5rem 1rem",
          textAlign: "center",
        }}
      >
        <h1
          style={{
            color: "#f0f6fc",
            fontSize: "28px",
            fontWeight: 700,
            margin: "0 0 0.5rem 0",
            fontFamily: "inherit",
            letterSpacing: "-0.02em",
          }}
        >
          Community Averages
        </h1>
        <p style={{ color: "#8b949e", margin: "0 0 2rem 0", fontSize: "14px" }}>
          Anonymous request-token comparisons from the community, showing how
          Opus 4.6 and Opus 4.7 differ on real inputs
        </p>

        {loading && (
          <div style={{ color: "#e5a536", marginTop: "2rem" }}>Loading...</div>
        )}

        {stats && (
          <div
            style={{
              border: "1px solid #1e2533",
              borderRadius: 8,
              background: "#111827",
              marginBottom: "2rem",
              textAlign: "left",
            }}
          >
            <div
              style={{
                padding: "0.5rem 0.85rem",
                borderBottom: "1px solid #1e2533",
                color: "#8b949e",
                fontSize: "12px",
                background: "#0f1520",
                borderRadius: "8px 8px 0 0",
                display: "flex",
                justifyContent: "space-between",
              }}
            >
              <span>Community averages for Opus 4.6 requests vs Opus 4.7 requests</span>
              <span style={{ color: "#8b949e" }}>
                {stats.uniqueSubmissions} submission
                {stats.uniqueSubmissions !== 1 ? "s" : ""}
              </span>
            </div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr 1fr",
                gap: "1rem",
                padding: "1.25rem",
                textAlign: "center",
              }}
            >
              <div>
                <div
                  style={{
                    color: "#8b949e",
                    fontSize: "11px",
                    textTransform: "uppercase",
                    letterSpacing: "0.04em",
                    marginBottom: "0.35rem",
                  }}
                >
                  Avg request token change
                </div>
                <div
                  style={{
                    fontSize: "22px",
                    fontWeight: 700,
                    color: diffColor(stats.avgRequestTokenPctChange),
                  }}
                >
                  {formatPct(stats.avgRequestTokenPctChange)}
                </div>
              </div>
              <div>
                <div
                  style={{
                    color: "#8b949e",
                    fontSize: "11px",
                    textTransform: "uppercase",
                    letterSpacing: "0.04em",
                    marginBottom: "0.35rem",
                  }}
                >
                  Avg request cost change
                </div>
                <div
                  style={{
                    fontSize: "22px",
                    fontWeight: 700,
                    color: diffColor(stats.avgRequestCostPctChange),
                  }}
                >
                  {formatPct(stats.avgRequestCostPctChange)}
                </div>
              </div>
              <div>
                <div
                  style={{
                    color: "#8b949e",
                    fontSize: "11px",
                    textTransform: "uppercase",
                    letterSpacing: "0.04em",
                    marginBottom: "0.35rem",
                  }}
                >
                  Avg request size
                </div>
                <div style={{ fontSize: "22px", fontWeight: 700, color: "#e6edf3" }}>
                  {stats.avgRequestTokens46.toLocaleString()} /{" "}
                  {stats.avgRequestTokens47.toLocaleString()}
                </div>
              </div>
            </div>
          </div>
        )}

        {!loading && entries.length === 0 && (
          <div style={{ color: "#8b949e", marginTop: "2rem" }}>
            No comparisons yet.{" "}
            <Link href="/" style={{ color: "#e5a536", textDecoration: "underline" }}>
              Be the first!
            </Link>
          </div>
        )}

        {entries.length > 0 && (
          <div
            style={{
              border: "1px solid #1e2533",
              borderRadius: 8,
              background: "#111827",
              textAlign: "left",
            }}
          >
            <div
              style={{
                padding: "0.5rem 0.85rem",
                borderBottom: "1px solid #1e2533",
                color: "#8b949e",
                fontSize: "12px",
                background: "#0f1520",
                borderRadius: "8px 8px 0 0",
              }}
            >
              Recent anonymous comparisons (last 50, most recent first)
            </div>
            <div style={{ overflowX: "auto" }}>
              <table
                style={{
                  width: "100%",
                  borderCollapse: "collapse",
                  fontFamily: "inherit",
                }}
              >
                <thead>
                  <tr>
                    <th style={{ ...thStyle, textAlign: "left" }}>#</th>
                    <th style={{ ...thStyle, textAlign: "left" }}>Submission</th>
                    <th style={thStyle}>Request 4.6</th>
                    <th style={thStyle}>Request 4.7</th>
                    <th style={thStyle}>Request %</th>
                    <th style={thStyle}>Cost 4.6</th>
                    <th style={thStyle}>Cost 4.7</th>
                    <th style={thStyle}>Cost %</th>
                  </tr>
                </thead>
                <tbody>
                  {entries.map((entry, index) => (
                    <tr key={entry.submissionId}>
                      <td
                        style={{
                          ...tdStyle,
                          textAlign: "left",
                          color: "#8b949e",
                        }}
                      >
                        {index + 1}
                      </td>
                      <td
                        style={{
                          ...tdStyle,
                          textAlign: "left",
                          color: "#8b949e",
                        }}
                      >
                        {entry.submissionId.slice(0, 8)}
                      </td>
                      <td style={tdStyle}>
                        {entry.requestTokens46.toLocaleString()}
                      </td>
                      <td style={tdStyle}>
                        {entry.requestTokens47.toLocaleString()}
                      </td>
                      <td
                        style={{
                          ...tdStyle,
                          color: diffColor(entry.requestPct),
                          fontWeight: 600,
                        }}
                      >
                        {formatPct(entry.requestPct)}
                      </td>
                      <td style={tdStyle}>{formatCost(entry.requestCost46)}</td>
                      <td style={tdStyle}>{formatCost(entry.requestCost47)}</td>
                      <td
                        style={{
                          ...tdStyle,
                          color: diffColor(entry.costPct),
                          fontWeight: 600,
                        }}
                      >
                        {formatPct(entry.costPct)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        <div
          style={{
            marginTop: "2.5rem",
            paddingTop: "0.75rem",
            borderTop: "1px solid #1e2533",
            color: "#4b5563",
            fontSize: "12px",
            textAlign: "center",
          }}
        >
          Open source &middot; stored rows contain anonymous submission IDs only
          <br />
          Not affiliated with or endorsed by Anthropic.
          <div style={{ marginTop: "0.5rem", display: "flex", justifyContent: "center", gap: "0.75rem", alignItems: "center" }}>
            <a
              href="https://github.com/bllchmbrs/tokensmatter"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: "#8b949e", textDecoration: "none" }}
              title="Source on GitHub"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor"><path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"/></svg>
            </a>
            <a
              href="https://x.com/bllchmbrs"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: "#8b949e", textDecoration: "none" }}
              title="@bllchmbrs on X"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
            </a>
            <a
              href="https://billchambers.me"
              style={{ color: "#8b949e", textDecoration: "underline", fontSize: "12px" }}
            >
              billchambers.me
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
