/**
 * Vercel serverless entrypoint (repo root /api/index.ts).
 *
 * Vercel auto-detects files in /api/ and deploys them as serverless functions.
 * This file re-exports the pre-built handler from artifacts/api-server/dist/serverless.mjs,
 * which is produced by `pnpm --filter @workspace/api-server run build` in vercel.json's
 * buildCommand BEFORE Vercel processes this file.
 *
 * TypeScript types come from dist/serverless.d.mts, which is emitted by build.mjs
 * alongside the .mjs bundle — no ambient declarations needed.
 */
export { default } from "../artifacts/api-server/dist/serverless.mjs";
