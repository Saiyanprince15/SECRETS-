import { GoogleGenAI, Type } from '@google/genai';

let client: GoogleGenAI | null = null;

export function getGenAiClient(): GoogleGenAI | null {
  if (client) return client;
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.warn('GEMINI_API_KEY is not configured.');
    return null;
  }
  client = new GoogleGenAI({
    apiKey,
    httpOptions: { headers: { 'User-Agent': 'secrets-app' } },
  });
  return client;
}

/** Text model — narrative, choices, exhibition copy. */
export const MODEL = 'gemini-3.6-flash';

/**
 * Image model — "Nano Banana". Generates the artwork for each story node.
 * Set IMAGE_MODEL env var to gemini-3.1-flash-image-preview (Nano Banana 2)
 * or gemini-3-pro-image-preview (Nano Banana Pro) for higher quality.
 */
export const IMAGE_MODEL = process.env.IMAGE_MODEL || 'gemini-2.5-flash-image';

/**
 * Fallback artwork, used ONLY when image generation fails or no API key is
 * configured. These are not the primary path — see generateFragmentImage.
 */
export const FRAGMENT_IMAGES = [
  'https://images.unsplash.com/photo-1462331940025-496dfbfc7564?q=80&w=2400&h=1350&fit=crop&auto=format',
  'https://images.unsplash.com/photo-1444703686981-a3abbc4d4fe3?q=80&w=2400&h=1350&fit=crop&auto=format',
  'https://images.unsplash.com/photo-1543722530-d2c3201371e7?q=80&w=2400&h=1350&fit=crop&auto=format',
  'https://images.unsplash.com/photo-1502134249126-9f3755a50d78?q=80&w=2400&h=1350&fit=crop&auto=format',
  'https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?q=80&w=2400&h=1350&fit=crop&auto=format',
  'https://images.unsplash.com/photo-1534796636912-3b95b3ab5986?q=80&w=2400&h=1350&fit=crop&auto=format',
];

const DEPTHS = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX'];

export function randomFragment() {
  return FRAGMENT_IMAGES[Math.floor(Math.random() * FRAGMENT_IMAGES.length)];
}

export function randomCycle() {
  return `Cycle ${Math.floor(Math.random() * 50) + 10}`;
}

export function randomDepth() {
  return `Depth ${DEPTHS[Math.floor(Math.random() * DEPTHS.length)]}`;
}

/**
 * Generate original artwork for a story node.
 *
 * Returns a base64 data URL so the frontend can render it with no storage
 * layer. That keeps setup to zero, at the cost of a ~1MB payload per node
 * and images that vanish on refresh. To persist them, upload the buffer to
 * a Supabase Storage bucket here and return the public URL instead.
 *
 * Returns null on any failure — callers fall back to FRAGMENT_IMAGES so a
 * quota error or safety block never breaks the story flow.
 */
export async function generateFragmentImage(
  title: string,
  body: string
): Promise<string | null> {
  const ai = getGenAiClient();
  if (!ai) return null;

  const prompt = `Cinematic 16:9 concept artwork for a cosmic mystery art exhibition titled "Secrets".

Scene: ${title}
${body}

Style: painterly, atmospheric, deep shadow with a single dominant light source.
Muted palette with one warm accent. Vast negative space, a sense of silence and
scale. No text, no letters, no watermarks, no people's faces. Fine-art gallery
piece, not a photograph.`;

  try {
    const response = await ai.models.generateContent({
      model: IMAGE_MODEL,
      contents: prompt,
    });

    const parts = response.candidates?.[0]?.content?.parts ?? [];
    for (const part of parts) {
      const inline = (part as any).inlineData;
      if (inline?.data) {
        const mime = inline.mimeType || 'image/png';
        return `data:${mime};base64,${inline.data}`;
      }
    }

    console.warn('Image model returned no image part.');
    return null;
  } catch (err: any) {
    console.error('Image generation failed:', err?.message ?? err);
    return null;
  }
}

export interface StoryChoiceBody {
  choiceText?: string;
  currentNarrative?: string;
  history?: Array<{ title: string; choice: string }>;
}

export async function generateStoryContinuation(body: StoryChoiceBody) {
  const { choiceText, currentNarrative, history = [] } = body;
  const ai = getGenAiClient();

  if (!ai) {
    return {
      revelationTitle: 'The Celestial Anomaly',
      revelationBody: `As you chose to "${choiceText}", the ancient controls hum with a deep resonant frequency. A hidden hologram illuminates the dark bridge, revealing forgotten stellar cartography from the Lost Era.`,
      nextChoices: [
        'Decode the Celestial Coordinates',
        "Interrogate the Ship's AI Log",
        'Activate the Sub-light Thrusters',
        'Return to the Observation Deck',
      ],
      fragmentImage: randomFragment(),
      imageGenerated: false,
      cycle: randomCycle(),
      depth: randomDepth(),
    };
  }

  const prompt = `
You are the silent, atmospheric curator and narrator of "Secrets — A Never Ending Art", an immersive cosmic mystery art exhibition.
The explorer is on a silent spacecraft or digital museum gallery.

Current Narrative: "${
    currentNarrative ||
    'The bridge of the abandoned spacecraft is silent. A weary captain watches distant stars while ancient machinery hums softly beneath the floor.'
  }"
Explorer's Action/Choice: "${choiceText}"
Previous steps: ${JSON.stringify(history)}

Generate an evocative, poetic, cinematic continuation of the mystery story and 4 new distinct exploratory options.
Output JSON strictly conforming to this structure:
{
  "revelationTitle": "Short poetic title (3-6 words)",
  "revelationBody": "2-3 evocative, atmospheric sentences describing what happens and what secret is uncovered.",
  "nextChoices": ["Choice 1", "Choice 2", "Choice 3", "Choice 4"]
}
`;

  const response = await ai.models.generateContent({
    model: MODEL,
    contents: prompt,
    config: {
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          revelationTitle: { type: Type.STRING },
          revelationBody: { type: Type.STRING },
          nextChoices: { type: Type.ARRAY, items: { type: Type.STRING } },
        },
        required: ['revelationTitle', 'revelationBody', 'nextChoices'],
      },
    },
  });

  const data = JSON.parse(response.text || '{}');

  // Artwork is generated FROM the narrative, so this has to run after the
  // text call rather than in parallel with it.
  const generated = await generateFragmentImage(
    data.revelationTitle ?? '',
    data.revelationBody ?? ''
  );

  return {
    ...data,
    fragmentImage: generated ?? randomFragment(),
    imageGenerated: generated !== null,
    cycle: randomCycle(),
    depth: randomDepth(),
  };
}

export async function generateExhibition(themePrompt?: string) {
  const ai = getGenAiClient();

  if (!ai) {
    return {
      title: 'Season V: Crimson Echoes',
      tagline: 'A meditation on memory and lost constellations.',
      description:
        'Explore the remnants of a silent spacefaring civilization through procedural artifacts and forgotten acoustics.',
      bgImage: randomFragment(),
      imageGenerated: false,
    };
  }

  const prompt = `
Generate a poetic exhibition theme for a digital art museum called "Secrets".
User requested topic/feeling: "${themePrompt || 'Quantum memories in deep space'}"

Output JSON:
{
  "title": "Season Name (e.g. Season Four: The Stardust Relics)",
  "tagline": "Short atmospheric 1-sentence tagline",
  "description": "2 sentence gallery description describing the artifacts and emotional tone"
}
`;

  const response = await ai.models.generateContent({
    model: MODEL,
    contents: prompt,
    config: {
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          tagline: { type: Type.STRING },
          description: { type: Type.STRING },
        },
        required: ['title', 'tagline', 'description'],
      },
    },
  });

  const data = JSON.parse(response.text || '{}');

  const generated = await generateFragmentImage(
    data.title ?? '',
    data.description ?? ''
  );

  return {
    ...data,
    bgImage: generated ?? randomFragment(),
    imageGenerated: generated !== null,
  };
}
