import { StoryNode, HistoryItem, SavedDiscovery, SeasonExhibition } from './types';
import { CHAPTERS } from './chapters';

/** The opening node. */
export const INITIAL_STORY: StoryNode = CHAPTERS[0].story;

/**
 * History and discoveries start empty and fill up as the explorer makes
 * choices. Previously these were seeded with invented sample entries, which
 * showed up on the profile as though the user had already explored.
 */
export const INITIAL_HISTORY: HistoryItem[] = [];

export const INITIAL_SAVED_DISCOVERIES: SavedDiscovery[] = [];

export const INITIAL_SEASONS: SeasonExhibition[] = [
  {
    id: 'season-1',
    title: 'Season One: The Cosmos',
    subtitle: 'A journey through celestial mechanics and the quiet void.',
    description:
      'Discover artifacts born from starlight and entropy. A curated archive of immersive digital exhibitions.',
    status: 'active',
    bgImage:
      'https://images.unsplash.com/photo-1462331940025-496dfbfc7564?q=80&w=2400&h=1350&fit=crop&auto=format',
    isLocked: false,
  },
  {
    id: 'season-2',
    title: 'Season Two: The Depths',
    subtitle: 'Archiving in Progress',
    description:
      'Submerged acoustic structures and procedural ocean floors. Coming into resonance soon.',
    status: 'archiving',
    bgImage:
      'https://images.unsplash.com/photo-1439405326854-014607f694d7?q=80&w=2400&h=1350&fit=crop&auto=format',
    isLocked: true,
  },
  {
    id: 'season-3',
    title: 'Season Three: Earthbound',
    subtitle: 'Coming Soon',
    description: 'Botanical geometry and ancient terrestrial monoliths.',
    status: 'coming_soon',
    bgImage:
      'https://images.unsplash.com/photo-1518621736915-f3b1c41bfd00?q=80&w=2400&h=1350&fit=crop&auto=format',
    isLocked: true,
  },
];
