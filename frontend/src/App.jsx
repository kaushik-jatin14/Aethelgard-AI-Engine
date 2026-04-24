import React, { useEffect, useMemo, useState } from 'react';
import { RefreshCw, MapIcon, X, Swords, Backpack, ScrollText, Eye, EyeOff, BookOpen, Sparkles, BrainCircuit } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import EnvironmentViewer from './components/EnvironmentViewer';
import FullMap from './components/FullMap';
import ChatPanel from './components/ChatPanel';
import CharacterSelect from './components/CharacterSelect';
import LoginScreen from './components/LoginScreen';
import SettingsPanel, { SettingsButton } from './components/SettingsPanel';
import HelpModal from './components/HelpModal';
import AudioManager from './components/AudioManager';
import QuestPanel from './components/QuestPanel';
import { generateGameAction, generateWorldBuilderState } from './services/gemini';
import { locations } from './data/locations';
import useNarration from './hooks/useNarration';
import { useUISounds } from './hooks/useUISounds';

const PREFERENCES_KEY = 'AETHELGARD_PREFERENCES';
const DIFFICULTY_LABELS = {
  'pilgrims-grace': "Pilgrim's Grace",
  'wardens-trial': "Warden's Trial",
  'abyssforged-doom': 'Abyssforged Doom',
};

const INITIAL_GAME_STATE = {
  location: 'The Nexus Point',
  inventory: [],
  health: 100,
  quests: [],
  world_map: null,
  quest_chain: null,
  story_memory: {
    summary: 'No enduring consequences have been recorded yet.',
    story_flags: [],
    recent_consequences: [],
    chronicle: [],
  },
  dynamic_scene: {
    turn_title: 'Whispers over The Nexus Point',
    visual_mood: 'watchful',
    weather: 'runic dust spirals',
    ambient_cue: 'Low chants and distant iron creaks.',
    objective_focus: 'Read the omens surrounding The Nexus Point.',
    hazard: 'Unknown movement beyond the immediate path.',
    world_shift: 'The realm is testing the edges of The Nexus Point.',
    tension: 35,
    threat_level: 2,
    route_options: [
      'Scout the hidden paths around The Nexus Point.',
      'Question the locals tied to The Nexus Point.',
      'Prepare for the next omen before pressing deeper.',
    ],
    cinematic_tags: ['watchful', 'embers', 'oracle-feed'],
  },
  active_region: 'The Nexus Point',
  turn_count: 0,
  difficulty: 'wardens-trial',
};

const buildServiceNotice = (error, channel = 'oracle') => {
  const title = channel === 'gatekeeper' ? 'The Gate Keeper is unavailable.' : 'The Oracle is unavailable.';
  const detail = error?.message || 'The hosted AI service could not complete this request.';
  const retryLine = error?.retryable === false
    ? 'A server-side configuration fix is required before this can work again.'
    : 'Please try again in a moment.';

  return `**${title}**\n\n${detail}\n\n${retryLine}`;
};

const mergeBuilderResponse = (baseState, payload) => ({
  ...baseState,
  world_map: payload?.generated_map || baseState.world_map,
  quest_chain: payload?.quest_chain || baseState.quest_chain,
  story_memory: payload?.story_memory || baseState.story_memory,
  dynamic_scene: payload?.dynamic_scene || baseState.dynamic_scene,
  active_region: payload?.generated_map?.active_region || payload?.quest_chain?.region || baseState.location,
});

function App() {
  const [appState, setAppState] = useState('LOGIN');
  const [userProfile, setUserProfile] = useState(null);
  const [character, setCharacter] = useState(null);
  const [gameState, setGameState] = useState(INITIAL_GAME_STATE);
  const [chatHistory, setChatHistory] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isForgingWorld, setIsForgingWorld] = useState(false);
  const [forgeLoadingRegion, setForgeLoadingRegion] = useState(null);
  const [isMapOpen, setIsMapOpen] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [volume, setVolume] = useState(0.6);
  const [muted, setMuted] = useState(false);
  const [brightness, setBrightness] = useState(1.0);
  const [realmTheme, setRealmTheme] = useState('ashen-night');
  const [difficulty, setDifficulty] = useState('wardens-trial');
  const [narrationEnabled, setNarrationEnabled] = useState(true);
  const [voiceVolume, setVoiceVolume] = useState(0.95);
  const [cinematicMode, setCinematicMode] = useState(true);
  const [tomeOpen, setTomeOpen] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [serviceBanner, setServiceBanner] = useState(null);
  const { withSounds } = useUISounds();
  const { speak, stopNarration, selectedVoiceName } = useNarration({
    enabled: narrationEnabled,
    character,
    voiceVolume,
  });

  const buildCharacterContext = (baseCharacter) => ({
    ...baseCharacter,
    currentDifficulty: difficulty,
  });

  useEffect(() => {
    document.documentElement.style.filter = `brightness(${brightness})`;
  }, [brightness]);

  useEffect(() => {
    const stored = localStorage.getItem(PREFERENCES_KEY);
    if (!stored) return;
    try {
      const parsed = JSON.parse(stored);
      if (parsed.realmTheme) setRealmTheme(parsed.realmTheme);
      if (parsed.difficulty) setDifficulty(parsed.difficulty);
      if (typeof parsed.narrationEnabled === 'boolean') setNarrationEnabled(parsed.narrationEnabled);
      if (typeof parsed.voiceVolume === 'number') setVoiceVolume(parsed.voiceVolume);
      if (typeof parsed.volume === 'number') setVolume(parsed.volume);
      if (typeof parsed.muted === 'boolean') setMuted(parsed.muted);
      if (typeof parsed.brightness === 'number') setBrightness(parsed.brightness);
    } catch {
      // Ignore malformed stored preferences.
    }
  }, []);

  useEffect(() => {
    document.documentElement.dataset.theme = realmTheme;
    localStorage.setItem(PREFERENCES_KEY, JSON.stringify({
      realmTheme,
      difficulty,
      narrationEnabled,
      voiceVolume,
      volume,
      muted,
      brightness,
    }));
  }, [realmTheme, difficulty, narrationEnabled, voiceVolume, volume, muted, brightness]);

  useEffect(() => {
    if (!userProfile) return;
    if (userProfile.isGuest) {
      setAppState('CHAR_SELECT');
      return;
    }

    const save = localStorage.getItem(`AETHELGARD_SAVE_${userProfile.pin}`);
    if (save) {
      try {
        const { gameState: savedGameState, chatHistory: savedChatHistory, character: savedCharacter } = JSON.parse(save);
        setGameState(savedGameState || INITIAL_GAME_STATE);
        if (savedGameState?.difficulty) {
          setDifficulty(savedGameState.difficulty);
        }
        setChatHistory(savedChatHistory || []);
        setCharacter(savedCharacter || null);
        setAppState(savedCharacter ? 'PLAYING' : 'CHAR_SELECT');
      } catch {
        setAppState('CHAR_SELECT');
      }
    } else {
      setAppState('CHAR_SELECT');
    }
  }, [userProfile]);

  useEffect(() => {
    if (appState === 'PLAYING' && character && userProfile && !userProfile.isGuest) {
      localStorage.setItem(
        `AETHELGARD_SAVE_${userProfile.pin}`,
        JSON.stringify({ gameState, chatHistory, character })
      );
    }
  }, [gameState, chatHistory, character, appState, userProfile]);

  const regionIntelByName = useMemo(
    () => Object.fromEntries((gameState.world_map?.regions || []).map((region) => [region.location, region])),
    [gameState.world_map]
  );

  const handleLogin = (profile) => setUserProfile(profile);

  const forgeWorldState = async (baseState, char, selectedRegion, { silent = false } = {}) => {
    if (!char) return baseState;

    if (!silent) {
      setIsForgingWorld(true);
    }
    setForgeLoadingRegion(selectedRegion);

    try {
      const payload = await generateWorldBuilderState({
        currentState: baseState,
        characterData: buildCharacterContext(char),
        selectedRegion,
        theme: baseState?.world_map?.theme || null,
      });

      return mergeBuilderResponse(baseState, payload);
    } catch (error) {
      setServiceBanner({
        tone: error?.retryable === false ? 'critical' : 'warning',
        text: buildServiceNotice(error, 'oracle'),
      });
      return baseState;
    } finally {
      setForgeLoadingRegion(null);
      if (!silent) {
        setIsForgingWorld(false);
      }
    }
  };

  const handleSelectCharacter = async (char) => {
    setServiceBanner(null);
    setCharacter(char);
    setAppState('PLAYING');
    setIsProcessing(true);
    setChatHistory([]);

    const startLoc = char.startLocation || 'The Nexus Point';
    let workingState = {
      location: startLoc,
      inventory: [char.weapon, 'Ancient Rations', 'Healing Draught'],
      health: 100,
      quests: [{ id: 'q0', title: 'The Awakening', description: char.mission, status: 'active' }],
      active_region: startLoc,
      turn_count: 0,
      difficulty,
      story_memory: INITIAL_GAME_STATE.story_memory,
      dynamic_scene: {
        ...INITIAL_GAME_STATE.dynamic_scene,
        objective_focus: `Enter ${startLoc} and awaken thy first omen.`,
        route_options: [
          `Seek the first omen in ${startLoc}.`,
          `Question the sentries and witnesses in ${startLoc}.`,
          `Move cautiously and read the danger surrounding ${startLoc}.`,
        ],
      },
      world_map: null,
      quest_chain: null,
    };

    setGameState(workingState);

    try {
      const res = await generateGameAction(
        `I am ${char.name}, ${char.title}. I have arrived at ${startLoc} for the first time. Greet me with the ancient oracle's opening narration.`,
        workingState,
        buildCharacterContext(char)
      );
      const nextState = res.new_state ? { ...workingState, ...res.new_state } : workingState;
      workingState = nextState;
      if (nextState.difficulty) {
        setDifficulty(nextState.difficulty);
      }
      setChatHistory([{ role: 'gm', text: res.narrative }]);
      setGameState(nextState);
    } catch (error) {
      const notice = buildServiceNotice(error, 'oracle');
      setServiceBanner({
        tone: error?.retryable === false ? 'critical' : 'warning',
        text: notice,
      });
      setChatHistory([{ role: 'gm', text: notice }]);
    } finally {
      setIsProcessing(false);
    }

    const forgedState = await forgeWorldState(workingState, char, startLoc);
    setGameState(forgedState);
  };

  const handlePlayerAction = async (action) => {
    setServiceBanner(null);
    const updatedHistory = [...chatHistory, { role: 'player', text: action }];
    setChatHistory(updatedHistory);
    setIsProcessing(true);

    try {
      const previousLocation = gameState.location;
      const res = await generateGameAction(action, { ...gameState, difficulty }, buildCharacterContext(character));
      const nextState = res.new_state ? { ...gameState, ...res.new_state } : gameState;
      if (nextState.difficulty && nextState.difficulty !== difficulty) {
        setDifficulty(nextState.difficulty);
      }

      setChatHistory([...updatedHistory, { role: 'gm', text: res.narrative }]);
      setGameState(nextState);

      const needsForge = !nextState.quest_chain || nextState.location !== previousLocation || nextState.quest_chain?.region !== nextState.location;
      if (needsForge) {
        const forgedState = await forgeWorldState(nextState, character, nextState.location, { silent: true });
        setGameState(forgedState);
      }
    } catch (error) {
      const notice = buildServiceNotice(error, 'oracle');
      setServiceBanner({
        tone: error?.retryable === false ? 'critical' : 'warning',
        text: notice,
      });
      setChatHistory([...updatedHistory, { role: 'gm', text: notice }]);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleForgeRegion = async (regionName) => {
    const forgedState = await forgeWorldState(gameState, character, regionName);
    setGameState(forgedState);
  };

  const handleNarrateRegion = (region, intel, questChain) => {
    const chain = questChain?.region === region?.name ? questChain : null;
    const summary = [
      `${region?.name}.`,
      intel?.current_state || region?.currentEvent || '',
      intel?.quest_hook || '',
      chain ? `${chain.title}. ${chain.arc}` : 'The region awaits a forged quest chain.',
    ].filter(Boolean).join(' ');
    speak(summary, { force: true });
  };

  const handleReset = () => {
    setAppState('LOGIN');
    setUserProfile(null);
    setCharacter(null);
    setGameState(INITIAL_GAME_STATE);
    setChatHistory([]);
    setIsMapOpen(false);
    setServiceBanner(null);
    setIsForgingWorld(false);
    setForgeLoadingRegion(null);
    stopNarration();
  };

  useEffect(() => {
    if (!chatHistory.length) return;
    const latest = chatHistory[chatHistory.length - 1];
    if (latest.role === 'gm') {
      speak(latest.text);
    }
  }, [chatHistory, speak]);

  useEffect(() => {
    if (serviceBanner?.text) {
      speak(serviceBanner.text, { force: true });
    }
  }, [serviceBanner, speak]);

  useEffect(() => {
    setGameState((prev) => ({ ...prev, difficulty }));
  }, [difficulty]);

  const locData = locations.find((location) => location.name === gameState.location) || locations[0];
  let atmosphere = 'terrifying';
  if (appState === 'LOGIN' || appState === 'CHAR_SELECT') {
    atmosphere = 'epic';
  } else {
    atmosphere = locData?.atmosphere || 'terrifying';
  }

  const chronicle = gameState.story_memory?.chronicle || [];
  const recentFlags = gameState.story_memory?.story_flags || [];
  const currentRegionIntel = regionIntelByName[gameState.location];
  const dynamicScene = gameState.dynamic_scene || INITIAL_GAME_STATE.dynamic_scene;

  const renderScreen = () => {
    if (appState === 'LOGIN') {
      return (
        <>
          <LoginScreen onLogin={handleLogin} onOpenSettings={() => setShowSettings(true)} onOpenHelp={() => setShowHelp(true)} />
          <SettingsPanel
            isOpen={showSettings}
            onClose={() => setShowSettings(false)}
            volume={volume}
            setVolume={setVolume}
            muted={muted}
            setMuted={setMuted}
            brightness={brightness}
            setBrightness={setBrightness}
            onOpenHelp={() => setShowHelp(true)}
            difficulty={difficulty}
            setDifficulty={setDifficulty}
            realmTheme={realmTheme}
            setRealmTheme={setRealmTheme}
            narrationEnabled={narrationEnabled}
            setNarrationEnabled={setNarrationEnabled}
            voiceVolume={voiceVolume}
            setVoiceVolume={setVoiceVolume}
            selectedVoiceName={selectedVoiceName}
          />
          <HelpModal
            isOpen={showHelp}
            onClose={() => setShowHelp(false)}
            onLogin={(profile) => {
              handleLogin(profile);
              setShowHelp(false);
            }}
          />
        </>
      );
    }

    if (appState === 'CHAR_SELECT') {
      return (
        <>
          <SettingsButton onClick={() => setShowSettings(true)} />
          <CharacterSelect onSelectCharacter={handleSelectCharacter} />
          <SettingsPanel
            isOpen={showSettings}
            onClose={() => setShowSettings(false)}
            volume={volume}
            setVolume={setVolume}
            muted={muted}
            setMuted={setMuted}
            brightness={brightness}
            setBrightness={setBrightness}
            onOpenHelp={() => setShowHelp(true)}
            difficulty={difficulty}
            setDifficulty={setDifficulty}
            realmTheme={realmTheme}
            setRealmTheme={setRealmTheme}
            narrationEnabled={narrationEnabled}
            setNarrationEnabled={setNarrationEnabled}
            voiceVolume={voiceVolume}
            setVoiceVolume={setVoiceVolume}
            selectedVoiceName={selectedVoiceName}
          />
          <HelpModal
            isOpen={showHelp}
            onClose={() => setShowHelp(false)}
            onLogin={(profile) => {
              handleLogin(profile);
              setShowHelp(false);
            }}
          />
        </>
      );
    }

    return (
      <div className="flex flex-col h-screen overflow-hidden" style={{ background: 'var(--bg-dark)' }}>
        <div className={`relative z-50 flex items-center justify-between px-6 py-4 transition-all duration-700 ${cinematicMode ? '-translate-y-full absolute top-0 w-full opacity-0' : 'translate-y-0 opacity-100 bg-[var(--bg-dark)] border-b border-[var(--border-stone)] shadow-xl'}`}>
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full overflow-hidden" style={{ border: '2px solid var(--gold)' }}>
              <img src={character?.image} alt={character?.name} className="w-full h-full object-cover object-top" style={{ filter: character?.gender === 'female' ? character?.fantasyFilter : '' }} />
            </div>
            <div>
              <h2 className="text-3xl font-black uppercase tracking-widest drop-shadow-md" style={{ color: 'var(--text-parchment)', fontFamily: 'Cinzel Decorative, serif' }}>
                {character?.name}
              </h2>
              <p className="text-sm italic drop-shadow-sm font-bold" style={{ color: 'var(--gold)', fontFamily: 'Crimson Text, serif', letterSpacing: '0.15em' }}>
                {character?.title}
              </p>
            </div>
          </div>

          <div className="flex flex-col items-center absolute left-1/2 -translate-x-1/2">
            <p className="text-[0.65rem] font-ancient uppercase tracking-[0.3em] mb-1" style={{ color: 'var(--text-dim)' }}>Current Territory</p>
            <div className="flex items-center gap-4">
              <div className="divider-ancient w-16" />
              <h1 className="text-4xl font-black uppercase tracking-widest drop-shadow-lg" style={{ color: 'var(--gold)', fontFamily: 'Cinzel, serif' }}>
                {gameState.location}
              </h1>
              <div className="divider-ancient w-16" />
            </div>
            <div className="flex items-center gap-2 mt-2">
              <span className="text-[0.6rem] font-ancient tracking-[0.1em]" style={{ color: 'var(--text-dim)' }}>VITALITY</span>
              <div className="w-32 health-bar-track rounded-sm overflow-hidden" style={{ height: '6px' }}>
                <motion.div className={`h-full health-bar-fill ${(gameState.health || 100) > 50 ? 'healthy' : ''}`} animate={{ width: `${gameState.health || 100}%` }} transition={{ duration: 0.8 }} />
              </div>
              <span className="text-[0.6rem] font-ancient font-bold" style={{ color: (gameState.health || 100) > 50 ? 'var(--forest-light)' : 'var(--iron-red)' }}>
                {gameState.health || 100}%
              </span>
            </div>
            {gameState.world_map?.theme && (
              <p className="text-[0.55rem] mt-2 uppercase tracking-[0.18em] font-ancient text-center max-w-[540px]" style={{ color: 'var(--text-dim)' }}>
                {gameState.world_map.theme}
              </p>
            )}
            <div className="flex items-center gap-2 mt-2">
              <span className="badge-ancient">{DIFFICULTY_LABELS[difficulty]}</span>
              <span className="badge-ancient">{realmTheme === 'ashen-night' ? 'Ashen Night' : 'Sunlit Chronicle'}</span>
            </div>
          </div>

          <div className="flex flex-col items-end gap-3">
            <TopBtn icon={<RefreshCw size={13} />} label="Abandon Quest" onClick={handleReset} danger />
          </div>
        </div>

        <div className="absolute top-28 left-6 z-[60] flex flex-col gap-3">
          <button
            {...withSounds({ onClick: () => setCinematicMode(!cinematicMode) })}
            className="p-3 rounded-full shadow-2xl transition-all hover:scale-110 hover:rotate-12 backdrop-blur-md"
            style={{ background: 'rgba(8,6,3,0.7)', border: '2px solid var(--gold)', color: 'var(--gold)' }}
          >
            {cinematicMode ? <Eye size={24} /> : <EyeOff size={24} />}
          </button>
          <button
            {...withSounds({ onClick: () => setTomeOpen(!tomeOpen) })}
            className="p-3 rounded-full shadow-2xl transition-all hover:scale-110 backdrop-blur-md relative"
            style={{ background: 'rgba(8,6,3,0.7)', border: '2px solid var(--border-bright)', color: 'var(--text-parchment)' }}
          >
            <BookOpen size={24} />
            {((gameState.quests || []).length > 0 || gameState.quest_chain) && <div className="absolute top-0 right-0 w-3 h-3 bg-red-500 rounded-full border border-black animate-pulse" />}
          </button>
        </div>

        <div className="absolute top-4 right-4 z-[60] flex gap-3">
          <button
            {...withSounds({ onClick: () => setIsMapOpen(true) })}
            className="p-3 rounded-full shadow-2xl transition-all hover:scale-110 backdrop-blur-md relative"
            style={{ background: 'rgba(8,6,3,0.7)', border: '1px solid var(--border-stone)', color: 'var(--gold)' }}
          >
            <MapIcon size={20} />
            {gameState.world_map && <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full" style={{ background: 'var(--gold-bright)', boxShadow: '0 0 12px var(--glow-gold)' }} />}
          </button>
          <button
            {...withSounds({ onClick: () => setShowSettings(true) })}
            className="p-3 rounded-full shadow-2xl transition-all hover:scale-110 backdrop-blur-md"
            style={{ background: 'rgba(8,6,3,0.7)', border: '1px solid var(--border-stone)', color: 'var(--text-dim)' }}
          >
            <Swords size={20} />
          </button>
        </div>

        <div className="relative flex flex-1 overflow-hidden items-center justify-start bg-black">
          <motion.div
            animate={{
              width: cinematicMode && !chatOpen ? '100%' : cinematicMode && chatOpen ? '70%' : !cinematicMode && !chatOpen ? '90%' : '65%',
              height: cinematicMode ? '100%' : '80%',
              borderRadius: cinematicMode ? '0px' : '24px',
              marginLeft: cinematicMode ? '0px' : '5%',
            }}
            transition={{ duration: 0.8, ease: 'easeInOut' }}
            className="relative overflow-hidden shadow-[0_0_100px_rgba(0,0,0,1)] bg-[var(--bg-deepest)]"
          >
            <EnvironmentViewer location={gameState.location} isProcessing={isProcessing} dynamicScene={dynamicScene} />

            <AnimatePresence>
              {dynamicScene && (
                <motion.div
                  initial={{ opacity: 0, x: -18 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -18 }}
                  className="absolute top-6 left-6 max-w-md px-5 py-4 rounded-md shadow-2xl border"
                  style={{ background: 'rgba(15, 11, 6, 0.86)', borderColor: 'var(--border-gold)', color: 'var(--text-parchment)' }}
                >
                  <p className="text-[0.62rem] uppercase tracking-[0.2em] mb-1 flex items-center gap-2" style={{ color: 'var(--gold)' }}>
                    <Sparkles size={12} />
                    Live Scene Director
                  </p>
                  <p className="text-sm font-bold uppercase" style={{ color: 'var(--text-parchment)' }}>
                    {dynamicScene.turn_title}
                  </p>
                  <p className="text-sm mt-2 leading-relaxed" style={{ color: 'var(--text-faded)', fontFamily: 'Crimson Text, serif' }}>
                    {dynamicScene.world_shift}
                  </p>
                  <div className="mt-3 flex items-center gap-3">
                    <div className="flex-1">
                      <p className="text-[0.55rem] uppercase tracking-[0.14em] mb-1" style={{ color: 'var(--text-dim)' }}>
                        Tension
                      </p>
                      <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(30,20,10,0.8)' }}>
                        <motion.div
                          className="h-full"
                          animate={{ width: `${dynamicScene.tension || 0}%` }}
                          transition={{ duration: 0.7 }}
                          style={{
                            background: (dynamicScene.tension || 0) >= 70
                              ? 'linear-gradient(90deg, #7a1010, #d24724)'
                              : 'linear-gradient(90deg, #876229, #d1a049)',
                          }}
                        />
                      </div>
                    </div>
                    <span className="badge-ancient">Threat {dynamicScene.threat_level}/5</span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <AnimatePresence>
              {serviceBanner && (
                <motion.div
                  initial={{ opacity: 0, y: -14 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -14 }}
                  className="absolute top-6 right-6 max-w-md px-5 py-4 rounded-md shadow-2xl border"
                  style={{
                    background: serviceBanner.tone === 'critical' ? 'rgba(96, 22, 22, 0.92)' : 'rgba(82, 55, 11, 0.92)',
                    borderColor: serviceBanner.tone === 'critical' ? 'var(--blood)' : 'var(--gold-dim)',
                    color: '#f3e7c8',
                    fontFamily: 'Crimson Text, serif',
                  }}
                >
                  <p className="text-[0.65rem] uppercase tracking-[0.22em] mb-1" style={{ color: 'var(--gold)' }}>
                    Hosted Service Status
                  </p>
                  <p className="text-sm leading-relaxed whitespace-pre-line">
                    {serviceBanner.text.replace(/\*\*/g, '')}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>

            <AnimatePresence>
              {(isForgingWorld || forgeLoadingRegion) && (
                <motion.div
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 14 }}
                  className="absolute bottom-6 left-6 max-w-sm px-4 py-3 rounded-md shadow-2xl border"
                  style={{ background: 'rgba(20, 14, 8, 0.92)', borderColor: 'var(--border-gold)', color: 'var(--text-parchment)' }}
                >
                  <p className="text-[0.62rem] uppercase tracking-[0.2em] mb-1 flex items-center gap-2" style={{ color: 'var(--gold)' }}>
                    <Sparkles size={12} />
                    World-Forge Active
                  </p>
                  <p className="text-sm leading-relaxed" style={{ fontFamily: 'Crimson Text, serif' }}>
                    Forging map logic, regional quest chains, and memory threads for {forgeLoadingRegion || gameState.location}.
                  </p>
                </motion.div>
              )}
            </AnimatePresence>

            <AnimatePresence>
              {currentRegionIntel && (
                <motion.div
                  initial={{ opacity: 0, y: 18 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 18 }}
                  className="absolute bottom-6 right-6 max-w-md px-5 py-4 rounded-md shadow-2xl border"
                  style={{ background: 'rgba(15, 11, 6, 0.84)', borderColor: 'var(--border-stone)', color: 'var(--text-parchment)' }}
                >
                  <p className="text-[0.62rem] uppercase tracking-[0.18em] mb-1" style={{ color: 'var(--gold)' }}>
                    AI Region Focus
                  </p>
                  <p className="text-sm font-bold uppercase" style={{ color: 'var(--text-parchment)' }}>
                    {currentRegionIntel.region_title}
                  </p>
                  <p className="text-sm mt-2 leading-relaxed" style={{ color: 'var(--text-faded)', fontFamily: 'Crimson Text, serif' }}>
                    {currentRegionIntel.quest_hook}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>

            <AnimatePresence>
              {gameState.health_change_reason && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="absolute top-8 left-1/2 -translate-x-1/2 px-6 py-3 rounded text-sm font-lore italic shadow-2xl backdrop-blur-md"
                  style={{ background: 'rgba(139,32,32,0.8)', border: '1px solid var(--blood)', color: '#ffd0d0', fontFamily: 'Crimson Text, serif' }}
                >
                  {gameState.health_change_reason}
                </motion.div>
              )}
            </AnimatePresence>

            <AnimatePresence>
              {dynamicScene?.route_options?.length > 0 && !isProcessing && (
                <motion.div
                  initial={{ opacity: 0, y: 18 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 18 }}
                  className="absolute left-6 right-6 bottom-24 z-20 grid grid-cols-1 md:grid-cols-3 gap-3"
                >
                  {dynamicScene.route_options.map((route) => (
                    <button
                      key={route}
                      {...withSounds({ onClick: () => handlePlayerAction(route) })}
                      className="text-left px-4 py-3 rounded-md shadow-2xl transition-all hover:-translate-y-1"
                      style={{ background: 'rgba(12, 8, 5, 0.82)', border: '1px solid var(--border-stone)', color: 'var(--text-parchment)' }}
                    >
                      <p className="text-[0.58rem] uppercase tracking-[0.16em] mb-1" style={{ color: 'var(--gold)' }}>
                        Dynamic Route
                      </p>
                      <p className="text-sm leading-relaxed" style={{ fontFamily: 'Crimson Text, serif' }}>
                        {route}
                      </p>
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>

        <AnimatePresence>
          {tomeOpen && (
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="absolute top-0 left-0 h-full w-[430px] z-[70] flex flex-col shadow-[20px_0_50px_rgba(0,0,0,0.8)]"
              style={{ background: 'var(--bg-panel)', borderRight: '2px solid var(--border-gold)' }}
            >
              <div className="p-5 border-b flex items-center justify-between" style={{ borderColor: 'var(--border-stone)', background: 'rgba(8,6,3,0.9)' }}>
                <div className="flex items-center gap-3">
                  <BookOpen size={24} style={{ color: 'var(--gold)' }} />
                  <h2 className="text-xl font-black uppercase tracking-widest" style={{ color: 'var(--text-parchment)' }}>The Tome of Fates</h2>
                </div>
                <button {...withSounds({ onClick: () => setTomeOpen(false) })} className="hover:scale-110 transition-transform" style={{ color: 'var(--text-dim)' }}>
                  <X size={24} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-6">
                <div className="rounded-md p-4 ancient-panel">
                  <p className="text-[0.62rem] uppercase tracking-[0.18em] font-ancient mb-2 flex items-center gap-2" style={{ color: 'var(--gold)' }}>
                    <Sparkles size={13} />
                    World-Forge Summary
                  </p>
                  <p className="text-sm leading-relaxed" style={{ color: 'var(--text-faded)', fontFamily: 'Crimson Text, serif' }}>
                    {gameState.world_map?.world_summary || 'The world forge has not yet woven a campaign map for this save.'}
                  </p>
                  {gameState.world_map?.generated_via && (
                    <div className="mt-3 flex items-center justify-between gap-2">
                      <span className="badge-ancient">{gameState.world_map.generated_via}</span>
                      <span className="text-[0.62rem] uppercase tracking-[0.14em] font-ancient" style={{ color: 'var(--text-dim)' }}>
                        Active region: {gameState.active_region || gameState.location}
                      </span>
                    </div>
                  )}
                </div>

                <QuestPanel questChain={gameState.quest_chain} />

                <div className="divider-ancient" />

                <div className="rounded-md p-4 ancient-panel">
                  <p className="text-[0.62rem] uppercase tracking-[0.18em] font-ancient mb-2 flex items-center gap-2" style={{ color: 'var(--gold)' }}>
                    <ScrollText size={13} />
                    Dynamic Oracle State
                  </p>
                  <p className="text-sm font-bold uppercase" style={{ color: 'var(--text-parchment)' }}>
                    {dynamicScene.turn_title}
                  </p>
                  <p className="text-sm mt-2" style={{ color: 'var(--text-faded)', fontFamily: 'Crimson Text, serif' }}>
                    {dynamicScene.ambient_cue}
                  </p>
                  <div className="grid grid-cols-1 gap-2 mt-3 text-xs">
                    <div>
                      <p className="font-ancient uppercase mb-1" style={{ color: 'var(--text-dim)' }}>Objective Focus</p>
                      <p style={{ color: 'var(--text-parchment)', fontFamily: 'Crimson Text, serif' }}>{dynamicScene.objective_focus}</p>
                    </div>
                    <div>
                      <p className="font-ancient uppercase mb-1" style={{ color: 'var(--text-dim)' }}>Hazard</p>
                      <p style={{ color: '#e3b4b4', fontFamily: 'Crimson Text, serif' }}>{dynamicScene.hazard}</p>
                    </div>
                    <div className="flex flex-wrap gap-2 pt-1">
                      {(dynamicScene.cinematic_tags || []).map((tag) => (
                        <span key={tag} className="badge-ancient">{tag}</span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="divider-ancient" />

                <div>
                  <p className="text-xs font-ancient uppercase mb-4 flex items-center gap-2" style={{ color: 'var(--gold)', letterSpacing: '0.2em' }}>
                    <BrainCircuit size={14} /> Story Memory
                  </p>
                  <div className="rounded-md p-4 ancient-panel">
                    <p className="text-sm italic leading-relaxed" style={{ color: 'var(--text-faded)', fontFamily: 'Crimson Text, serif' }}>
                      {gameState.story_memory?.summary}
                    </p>
                    {recentFlags.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {recentFlags.map((flag) => (
                          <span key={flag} className="badge-ancient">{flag}</span>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="mt-4 space-y-3">
                    {chronicle.length === 0 ? (
                      <p className="text-sm italic" style={{ color: 'var(--text-dim)', fontFamily: 'Crimson Text, serif' }}>
                        No consequences have yet been written into the chronicle.
                      </p>
                    ) : (
                      chronicle.slice().reverse().map((entry) => (
                        <div key={`${entry.turn}-${entry.location}-${entry.action}`} className="rounded-md p-4 ancient-panel">
                          <div className="flex items-center justify-between gap-2">
                            <p className="text-[0.62rem] uppercase tracking-[0.18em] font-ancient" style={{ color: 'var(--gold)' }}>
                              Turn {entry.turn} · {entry.location}
                            </p>
                            <span className="badge-ancient">{(entry.tags || []).join(' · ')}</span>
                          </div>
                          <p className="text-sm mt-2" style={{ color: 'var(--text-parchment)', fontFamily: 'Crimson Text, serif' }}>
                            {entry.consequence}
                          </p>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                <div className="divider-ancient" />

                {currentRegionIntel && (
                  <div className="rounded-md p-4 ancient-panel">
                    <p className="text-xs font-ancient uppercase mb-3 flex items-center gap-2" style={{ color: 'var(--gold)', letterSpacing: '0.18em' }}>
                      <MapIcon size={14} /> Current Region Dossier
                    </p>
                    <p className="text-sm font-bold uppercase" style={{ color: 'var(--text-parchment)' }}>
                      {currentRegionIntel.region_title}
                    </p>
                    <p className="text-sm mt-2 italic" style={{ color: 'var(--text-faded)', fontFamily: 'Crimson Text, serif' }}>
                      {currentRegionIntel.current_state}
                    </p>
                    <div className="grid grid-cols-2 gap-3 mt-3 text-xs">
                      <div>
                        <p className="font-ancient uppercase mb-1" style={{ color: 'var(--text-dim)' }}>Relic</p>
                        <p style={{ color: 'var(--text-parchment)', fontFamily: 'Crimson Text, serif' }}>{currentRegionIntel.relic}</p>
                      </div>
                      <div>
                        <p className="font-ancient uppercase mb-1" style={{ color: 'var(--text-dim)' }}>Notable NPC</p>
                        <p style={{ color: 'var(--text-parchment)', fontFamily: 'Crimson Text, serif' }}>{currentRegionIntel.notable_npc}</p>
                      </div>
                    </div>
                  </div>
                )}

                <div className="divider-ancient" />

                <div>
                  <p className="text-xs font-ancient uppercase mb-4 flex items-center gap-2" style={{ color: 'var(--text-dim)', letterSpacing: '0.2em' }}>
                    <Backpack size={14} /> Satchel
                  </p>
                  {(gameState.inventory || []).length === 0 ? (
                    <p className="text-sm italic" style={{ color: 'var(--text-dim)', fontFamily: 'Crimson Text, serif' }}>Thy satchel is empty...</p>
                  ) : (
                    <div className="grid grid-cols-2 gap-2">
                      {(gameState.inventory || []).map((item, index) => (
                        <div key={index} className="text-sm p-2 flex items-center gap-2 rounded bg-black/40 border border-stone-800">
                          <span style={{ color: 'var(--gold)' }}>◆</span>
                          <span style={{ color: 'var(--text-faded)', fontFamily: 'Crimson Text, serif' }}>{item}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="divider-ancient" />

                <div>
                  <p className="text-xs font-ancient mb-3" style={{ color: 'var(--text-dim)', letterSpacing: '0.15em' }}>KNOWN THREATS</p>
                  {(locData?.threats || []).map((threat, index) => (
                    <p key={index} className="text-sm mb-1.5 flex items-center gap-2" style={{ color: 'var(--iron-red)', fontFamily: 'Crimson Text, serif' }}>
                      <Swords size={12} /> {threat}
                    </p>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {tomeOpen && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/60 z-[65] pointer-events-none" />
          )}
        </AnimatePresence>

        <AnimatePresence>
          {isMapOpen && (
            <FullMap
              currentLocationName={gameState.location}
              onClose={() => setIsMapOpen(false)}
              regionIntelByName={regionIntelByName}
              currentQuestChain={gameState.quest_chain}
              onForgeRegion={handleForgeRegion}
              forgeLoadingRegion={forgeLoadingRegion}
              onNarrateRegion={handleNarrateRegion}
            />
          )}
        </AnimatePresence>

        <ChatPanel
          isOpen={chatOpen}
          onToggle={setChatOpen}
          history={chatHistory}
          onSend={handlePlayerAction}
          isProcessing={isProcessing}
          characterName={character?.name}
          characterImage={character?.image}
          characterFilter={character?.fantasyFilter}
          serviceBanner={serviceBanner}
          dynamicScene={dynamicScene}
        />

        <SettingsPanel
          isOpen={showSettings}
          onClose={() => setShowSettings(false)}
          volume={volume}
          setVolume={setVolume}
          muted={muted}
          setMuted={setMuted}
          brightness={brightness}
          setBrightness={setBrightness}
          onOpenHelp={() => setShowHelp(true)}
          difficulty={difficulty}
          setDifficulty={setDifficulty}
          realmTheme={realmTheme}
          setRealmTheme={setRealmTheme}
          narrationEnabled={narrationEnabled}
          setNarrationEnabled={setNarrationEnabled}
          voiceVolume={voiceVolume}
          setVoiceVolume={setVoiceVolume}
          selectedVoiceName={selectedVoiceName}
        />

        <HelpModal
          isOpen={showHelp}
          onClose={() => setShowHelp(false)}
          onLogin={(profile) => {
            handleLogin(profile);
            setShowHelp(false);
          }}
        />
      </div>
    );
  };

  return (
    <>
      <AudioManager atmosphere={atmosphere} volume={volume} muted={muted} />
      {renderScreen()}
    </>
  );
}

const TopBtn = ({ icon, label, onClick, danger }) => {
  const { withSounds } = useUISounds();
  return (
    <button
      {...withSounds({ onClick })}
      className="flex items-center gap-1.5 px-3 py-2 text-xs font-ancient uppercase transition-all hover:opacity-80 rounded-sm"
      style={{
        background: danger ? 'rgba(139,32,32,0.2)' : 'var(--bg-card)',
        border: `1px solid ${danger ? 'var(--blood)' : 'var(--border-stone)'}`,
        color: danger ? 'var(--iron-red)' : 'var(--text-faded)',
        letterSpacing: '0.08em',
        fontSize: '0.6rem',
      }}
    >
      {icon} {label}
    </button>
  );
};

export default App;
