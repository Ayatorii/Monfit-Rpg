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
 * Issues a fresh SIWE nonce and stores it on the session.
 */
router.get("/nonce", (req, res): void => {
  const nonce = generateSiweNonce();
  req.session.nonce = nonce;
  req.session.save((err) => {
    if (err) {
      req.log.error({ err }, "Failed to save nonce to session");
      res.status(500).json({ error: "Failed to generate nonce" });
      return;
    }
    res.json({ nonce });
  });
});

/**
 * POST /api/auth/verify
 * Verifies a signed SIWE message and establishes a session.
 */
router.post("/verify", async (req, res): Promise<void> => {
  const { message, signature } = req.body as {
    message?: unknown;
    signature?: unknown;
  };

  if (typeof message !== "string" || typeof signature !== "string") {
    res.status(400).json({ error: "Missing message or signature" });
    return;
  }

  const expectedNonce = req.session.nonce;
  if (!expectedNonce) {
    res.status(400).json({ error: "No nonce on session — call /auth/nonce first" });
    return;
  }

  let parsedMessage: ReturnType<typeof parseSiweMessage>;
  try {
    parsedMessage = parseSiweMessage(message);
  } catch {
    res.status(400).json({ error: "Invalid SIWE message" });
    return;
  }

  if (parsedMessage.nonce !== expectedNonce) {
    res.status(400).json({ error: "Nonce mismatch" });
    return;
  }

  try {
    const valid = await publicClient.verifySiweMessage({
      message,
      signature: signature as `0x${string}`,
    });
    if (!valid) {
      res.status(401).json({ error: "Invalid signature" });
      return;
    }
  } catch (err) {
    req.log.error({ err }, "Signature verification failed");
    res.status(401).json({ error: "Signature verification failed" });
    return;
  }

  const walletAddress = parsedMessage.address.toLowerCase();

  // Upsert user
  await db
    .insert(usersTable)
    .values({ walletAddress })
    .onConflictDoNothing({ target: usersTable.walletAddress });

  // Upsert player
  const [player] = await db
    .insert(playersTable)
    .values({ walletAddress, xp: 0, gold: 0 })
    .onConflictDoUpdate({
      target: playersTable.walletAddress,
      set: { updatedAt: new Date() },
    })
    .returning();

  req.session.nonce = undefined;
  req.session.walletAddress = walletAddress;
  const body: AuthSession = { user: toAuthUser(walletAddress, player!) };
  res.json(body);
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
