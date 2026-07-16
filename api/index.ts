/**
 * Vercel serverless entrypoint (repo root /api/index.ts).
 *
 * Vercel's @vercel/node compiles api/ as CommonJS by default. A static
 * top-level `import` from a .mjs file becomes `require()` under the hood,
 * which Node.js rejects for genuine ES Modules (ERR_REQUIRE_ESM).
 *
 * Fix: use a dynamic import() instead. Node.js caches ES module loads after
 * the first invocation within a function instance, so the overhead is only
 * paid once — subsequent requests reuse the cached module.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default async function handler(req: any, res: any) {
  const { default: handle } = await import(
    "../artifacts/api-server/dist/serverless.mjs"
  );
  return handle(req, res);
}
