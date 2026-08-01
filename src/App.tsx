import { useState, useEffect } from 'react';
import { AppTab, UserProfile, StoryNode, HistoryItem, SavedDiscovery, SeasonExhibition } from './types';
import { INITIAL_STORY, INITIAL_HISTORY, INITIAL_SAVED_DISCOVERIES, INITIAL_SEASONS } from './data';
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
  
  // User Profile
  const [profile, setProfile] = useState<UserProfile>({
    email: 'wanderer@secrets.art',
    loggedIn: false,
    explorerName: 'The Wanderer',
    level: 'LVL VII / SEASON OF ROSES',
    currentSeason: 'Season of Roses',
  });

  // Narrative & Exhibition Data
  const [storyNode, setStoryNode] = useState<StoryNode>(INITIAL_STORY);
  const [history, setHistory] = useState<HistoryItem[]>(INITIAL_HISTORY);
  const [savedDiscoveries, setSavedDiscoveries] = useState<SavedDiscovery[]>(INITIAL_SAVED_DISCOVERIES);
  const [seasons, setSeasons] = useState<SeasonExhibition[]>(INITIAL_SEASONS);

  // Soundscape transition on storyNode update
  useEffect(() => {
    audioEngine.transitionForStoryNode(storyNode.title, storyNode.text, storyNode.depth);
  }, [storyNode]);
  
  // Modal state
  const [selectedDiscovery, setSelectedDiscovery] = useState<SavedDiscovery | null>(null);

  // Handle Login
  const handleLogin = (userEmail: string) => {
    setProfile(prev => ({
      ...prev,
      email: userEmail,
      loggedIn: true,
      explorerName: userEmail.split('@')[0] || 'The Wanderer',
    }));
    setLastChoice("Entry Key Authenticated");
    setIsTransitioning(true);
  };

  // Handle Story Choice / Intention
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
          history: history.map(h => ({ title: h.title, choice: h.description }))
        })
      });

      if (res.ok) {
        const data = await res.json();
        const newStoryNode: StoryNode = {
          title: data.revelationTitle || "The Cosmic Revelation",
          text: data.revelationBody || "As you proceeded, ancient holographic glyphs materialized in the surrounding quiet.",
          imageUrl: data.fragmentImage || storyNode.imageUrl,
          choices: data.nextChoices || INITIAL_STORY.choices,
          cycle: data.cycle || "Cycle 45",
          depth: data.depth || "Depth VII"
        };

        setStoryNode(newStoryNode);

        // Add to history
        const newHistoryItem: HistoryItem = {
          id: `h-${Date.now()}`,
          title: data.revelationTitle || choiceText,
          cycle: data.cycle || "Cycle 45",
          depth: data.depth || "Depth VII",
          description: data.revelationBody || `Resonated with intention: "${choiceText}"`,
          imageUrl: data.fragmentImage || storyNode.imageUrl,
          date: new Date().toISOString().split('T')[0]
        };

        setHistory(prev => [newHistoryItem, ...prev]);

        // Automatically add to saved discoveries
        const newDiscovery: SavedDiscovery = {
          id: `s-${Date.now()}`,
          title: data.revelationTitle || choiceText,
          cycle: data.cycle || "Cycle 45",
          depth: data.depth || "Depth VII",
          description: data.revelationBody,
          imageUrl: data.fragmentImage || storyNode.imageUrl,
          bookmarked: true
        };

        setSavedDiscoveries(prev => [newDiscovery, ...prev]);
      }
    } catch (err) {
      console.error("Failed to process story choice:", err);
    }
  };

  // Complete Transition
  const handleFinishTransition = () => {
    setIsTransitioning(false);
    if (currentTab === 'auth') {
      setCurrentTab('explore');
    }
    // Play harmonic chime when unlocking & revealing new story node
    audioEngine.playUnlockChime();
  };

  // Bookmark Toggle
  const handleToggleBookmark = (id: string) => {
    setSavedDiscoveries(prev =>
      prev.map(item => item.id === id ? { ...item, bookmarked: !item.bookmarked } : item)
    );
  };

  // Generate Custom Exhibition
  const handleGenerateCustomExhibition = async (themePrompt: string): Promise<SeasonExhibition | null> => {
    try {
      const res = await fetch('/api/exhibitions/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ themePrompt })
      });

      if (res.ok) {
        const data = await res.json();
        const newSeason: SeasonExhibition = {
          id: `season-custom-${Date.now()}`,
          title: data.title || `Season: ${themePrompt}`,
          subtitle: data.tagline || "Custom AI Curation",
          description: data.description || "Synthesized from your cosmic prompt.",
          status: 'active',
          bgImage: data.bgImage || "https://images.unsplash.com/photo-1518621736915-f3b1c41bfd00?q=80&w=2000&auto=format&fit=crop",
          isLocked: false
        };

        setSeasons(prev => [newSeason, ...prev]);
        return newSeason;
      }
    } catch (err) {
      console.error("Failed to generate custom exhibition:", err);
    }
    return null;
  };

  // Select Season to view
  const handleSelectSeason = (season: SeasonExhibition) => {
    setStoryNode({
      title: season.title,
      text: `${season.description} You step through the threshold of ${season.title}.`,
      imageUrl: season.bgImage,
      choices: [
        "Inspect Exhibition Monolith",
        "Observe Shifting Light Geometry",
        "Listen to Ambient Resonances",
        "Record Discovery in Journal"
      ],
      cycle: "Cycle 50",
      depth: "Depth IX"
    });
    setLastChoice(`Entering ${season.title}`);
    setIsTransitioning(true);
    setCurrentTab('explore');
  };

  return (
    <div className="min-h-screen bg-[#131313] text-[#e5e2e1] flex flex-col font-sans selection:bg-[#FF4E00]/30 selection:text-[#FF4E00] relative overflow-x-hidden">
      {/* Universal Top Navigation */}
      {currentTab !== 'landing' && (
        <Navbar
          currentTab={currentTab}
          onSelectTab={(tab) => setCurrentTab(tab)}
        />
      )}

      {/* Main View Router */}
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

      {/* Footer */}
      {currentTab !== 'landing' && currentTab !== 'auth' && !isTransitioning && (
        <Footer currentSeason={profile.currentSeason} />
      )}

      {/* Modal Viewer */}
      <SecretModal
        discovery={selectedDiscovery}
        onClose={() => setSelectedDiscovery(null)}
        onToggleBookmark={handleToggleBookmark}
      />
    </div>
  );
}

export default App;
