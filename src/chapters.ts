import { StoryNode } from './types';

export interface Chapter {
  id: string;
  label: string;
  title: string;
  blurb: string;
  cardImage: string;
  story: StoryNode;
}

/**
 * Each chapter owns its own opening StoryNode — including its own hero image.
 * Selecting a chapter must set the story node, otherwise the hero falls back
 * to whatever the previous node was.
 */
export const CHAPTERS: Chapter[] = [
  {
    id: 'cosmos',
    label: 'Chapter I',
    title: 'Season 1 Cosmos',
    blurb:
      'Enter the primordial void and discover the resonant frequencies of the early universe.',
    cardImage:
      'https://images.unsplash.com/photo-1462331940025-496dfbfc7564?q=80&w=1600&auto=format&fit=crop',
    story: {
      title: 'The Primordial Void',
      text: 'Nothing here has weight. Cold starlight drifts across the hull in slow bands, and somewhere below the deck an old machine keeps counting a rhythm no one set. The void does not answer, but it listens.',
      imageUrl:
        'https://images.unsplash.com/photo-1462331940025-496dfbfc7564?q=80&w=2400&h=1350&fit=crop&crop=entropy&auto=format',
      choices: [
        'Drift Toward the Nebula',
        'Read the Cold Starlight',
        'Follow the Counting Machine',
        'Listen to the Silence',
      ],
      cycle: 'Cycle 01',
      depth: 'Depth I',
    },
  },
];

export const FALLBACK_HERO =
  'https://images.unsplash.com/photo-1444703686981-a3abbc4d4fe3?q=80&w=2400&h=1350&fit=crop&auto=format';
