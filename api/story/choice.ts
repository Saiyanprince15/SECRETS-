import type { VercelRequest, VercelResponse } from '@vercel/node';
import { generateStoryContinuation } from '../_lib/narrative.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  try {
    const result = await generateStoryContinuation(req.body ?? {});
    return res.status(200).json(result);
  } catch (err: any) {
    console.error('Story API error:', err);
    return res.status(500).json({
      error: 'Failed to generate narrative continuation',
      message: err?.message,
    });
  }
}
