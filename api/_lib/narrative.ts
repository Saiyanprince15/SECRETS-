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

/**
 * Text models, tried in order. Gemini returns 503 "high demand" under load,
 * so a single overloaded model must not take the whole endpoint down.
 * Override with TEXT_MODELS as a comma-separated list.
 */
export const TEXT_MODELS = (
  process.env.TEXT_MODELS || 'gemini-3.6-flash,gemini-2.5-flash'
)
  .split(',')
  .map((m) => m.trim())
  .filter(Boolean);

/** Kept for backwards compatibility with anything importing MODEL. */
export const MODEL = TEXT_MODELS[0];

/**
 * Image generation runs on Hugging Face Inference Providers, not Gemini —
 * Gemini's image models have no free tier.
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

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/** 503/429/500 and UNAVAILABLE/RESOURCE_EXHAUSTED are worth another attempt. */
function isRetryable(err: any): boolean {
  const status = err?.status ?? err?.code;
  if (status === 503 || status === 429 || status === 500) return true;
  const text = String(err?.message ?? err);
  return (
    text.includes('503') ||
    text.includes('429') ||
    text.includes('UNAVAILABLE') ||
    text.includes('RESOURCE_EXHAUSTED') ||
    text.includes('overloaded') ||
    text.includes('high demand')
  );
}

/**
 * Run a Gemini call across TEXT_MODELS with exponential backoff.
 * Throws only if every model fails on every attempt.
 */
async function withModelFallback<T>(
  run: (model: string) => Promise<T>,
  attemptsPerModel = 3
): Promise<T> {
  let lastErr: any;

  for (const model of TEXT_MODELS) {
    for (let attempt = 0; attempt < attemptsPerModel; attempt++) {
      try {
        return await run(model);
      } catch (err: any) {
        lastErr = err;
        if (!isRetryable(err)) {
          console.error(`[${model}] non-retryable:`, err?.message ?? err);
          break; // try the next model rather than hammering this one
        }
        const backoff = 600 * Math.pow(2, attempt); // 600ms, 1.2s, 2.4s
        console.warn(
          `[${model}] attempt ${attempt + 1} failed (${
            err?.message ?? err
          }) — retrying in ${backoff}ms`
        );
        await sleep(backoff);
      }
    }
    console.warn(`[${model}] exhausted — falling through to next model.`);
  }

  throw lastErr ?? new Error('All text models failed.');
}

/**
 * Generate original artwork for a story node via FLUX.1-schnell on HF.
 *
 * Returns a base64 data URL, or null on any failure so callers can fall back
 * to FRAGMENT_IMAGES — a rate limit or cold provider never breaks the story.
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

/**
 * Locally-composed continuation used when every text model is unavailable.
 * Varies with the choice so a degraded run still reads as a story rather
 * than the same paragraph every time.
 */
const DEGRADED_OPENERS = [
  'The instruments settle, and for a moment the vessel holds its breath.',
  'Something shifts in the dark beyond the hull, patient and unhurried.',
  'A low resonance moves through the deck plating, older than the ship.',
  'The light changes without a source, as though the room remembered a sun.',
];

const DEGRADED_TITLES = [
  'A Pause in the Signal',
  'The Long Quiet',
  'What the Dark Retains',
  'An Unmarked Threshold',
];

function degradedContinuation(choiceText: string) {
  const i = Math.floor(Math.random() * DEGRADED_OPENERS.length);
  return {
    revelationTitle: DEGRADED_TITLES[i],
    revelationBody: `${DEGRADED_OPENERS[i]} You chose to ${choiceText.toLowerCase()}, and the exhibition answers slowly, withholding more than it gives.`,
    nextChoices: [
      'Wait for the resonance to return',
      'Trace the signal to its source',
      'Record what you witnessed',
      'Withdraw to the observation deck',
    ],
  };
}

export interface StoryChoiceBody {
  choiceText?: string;
  currentNarrative?: string;
  history?: Array<{ title: string; choice: string }>;
}

export async function generateStoryContinuation(body: StoryChoiceBody) {
  const { choiceText = 'continue', currentNarrative, history = [] } = body;
  const ai = getGenAiClient();

  let data: any = null;
  let degraded = false;

  if (ai) {
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

    try {
      const response = await withModelFallback((model) =>
        ai.models.generateContent({
          model,
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
        })
      );
      data = JSON.parse(response.text || '{}');
    } catch (err: any) {
      console.error('All text models failed:', err?.message ?? err);
      degraded = true;
    }
  } else {
    degraded = true;
  }

  if (!data || !data.revelationTitle) {
    data = degradedContinuation(choiceText);
    degraded = true;
  }

  const generated = await generateFragmentImage(
    data.revelationTitle ?? '',
    data.revelationBody ?? ''
  );

  return {
    ...data,
    fragmentImage: generated ?? randomFragment(),
    imageGenerated: generated !== null,
    textDegraded: degraded,
    cycle: randomCycle(),
    depth: randomDepth(),
  };
}

export async function generateExhibition(themePrompt?: string) {
  const ai = getGenAiClient();
  const theme = themePrompt || 'Quantum memories in deep space';

  let data: any = null;
  let degraded = false;

  if (ai) {
    const prompt = `
Generate a poetic exhibition theme for a digital art museum called "Secrets".
User requested topic/feeling: "${theme}"

Output JSON:
{
  "title": "Season Name (e.g. Season Four: The Stardust Relics)",
  "tagline": "Short atmospheric 1-sentence tagline",
  "description": "2 sentence gallery description describing the artifacts and emotional tone"
}
`;
    try {
      const response = await withModelFallback((model) =>
        ai.models.generateContent({
          model,
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
        })
      );
      data = JSON.parse(response.text || '{}');
    } catch (err: any) {
      console.error('All text models failed:', err?.message ?? err);
      degraded = true;
    }
  } else {
    degraded = true;
  }

  if (!data || !data.title) {
    data = {
      title: `Season: ${theme}`,
      tagline: 'An exhibition assembled in the quiet.',
      description:
        'The curator is unreachable, so this gallery was assembled from what remained in the archive. Its artifacts are provisional.',
    };
    degraded = true;
  }

  const generated = await generateFragmentImage(
    data.title ?? '',
    data.description ?? ''
  );

  return {
    ...data,
    bgImage: generated ?? randomFragment(),
    imageGenerated: generated !== null,
    textDegraded: degraded,
  };
}
