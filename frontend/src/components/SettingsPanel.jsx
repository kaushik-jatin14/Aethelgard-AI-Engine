import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Volume2, VolumeX, Sun, HelpCircle, Server, Settings, MoonStar, ShieldAlert, Mic2 } from 'lucide-react';

const difficultyOptions = [
  { id: 'pilgrims-grace', label: "Pilgrim's Grace", sub: 'Merciful hints, kinder battles, steadier recovery.' },
  { id: 'wardens-trial', label: "Warden's Trial", sub: 'Balanced danger for most travelers.' },
  { id: 'abyssforged-doom', label: 'Abyssforged Doom', sub: 'Sharper costs, fiercer enemies, harsher turns.' },
];

const realmThemes = [
  { id: 'ashen-night', label: 'Moonsteel Court', icon: MoonStar, sub: 'High-contrast obsidian, silver, and storm-cyan for the core fantasy mood.' },
  { id: 'sunlit-chronicle', label: 'Ivory Chronicle', icon: Sun, sub: 'A bright ceremonial version with cleaner distance readability.' },
];

const SettingsPanel = ({
  isOpen,
  onClose,
  volume,
  setVolume,
  muted,
  setMuted,
  brightness,
  setBrightness,
  onOpenHelp,
  difficulty,
  setDifficulty,
  realmTheme,
  setRealmTheme,
  narrationEnabled,
  setNarrationEnabled,
  voiceVolume,
  setVoiceVolume,
  selectedVoiceName,
  onTestNarration,
}) => {
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
                      color: muted ? '#ffd7df' : 'var(--gold)',
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
                    <div className="flex justify-between text-xs mt-1" style={{ color: 'var(--text-dim)', fontFamily: 'var(--font-ui)' }}>
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
                    type="range" min="0.7" max="1.35" step="0.05"
                    value={brightness}
                    onChange={(event) => setBrightness(parseFloat(event.target.value))}
                    className="w-full"
                    style={{ accentColor: 'var(--gold-bright)' }}
                  />
                  <div className="flex justify-between text-xs mt-1" style={{ color: 'var(--text-dim)', fontFamily: 'var(--font-ui)' }}>
                    <span>Dark</span>
                    <span>{Math.round(brightness * 100)}%</span>
                    <span>Bright</span>
                  </div>
                </div>
              </SettingSection>

              <Divider />

              <SettingSection icon={<MoonStar size={18} />} title="Realm Aspect" sub="Choose the premium grade that best fits the room, projector, and distance">
                <div className="grid grid-cols-1 gap-3 mt-3">
                  {realmThemes.map((theme) => {
                    const Icon = theme.icon;
                    const active = realmTheme === theme.id;
                    return (
                      <button
                        key={theme.id}
                        onClick={() => setRealmTheme(theme.id)}
                        className="text-left rounded-md px-4 py-3 transition-all"
                        style={{
                          background: active ? 'rgba(113,220,245,0.12)' : 'var(--bg-card)',
                          border: `1px solid ${active ? 'var(--gold)' : 'var(--border-stone)'}`,
                          color: active ? 'var(--gold-bright)' : 'var(--text-parchment)',
                        }}>
                        <div className="flex items-center gap-3">
                          <Icon size={16} style={{ color: active ? 'var(--gold)' : 'var(--text-dim)' }} />
                          <div>
                            <p className="font-ancient text-xs uppercase tracking-[0.12em]">{theme.label}</p>
                            <p className="text-xs mt-1 font-lore italic" style={{ color: 'var(--text-dim)' }}>{theme.sub}</p>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </SettingSection>

              <Divider />

              <SettingSection icon={<ShieldAlert size={18} />} title="Trial Severity" sub="Set how merciful or brutal the Oracle's campaign should feel">
                <div className="grid grid-cols-1 gap-3 mt-3">
                  {difficultyOptions.map((option) => {
                    const active = difficulty === option.id;
                    return (
                      <button
                        key={option.id}
                        onClick={() => setDifficulty(option.id)}
                        className="text-left rounded-md px-4 py-3 transition-all"
                        style={{
                          background: active ? 'rgba(113,220,245,0.12)' : 'var(--bg-card)',
                          border: `1px solid ${active ? 'var(--gold)' : 'var(--border-stone)'}`,
                          color: active ? 'var(--gold-bright)' : 'var(--text-parchment)',
                        }}>
                        <p className="font-ancient text-xs uppercase tracking-[0.12em]">{option.label}</p>
                        <p className="text-xs mt-1 font-lore italic" style={{ color: 'var(--text-dim)' }}>{option.sub}</p>
                      </button>
                    );
                  })}
                </div>
              </SettingSection>

              <Divider />

              <SettingSection icon={<Mic2 size={18} />} title="Oracle Voicebinding" sub="Let thy champion speak narrations, map lore, warnings, and quest calls aloud">
                <div className="flex items-center gap-4 mt-3">
                  <button
                    onClick={() => setNarrationEnabled(!narrationEnabled)}
                    className="p-2 rounded transition-all"
                    style={{
                      background: narrationEnabled ? 'rgba(30,61,30,0.5)' : 'var(--bg-card)',
                      border: `1px solid ${narrationEnabled ? 'var(--forest-light)' : 'var(--border-stone)'}`,
                      color: narrationEnabled ? 'var(--forest-light)' : 'var(--text-dim)',
                    }}>
                    <Mic2 size={18} />
                  </button>
                  <div className="flex-1">
                    <p className="text-sm font-ancient" style={{ color: 'var(--text-parchment)' }}>
                      {narrationEnabled ? 'Voicebinding active' : 'Voicebinding silent'}
                    </p>
                    <p className="text-xs mt-1 font-lore italic" style={{ color: 'var(--text-dim)' }}>
                      Current voice: {selectedVoiceName}
                    </p>
                  </div>
                </div>
                <div className="mt-4">
                  <input
                    type="range" min="0.2" max="1" step="0.05"
                    value={voiceVolume}
                    onChange={(event) => setVoiceVolume(parseFloat(event.target.value))}
                    className="w-full ancient-volume-slider"
                    style={{ accentColor: 'var(--gold)' }}
                  />
                  <div className="flex justify-between text-xs mt-1" style={{ color: 'var(--text-dim)', fontFamily: 'var(--font-ui)' }}>
                    <span>Low</span>
                    <span>{Math.round(voiceVolume * 100)}%</span>
                    <span>Grand</span>
                  </div>
                </div>
                <button onClick={onTestNarration} className="btn-ancient mt-4 w-full py-3 px-4 rounded text-sm">
                  Test Oracle Voice
                </button>
              </SettingSection>

              <Divider />

              <SettingSection icon={<HelpCircle size={18} />} title="Seek the Gate Keeper" sub="Guidance on entering the realm">
                <button onClick={onOpenHelp} className="btn-ancient w-full py-3 px-4 mt-3 rounded text-sm">
                  Open the Book of Guidance
                </button>
              </SettingSection>

              <Divider />

              <SettingSection icon={<Server size={18} />} title="Hosted Oracle Service" sub="AI access is managed by the server for every traveler">
                <div className="mt-3 p-4 rounded-md" style={{ background: 'rgba(113,220,245,0.08)', border: '1px solid var(--border-gold)' }}>
                  <p className="text-sm leading-relaxed" style={{ color: 'var(--text-parchment)', fontFamily: 'var(--font-body)' }}>
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
    data-tooltip="Open settings"
    className="tooltip-shell fixed top-4 right-4 z-[150] flex items-center gap-2 px-3 py-2 rounded transition-all hover:scale-105"
    style={{
      background: 'var(--bg-panel)',
      border: '1px solid var(--border-gold)',
      color: 'var(--gold)',
      boxShadow: '0 0 15px rgba(113,220,245,0.15)',
      fontFamily: 'var(--font-ui)',
      fontSize: '0.65rem',
      letterSpacing: '0.1em',
    }}>
    <Settings size={14} />
    <span className="hidden sm:inline uppercase">Settings</span>
  </button>
);

export default SettingsPanel;

