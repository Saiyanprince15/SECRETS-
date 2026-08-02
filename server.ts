/**
 * Local development server only.
 *
 * In production on Vercel these routes are served by the serverless
 * functions in /api. This file exists so `npm run dev` gives you Vite
 * plus the same API surface on one port. Both paths share the logic in
 * api/_lib/narrative.ts so they cannot drift apart.
 */
import express from "express";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";
import {
  generateStoryContinuation,
  generateExhibition,
} from "./api/_lib/narrative.js";

dotenv.config();
dotenv.config({ path: '.env.local', override: true });

const app = express();
const PORT = Number(process.env.PORT ?? 3000);

app.use(express.json());

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

app.post("/api/story/choice", async (req, res) => {
  try {
    res.json(await generateStoryContinuation(req.body ?? {}));
  } catch (err: any) {
    console.error("Story API error:", err);
    res.status(500).json({
      error: "Failed to generate narrative continuation",
      message: err?.message,
    });
  }
});

app.post("/api/exhibitions/generate", async (req, res) => {
  try {
    res.json(await generateExhibition(req.body?.themePrompt));
  } catch (err: any) {
    console.error("Exhibition API error:", err);
    res.status(500).json({ error: "Failed to generate exhibition" });
  }
});

async function startServer() {
  const vite = await createViteServer({
    server: { middlewareMode: true },
    appType: "spa",
  });
  app.use(vite.middlewares);

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Dev server listening on http://localhost:${PORT}`);
  });
}

startServer();
