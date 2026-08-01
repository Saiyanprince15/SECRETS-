import { StoryNode, HistoryItem, SavedDiscovery, SeasonExhibition } from './types';

export const INITIAL_STORY: StoryNode = {
  title: "The Abandoned Bridge",
  text: "The bridge of the abandoned spacecraft is silent. A weary captain watches distant stars while ancient machinery hums softly beneath the floor.",
  imageUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuAogQLPgajrxgLFmp2gcBGQHHZe8Wh5C8mEsA4kKcvcjneifzSvWsvIEZ8TY4ML_l4lGXGzJ7Y8-h9--Afz00D2UKy7sMS9q7qGy2PXiWGVD752ZCywL5krJc_-LVUvM_Hf_KpsdKQn7zFklsRFcEAKPaKR42lh4BqSiGOyh1eR5w8YAJPaCWxs6nBYWmtSpaDAC2Ts2TorPmo4jfgs0WybfPrw0jKcmvLSJmJFVH5AlGZMNrTWbKTOd4Gg2E5Q61cXEg",
  choices: [
    "Speak with the Captain",
    "Examine the Navigation Console",
    "Look through the Observation Window",
    "Enter the Engine Room"
  ],
  cycle: "Cycle 44",
  depth: "Depth VII"
};

export const INITIAL_HISTORY: HistoryItem[] = [
  {
    id: "h1",
    title: "The Whispering Gallery",
    cycle: "Cycle 42",
    depth: "Depth III",
    description: "A space defined by acoustic shadows and deep crimson undertones. Lingered for several cycles to observe the shifting light patterns.",
    imageUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuDO_16DpRZAxCBlZDTo0d_cvUQTGX4za9kL0Fa3a9UlGYYLEp8ShUL2QQ8b0c7PtDmkVnt0FF5KnRwacP0nL8rxGGHU2dkrIaxVIh-aH9tj5jxQZf66n6TNNXXHnRGGedE6g4UfORYXcjZShdAtQO-GFzyeQ77irSBTE7gOzVBFc-tnh0JeJWymlGY0pwkyviIEOw0il7xgTNhJUwiUG8pgFzBBIgTR31ozH0T8q9nT9Balkyhtr5ll",
    date: "2024-07-28"
  },
  {
    id: "h2",
    title: "Echoes of the First Bloom",
    cycle: "Cycle 38",
    depth: "Depth V",
    description: "Encountered procedural geometry that mirrored early conceptual drafts of the museum.",
    imageUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuBRw8JgTq5_VmTuKidIIExtCTBZ02cADNDwEO2-O3XY5GMr-Ud2kb9VZlCoGzYQGACWxCxIyDKxsSsDcVzKlAR-ax-x7bHjiSTmEDkNst-Pl-XBkgIrrqc6pnLBcDURNDLxj35lc1p-dac_GttUBpmE3zP27dAiXNJLW5NIMXwmpzrXPhKpwHx1TFySC3gpEdpyfA1yqmgQpuvfg4QQxCj9uXNe-61nx9hUpt3aRYEo7jTChnKEqVAa",
    date: "2024-07-20"
  }
];

export const INITIAL_SAVED_DISCOVERIES: SavedDiscovery[] = [
  {
    id: "s1",
    title: "Terracotta Relief Relic",
    cycle: "Cycle 44",
    depth: "Depth VI",
    description: "Found in the ancient storage vault of the Lost Fleet. Shows archaic astronomical mapping.",
    imageUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuAjnxZ9G-3rw5X4BgLBPUCxAKpqeRZzLsqF_2bqaWtIlVLvdebVWQjhA1I5sRGrKn2hnghhdM9Mq5SZGBvVBLmYrlZ4Ms1FiSarh1R1XVa5EN8ECs3GP_wsyVcxzW4KH1Q-n4wGkQMVI5wOSsVLZSQQ56c8blRSyYO8bq-6DSXk-anKzUsK_r-ID4-w5CdYwvi4D4vQBjdVZ2G7LZHBZSQJChFq73p1wlM_AShmzje0J4Gm4DD37-jA",
    bookmarked: true
  },
  {
    id: "s2",
    title: "Stela of the Silent Sentinel",
    cycle: "Cycle 41",
    depth: "Depth IV",
    description: "Architectural fragment carved with ancient inscriptions from 2nd Century A.D.",
    imageUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuADcVslqfVX2E45rTx8-CqMS4Q1wnl-SYYeKxPmMbGZMQgETngPBuwfTxXvpK_vKRZqxCzd1VpWduatW_X8UcHGWO-ytJDle4kYeVhrADmv64Xum2YdgWvZW-H_wvDBuLv99fBVGMhnpIlggE7L3jKgZeiE3R1UsIATwTyKZi3LoLs2c_Eyu2IMHgdZs86BYH18jkc0G_A_T3k0GN7_LXtUTzFZYc_ggwqk7WCis6PPRYS114PKW1vU",
    bookmarked: true
  },
  {
    id: "s3",
    title: "Fragment of the Fallen Hoplite",
    cycle: "Cycle 39",
    depth: "Depth V",
    description: "An engraved stone tablet depicting a defender standing guard against cosmic decay.",
    imageUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuD_Gp-Q_1JNE0qvxa7IuChvq616Oni167OXnz9lBL8UTCrxAXcRCLOxwO0uRQPY3kQQTjSwIy51qQEpaTErVr1uPG7CXUkRTrn19QUmHXHiI-f-dX4xjkvuOFc-d8SJXITD0_iCwHBJ57IFAmaqqgDk_FkSG4w8k8IEe4RKfqY0NImmqt7jhYlK4-KBXEgQ-coVR0rEvFH4owjGU8SHwsYpCZ7aELGVXxRHuNHT2bO3tMKvEvwQxOtR",
    bookmarked: true
  }
];

export const INITIAL_SEASONS: SeasonExhibition[] = [
  {
    id: "season-1",
    title: "Season One: The Cosmos",
    subtitle: "A journey through celestial mechanics and the quiet void.",
    description: "Discover artifacts born from starlight and entropy. A curated archive of immersive digital exhibitions.",
    status: "active",
    bgImage: "https://images.unsplash.com/photo-1462331940025-496dfbfc7564?q=80&w=2000&auto=format&fit=crop",
    isLocked: false
  },
  {
    id: "season-2",
    title: "Season Two: The Depths",
    subtitle: "Archiving in Progress",
    description: "Submerged acoustic structures and procedural ocean floors. Coming into resonance soon.",
    status: "archiving",
    bgImage: "https://images.unsplash.com/photo-1605806616949-1e87b487cb2a?q=80&w=2000&auto=format&fit=crop",
    isLocked: true
  },
  {
    id: "season-3",
    title: "Season Three: Earthbound",
    subtitle: "Coming Soon",
    description: "Botanical geometry and ancient terrestrial monoliths.",
    status: "coming_soon",
    bgImage: "https://images.unsplash.com/photo-1518621736915-f3b1c41bfd00?q=80&w=2000&auto=format&fit=crop",
    isLocked: true
  }
];
