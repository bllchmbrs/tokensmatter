import { getCloudflareContext } from "@opennextjs/cloudflare";
import { createHash } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { recordComparison } from "@/lib/db";

export const runtime = "nodejs";

// Verified against Anthropic pricing docs on April 17, 2026.
const PRICING = {
  "claude-opus-4-6": {
    input: 15.0,
  },
  "claude-opus-4-7": {
    input: 15.0,
  },
} as const;

type ModelId = keyof typeof PRICING;

const MODELS: ModelId[] = ["claude-opus-4-6", "claude-opus-4-7"];
const MAX_BODY_BYTES = 64 * 1024;
const MAX_TOTAL_TEXT_CHARS = 50_000;
const MAX_MESSAGE_COUNT = 100;
const MAX_SINGLE_TEXT_CHARS = 20_000;

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface CountTokensBody {
  messages: Message[];
  system?: string;
}

interface AnthropicCountTokensResponse {
  input_tokens: number;
}

function validateMessages(raw: unknown): Message[] | null {
  if (!Array.isArray(raw)) return null;
  if (raw.length === 0 || raw.length > MAX_MESSAGE_COUNT) return null;

  const messages: Message[] = [];
  for (const msg of raw) {
    if (!msg || typeof msg !== "object") return null;

    const { role, content } = msg as Record<string, unknown>;
    if (role !== "user" && role !== "assistant") return null;
    if (typeof content !== "string" || !content.trim()) return null;
    if (content.length > MAX_SINGLE_TEXT_CHARS) return null;

    messages.push({ role, content: content.trim() });
  }

  return messages;
}

function validateSystem(raw: unknown): string | null {
  if (raw == null) return "";
  if (typeof raw !== "string") return null;
  if (raw.length > MAX_SINGLE_TEXT_CHARS) return null;
  return raw.trim();
}

function getRateLimitKey(request: NextRequest): string {
  const clientIp = request.headers.get("cf-connecting-ip");
  if (clientIp) {
    return `ip:${clientIp}`;
  }

  return "ip:unknown";
}

function totalTextChars(body: CountTokensBody): number {
  return body.messages.reduce((sum, message) => sum + message.content.length, 0) +
    (body.system?.length ?? 0);
}

function buildSubmissionId(body: CountTokensBody): string {
  return createHash("sha256")
    .update(
      JSON.stringify({
        version: 1,
        system: body.system ?? "",
        messages: body.messages,
      })
    )
    .digest("hex");
}

export async function POST(request: NextRequest) {
  const env = getCloudflareContext().env;
  const contentLength = Number(request.headers.get("content-length") ?? "0");
  if (Number.isFinite(contentLength) && contentLength > MAX_BODY_BYTES) {
    return NextResponse.json(
      { error: "Request body is too large." },
      { status: 413 }
    );
  }

  const rateLimit = await env.TOKEN_COUNT_LIMITER.limit({
    key: getRateLimitKey(request),
  });
  if (!rateLimit.success) {
    return NextResponse.json(
      { error: "Rate limit exceeded. Try again in a few minutes." },
      { status: 429 }
    );
  }

  try {
    const apiKey = env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "ANTHROPIC_API_KEY is not configured." },
        { status: 500 }
      );
    }

    const rawBody = await request.text();
    const bodyBytes = Buffer.byteLength(rawBody, "utf8");
    if (bodyBytes > MAX_BODY_BYTES) {
      return NextResponse.json(
        { error: "Request body is too large." },
        { status: 413 }
      );
    }

    let body: unknown;
    try {
      body = JSON.parse(rawBody);
    } catch {
      return NextResponse.json(
        { error: "Invalid JSON payload." },
        { status: 400 }
      );
    }
    if (!body || typeof body !== "object" || Array.isArray(body)) {
      return NextResponse.json(
        { error: "Invalid request payload." },
        { status: 400 }
      );
    }

    const parsedBody = body as Record<string, unknown>;
    const messages = validateMessages(parsedBody.messages);
    const system = validateSystem(parsedBody.system);

    if (!messages || system == null) {
      return NextResponse.json(
        { error: "Invalid request payload." },
        { status: 400 }
      );
    }

    if (totalTextChars({ messages, system }) > MAX_TOTAL_TEXT_CHARS) {
      return NextResponse.json(
        { error: "Request text is too large." },
        { status: 413 }
      );
    }

    const userMessages = messages.filter((message) => message.role === "user");
    const assistantMessages = messages.filter(
      (message) => message.role === "assistant"
    );
    const submissionId = buildSubmissionId({ messages, system });

    const results: Record<
      string,
      {
        requestTokens: number;
        requestCost: number;
      }
    > = {};

    for (const model of MODELS) {
      const countResult = await countTokensWithAnthropic(apiKey, {
        model,
        messages,
        ...(system ? { system } : {}),
      });

      const requestTokens = countResult.input_tokens;
      const requestCost = (requestTokens / 1_000_000) * PRICING[model].input;

      results[model] = {
        requestTokens,
        requestCost,
      };

      await recordComparison(submissionId, model, requestTokens, requestCost);
    }

    return NextResponse.json({
      results,
      isConversation: assistantMessages.length > 0,
      hasSystemPrompt: Boolean(system),
      messageCount: messages.length,
      userMessageCount: userMessages.length,
      assistantMessageCount: assistantMessages.length,
    });
  } catch (error: unknown) {
    console.error(
      "Token counting failed:",
      error instanceof Error ? error.message : error
    );

    return NextResponse.json(
      { error: "Token counting failed. Please try again." },
      { status: 502 }
    );
  }
}

async function countTokensWithAnthropic(
  apiKey: string,
  body: {
    model: ModelId;
    messages: Message[];
    system?: string;
  }
): Promise<AnthropicCountTokensResponse> {
  const response = await fetch("https://api.anthropic.com/v1/messages/count_tokens", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `Anthropic count_tokens failed with ${response.status}: ${truncateForLog(errorText)}`
    );
  }

  return (await response.json()) as AnthropicCountTokensResponse;
}

function truncateForLog(value: string, maxLength = 300): string {
  if (value.length <= maxLength) {
    return value;
  }

  return `${value.slice(0, maxLength)}...`;
}
