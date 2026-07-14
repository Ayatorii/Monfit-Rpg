// Session type augmentation — imported by app.ts so TS picks it up globally.
import "express-session";

declare module "express-session" {
  interface SessionData {
    nonce?: string;
    walletAddress?: string;
    userId?: number;
  }
}

export {};
