# tokensmatter

See the difference between Opus 4.6 and Opus 4.7 tokenizers and share the aggregate results with the community.

## Local development

1. Install dependencies:

```bash
npm install
```

2. Create `.dev.vars`:

```bash
ANTHROPIC_API_KEY=your_anthropic_api_key
```

3. Start the Next.js dev server:

```bash
npm run dev
```

## Cloudflare Workers + D1 setup

This app is configured for Cloudflare Workers using the OpenNext adapter and stores aggregate comparison stats in D1.

1. Create a D1 database:

```bash
npx wrangler d1 create tokensmatter
```

2. Copy the returned `database_id` into `wrangler.toml` for both `database_id` and `preview_database_id`.

3. Apply the migration locally or remotely:

```bash
npx wrangler d1 migrations apply tokensmatter --local
```

4. Add the production secret:

```bash
npx wrangler secret put ANTHROPIC_API_KEY
```

5. Preview or deploy:

```bash
npm run preview
npm run deploy
```

## Notes

- Prompt text is not stored. Only anonymous token-count comparison records are written to D1.
- The local `next dev` flow uses OpenNext's Cloudflare dev integration so route handlers can access `env.DB` and `env.ANTHROPIC_API_KEY`.
