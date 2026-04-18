declare namespace Cloudflare {
  interface GlobalProps {
    mainModule: typeof import("./.open-next/worker");
  }

  interface Env {
    ASSETS: Fetcher;
    DB: D1Database;
  }
}

interface CloudflareEnv extends Cloudflare.Env {}
