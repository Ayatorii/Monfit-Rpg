import { Router } from "express";
import { randomBytes } from "crypto";
import { recoverMessageAddress } from "viem";
import { db, usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";

const router = Router();

/** GET /api/auth/nonce — generate a fresh nonce and store it in the session. */
router.get("/nonce", (req, res) => {
  const nonce = randomBytes(16).toString("hex");
  req.session.nonce = nonce;
  req.session.save((err) => {
    if (err) {
      console.error("[auth/nonce] session.save error:", err);
      res.status(500).json({ error: "Failed to save session", detail: (err as Error).message });
      return;
    }
    res.json({ nonce });
  });
});

/** POST /api/auth/verify — verify a SIWE message + signature, create/find user. */
router.post("/verify", async (req, res) => {
  try {
    const { message, signature, address } = req.body as {
      message?: string;
      signature?: string;
      address?: string;
    };

    if (!message || !signature || !address) {
      res.status(400).json({ error: "Missing required fields" });
      return;
    }

    // Verify signature — recover the signing address from the message hash.
    let recovered: string;
    try {
      recovered = await recoverMessageAddress({
        message,
        signature: signature as `0x${string}`,
      });
    } catch {
      res.status(422).json({ error: "Could not verify signature" });
      return;
    }

    if (recovered.toLowerCase() !== address.toLowerCase()) {
      res.status(422).json({ error: "Signature address mismatch" });
      return;
    }

    // Verify the nonce in the message matches the one stored in this session.
    const nonceMatch = message.match(/Nonce: ([a-f0-9]+)/);
    const messageNonce = nonceMatch?.[1];

    if (!messageNonce || messageNonce !== req.session.nonce) {
      res.status(422).json({ error: "Invalid or expired nonce" });
      return;
    }

    // Find or create the user record.
    const normalizedAddress = address.toLowerCase();
    let [user] = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.walletAddress, normalizedAddress))
      .limit(1);

    if (!user) {
      const inserted = await db
        .insert(usersTable)
        .values({ walletAddress: normalizedAddress })
        .returning();
      user = inserted[0];
    }

    // Persist to session, clear the one-time nonce.
    req.session.walletAddress = normalizedAddress;
    req.session.userId = user.id;
    req.session.nonce = undefined;

    res.json({ ok: true, address: normalizedAddress });
  } catch (err) {
    console.error("[auth/verify]", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

/** GET /api/auth/session — return the current session state. */
router.get("/session", (req, res) => {
  if (req.session.walletAddress) {
    res.json({ authenticated: true, address: req.session.walletAddress });
  } else {
    res.json({ authenticated: false });
  }
});

/** POST /api/auth/logout — destroy the session. */
router.post("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      res.status(500).json({ error: "Logout failed" });
      return;
    }
    res.clearCookie("monfit.sid");
    res.json({ ok: true });
  });
});

export default router;
