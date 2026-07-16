import { neonConfig, Pool } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-serverless";
import ws from "ws";
import * as schema from "./schema";

// Provide a WebSocket constructor for Node.js environments (Replit, Vercel
// Node.js runtime). Not needed in edge runtimes that have native WebSocket.
neonConfig.webSocketConstructor = ws;

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

// Pool uses Neon's WebSocket-based transport — no persistent TCP connections,
// safe for both long-running servers (Replit) and serverless (Vercel).
export const pool = new Pool({ connectionString: process.env.DATABASE_URL });
export const db = drizzle(pool, { schema });

export * from "./schema";
