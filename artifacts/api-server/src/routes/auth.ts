import { Router, type IRouter } from "express";
import { generateSiweNonce, parseSiweMessage } from "viem/siwe";
import { eq } from "drizzle-orm";
import { db, usersTable, playersTable } from "@workspace/db";
import { publicClient } from "../lib/chain";
import type { AuthSession, AuthUser } from "@workspace/api-zod";

const router: IRouter = Router();

function toAuthUser(walletAddress: string, player: { xp: number; gold: number }): AuthUser {
  return {
    walletAddress,
    player: {
      walletAddress,
      xp: player.xp,
      gold: player.gold,
      level: Math.floor(player.xp / 100) + 1,
    },
  };
}

/**
 * GET /api/auth/nonce
 * Issues a fresh SIWE nonce and stores it on the session so /verify can
 * confirm the signed message was generated for this exact session.
 */
router.get("/nonce", (req, res): void => {
  const nonce = generateSiweNonce();
  req.session.nonce = nonce;
  res.json({ nonce });
});

/**
 * POST /api/auth/verify
 * Verifies a signed SIWE message (via viem, which checks EOA + EIP-1271
 * signatures against Monad Testnet) and, on success, establishes a session
 * for the recovered wallet address — creating the user/player rows on
 * first sign-in.
 */
router.post("/verify", async (req, res): Promise<void> => {
  const { message, signature } = req.body as { message?: unknown; signature?: unknown };

  if (typeof message !== "string" || typeof signature !== "string") {
    res.status(401).json({ error: "Missing message or signature" });
    return;
  }

  const expectedNonce = req.session.nonce;
  if (!expectedNonce) {
    res.status(401).json({ error: "No pending nonce for this session — request a new one" });
    return;
  }

  let parsed;
  try {
    parsed = parseSiweMessage(message);
  } catch (err) {
    req.log.warn({ err }, "Failed to parse SIWE message");
    res.status(401).json({ error: "Invalid SIWE message" });
    return;
  }

  if (!parsed.address || parsed.nonce !== expectedNonce) {
    res.status(401).json({ error: "Nonce mismatch" });
    return;
  }

  let valid = false;
  try {
    valid = await publicClient.verifySiweMessage({
      message,
      signature: signature as `0x${string}`,
      nonce: expectedNonce,
    });
  } catch (err) {
    req.log.error({ err }, "SIWE signature verification threw");
    res.status(401).json({ error: "Signature verification failed" });
    return;
  }

  if (!valid) {
    res.status(401).json({ error: "Invalid signature" });
    return;
  }

  const walletAddress = parsed.address.toLowerCase();

  await db.insert(usersTable).values({ walletAddress }).onConflictDoNothing({
    target: usersTable.walletAddress,
  });
  await db.insert(playersTable).values({ walletAddress }).onConflictDoNothing({
    target: playersTable.walletAddress,
  });

  const [player] = await db
    .select()
    .from(playersTable)
    .where(eq(playersTable.walletAddress, walletAddress));

  if (!player) {
    req.log.error({ walletAddress }, "Player row missing immediately after upsert");
    res.status(500).json({ error: "Failed to establish player profile" });
    return;
  }

  // Nonce is single-use — clear it and regenerate the session ID to guard
  // against session fixation.
  req.session.nonce = undefined;
  req.session.regenerate((err) => {
    if (err) {
      req.log.error({ err }, "Failed to regenerate session");
      res.status(500).json({ error: "Failed to establish session" });
      return;
    }

    req.session.walletAddress = walletAddress;
    const body: AuthSession = { user: toAuthUser(walletAddress, player) };
    res.json(body);
  });
});

/**
 * GET /api/auth/session
 * Returns the currently signed-in wallet's user/player, or { user: null }.
 */
router.get("/session", async (req, res): Promise<void> => {
  const walletAddress = req.session.walletAddress;
  if (!walletAddress) {
    const body: AuthSession = { user: null };
    res.json(body);
    return;
  }

  const [player] = await db
    .select()
    .from(playersTable)
    .where(eq(playersTable.walletAddress, walletAddress));

  if (!player) {
    const body: AuthSession = { user: null };
    res.json(body);
    return;
  }

  const body: AuthSession = { user: toAuthUser(walletAddress, player) };
  res.json(body);
});

/**
 * POST /api/auth/logout
 */
router.post("/logout", (req, res): void => {
  req.session.destroy((err) => {
    if (err) {
      req.log.error({ err }, "Failed to destroy session");
      res.status(500).json({ error: "Failed to log out" });
      return;
    }
    res.clearCookie("monfit.sid");
    res.status(204).end();
  });
});

export default router;
