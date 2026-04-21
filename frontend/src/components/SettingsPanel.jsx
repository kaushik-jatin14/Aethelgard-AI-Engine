import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Volume2, VolumeX, Sun, HelpCircle, Server, Settings } from 'lucide-react';

const SettingsPanel = ({ isOpen, onClose, volume, setVolume, muted, setMuted, brightness, setBrightness, onOpenHelp }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] bg-black/70 backdrop-blur-sm"
            onClick={onClose}
          />

          <motion.div
            initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 200 }}
            className="fixed right-0 top-0 bottom-0 z-[201] w-[380px] overflow-y-auto"
            style={{ background: 'var(--bg-panel)', borderLeft: '1px solid var(--border-stone)' }}
            onClick={(event) => event.stopPropagation()}>
            <div className="absolute inset-0 opacity-20 pointer-events-none parchment-texture" />

            <div className="relative p-6 border-b" style={{ borderColor: 'var(--border-stone)' }}>
              <div className="absolute top-0 left-0 right-0 h-0.5"
                style={{ background: 'linear-gradient(90deg, transparent, var(--gold), transparent)' }} />
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="font-ancient text-lg font-bold" style={{ color: 'var(--gold)' }}>
                    The Council Chamber
                  </h2>
                  <p className="text-xs mt-0.5 font-lore italic" style={{ color: 'var(--text-faded)' }}>
                    Adjust the realm and review hosted service guidance
                  </p>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 rounded transition-colors hover:opacity-80"
                  style={{ background: 'var(--bg-card)', border: '1px solid var(--border-stone)', color: 'var(--text-faded)' }}>
                  <X size={18} />
                </button>
              </div>
            </div>

            <div className="relative p-6 space-y-7">
              <SettingSection icon={<Volume2 size={18} />} title="The Voice of the Realm" sub="Adjust ambient orchestral volume">
                <div className="flex items-center gap-4 mt-3">
                  <button
                    onClick={() => setMuted(!muted)}
                    className="p-2 rounded transition-all"
                    style={{
                      background: muted ? 'var(--blood)' : 'var(--bg-card)',
                      border: `1px solid ${muted ? 'var(--iron-red)' : 'var(--border-stone)'}`,
                      color: muted ? '#e06060' : 'var(--gold)',
                    }}>
                    {muted ? <VolumeX size={18} /> : <Volume2 size={18} />}
                  </button>
                  <div className="flex-1">
                    <input
                      type="range" min="0" max="1" step="0.05"
                      value={muted ? 0 : volume}
                      onChange={(event) => {
                        setVolume(parseFloat(event.target.value));
                        if (muted) setMuted(false);
                      }}
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

              <SettingSection icon={<Sun size={18} />} title="The Light of Aethel" sub="Adjust realm visibility">
                <div className="mt-3">
                  <input
                    type="range" min="0.3" max="1.2" step="0.05"
                    value={brightness}
                    onChange={(event) => setBrightness(parseFloat(event.target.value))}
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

              <SettingSection icon={<HelpCircle size={18} />} title="Seek the Gate Keeper" sub="Guidance on entering the realm">
                <button onClick={onOpenHelp} className="btn-ancient w-full py-3 px-4 mt-3 rounded text-sm">
                  Open the Book of Guidance
                </button>
              </SettingSection>

              <Divider />

              <SettingSection icon={<Server size={18} />} title="Hosted Oracle Service" sub="AI access is managed by the server for every traveler">
                <div className="mt-3 p-4 rounded-md" style={{ background: 'rgba(201,168,76,0.08)', border: '1px solid var(--border-gold)' }}>
                  <p className="text-sm leading-relaxed" style={{ color: 'var(--text-parchment)', fontFamily: 'Crimson Text, serif' }}>
                    End users do not need to paste API keys or start extra local services. If the Oracle or Gate Keeper is unavailable, the realm will show a hosted service warning instead of asking for a device-specific key.
                  </p>
                </div>
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
    }}>
    <Settings size={14} />
    <span className="hidden sm:inline uppercase">Settings</span>
  </button>
);

export default SettingsPanel;
