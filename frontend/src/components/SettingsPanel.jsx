import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Volume2, VolumeX, Sun, HelpCircle, Lock, Eye, EyeOff, Settings } from 'lucide-react';

const DEV_PASSWORD = '0134';

const SettingsPanel = ({ isOpen, onClose, volume, setVolume, muted, setMuted, brightness, setBrightness, onOpenHelp }) => {
  const [devMode, setDevMode] = useState(false);
  const [pwInput, setPwInput] = useState('');
  const [pwError, setPwError] = useState(false);
  const [showPw, setShowPw] = useState(false);
  const [apiKeyInput, setApiKeyInput] = useState(localStorage.getItem('GEMINI_API_KEY') || '');
  const [apiSaved, setApiSaved] = useState(false);

  const handleDevLogin = () => {
    if (pwInput === DEV_PASSWORD) {
      setDevMode(true);
      setPwError(false);
    } else {
      setPwError(true);
      setPwInput('');
    }
  };

  const handleSaveApi = () => {
    localStorage.setItem('GEMINI_API_KEY', apiKeyInput);
    setApiSaved(true);
    setTimeout(() => setApiSaved(false), 2000);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] bg-black/70 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Panel Drawer */}
          <motion.div
            initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 200 }}
            className="fixed right-0 top-0 bottom-0 z-[201] w-[380px] overflow-y-auto"
            style={{ background: 'var(--bg-panel)', borderLeft: '1px solid var(--border-stone)' }}
            onClick={e => e.stopPropagation()}
          >
            {/* Parchment texture overlay */}
            <div className="absolute inset-0 opacity-20 pointer-events-none parchment-texture" />

            {/* Header */}
            <div className="relative p-6 border-b" style={{ borderColor: 'var(--border-stone)' }}>
              <div className="absolute top-0 left-0 right-0 h-0.5"
                style={{ background: 'linear-gradient(90deg, transparent, var(--gold), transparent)' }} />
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="font-ancient text-lg font-bold" style={{ color: 'var(--gold)' }}>
                    ⚙ The Council Chamber
                  </h2>
                  <p className="text-xs mt-0.5 font-lore italic" style={{ color: 'var(--text-faded)' }}>
                    Adjust the parameters of thy realm
                  </p>
                </div>
                <button onClick={onClose}
                  className="p-2 rounded transition-colors hover:opacity-80"
                  style={{ background: 'var(--bg-card)', border: '1px solid var(--border-stone)', color: 'var(--text-faded)' }}
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            <div className="relative p-6 space-y-7">

              {/* ── SOUND VOLUME ── */}
              <SettingSection icon={<Volume2 size={18} />} title="The Voice of the Realm" sub="Adjust ambient orchestral volume">
                <div className="flex items-center gap-4 mt-3">
                  <button onClick={() => setMuted(!muted)}
                    className="p-2 rounded transition-all"
                    style={{ background: muted ? 'var(--blood)' : 'var(--bg-card)', border: `1px solid ${muted ? 'var(--iron-red)' : 'var(--border-stone)'}`, color: muted ? '#e06060' : 'var(--gold)' }}
                  >
                    {muted ? <VolumeX size={18} /> : <Volume2 size={18} />}
                  </button>
                  <div className="flex-1">
                    <input
                      type="range" min="0" max="1" step="0.05"
                      value={muted ? 0 : volume}
                      onChange={e => { setVolume(parseFloat(e.target.value)); if (muted) setMuted(false); }}
                      className="w-full ancient-volume-slider"
                      style={{ accentColor: 'var(--gold)' }}
                    />
                    <div className="flex justify-between text-xs mt-1" style={{ color: 'var(--text-dim)', fontFamily: 'Cinzel, serif' }}>
                      <span>Silence</span>
                      <span>{Math.round((muted ? 0 : volume) * 100)}%</span>
                      <span>Full</span>
                    </div>
                  </div>
                </div>
              </SettingSection>

              <Divider />

              {/* ── BRIGHTNESS ── */}
              <SettingSection icon={<Sun size={18} />} title="The Light of Aethel" sub="Adjust realm visibility">
                <div className="mt-3">
                  <input
                    type="range" min="0.3" max="1.2" step="0.05"
                    value={brightness}
                    onChange={e => { setBrightness(parseFloat(e.target.value)); }}
                    className="w-full"
                    style={{ accentColor: 'var(--gold-bright)' }}
                  />
                  <div className="flex justify-between text-xs mt-1" style={{ color: 'var(--text-dim)', fontFamily: 'Cinzel, serif' }}>
                    <span>Dark</span>
                    <span>{Math.round(brightness * 100)}%</span>
                    <span>Bright</span>
                  </div>
                </div>
              </SettingSection>

              <Divider />

              {/* ── HELP ── */}
              <SettingSection icon={<HelpCircle size={18} />} title="Seek the Gate Keeper" sub="Guidance on entering the realm">
                <button onClick={onOpenHelp} className="btn-ancient w-full py-3 px-4 mt-3 rounded text-sm">
                  Open the Book of Guidance
                </button>
              </SettingSection>

              <Divider />

              {/* ── DEVELOPER SECRETS ── */}
              <SettingSection
                icon={<Lock size={18} />}
                title="Ancient Secrets"
                sub="Restricted — speak the password of the Architect"
              >
                {!devMode ? (
                  <div className="mt-3 space-y-3">
                    <div className="relative">
                      <input
                        type={showPw ? 'text' : 'password'}
                        value={pwInput}
                        onChange={e => { setPwInput(e.target.value); setPwError(false); }}
                        onKeyDown={e => e.key === 'Enter' && handleDevLogin()}
                        placeholder="Speak the ancient word..."
                        className="input-ancient w-full px-4 py-3 text-sm rounded pr-10"
                        style={{ letterSpacing: '0.3em' }}
                      />
                      <button onClick={() => setShowPw(!showPw)}
                        className="absolute right-3 top-1/2 -translate-y-1/2"
                        style={{ color: 'var(--text-dim)' }}
                      >
                        {showPw ? <EyeOff size={14} /> : <Eye size={14} />}
                      </button>
                    </div>
                    {pwError && (
                      <p className="text-xs italic" style={{ color: 'var(--iron-red)' }}>
                        The realm denies thee entry. Wrong password.
                      </p>
                    )}
                    <button onClick={handleDevLogin} className="btn-danger btn-ancient w-full py-2.5 rounded text-sm">
                      Invoke the Architect's Key
                    </button>
                  </div>
                ) : (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-3 space-y-3">
                    <div className="px-3 py-2 rounded text-xs font-bold"
                      style={{ background: 'rgba(139,32,32,0.2)', border: '1px solid var(--blood)', color: 'var(--iron-red)', fontFamily: 'Cinzel, serif' }}>
                      ⚠ Architect Mode Active
                    </div>
                    <div>
                      <label className="block text-xs mb-1.5 font-ancient uppercase" style={{ color: 'var(--text-faded)', letterSpacing: '0.1em' }}>
                        Gemini Oracle Key
                      </label>
                      <input
                        type="password"
                        value={apiKeyInput}
                        onChange={e => setApiKeyInput(e.target.value)}
                        placeholder="AIzaSy..."
                        className="input-ancient w-full px-4 py-3 text-sm rounded font-mono"
                      />
                    </div>
                    <button onClick={handleSaveApi}
                      className="btn-ancient w-full py-3 rounded"
                      style={apiSaved ? { background: 'var(--forest-deep)', borderColor: 'var(--forest-light)', color: '#6aaa6a' } : {}}
                    >
                      {apiSaved ? '✓ Key Sealed in the Vault' : 'Seal the Key'}
                    </button>
                    <a href="https://aistudio.google.com/" target="_blank" rel="noreferrer"
                      className="block text-center text-xs hover:underline"
                      style={{ color: 'var(--text-dim)', fontFamily: 'Cinzel, serif' }}
                    >
                      Obtain an Oracle Key →
                    </a>
                  </motion.div>
                )}
              </SettingSection>

            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

const SettingSection = ({ icon, title, sub, children }) => (
  <div>
    <div className="flex items-center gap-2 mb-0.5">
      <span style={{ color: 'var(--gold)' }}>{icon}</span>
      <h3 className="font-ancient font-bold text-sm" style={{ color: 'var(--text-parchment)' }}>{title}</h3>
    </div>
    <p className="text-xs font-lore italic ml-7" style={{ color: 'var(--text-dim)' }}>{sub}</p>
    {children}
  </div>
);

const Divider = () => (
  <div className="divider-ancient" />
);

// ── ALWAYS-VISIBLE SETTINGS BUTTON ──
export const SettingsButton = ({ onClick }) => (
  <button
    id="settings-btn"
    onClick={onClick}
    title="The Council Chamber"
    className="fixed top-4 right-4 z-[150] flex items-center gap-2 px-3 py-2 rounded transition-all hover:scale-105"
    style={{
      background: 'var(--bg-panel)',
      border: '1px solid var(--border-gold)',
      color: 'var(--gold)',
      boxShadow: '0 0 15px rgba(201,168,76,0.15)',
      fontFamily: 'Cinzel, serif',
      fontSize: '0.65rem',
      letterSpacing: '0.1em',
    }}
  >
    <Settings size={14} />
    <span className="hidden sm:inline uppercase">Settings</span>
  </button>
);

export default SettingsPanel;
