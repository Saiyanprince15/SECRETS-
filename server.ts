import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize Gemini client lazily
let genAiClient: GoogleGenAI | null = null;
function getGenAiClient(): GoogleGenAI | null {
  if (!genAiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.warn("GEMINI_API_KEY is not configured.");
      return null;
    }
    genAiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return genAiClient;
}

// API Routes
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Interactive Story Choice / Revelation Endpoint
app.post("/api/story/choice", async (req, res) => {
  try {
    const { choiceText, currentNarrative, history = [] } = req.body;

    const ai = getGenAiClient();
    if (!ai) {
      // Fallback narrative if API key is not active
      return res.json({
        revelationTitle: "The Celestial Anomaly",
        revelationBody: `As you chose to "${choiceText}", the ancient controls hum with a deep resonant frequency. A hidden hologram illuminates the dark bridge, revealing forgotten stellar cartography from the Lost Era.`,
        nextChoices: [
          "Decode the Celestial Coordinates",
          "Interrogate the Ship's AI Log",
          "Activate the Sub-light Thrusters",
          "Return to the Observation Deck"
        ],
        fragmentImage: "https://lh3.googleusercontent.com/aida-public/AB6AXuDO_16DpRZAxCBlZDTo0d_cvUQTGX4za9kL0Fa3a9UlGYYLEp8ShUL2QQ8b0c7PtDmkVnt0FF5KnRwacP0nL8rxGGHU2dkrIaxVIh-aH9tj5jxQZf66n6TNNXXHnRGGedE6g4UfORYXcjZShdAtQO-GFzyeQ77irSBTE7gOzVBFc-tnh0JeJWymlGY0pwkyviIEOw0il7xgTNhJUwiUG8pgFzBBIgTR31ozH0T8q9nT9Balkyhtr5ll",
        cycle: `Cycle ${Math.floor(Math.random() * 50) + 10}`,
        depth: `Depth ${["I", "II", "III", "IV", "V", "VI", "VII"][Math.floor(Math.random() * 7)]}`
      });
    }

    const prompt = `
You are the silent, atmospheric curator and narrator of "Secrets — A Never Ending Art", an immersive cosmic mystery art exhibition.
The explorer is on a silent spacecraft or digital museum gallery.

Current Narrative: "${currentNarrative || "The bridge of the abandoned spacecraft is silent. A weary captain watches distant stars while ancient machinery hums softly beneath the floor."}"
Explorer's Action/Choice: "${choiceText}"
Previous steps: ${JSON.stringify(history)}

Generate a evocative, poetic, cinematic continuation of the mystery story and 4 new distinct exploratory options.
Output JSON strictly conforming to this structure:
{
  "revelationTitle": "Short poetic title (3-6 words)",
  "revelationBody": "2-3 evocative, atmospheric sentences describing what happens and what secret is uncovered.",
  "nextChoices": ["Choice 1", "Choice 2", "Choice 3", "Choice 4"]
}
`;

    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            revelationTitle: { type: Type.STRING },
            revelationBody: { type: Type.STRING },
            nextChoices: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            }
          },
          required: ["revelationTitle", "revelationBody", "nextChoices"]
        }
      }
    });

    const data = JSON.parse(response.text || "{}");
    
    // Default image collection from provided art
    const sampleImages = [
      "https://lh3.googleusercontent.com/aida-public/AB6AXuDO_16DpRZAxCBlZDTo0d_cvUQTGX4za9kL0Fa3a9UlGYYLEp8ShUL2QQ8b0c7PtDmkVnt0FF5KnRwacP0nL8rxGGHU2dkrIaxVIh-aH9tj5jxQZf66n6TNNXXHnRGGedE6g4UfORYXcjZShdAtQO-GFzyeQ77irSBTE7gOzVBFc-tnh0JeJWymlGY0pwkyviIEOw0il7xgTNhJUwiUG8pgFzBBIgTR31ozH0T8q9nT9Balkyhtr5ll",
      "https://lh3.googleusercontent.com/aida-public/AB6AXuBRw8JgTq5_VmTuKidIIExtCTBZ02cADNDwEO2-O3XY5GMr-Ud2kb9VZlCoGzYQGACWxCxIyDKxsSsDcVzKlAR-ax-x7bHjiSTmEDkNst-Pl-XBkgIrrqc6pnLBcDURNDLxj35lc1p-dac_GttUBpmE3zP27dAiXNJLW5NIMXwmpzrXPhKpwHx1TFySC3gpEdpyfA1yqmgQpuvfg4QQxCj9uXNe-61nx9hUpt3aRYEo7jTChnKEqVAa",
      "https://lh3.googleusercontent.com/aida-public/AB6AXuAjnxZ9G-3rw5X4BgLBPUCxAKpqeRZzLsqF_2bqaWtIlVLvdebVWQjhA1I5sRGrKn2hnghhdM9Mq5SZGBvVBLmYrlZ4Ms1FiSarh1R1XVa5EN8ECs3GP_wsyVcxzW4KH1Q-n4wGkQMVI5wOSsVLZSQQ56c8blRSyYO8bq-6DSXk-anKzUsK_r-ID4-w5CdYwvi4D4vQBjdVZ2G7LZHBZSQJChFq73p1wlM_AShmzje0J4Gm4DD37-jA",
      "https://lh3.googleusercontent.com/aida-public/AB6AXuADcVslqfVX2E45rTx8-CqMS4Q1wnl-SYYeKxPmMbGZMQgETngPBuwfTxXvpK_vKRZqxCzd1VpWduatW_X8UcHGWO-ytJDle4kYeVhrADmv64Xum2YdgWvZW-H_wvDBuLv99fBVGMhnpIlggE7L3jKgZeiE3R1UsIATwTyKZi3LoLs2c_Eyu2IMHgdZs86BYH18jkc0G_A_T3k0GN7_LXtUTzFZYc_ggwqk7WCis6PPRYS114PKW1vU",
      "https://lh3.googleusercontent.com/aida-public/AB6AXuD_Gp-Q_1JNE0qvxa7IuChvq616Oni167OXnz9lBL8UTCrxAXcRCLOxwO0uRQPY3kQQTjSwIy51qQEpaTErVr1uPG7CXUkRTrn19QUmHXHiI-f-dX4xjkvuOFc-d8SJXITD0_iCwHBJ57IFAmaqqgDk_FkSG4w8k8IEe4RKfqY0NImmqt7jhYlK4-KBXEgQ-coVR0rEvFH4owjGU8SHwsYpCZ7aELGVXxRHuNHT2bO3tMKvEvwQxOtR"
    ];

    const randomImg = sampleImages[Math.floor(Math.random() * sampleImages.length)];

    return res.json({
      ...data,
      fragmentImage: randomImg,
      cycle: `Cycle ${Math.floor(Math.random() * 50) + 10}`,
      depth: `Depth ${["I", "II", "III", "IV", "V", "VI", "VII"][Math.floor(Math.random() * 7)]}`
    });
  } catch (err: any) {
    console.error("Story API error:", err);
    return res.status(500).json({
      error: "Failed to generate narrative continuation",
      message: err.message
    });
  }
});

// Custom Exhibition Generation Endpoint
app.post("/api/exhibitions/generate", async (req, res) => {
  try {
    const { themePrompt } = req.body;
    const ai = getGenAiClient();

    if (!ai) {
      return res.json({
        title: "Season V: Crimson Echoes",
        tagline: "A meditation on memory and lost constellations.",
        description: "Explore the remnants of silent space faring civilization through procedural artifacts and forgotten acoustics.",
        bgImage: "https://images.unsplash.com/photo-1462331940025-496dfbfc7564?q=80&w=2000&auto=format&fit=crop"
      });
    }

    const prompt = `
Generate a poetic exhibition theme for a digital art museum called "Secrets".
User requested topic/feeling: "${themePrompt || "Quantum memories in deep space"}"

Output JSON:
{
  "title": "Season Name (e.g. Season Four: The Stardust Relics)",
  "tagline": "Short atmospheric 1-sentence tagline",
  "description": "2 sentence gallery description describing the artifacts and emotional tone"
}
`;

    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            tagline: { type: Type.STRING },
            description: { type: Type.STRING }
          },
          required: ["title", "tagline", "description"]
        }
      }
    });

    const data = JSON.parse(response.text || "{}");
    return res.json({
      ...data,
      bgImage: "https://images.unsplash.com/photo-1518621736915-f3b1c41bfd00?q=80&w=2000&auto=format&fit=crop"
    });
  } catch (err: any) {
    console.error("Exhibition API error:", err);
    return res.status(500).json({ error: "Failed to generate exhibition" });
  }
});

async function startServer() {
  // Vite middleware for dev
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
