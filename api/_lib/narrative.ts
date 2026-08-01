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

export const MODEL = 'gemini-3.6-flash';

/**
 * Stable, permanently-hosted artwork. The previous set used
 * lh3.googleusercontent.com/aida-public/... URLs exported from AI Studio;
 * those are temporary and expire, which is why heroes went blank.
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
  return {
    ...data,
    fragmentImage: randomFragment(),
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
  return { ...data, bgImage: randomFragment() };
}
