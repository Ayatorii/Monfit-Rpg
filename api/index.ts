import type { Request, Response } from "express";

/**
 * Vercel serverless function — handles all /api/* requests.
 *
 * Dynamically imports the pre-built Express app so the heavy bundle is loaded
 * once per cold-start and reused across warm invocations.
 */
export default async function handler(req: Request, res: Response) {
  const { default: app } = await import(
    "../artifacts/api-server/dist/handler.mjs"
  );
  return app(req, res);
}
