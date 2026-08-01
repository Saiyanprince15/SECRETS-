import { StoryNode, HistoryItem, SavedDiscovery, SeasonExhibition } from './types';
import { CHAPTERS } from './chapters';

/**
 * The opening node. Every image below is a stable, permanently-hosted URL.
 * The previous set used lh3.googleusercontent.com/aida-public/... links from
 * the AI Studio export, which are temporary and expire.
 */
export const INITIAL_STORY: StoryNode = CHAPTERS[0].story;

export const INITIAL_HISTORY: HistoryItem[] = [
  {
    id: 'h1',
    title: 'The Whispering Gallery',
    cycle: 'Cycle 42',
    depth: 'Depth III',
    description:
      'A space defined by acoustic shadows and deep crimson undertones. Lingered for several cycles to observe the shifting light patterns.',
    imageUrl:
      'https://images.unsplash.com/photo-1543722530-d2c3201371e7?q=80&w=1600&h=900&fit=crop&auto=format',
    date: '2024-07-28',
  },
  {
    id: 'h2',
    title: 'Echoes of the First Bloom',
    cycle: 'Cycle 38',
    depth: 'Depth V',
    description:
      'Encountered procedural geometry that mirrored early conceptual drafts of the museum.',
    imageUrl:
      'https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?q=80&w=1600&h=900&fit=crop&auto=format',
    date: '2024-07-20',
  },
];

export const INITIAL_SAVED_DISCOVERIES: SavedDiscovery[] = [
  {
    id: 's1',
    title: 'Terracotta Relief Relic',
    cycle: 'Cycle 44',
    depth: 'Depth VI',
    description:
      'Found in the ancient storage vault of the Lost Fleet. Shows archaic astronomical mapping.',
    imageUrl:
      'https://images.unsplash.com/photo-1534796636912-3b95b3ab5986?q=80&w=1600&h=900&fit=crop&auto=format',
    bookmarked: true,
  },
  {
    id: 's2',
    title: 'Stela of the Silent Sentinel',
    cycle: 'Cycle 41',
    depth: 'Depth IV',
    description:
      'Architectural fragment carved with ancient inscriptions from 2nd Century A.D.',
    imageUrl:
      'https://images.unsplash.com/photo-1502134249126-9f3755a50d78?q=80&w=1600&h=900&fit=crop&auto=format',
    bookmarked: true,
  },
  {
    id: 's3',
    title: 'Fragment of the Fallen Hoplite',
    cycle: 'Cycle 39',
    depth: 'Depth V',
    description:
      'An engraved stone tablet depicting a defender standing guard against cosmic decay.',
    imageUrl:
      'https://images.unsplash.com/photo-1444703686981-a3abbc4d4fe3?q=80&w=1600&h=900&fit=crop&auto=format',
    bookmarked: true,
  },
];

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
