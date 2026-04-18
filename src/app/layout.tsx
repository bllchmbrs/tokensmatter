import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Tokenomics - Anthropic Token Cost Calculator",
  description:
    "Compare how the same transcript is counted for requests to Anthropic Opus 4.6 versus Anthropic Opus 4.7",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body style={{ margin: 0, background: "#0d1117" }}>
        {children}
      </body>
    </html>
  );
}
