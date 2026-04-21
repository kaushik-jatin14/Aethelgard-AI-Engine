import React, { useEffect, useState } from 'react';
import { RefreshCw, MapIcon, X, Swords, Backpack, ScrollText, Eye, EyeOff, BookOpen } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import EnvironmentViewer from './components/EnvironmentViewer';
import FullMap from './components/FullMap';
import ChatPanel from './components/ChatPanel';
import CharacterSelect from './components/CharacterSelect';
import LoginScreen from './components/LoginScreen';
import SettingsPanel, { SettingsButton } from './components/SettingsPanel';
import HelpModal from './components/HelpModal';
import AudioManager from './components/AudioManager';
import { generateGameAction } from './services/gemini';
import { locations } from './data/locations';
import { useUISounds } from './hooks/useUISounds';

const INITIAL_GAME_STATE = { location: 'The Nexus Point', inventory: [], health: 100, quests: [] };

const buildServiceNotice = (error, channel = 'oracle') => {
  const title = channel === 'gatekeeper' ? 'The Gate Keeper is unavailable.' : 'The Oracle is unavailable.';
  const detail = error?.message || 'The hosted AI service could not complete this request.';
  const retryLine = error?.retryable === false
    ? 'A server-side configuration fix is required before this can work again.'
    : 'Please try again in a moment.';

  return `**${title}**\n\n${detail}\n\n${retryLine}`;
};

function App() {
  const [appState, setAppState] = useState('LOGIN');
  const [userProfile, setUserProfile] = useState(null);
  const [character, setCharacter] = useState(null);
  const [gameState, setGameState] = useState(INITIAL_GAME_STATE);
  const [chatHistory, setChatHistory] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isMapOpen, setIsMapOpen] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [volume, setVolume] = useState(0.6);
  const [muted, setMuted] = useState(false);
  const [brightness, setBrightness] = useState(1.0);
  const [cinematicMode, setCinematicMode] = useState(true);
  const [tomeOpen, setTomeOpen] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [serviceBanner, setServiceBanner] = useState(null);
  const { withSounds } = useUISounds();

  useEffect(() => {
    document.documentElement.style.filter = `brightness(${brightness})`;
  }, [brightness]);

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

  const handleLogin = (profile) => setUserProfile(profile);

  const handleSelectCharacter = async (char) => {
    setServiceBanner(null);
    setCharacter(char);
    setAppState('PLAYING');
    setIsProcessing(true);
    setChatHistory([]);

    const startLoc = char.startLocation || 'The Nexus Point';
    const initial = {
      location: startLoc,
      inventory: [char.weapon, 'Ancient Rations', 'Healing Draught'],
      health: 100,
      quests: [{ id: 'q0', title: 'The Awakening', description: char.mission, status: 'active' }],
    };

    setGameState(initial);

    try {
      const res = await generateGameAction(
        `I am ${char.name}, ${char.title}. I have arrived at ${startLoc} for the first time. Greet me with the ancient oracle's opening narration.`,
        initial,
        char
      );
      setChatHistory([{ role: 'gm', text: res.narrative }]);
      if (res.new_state) setGameState(res.new_state);
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
  };

  const handlePlayerAction = async (action) => {
    setServiceBanner(null);
    const updated = [...chatHistory, { role: 'player', text: action }];
    setChatHistory(updated);
    setIsProcessing(true);

    try {
      const res = await generateGameAction(action, gameState, character);
      setChatHistory([...updated, { role: 'gm', text: res.narrative }]);
      if (res.new_state) setGameState(res.new_state);
    } catch (error) {
      const notice = buildServiceNotice(error, 'oracle');
      setServiceBanner({
        tone: error?.retryable === false ? 'critical' : 'warning',
        text: notice,
      });
      setChatHistory([...updated, { role: 'gm', text: notice }]);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReset = () => {
    setAppState('LOGIN');
    setUserProfile(null);
    setCharacter(null);
    setGameState(INITIAL_GAME_STATE);
    setChatHistory([]);
    setIsMapOpen(false);
    setServiceBanner(null);
  };

  const locData = locations.find((location) => location.name === gameState.location) || locations[0];
  let atmosphere = 'terrifying';
  if (appState === 'LOGIN' || appState === 'CHAR_SELECT') {
    atmosphere = 'epic';
  } else {
    atmosphere = locData?.atmosphere || 'terrifying';
  }

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
              <img src={character?.image} className="w-full h-full object-cover object-top" style={{ filter: character?.gender === 'female' ? character?.fantasyFilter : '' }} />
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
                <motion.div className={`h-full health-bar-fill ${(gameState.health || 100) > 50 ? 'healthy' : ''}`}
                  animate={{ width: `${gameState.health || 100}%` }} transition={{ duration: 0.8 }} />
              </div>
              <span className="text-[0.6rem] font-ancient font-bold" style={{ color: (gameState.health || 100) > 50 ? 'var(--forest-light)' : 'var(--iron-red)' }}>
                {gameState.health || 100}%
              </span>
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
            style={{ background: 'rgba(8,6,3,0.7)', border: '2px solid var(--gold)', color: 'var(--gold)' }}>
            {cinematicMode ? <Eye size={24} /> : <EyeOff size={24} />}
          </button>
          <button
            {...withSounds({ onClick: () => setTomeOpen(!tomeOpen) })}
            className="p-3 rounded-full shadow-2xl transition-all hover:scale-110 backdrop-blur-md relative"
            style={{ background: 'rgba(8,6,3,0.7)', border: '2px solid var(--border-bright)', color: 'var(--text-parchment)' }}>
            <BookOpen size={24} />
            {(gameState.quests || []).length > 0 && <div className="absolute top-0 right-0 w-3 h-3 bg-red-500 rounded-full border border-black animate-pulse" />}
          </button>
        </div>

        <div className="absolute top-4 right-4 z-[60] flex gap-3">
          <button
            {...withSounds({ onClick: () => setIsMapOpen(true) })}
            className="p-3 rounded-full shadow-2xl transition-all hover:scale-110 backdrop-blur-md"
            style={{ background: 'rgba(8,6,3,0.7)', border: '1px solid var(--border-stone)', color: 'var(--gold)' }}>
            <MapIcon size={20} />
          </button>
          <button
            {...withSounds({ onClick: () => setShowSettings(true) })}
            className="p-3 rounded-full shadow-2xl transition-all hover:scale-110 backdrop-blur-md"
            style={{ background: 'rgba(8,6,3,0.7)', border: '1px solid var(--border-stone)', color: 'var(--text-dim)' }}>
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
            className="relative overflow-hidden shadow-[0_0_100px_rgba(0,0,0,1)] bg-[var(--bg-deepest)]">
            <EnvironmentViewer location={gameState.location} isProcessing={isProcessing} />

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
                  }}>
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
              {gameState.health_change_reason && (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                  className="absolute top-8 left-1/2 -translate-x-1/2 px-6 py-3 rounded text-sm font-lore italic shadow-2xl backdrop-blur-md"
                  style={{ background: 'rgba(139,32,32,0.8)', border: '1px solid var(--blood)', color: '#ffd0d0', fontFamily: 'Crimson Text, serif' }}>
                  {gameState.health_change_reason}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>

        <AnimatePresence>
          {tomeOpen && (
            <motion.div initial={{ x: '-100%' }} animate={{ x: 0 }} exit={{ x: '-100%' }} transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="absolute top-0 left-0 h-full w-[400px] z-[70] flex flex-col shadow-[20px_0_50px_rgba(0,0,0,0.8)]"
              style={{ background: 'var(--bg-panel)', borderRight: '2px solid var(--border-gold)' }}>
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
                <div>
                  <p className="text-xs font-ancient uppercase mb-4 flex items-center gap-2" style={{ color: 'var(--gold)', letterSpacing: '0.2em' }}>
                    <ScrollText size={14} /> Active Quests
                  </p>
                  {(gameState.quests || []).length === 0 ? (
                    <p className="text-sm italic" style={{ color: 'var(--text-dim)', fontFamily: 'Crimson Text, serif' }}>The pages are blank...</p>
                  ) : (
                    (gameState.quests || []).map((quest, index) => (
                      <div key={quest.id || index} className="mb-3 p-4 rounded-md shadow-inner" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-stone)' }}>
                        <p className="text-sm font-ancient font-bold uppercase tracking-wider" style={{ color: 'var(--text-parchment)' }}>{quest.title}</p>
                        <p className="text-sm italic mt-2 leading-relaxed" style={{ color: 'var(--text-dim)', fontFamily: 'Crimson Text, serif' }}>{quest.description}</p>
                        <span className="mt-3 inline-block badge-ancient text-xs">{quest.status}</span>
                      </div>
                    ))
                  )}
                </div>

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
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60 z-[65] pointer-events-none" />
          )}
        </AnimatePresence>

        <AnimatePresence>
          {isMapOpen && (
            <FullMap currentLocationName={gameState.location} onClose={() => setIsMapOpen(false)} />
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
    <button {...withSounds({ onClick })}
      className="flex items-center gap-1.5 px-3 py-2 text-xs font-ancient uppercase transition-all hover:opacity-80 rounded-sm"
      style={{
        background: danger ? 'rgba(139,32,32,0.2)' : 'var(--bg-card)',
        border: `1px solid ${danger ? 'var(--blood)' : 'var(--border-stone)'}`,
        color: danger ? 'var(--iron-red)' : 'var(--text-faded)',
        letterSpacing: '0.08em',
        fontSize: '0.6rem',
      }}>
      {icon} {label}
    </button>
  );
};

export default App;
