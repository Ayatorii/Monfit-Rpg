/**
 * Vercel serverless entrypoint.
 *
 * Vercel auto-detects files in /api/ and exposes them as serverless functions.
 * This file wraps the Express app (which handles all /api/* routes) via
 * serverless-http so it runs in Vercel's function runtime instead of as a
 * long-lived server process.
 *
 * vercel.json rewrites all /api/* traffic here.
 */
import serverless from "serverless-http";
import app from "../artifacts/api-server/src/app";

export default serverless(app);
