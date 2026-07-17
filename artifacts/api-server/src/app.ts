import express, { type Express } from "express";
import cors from "cors";
import pinoHttp from "pino-http";
import path from "path";
import { fileURLToPath } from "url";
import router from "./routes";
import { logger } from "./lib/logger";
import { sessionMiddleware } from "./lib/session";

const app: Express = express();

// Trust all Replit reverse proxy hops so req.ip / req.protocol / req.secure
// are accurate.  Replit may use more than one internal proxy layer before
// reaching the app, so using `true` (trust any X-Forwarded-* header) is more
// reliable than `1` (trust only the outermost hop).  The session middleware
// uses req.secure to decide whether to set the Secure cookie flag, so this
// must be correct for SameSite=None cookies to work in the browser.
app.set("trust proxy", true);

app.use(
  pinoHttp({
    logger,
    serializers: {
      req(req) {
        return {
          id: req.id,
          method: req.method,
          url: req.url?.split("?")[0],
        };
      },
      res(res) {
        return {
          statusCode: res.statusCode,
        };
      },
    },
  }),
);

app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(sessionMiddleware);

app.use("/api", router);

// ─── Production: serve Vite-built frontend as static files ───────────────────
//
// In Replit Deployments (Autoscale), the platform expects a single process
// binding to 0.0.0.0:PORT.  We serve the pre-built Vite SPA from Express so
// the API server IS the only process — no second web service needed.
//
// In dev, the Vite dev server runs separately (artifacts/monfit-rpg: web
// workflow) with HMR; this block is intentionally skipped.
if (process.env.NODE_ENV === "production") {
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);

  // Resolve relative to the workspace root (where the node process is launched
  // from in the artifact.toml production run command).
  const staticDir = path.resolve(__dirname, "../../artifacts/monfit-rpg/dist/public");

  app.use(express.static(staticDir));

  // SPA fallback — any path that is not an /api route gets index.html so
  // client-side routing (wouter) works on hard refresh.
  app.get("*", (_req, res) => {
    res.sendFile(path.join(staticDir, "index.html"));
  });
}

export default app;
