/**
 * Vercel serverless entrypoint.
 *
 * This file is built by esbuild (alongside index.ts) into dist/serverless.mjs.
 * api/index.ts at the repo root re-exports this handler so that Vercel's
 * @vercel/node builder can pick it up as a serverless function.
 *
 * Unlike index.ts, this file does NOT call app.listen() — it just exports
 * the Express app wrapped in serverless-http so Vercel can invoke it per-request.
 */
import serverless from "serverless-http";
import app from "./app";

export default serverless(app);
