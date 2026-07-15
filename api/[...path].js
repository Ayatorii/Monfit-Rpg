/**
 * Vercel catch-all serverless function for /api/* routes.
 *
 * The Express app is pre-built by `artifacts/api-server/build.mjs` (esbuild)
 * into a self-contained ESM bundle.  Vercel invokes the default export as a
 * standard Node.js (req, res) handler — no serverless-http adapter required.
 *
 * Build order in vercel.json guarantees dist/handler.mjs exists before
 * Vercel processes this file.
 */
export { default } from "../artifacts/api-server/dist/handler.mjs";
