import { useState, useEffect } from 'react';
import {
  AppTab,
  UserProfile,
  StoryNode,
  HistoryItem,
  SavedDiscovery,
  SeasonExhibition,
} from './types';
import {
  INITIAL_STORY,
  INITIAL_HISTORY,
  INITIAL_SAVED_DISCOVERIES,
  INITIAL_SEASONS,
} from './data';
import { Chapter } from './chapters';
import { supabase, ensureProfile } from './lib/supabase';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { AuthScreen } from './components/AuthScreen';
import { LandingScreen } from './components/LandingScreen';
import { ExploreScreen } from './components/ExploreScreen';
import { TransitionScreen } from './components/TransitionScreen';
import { SeasonsScreen } from './components/SeasonsScreen';
import { ProfileScreen } from './components/ProfileScreen';
import { SecretModal } from './components/SecretModal';
import { audioEngine } from './lib/audioEngine';

export function App() {
  const [currentTab, setCurrentTab] = useState<AppTab>('landing');
  const [isTransitioning, setIsTransitioning] = useState<boolean>(false);
  const [lastChoice, setLastChoice] = useState<string>('');

  const [profile, setProfile] = useState<UserProfile>({
    email: '',
    loggedIn: false,
    explorerName: 'The Wanderer',
    level: 'LVL I / SEASON OF ROSES',
    currentSeason: 'Season of Roses',
  });

  const [storyNode, setStoryNode] = useState<StoryNode>(INITIAL_STORY);
  const [history, setHistory] = useState<HistoryItem[]>(INITIAL_HISTORY);
  const [savedDiscoveries, setSavedDiscoveries] = useState<SavedDiscovery[]>(
    INITIAL_SAVED_DISCOVERIES
  );
  const [seasons, setSeasons] = useState<SeasonExhibition[]>(INITIAL_SEASONS);
  const [selectedDiscovery, setSelectedDiscovery] =
    useState<SavedDiscovery | null>(null);

  // Supabase session: restore on mount, then track changes
  useEffect(() => {
    const applyUser = (user: { id: string; email?: string }) => {
      ensureProfile(user.id, user.email ?? '');
      setProfile((prev) => ({
        ...prev,
        email: user.email ?? prev.email,
        loggedIn: true,
        explorerName: user.email?.split('@')[0] || 'The Wanderer',
      }));
    };

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        applyUser(session.user);
        setCurrentTab((tab) => (tab === 'landing' ? 'explore' : tab));
      }
    });

    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        applyUser(session.user);
      } else {
        setProfile((prev) => ({ ...prev, loggedIn: false, email: '' }));
        setCurrentTab('landing');
      }
    });

    return () => sub.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    audioEngine.transitionForStoryNode(
      storyNode.title,
      storyNode.text,
      storyNode.depth
    );
  }, [storyNode]);

  const handleLogin = (userEmail: string) => {
    setProfile((prev) => ({
      ...prev,
      email: userEmail,
      loggedIn: true,
      explorerName: userEmail.split('@')[0] || 'The Wanderer',
    }));
    setLastChoice('Entry Key Authenticated');
    setIsTransitioning(true);
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setCurrentTab('landing');
  };

  /** Selecting a chapter must set the story node, or the hero image
   *  stays on whatever the previous node was. */
  const handleSelectChapter = (chapter: Chapter) => {
    setStoryNode(chapter.story);
    setLastChoice(`Entering ${chapter.title}`);
  };

  const handleSelectChoice = async (choiceText: string) => {
    setLastChoice(choiceText);
    setIsTransitioning(true);

    try {
      const res = await fetch('/api/story/choice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          choiceText,
          currentNarrative: storyNode.text,
          history: history.map((h) => ({
            title: h.title,
            choice: h.description,
          })),
        }),
      });

      if (!res.ok) throw new Error(`Story API returned ${res.status}`);

      const data = await res.json();
      const newStoryNode: StoryNode = {
        title: data.revelationTitle || 'The Cosmic Revelation',
        text:
          data.revelationBody ||
          'As you proceeded, ancient holographic glyphs materialized in the surrounding quiet.',
        imageUrl: data.fragmentImage || storyNode.imageUrl,
        choices: data.nextChoices || INITIAL_STORY.choices,
        cycle: data.cycle || 'Cycle 45',
        depth: data.depth || 'Depth VII',
      };

      setStoryNode(newStoryNode);

      const stamp = Date.now();
      const entry = {
        title: newStoryNode.title,
        cycle: newStoryNode.cycle,
        depth: newStoryNode.depth,
        description: newStoryNode.text,
        imageUrl: newStoryNode.imageUrl,
      };

      setHistory((prev) => [
        { id: `h-${stamp}`, ...entry, date: new Date().toISOString().split('T')[0] },
        ...prev,
      ]);
      setSavedDiscoveries((prev) => [
        { id: `s-${stamp}`, ...entry, bookmarked: true },
        ...prev,
      ]);
    } catch (err) {
      console.error('Failed to process story choice:', err);
    }
  };

  const handleFinishTransition = () => {
    setIsTransitioning(false);
    if (currentTab === 'auth') setCurrentTab('explore');
    audioEngine.playUnlockChime();
  };

  const handleToggleBookmark = (id: string) => {
    setSavedDiscoveries((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, bookmarked: !item.bookmarked } : item
      )
    );
  };

  const handleGenerateCustomExhibition = async (
    themePrompt: string
  ): Promise<SeasonExhibition | null> => {
    try {
      const res = await fetch('/api/exhibitions/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ themePrompt }),
      });

      if (!res.ok) throw new Error(`Exhibition API returned ${res.status}`);

      const data = await res.json();
      const newSeason: SeasonExhibition = {
        id: `season-custom-${Date.now()}`,
        title: data.title || `Season: ${themePrompt}`,
        subtitle: data.tagline || 'Custom AI Curation',
        description: data.description || 'Synthesized from your cosmic prompt.',
        status: 'active',
        bgImage:
          data.bgImage ||
          'https://images.unsplash.com/photo-1518621736915-f3b1c41bfd00?q=80&w=2400&h=1350&fit=crop&auto=format',
        isLocked: false,
      };

      setSeasons((prev) => [newSeason, ...prev]);
      return newSeason;
    } catch (err) {
      console.error('Failed to generate custom exhibition:', err);
      return null;
    }
  };

  const handleSelectSeason = (season: SeasonExhibition) => {
    setStoryNode({
      title: season.title,
      text: `${season.description} You step through the threshold of ${season.title}.`,
      imageUrl: season.bgImage,
      choices: [
        'Inspect Exhibition Monolith',
        'Observe Shifting Light Geometry',
        'Listen to Ambient Resonances',
        'Record Discovery in Journal',
      ],
      cycle: 'Cycle 50',
      depth: 'Depth IX',
    });
    setLastChoice(`Entering ${season.title}`);
    setIsTransitioning(true);
    setCurrentTab('explore');
  };

  return (
    <div className="min-h-screen bg-[#131313] text-[#e5e2e1] flex flex-col font-sans selection:bg-[#FF4E00]/30 selection:text-[#FF4E00] relative overflow-x-hidden">
      {currentTab !== 'landing' && (
        <Navbar
          currentTab={currentTab}
          onSelectTab={(tab) => setCurrentTab(tab)}
          onSignOut={profile.loggedIn ? handleSignOut : undefined}
        />
      )}

      {isTransitioning ? (
        <TransitionScreen
          chosenAction={lastChoice}
          onFinishTransition={handleFinishTransition}
        />
      ) : currentTab === 'landing' ? (
        <LandingScreen
          onBegin={() => setCurrentTab('explore')}
          onLoginClick={() => setCurrentTab('auth')}
        />
      ) : currentTab === 'auth' ? (
        <AuthScreen onLogin={handleLogin} />
      ) : currentTab === 'explore' ? (
        <ExploreScreen
          storyNode={storyNode}
          onSelectChoice={handleSelectChoice}
          onSelectChapter={handleSelectChapter}
        />
      ) : currentTab === 'seasons' ? (
        <SeasonsScreen
          seasons={seasons}
          onSelectSeason={handleSelectSeason}
          onGenerateCustomExhibition={handleGenerateCustomExhibition}
        />
      ) : (
        <ProfileScreen
          profile={profile}
          history={history}
          savedDiscoveries={savedDiscoveries}
          onToggleBookmark={handleToggleBookmark}
          onSelectDiscovery={(disc) => setSelectedDiscovery(disc)}
        />
      )}

      {currentTab !== 'landing' && currentTab !== 'auth' && !isTransitioning && (
        <Footer currentSeason={profile.currentSeason} />
      )}

      <SecretModal
        discovery={selectedDiscovery}
        onClose={() => setSelectedDiscovery(null)}
        onToggleBookmark={handleToggleBookmark}
      />
    </div>
  );
}

export default App;
