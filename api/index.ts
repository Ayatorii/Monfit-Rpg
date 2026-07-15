/**
 * Vercel serverless entrypoint (repo root /api/index.ts).
 *
 * Vercel auto-detects files in /api/ and deploys them as serverless functions.
 * This file re-exports the pre-built handler from artifacts/api-server/dist/serverless.mjs,
 * which is produced by `pnpm --filter @workspace/api-server run build` in vercel.json's
 * buildCommand BEFORE Vercel processes this file.
 *
 * The Express app is a default export from app.ts wrapped with serverless-http.
 * In production, pino uses stdout (no worker threads), so no extra pino worker
 * files need to be co-located in the function package.
 */
export { default } from "../artifacts/api-server/dist/serverless.mjs";
