"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

interface ModelResult {
  requestTokens: number;
  requestCost: number;
}

interface ApiResponse {
  results: Record<string, ModelResult>;
  isConversation: boolean;
  hasSystemPrompt: boolean;
  messageCount: number;
  userMessageCount: number;
  assistantMessageCount: number;
}

interface ParsedMessage {
  role: "user" | "assistant";
  content: string;
}

interface ParsedSubmission {
  system: string;
  messages: ParsedMessage[];
}

const VERBS = [
  "Fleecing",
  "Swindling",
  "Bamboozling",
  "Hoodwinking",
  "Duping",
  "Bilking",
  "Rooking",
  "Finagling",
  "Flimflamming",
  "Grifting",
  "Conning",
  "Shafting",
  "Stinging",
  "Gulling",
  "Cozening",
  "Mulcting",
  "Diddling",
  "Snookering",
  "Goldbricking",
  "Gouging",
  "Double-crossing",
  "Shortchanging",
  "Chicaning",
  "Illuding",
  "Pulling a fast one on",
  "Leading up the garden path",
  "Selling down the river",
  "Pulling the wool over the eyes of",
  "Giving a bum steer to",
  "Taking for a ride",
  "Pulling a swifty on",
  "Ripping off",
  "Robbing",
];

const EXAMPLES = [
  {
    label: "Conversation",
    text: JSON.stringify(
      [
        { role: "user", content: "Tell me a short joke." },
        {
          role: "assistant",
          content:
            "Why did the computer show up late to work? It had a hard drive!",
        },
        { role: "user", content: "Can you explain why that's funny?" },
      ],
      null,
      2
    ),
  },
  {
    label: "Code",
    text: JSON.stringify(
      [
        {
          role: "user",
          content:
            "Write a Python function that takes a list of integers and returns the two numbers that add up to a target sum. Include type hints and a docstring.",
        },
        {
          role: "assistant",
          content: `def two_sum(nums: list[int], target: int) -> tuple[int, int] | None:
    """Find two numbers in nums that add up to target.

    Args:
        nums: List of integers to search.
        target: The desired sum.

    Returns:
        A tuple of the two numbers, or None if no pair exists.
    """
    seen: dict[int, int] = {}
    for num in nums:
        complement = target - num
        if complement in seen:
            return (complement, num)
        seen[num] = num
    return None`,
        },
      ],
      null,
      2
    ),
  },
  {
    label: "Prose",
    text: `The history of artificial intelligence is shorter than most people realize. The term was coined in 1956 at a workshop at Dartmouth College, where a small group of researchers gathered to explore whether machines could be made to simulate human intelligence. Early optimism led to bold predictions - Herbert Simon famously claimed in 1965 that machines would be capable of doing any work a man can do within twenty years. That prediction, of course, proved wildly premature. What followed were decades of boom and bust, periods of excitement followed by so-called "AI winters" where funding dried up and progress stalled. The recent revolution in large language models has reignited the field in ways that even optimists didn't anticipate, raising questions not just about capability but about cost, access, and who benefits from these advances.`,
  },
  {
    label: "Blog post",
    text: `Introducing Claude Opus 4.7
Apr 16, 2026

Our latest model, Claude Opus 4.7, is now generally available.

Opus 4.7 is a notable improvement on Opus 4.6 in advanced software engineering, with particular gains on the most difficult tasks. Users report being able to hand off their hardest coding work—the kind that previously needed close supervision—to Opus 4.7 with confidence. Opus 4.7 handles complex, long-running tasks with rigor and consistency, pays precise attention to instructions, and devises ways to verify its own outputs before reporting back.

The model also has substantially better vision: it can see images in greater resolution. It's more tasteful and creative when completing professional tasks, producing higher-quality interfaces, slides, and docs. And—although it is less broadly capable than our most powerful model, Claude Mythos Preview—it shows better results than Opus 4.6 across a range of benchmarks.

Last week we announced Project Glasswing, highlighting the risks—and benefits—of AI models for cybersecurity. We stated that we would keep Claude Mythos Preview's release limited and test new cyber safeguards on less capable models first. Opus 4.7 is the first such model: its cyber capabilities are not as advanced as those of Mythos Preview (indeed, during its training we experimented with efforts to differentially reduce these capabilities). We are releasing Opus 4.7 with safeguards that automatically detect and block requests that indicate prohibited or high-risk cybersecurity uses. What we learn from the real-world deployment of these safeguards will help us work towards our eventual goal of a broad release of Mythos-class models.

Security professionals who wish to use Opus 4.7 for legitimate cybersecurity purposes (such as vulnerability research, penetration testing, and red-teaming) are invited to join our new Cyber Verification Program.

Opus 4.7 is available today across all Claude products and our API, Amazon Bedrock, Google Cloud's Vertex AI, and Microsoft Foundry. Pricing remains the same as Opus 4.6: $5 per million input tokens and $25 per million output tokens. Developers can use claude-opus-4-7 via the Claude API.

Testing Claude Opus 4.7

Below are some highlights and notes from our early testing of Opus 4.7:

Instruction following. Opus 4.7 is substantially better at following instructions. Interestingly, this means that prompts written for earlier models can sometimes now produce unexpected results: where previous models interpreted instructions loosely or skipped parts entirely, Opus 4.7 takes the instructions literally. Users should re-tune their prompts and harnesses accordingly.
Improved multimodal support. Opus 4.7 has better vision for high-resolution images: it can accept images up to 2,576 pixels on the long edge (~3.75 megapixels), more than three times as many as prior Claude models.
Real-world work. As well as its state-of-the-art score on the Finance Agent evaluation, our internal testing showed Opus 4.7 to be a more effective finance analyst than Opus 4.6, producing rigorous analyses and models, more professional presentations, and tighter integration across tasks.
Memory. Opus 4.7 is better at using file system-based memory. It remembers important notes across long, multi-session work, and uses them to move on to new tasks that, as a result, need less up-front context.

Migrating from Opus 4.6 to Opus 4.7

Opus 4.7 is a direct upgrade to Opus 4.6, but two changes are worth planning for because they affect token usage. First, Opus 4.7 uses an updated tokenizer that improves how the model processes text. The tradeoff is that the same input can map to more tokens—roughly 1.0–1.35× depending on the content type. Second, Opus 4.7 thinks more at higher effort levels, particularly on later turns in agentic settings. This improves its reliability on hard problems, but it does mean it produces more output tokens.

Users can control token usage in various ways: by using the effort parameter, adjusting their task budgets, or prompting the model to be more concise.`,
  },
];

const MIN_LOADING_MS = 2500;

function pickRandomVerb(): string {
  return VERBS[Math.floor(Math.random() * VERBS.length)];
}

function formatCost(cost: number): string {
  if (cost < 0.01) return `$${cost.toFixed(6)}`;
  return `$${cost.toFixed(4)}`;
}

function diffPct(a: number, b: number): number {
  if (a === 0) return 0;
  return ((b - a) / a) * 100;
}

function formatTokenDiff(a: number, b: number): string {
  const diff = b - a;
  const pct = a > 0 ? diffPct(a, b).toFixed(1) : "N/A";
  const sign = diff > 0 ? "+" : "";
  return `${sign}${diff} tokens (${sign}${pct}%)`;
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

function extractTextContent(content: unknown): string {
  if (typeof content === "string") return content;

  if (Array.isArray(content)) {
    return content
      .map((block) => {
        if (typeof block === "string") {
          return block;
        }

        if (
          block &&
          typeof block === "object" &&
          (block as Record<string, unknown>).type === "text"
        ) {
          return String((block as Record<string, unknown>).text || "");
        }

        return "";
      })
      .filter(Boolean)
      .join("\n");
  }

  return String(content ?? "");
}

function normalizeSystem(raw: unknown): string {
  return extractTextContent(raw).trim();
}

function tryParseJson(text: string): ParsedSubmission | null {
  const trimmed = text.trim();
  if (!trimmed.startsWith("[") && !trimmed.startsWith("{")) return null;

  try {
    let parsed = JSON.parse(trimmed);
    let system = "";

    if (parsed && !Array.isArray(parsed) && typeof parsed === "object") {
      system = normalizeSystem((parsed as Record<string, unknown>).system);
      const arr =
        (parsed as Record<string, unknown>).messages ||
        (parsed as Record<string, unknown>).conversation ||
        (parsed as Record<string, unknown>).chat ||
        (parsed as Record<string, unknown>).data;

      if (Array.isArray(arr)) {
        parsed = arr;
      } else {
        return null;
      }
    }

    if (!Array.isArray(parsed)) return null;

    const messages: ParsedMessage[] = [];
    for (const msg of parsed) {
      if (!msg || typeof msg !== "object") continue;

      const record = msg as Record<string, unknown>;
      const rawRole = String(record.role || record.sender || "").toLowerCase();
      const content = extractTextContent(
        record.content || record.text || record.message
      ).trim();

      if (!content) continue;

      if (rawRole === "system") {
        system = system ? `${system}\n\n${content}` : content;
        continue;
      }

      const role: "user" | "assistant" =
        rawRole === "assistant" || rawRole === "ai" || rawRole === "claude"
          ? "assistant"
          : "user";
      messages.push({ role, content });
    }

    return messages.length > 0 ? { system, messages } : null;
  } catch {
    return null;
  }
}

function parseConversation(text: string): ParsedSubmission {
  const jsonMessages = tryParseJson(text);
  if (jsonMessages) return jsonMessages;

  const turnPattern = /^(user|human|assistant|ai|system|claude)\s*:/im;
  if (turnPattern.test(text)) {
    const messages: ParsedMessage[] = [];
    let system = "";
    const parts = text.split(
      /^(user|human|assistant|ai|system|claude)\s*:\s*/im
    );

    for (let i = 1; i < parts.length; i += 2) {
      const label = parts[i].toLowerCase();
      const content = (parts[i + 1] || "").trim();
      if (!content) continue;

      if (label === "system") {
        system = system ? `${system}\n\n${content}` : content;
        continue;
      }

      const role =
        label === "assistant" || label === "ai" || label === "claude"
          ? "assistant"
          : "user";
      messages.push({ role, content });
    }

    if (messages.length > 0) {
      return { system, messages };
    }
  }

  return {
    system: "",
    messages: [{ role: "user", content: text }],
  };
}

function LoadingAnimation({ verb }: { verb: string }) {
  const [dots, setDots] = useState("");
  const intervalRef = useRef<ReturnType<typeof setInterval>>(undefined);

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setDots((value) => (value.length >= 4 ? "" : `${value}.`));
    }, 350);

    return () => clearInterval(intervalRef.current);
  }, []);

  return (
    <div style={{ color: "#e5a536", marginTop: "0.75rem", textAlign: "center" }}>
      {">"} {verb}
      {dots}
    </div>
  );
}

function ResultsTable({
  opus46,
  opus47,
}: {
  opus46: ModelResult;
  opus47: ModelResult;
}) {
  const rows: {
    label: string;
    v46: string;
    v47: string;
    diff: string;
    pct: number;
    isTotal?: boolean;
  }[] = [
    {
      label: "Request tokens",
      v46: opus46.requestTokens.toLocaleString(),
      v47: opus47.requestTokens.toLocaleString(),
      diff: formatTokenDiff(opus46.requestTokens, opus47.requestTokens),
      pct: diffPct(opus46.requestTokens, opus47.requestTokens),
    },
    {
      label: "Request cost",
      v46: formatCost(opus46.requestCost),
      v47: formatCost(opus47.requestCost),
      diff: formatCost(opus47.requestCost - opus46.requestCost),
      pct: diffPct(opus46.requestCost, opus47.requestCost),
      isTotal: true,
    },
  ];

  const cellStyle = (isHeader?: boolean): React.CSSProperties => ({
    padding: "0.6rem 1rem",
    textAlign: "right",
    borderBottom: "1px solid #2a2f3a",
    color: isHeader ? "#8b949e" : "#e6edf3",
    fontSize: isHeader ? "12px" : "13px",
    fontWeight: isHeader ? 600 : 400,
    letterSpacing: isHeader ? "0.04em" : undefined,
    textTransform: isHeader ? "uppercase" : undefined,
  });

  const labelStyle: React.CSSProperties = {
    ...cellStyle(),
    textAlign: "left",
    color: "#8b949e",
    fontWeight: 500,
  };

  return (
    <table
      style={{
        borderCollapse: "collapse",
        fontFamily: "inherit",
        margin: "0 auto",
      }}
    >
      <thead>
        <tr>
          <th style={{ ...cellStyle(true), textAlign: "left" }}></th>
          <th style={cellStyle(true)}>Opus 4.6</th>
          <th style={cellStyle(true)}>Opus 4.7</th>
          <th style={cellStyle(true)}>Difference</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((row) => (
          <tr
            key={row.label}
            style={{
              borderTop: row.isTotal ? "2px solid #e5a536" : undefined,
              background: row.isTotal ? "rgba(229, 165, 54, 0.05)" : undefined,
            }}
          >
            <td
              style={{
                ...labelStyle,
                color: row.isTotal ? "#e6edf3" : "#8b949e",
                fontWeight: row.isTotal ? 700 : 500,
              }}
            >
              {row.label}
            </td>
            <td
              style={{
                ...cellStyle(),
                fontWeight: row.isTotal ? 700 : 400,
                fontVariantNumeric: "tabular-nums",
              }}
            >
              {row.v46}
            </td>
            <td
              style={{
                ...cellStyle(),
                fontWeight: row.isTotal ? 700 : 400,
                fontVariantNumeric: "tabular-nums",
              }}
            >
              {row.v47}
            </td>
            <td
              style={{
                ...cellStyle(),
                fontWeight: row.isTotal ? 700 : 400,
                color: diffColor(row.pct),
                fontVariantNumeric: "tabular-nums",
              }}
            >
              {row.diff}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export default function Home() {
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<ApiResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [currentVerb, setCurrentVerb] = useState("");

  async function handleSubmit() {
    if (!text.trim()) return;

    setLoading(true);
    setError(null);
    setData(null);
    setCurrentVerb(pickRandomVerb());

    const startTime = Date.now();

    try {
      const submission = parseConversation(text);
      const res = await fetch("/api/count-tokens", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(submission),
      });

      const contentType = res.headers.get("content-type") || "";
      if (!contentType.includes("application/json")) {
        setError(`Server returned ${res.status} - is the API route running?`);
        return;
      }

      const json = await res.json();
      const elapsed = Date.now() - startTime;
      if (elapsed < MIN_LOADING_MS) {
        await new Promise((resolve) =>
          setTimeout(resolve, MIN_LOADING_MS - elapsed)
        );
      }

      if (!res.ok) {
        setError(json.error || "Request failed");
      } else {
        setData(json);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Network error");
    } finally {
      setLoading(false);
    }
  }

  const opus46 = data?.results["claude-opus-4-6"];
  const opus47 = data?.results["claude-opus-4-7"];
  const transcriptSummary = data
    ? [
        data.hasSystemPrompt ? "system" : null,
        data.userMessageCount > 0 ? `${data.userMessageCount} user` : null,
        data.assistantMessageCount > 0
          ? `${data.assistantMessageCount} assistant`
          : null,
      ]
        .filter(Boolean)
        .join(" + ")
    : "";

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
        <span style={{ color: "#e5a536", fontWeight: 700, fontSize: "13px" }}>
          Calculate
        </span>
        <Link
          href="/leaderboard"
          style={{ color: "#8b949e", textDecoration: "none", fontSize: "13px" }}
        >
          Leaderboard
        </Link>
        <Link
          href="/about"
          style={{ color: "#8b949e", textDecoration: "none", fontSize: "13px" }}
        >
          About
        </Link>
      </div>

      <div
        style={{
          maxWidth: 720,
          margin: "0 auto",
          padding: "2.5rem 1rem",
          textAlign: "center",
        }}
      >
        <div style={{ marginBottom: "2rem" }}>
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
            Tokenomics
          </h1>
          <p
            style={{
              color: "#8b949e",
              margin: "0 0 0.5rem 0",
              fontSize: "14px",
            }}
          >
            Compare how the same transcript is counted when you send a request
            to Opus 4.6 versus a request to Opus 4.7
          </p>
          <p
            style={{
              color: "#8b949e",
              margin: 0,
              fontSize: "13px",
            }}
          >
            Paste a request transcript and see the request-token and
            request-cost difference between requests to Opus 4.6 and requests
            to Opus 4.7
          </p>
        </div>

        <div style={{ marginBottom: "1rem", textAlign: "center" }}>
          <div
            style={{ color: "#8b949e", fontSize: "12px", marginBottom: "0.5rem" }}
          >
            Try an example:
          </div>
          <div
            style={{
              display: "flex",
              gap: "0.5rem",
              justifyContent: "center",
            }}
          >
            {EXAMPLES.map((example) => (
              <button
                key={example.label}
                onClick={() => setText(example.text)}
                style={{
                  flex: "1 1 0",
                  maxWidth: 150,
                  padding: "0.4rem 0",
                  fontSize: "12px",
                  fontFamily: "inherit",
                  background: "rgba(229, 165, 54, 0.08)",
                  color: "#e5a536",
                  border: "1px solid rgba(229, 165, 54, 0.25)",
                  borderRadius: 4,
                  cursor: "pointer",
                  transition: "all 0.15s",
                  textAlign: "center",
                }}
                onMouseEnter={(event) => {
                  event.currentTarget.style.background =
                    "rgba(229, 165, 54, 0.18)";
                  event.currentTarget.style.borderColor = "#e5a536";
                }}
                onMouseLeave={(event) => {
                  event.currentTarget.style.background =
                    "rgba(229, 165, 54, 0.08)";
                  event.currentTarget.style.borderColor =
                    "rgba(229, 165, 54, 0.25)";
                }}
              >
                {example.label}
              </button>
            ))}
          </div>
        </div>

        <div
          style={{
            border: "1px solid #1e2533",
            borderRadius: 8,
            background: "#111827",
            marginBottom: "1.25rem",
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
            Paste Anthropic or OpenAI-style JSON, a transcript with role
            labels, or plain text
          </div>
          <textarea
            value={text}
            onChange={(event) => setText(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter" && event.metaKey) {
                event.preventDefault();
                handleSubmit();
              }
            }}
            placeholder={`{"system":"You are concise.","messages":[{"role":"user","content":"Hello!"}]}`}
            style={{
              width: "100%",
              minHeight: 180,
              padding: "0.75rem 0.85rem",
              fontSize: "13px",
              fontFamily: "inherit",
              background: "transparent",
              color: "#e6edf3",
              border: "none",
              outline: "none",
              resize: "vertical",
              boxSizing: "border-box",
            }}
          />
        </div>
        <div
          style={{
            color: "#8b949e",
            fontSize: "11px",
            marginBottom: "0.75rem",
            textAlign: "left",
          }}
        >
          Prompt text is sent to Anthropic for counting but is not stored by
          this app. We only keep anonymous per-submission metrics.
        </div>

        <div style={{ marginBottom: "1.5rem" }}>
          <button
            onClick={handleSubmit}
            disabled={loading || !text.trim()}
            style={{
              padding: "0.6rem 2rem",
              fontSize: "13px",
              fontFamily: "inherit",
              fontWeight: 600,
              background: loading ? "#1e2533" : "#e5a536",
              color: loading ? "#4b5563" : "#0a0e17",
              border: `1px solid ${loading ? "#2a3344" : "#e5a536"}`,
              borderRadius: 6,
              cursor: loading ? "not-allowed" : "pointer",
              transition: "all 0.15s",
            }}
          >
            {loading ? "working..." : "Calculate Request Difference"}
          </button>
        </div>

        {error && (
          <div
            style={{
              marginBottom: "1rem",
              padding: "0.5rem 0.75rem",
              border: "1px solid #f85149",
              borderRadius: 6,
              color: "#f85149",
              background: "rgba(248, 81, 73, 0.06)",
              textAlign: "left",
            }}
          >
            {"error: "}
            {error}
          </div>
        )}

        {loading && <LoadingAnimation verb={currentVerb} />}

        {data && opus46 && opus47 && (
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
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <span>Request to Opus 4.6 vs request to Opus 4.7</span>
              {(data.isConversation || data.hasSystemPrompt) && (
                <span style={{ color: "#8b949e" }}>{transcriptSummary}</span>
              )}
            </div>
            <div style={{ padding: "1rem 1.25rem" }}>
              <div
                style={{
                  color: "#8b949e",
                  fontSize: "12px",
                  marginBottom: "1rem",
                }}
              >
                Costs reflect sending the full transcript back to the model as
                input for a single request.
              </div>
              <ResultsTable opus46={opus46} opus47={opus47} />
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
          Open source &middot; request tokens counted via Anthropic SDK
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
