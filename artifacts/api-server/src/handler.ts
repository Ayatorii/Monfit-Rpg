/**
 * Vercel serverless entrypoint.
 *
 * Exports the Express `app` directly — Express instances implement the
 * (req, res) interface that Vercel's Node.js functions expect, so no
 * serverless-http wrapper is needed.
 *
 * The compiled output (dist/handler.mjs) is imported by api/index.ts.
 */
import app from "./app";

export default app;
