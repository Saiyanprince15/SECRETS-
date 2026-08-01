import { GoogleGenAI, Type } from '@google/genai';
import { InferenceClient } from '@huggingface/inference';

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

/** Text model — narrative, choices, exhibition copy. Gemini has a free tier for text. */
export const MODEL = 'gemini-3.6-flash';

/**
 * Image generation runs on Hugging Face Inference Providers, not Gemini —
 * Gemini's image models have no free tier.
 *
 * FLUX.1-schnell is a 4-step distilled model, so it's fast and cheap. Note
 * that HF Inference Providers is free-tier-limited, not unlimited: free
 * accounts get a monthly credit allowance, after which calls start failing
 * and we fall back to the stock images below.
 */
export const IMAGE_MODEL =
  process.env.IMAGE_MODEL || 'black-forest-labs/FLUX.1-schnell';

/**
 * Which HF inference provider to route through. "auto" picks the first
 * available provider for this model and gives a fallback if one is down.
 * Override with HF_PROVIDER (e.g. "fal-ai", "together", "replicate", "nebius").
 */
export const HF_PROVIDER = process.env.HF_PROVIDER || 'auto';

let hfClient: InferenceClient | null = null;

function getHfClient(): InferenceClient | null {
  if (hfClient) return hfClient;
  const token = process.env.HF_TOKEN;
  if (!token) {
    console.warn('HF_TOKEN is not configured — image generation disabled.');
    return null;
  }
  hfClient = new InferenceClient(token);
  return hfClient;
}

/**
 * Fallback artwork, used ONLY when image generation fails or no token is
 * configured. Not the primary path — see generateFragmentImage.
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
 * Generate original artwork for a story node via FLUX.1-schnell on HF.
 *
 * Returns a base64 data URL. Returns null on any failure so callers can fall
 * back to FRAGMENT_IMAGES — a rate limit or cold provider never breaks the
 * story flow.
 */
export async function generateFragmentImage(
  title: string,
  body: string
): Promise<string | null> {
  const hf = getHfClient();
  if (!hf) return null;

  const prompt = `Cinematic concept artwork for a cosmic mystery art exhibition. Scene: ${title}. ${body} Painterly and atmospheric, deep shadow with a single dominant light source, muted palette with one warm accent, vast negative space, a sense of silence and scale. Fine-art gallery piece, not a photograph. No text, no letters, no watermarks, no faces.`;

  try {
    const blob = await hf.textToImage({
      provider: HF_PROVIDER as any,
      model: IMAGE_MODEL,
      inputs: prompt,
      parameters: {
        // schnell is distilled for 4 steps with no guidance — going higher
        // is slower with no quality gain.
        num_inference_steps: 4,
        guidance_scale: 0,
        // 16:9, both dimensions divisible by 16 as FLUX expects.
        width: 1024,
        height: 576,
      },
    });

    const arrayBuffer = await (blob as unknown as Blob).arrayBuffer();
    const base64 = Buffer.from(arrayBuffer).toString('base64');
    const mime = (blob as unknown as Blob).type || 'image/png';

    if (!base64) {
      console.warn('HF returned an empty image payload.');
      return null;
    }

    return `data:${mime};base64,${base64}`;
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
    const fallbackImage = await generateFragmentImage(
      'The Celestial Anomaly',
      'Ancient controls hum with a deep resonant frequency on an abandoned bridge.'
    );
    return {
      revelationTitle: 'The Celestial Anomaly',
      revelationBody: `As you chose to "${choiceText}", the ancient controls hum with a deep resonant frequency. A hidden hologram illuminates the dark bridge, revealing forgotten stellar cartography from the Lost Era.`,
      nextChoices: [
        'Decode the Celestial Coordinates',
        "Interrogate the Ship's AI Log",
        'Activate the Sub-light Thrusters',
        'Return to the Observation Deck',
      ],
      fragmentImage: fallbackImage ?? randomFragment(),
      imageGenerated: fallbackImage !== null,
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

  // Artwork is generated FROM the narrative, so this runs after the text call.
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
    const fallbackImage = await generateFragmentImage(
      'Season V: Crimson Echoes',
      'A meditation on memory and lost constellations.'
    );
    return {
      title: 'Season V: Crimson Echoes',
      tagline: 'A meditation on memory and lost constellations.',
      description:
        'Explore the remnants of a silent spacefaring civilization through procedural artifacts and forgotten acoustics.',
      bgImage: fallbackImage ?? randomFragment(),
      imageGenerated: fallbackImage !== null,
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
