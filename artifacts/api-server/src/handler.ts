/**
 * Vercel serverless entry-point.
 *
 * Vercel invokes the default export as (req, res) — identical to how Express
 * itself is called.  Re-exporting `app` directly is the idiomatic pattern;
 * no serverless-http adapter is needed for the Node.js runtime.
 */
export { default } from "./app";
