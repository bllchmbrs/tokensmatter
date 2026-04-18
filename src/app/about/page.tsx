"use client";

import Link from "next/link";

export default function About() {
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
      {/* Nav */}
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
        <Link
          href="/leaderboard"
          style={{ color: "#8b949e", textDecoration: "none", fontSize: "13px" }}
        >
          Leaderboard
        </Link>
        <span style={{ color: "#e5a536", fontWeight: 700, fontSize: "13px" }}>
          About
        </span>
      </div>

      <div
        style={{
          maxWidth: 680,
          margin: "0 auto",
          padding: "2.5rem 1rem",
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
            textAlign: "center",
          }}
        >
          About Tokenomics
        </h1>
        <p
          style={{
            color: "#8b949e",
            margin: "0 0 2.5rem 0",
            fontSize: "14px",
            textAlign: "center",
          }}
        >
          Why this tool exists
        </p>

        {/* The key quote */}
        <div
          style={{
            border: "1px solid #1e2533",
            borderRadius: 8,
            background: "#111827",
            marginBottom: "2rem",
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
            <span>From the Opus 4.7 release post</span>
            <a
              href="https://www.anthropic.com/news/claude-opus-4-7"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: "#e5a536", textDecoration: "none" }}
            >
              anthropic.com
            </a>
          </div>
          <div style={{ padding: "1.25rem" }}>
            <blockquote
              style={{
                margin: 0,
                borderLeft: "3px solid #e5a536",
                paddingLeft: "1rem",
                color: "#e6edf3",
                fontSize: "14px",
                lineHeight: 1.7,
              }}
            >
              Opus 4.7 is a direct upgrade to Opus 4.6, but two changes are
              worth planning for because they affect token usage. First, Opus
              4.7 uses an updated tokenizer that improves how the model
              processes text. The tradeoff is that{" "}
              <strong style={{ color: "#e5a536" }}>
                the same input can map to more tokens—roughly 1.0–1.35x
                depending on the content type.
              </strong>{" "}
              Second, Opus 4.7 thinks more at higher effort levels, particularly
              on later turns in agentic settings. This improves its reliability
              on hard problems, but it does mean{" "}
              <strong style={{ color: "#e5a536" }}>
                it produces more output tokens.
              </strong>
            </blockquote>
          </div>
        </div>

        {/* Explanation */}
        <div style={{ lineHeight: 1.8, color: "#c9d1d9" }}>
          <h2
            style={{
              color: "#f0f6fc",
              fontSize: "18px",
              fontWeight: 700,
              margin: "0 0 0.75rem 0",
            }}
          >
            What this means for you
          </h2>
          <p style={{ margin: "0 0 1rem 0" }}>
            The updated tokenizer in Opus 4.7 means the exact same prompt text
            gets counted as more tokens. More tokens means higher cost per
            request, even if you don&apos;t change a single word.
          </p>
          <p style={{ margin: "0 0 1rem 0" }}>
            Tokenomics lets you paste any conversation, system prompt, or text
            and see the concrete difference: how many more tokens Opus 4.7
            counts versus 4.6, and what that costs you at current pricing.
          </p>
          <p style={{ margin: "0 0 1.5rem 0" }}>
            The{" "}
            <Link href="/leaderboard" style={{ color: "#e5a536", textDecoration: "underline" }}>
              leaderboard
            </Link>{" "}
            aggregates anonymous comparisons from everyone who uses the tool, so
            you can see the real-world average increase across different prompt
            types.
          </p>

          <h2
            style={{
              color: "#f0f6fc",
              fontSize: "18px",
              fontWeight: 700,
              margin: "0 0 0.75rem 0",
            }}
          >
            Two things to know
          </h2>
          <div style={{ margin: "0 0 1rem 0" }}>
            <strong style={{ color: "#f0f6fc" }}>1. We do not store your prompt text.</strong>{" "}
            Your input is parsed in the browser, sent to our server for token counting,
            and forwarded to the Anthropic token counting API. We do not save the
            prompt text in our database. We only store anonymous token-count metrics.
          </div>
          <div style={{ margin: "0 0 1rem 0" }}>
            <strong style={{ color: "#f0f6fc" }}>2. This is not an Anthropic product.</strong>{" "}
            Tokenomics was built by{" "}
            <a
              href="https://billchambers.me"
              style={{ color: "#e5a536", textDecoration: "underline" }}
            >
              Bill Chambers
            </a>
            . It is not affiliated with, endorsed by, or sponsored by Anthropic.
          </div>
          <div style={{ margin: "0 0 1.5rem 0" }}>
            <strong style={{ color: "#f0f6fc" }}>3. This is open source.</strong>{" "}
            The full source code is available on{" "}
            <a
              href="https://github.com/bllchmbrs/tokensmatter"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: "#e5a536", textDecoration: "underline" }}
            >
              GitHub
            </a>
            . Contributions and feedback are welcome.
          </div>

          <div style={{ textAlign: "center", marginTop: "2rem" }}>
            <Link
              href="/"
              style={{
                display: "inline-block",
                padding: "0.6rem 2rem",
                fontSize: "13px",
                fontFamily: "inherit",
                fontWeight: 600,
                background: "#e5a536",
                color: "#0a0e17",
                border: "1px solid #e5a536",
                borderRadius: 6,
                textDecoration: "none",
              }}
            >
              Try the calculator
            </Link>
          </div>
        </div>

        {/* Footer */}
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
          Open source &middot; Not affiliated with or endorsed by Anthropic.
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
