import type { VercelRequest, VercelResponse } from '@vercel/node';
import { generateExhibition } from '../_lib/narrative.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  try {
    const result = await generateExhibition(req.body?.themePrompt);
    return res.status(200).json(result);
  } catch (err: any) {
    console.error('Exhibition API error:', err);
    return res.status(500).json({ error: 'Failed to generate exhibition' });
  }
}
