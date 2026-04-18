import type { NextConfig } from "next";
import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";

const nextConfig: NextConfig = {
  outputFileTracingRoot: process.cwd(),
};

export default nextConfig;

if (process.argv.includes("dev")) {
  void initOpenNextCloudflareForDev();
}
