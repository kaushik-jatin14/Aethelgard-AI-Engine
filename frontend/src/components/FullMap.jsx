import React, { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Skull, Users, Mountain, ZoomIn, ZoomOut, Maximize, Sparkles, ScrollText } from 'lucide-react';
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch';
import { locations } from '../data/locations';

const atmosphereMeta = {
  mystical: { dot: '#60a5fa', glow: '0 0 18px rgba(96,165,250,0.9)', tag: '#1e3a6e' },
  scary: { dot: '#ef4444', glow: '0 0 18px rgba(239,68,68,0.9)', tag: '#5a1010' },
  dark: { dot: '#94a3b8', glow: '0 0 12px rgba(148,163,184,0.7)', tag: '#2a2a3a' },
  desolate: { dot: '#9ca3af', glow: '0 0 10px rgba(156,163,175,0.5)', tag: '#1e1e2a' },
  adventurous: { dot: '#f59e0b', glow: '0 0 18px rgba(245,158,11,0.9)', tag: '#4a3000' },
  soothing: { dot: '#34d399', glow: '0 0 18px rgba(52,211,153,0.9)', tag: '#0a3a1a' },
  tense: { dot: '#fb923c', glow: '0 0 18px rgba(251,146,60,0.9)', tag: '#4a2000' },
  intimidating: { dot: '#a78bfa', glow: '0 0 18px rgba(167,139,250,0.9)', tag: '#2a1050' },
  terrifying: { dot: '#f43f5e', glow: '0 0 22px rgba(244,63,94,1.0)', tag: '#5a0020' },
};

const FullMap = ({
  currentLocationName,
  onClose,
  regionIntelByName = {},
  currentQuestChain = null,
  onForgeRegion = null,
  forgeLoadingRegion = null,
  onNarrateRegion = null,
}) => {
  const [hovered, setHovered] = useState(null);
  const [selected, setSelected] = useState(null);

  const playerLoc = locations.find((location) => location.name === currentLocationName) || locations[0];
  const bgLoc = selected || hovered || playerLoc;
  const selectedIntel = selected ? regionIntelByName[selected.name] : null;
  const hoveredIntel = hovered ? regionIntelByName[hovered.name] : null;
  const chainPreview = useMemo(
    () => currentQuestChain?.region === selected?.name ? currentQuestChain : null,
    [currentQuestChain, selected]
  );

  useEffect(() => {
    if (!selected || !onNarrateRegion) return;
    onNarrateRegion(selected, selectedIntel, chainPreview);
  }, [selected, selectedIntel, chainPreview, onNarrateRegion]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] overflow-hidden"
      style={{ fontFamily: 'Cinzel, serif', background: '#0f0b06' }}
    >
      <AnimatePresence mode="wait">
        <motion.div key={bgLoc.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.2 }} className="absolute inset-0">
          <motion.img
            src={bgLoc.landscapeUrl || bgLoc.imageThumb}
            alt=""
            className="absolute inset-0 h-full w-full object-cover"
            style={{ filter: 'brightness(0.25) saturate(1.4)' }}
            animate={{ scale: [1, 1.06] }}
            transition={{ duration: 25, ease: 'linear', repeat: Infinity, repeatType: 'reverse' }}
          />
        </motion.div>
      </AnimatePresence>

      <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(8,6,3,0.97) 0%, rgba(8,6,3,0.55) 50%, rgba(8,6,3,0.75) 100%)' }} />

      <div className="absolute left-0 right-0 top-0 z-20 flex items-start justify-between p-4 sm:p-8">
        <div className="max-w-[70vw]">
          <p className="mb-1 text-xs uppercase" style={{ color: 'var(--iron-red)', letterSpacing: '0.32em' }}>
            Aethelgard Realm Map
          </p>
          <h2 className="text-3xl font-black uppercase sm:text-5xl" style={{ color: 'var(--text-parchment)', fontFamily: 'Cinzel Decorative, serif', textShadow: '0 4px 20px rgba(0,0,0,0.9)' }}>
            The Known World
          </h2>
          <p className="mt-1 text-xs italic" style={{ color: 'var(--text-dim)', fontFamily: 'Crimson Text, serif' }}>
            Hover to preview · Click for lore, hooks, and forged regional quests
          </p>
        </div>

        <button
          onClick={onClose}
          className="rounded-full p-3 transition-all hover:scale-110"
          style={{ background: 'var(--bg-panel)', border: '1px solid var(--border-stone)', color: 'var(--text-faded)' }}
        >
          <X size={20} />
        </button>
      </div>

      <div className="absolute inset-0 z-10 cursor-grab active:cursor-grabbing">
        <TransformWrapper initialScale={1.2} minScale={0.8} maxScale={4} centerOnInit wheel={{ step: 0.1 }}>
          {({ zoomIn, zoomOut, resetTransform }) => (
            <>
              <div className="absolute bottom-6 right-4 z-50 flex flex-col gap-2 rounded-lg sm:bottom-8 sm:right-8" style={{ background: 'var(--bg-panel)', border: '1px solid var(--border-stone)', padding: '8px' }}>
                <button onClick={() => zoomIn()} className="p-2 text-amber-500 transition-opacity hover:opacity-80"><ZoomIn size={18} /></button>
                <div className="h-px w-full bg-slate-700/50" />
                <button onClick={() => zoomOut()} className="p-2 text-amber-500 transition-opacity hover:opacity-80"><ZoomOut size={18} /></button>
                <div className="h-px w-full bg-slate-700/50" />
                <button onClick={() => resetTransform()} className="p-2 text-amber-500 transition-opacity hover:opacity-80"><Maximize size={18} /></button>
              </div>

              <TransformComponent wrapperClass="!w-full !h-full" contentClass="!w-full !h-full">
                <svg className="h-full w-full object-cover" viewBox="0 0 1000 700" preserveAspectRatio="xMidYMid slice" style={{ width: '100vw', height: '100vh', minWidth: '1000px', minHeight: '700px' }}>
                  <defs>
                    <filter id="blur-sm"><feGaussianBlur stdDeviation="2" /></filter>
                    <filter id="glow-gold"><feGaussianBlur stdDeviation="3" result="blur" /><feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
                  </defs>

                  <image href="/assets/map_bg.png" x="0" y="0" width="1000" height="700" preserveAspectRatio="xMidYMid slice" opacity="0.65" filter="url(#blur-sm)" />
                  <image href="/assets/map_bg.png" x="0" y="0" width="1000" height="700" preserveAspectRatio="xMidYMid slice" opacity="0.85" style={{ mixBlendMode: 'overlay' }} />

                  {locations.map((loc) => {
                    const cx = (loc.x / 100) * 1000;
                    const cy = (loc.y / 100) * 700;
                    const isPlayer = loc.id === playerLoc.id;
                    const isHovered = hovered?.id === loc.id;
                    const isForged = Boolean(regionIntelByName[loc.name]);
                    const colors = atmosphereMeta[loc.atmosphere] || atmosphereMeta.dark;

                    return (
                      <g
                        key={loc.id}
                        onMouseEnter={() => setHovered(loc)}
                        onMouseLeave={() => setHovered(null)}
                        onClick={() => {
                          setSelected(loc);
                          onForgeRegion?.(loc.name);
                        }}
                        style={{ cursor: 'pointer' }}
                      >
                        {(isPlayer || isHovered) && <circle cx={cx} cy={cy} r="14" fill={colors.dot} opacity="0.2" filter="url(#blur-sm)" />}
                        {isPlayer && (
                          <circle cx={cx} cy={cy} r="18">
                            <animate attributeName="r" values="10;20;10" dur="3s" repeatCount="indefinite" />
                            <animate attributeName="opacity" values="0.5;0;0.5" dur="3s" repeatCount="indefinite" />
                            <animate attributeName="fill" values={colors.dot} dur="3s" repeatCount="indefinite" />
                          </circle>
                        )}

                        <circle
                          cx={cx}
                          cy={cy}
                          r={isPlayer ? 7 : isHovered ? 6 : 4.5}
                          fill={colors.dot}
                          stroke={colors.tag}
                          strokeWidth="1.5"
                          filter={isHovered || isPlayer ? 'url(#glow-gold)' : undefined}
                        />

                        {isForged && <circle cx={cx + 9} cy={cy - 9} r="3.2" fill="#e8c56a" stroke="#2a1d09" strokeWidth="0.8" />}

                        <text
                          x={cx}
                          y={cy + (isPlayer ? 20 : 16)}
                          textAnchor="middle"
                          fontSize={isPlayer ? 11 : isHovered ? 10 : 8}
                          fill={isPlayer ? colors.dot : isHovered ? '#e8d5a3' : 'rgba(160,140,100,0.7)'}
                          fontFamily="Cinzel, serif"
                          fontWeight={isPlayer || isHovered ? 'bold' : 'normal'}
                        >
                          {isPlayer ? 'Current: ' : ''}{loc.name}
                        </text>
                      </g>
                    );
                  })}

                  <g transform="translate(50,640)" opacity="0.5">
                    <circle cx="0" cy="0" r="22" fill="none" stroke="rgba(201,168,76,0.4)" strokeWidth="1" />
                    <text x="0" y="-26" textAnchor="middle" fontSize="9" fill="#c9a84c" fontFamily="Cinzel">N</text>
                    <text x="26" y="3" textAnchor="middle" fontSize="9" fill="#c9a84c" fontFamily="Cinzel">E</text>
                    <text x="0" y="32" textAnchor="middle" fontSize="9" fill="#c9a84c" fontFamily="Cinzel">S</text>
                    <text x="-26" y="3" textAnchor="middle" fontSize="9" fill="#c9a84c" fontFamily="Cinzel">W</text>
                    <line x1="0" y1="-18" x2="0" y2="18" stroke="rgba(201,168,76,0.6)" strokeWidth="1" />
                    <line x1="-18" y1="0" x2="18" y2="0" stroke="rgba(201,168,76,0.6)" strokeWidth="1" />
                  </g>

                  <text x="500" y="688" textAnchor="middle" fontSize="10" fill="rgba(201,168,76,0.4)" fontFamily="Cinzel Decorative, serif">
                    ~ Aethelgard - The Shattered Realm ~
                  </text>
                </svg>
              </TransformComponent>
            </>
          )}
        </TransformWrapper>
      </div>

      <AnimatePresence>
        {hovered && !selected && (
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 30 }}
            className="absolute right-4 top-1/2 z-30 hidden w-72 -translate-y-1/2 overflow-hidden rounded-lg xl:block"
            style={{ background: 'var(--bg-panel)', border: '1px solid var(--border-gold)', boxShadow: '0 0 50px rgba(0,0,0,0.9)' }}
          >
            <div className="relative h-36 overflow-hidden">
              <img src={hovered.imageThumb} alt={hovered.name} className="h-full w-full object-cover" style={{ filter: 'brightness(0.6) saturate(1.3)' }} />
              <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, var(--bg-panel) 0%, transparent 100%)' }} />
              <div className="absolute bottom-3 left-4">
                <h3 className="text-lg font-black uppercase" style={{ color: 'var(--text-parchment)', fontFamily: 'Cinzel, serif' }}>{hovered.name}</h3>
              </div>
            </div>
            <div className="space-y-2 p-4">
              <p className="text-sm font-lore italic" style={{ color: 'var(--text-faded)' }}>{hovered.terrain}</p>
              {hoveredIntel && (
                <div className="rounded p-2" style={{ background: 'rgba(201,168,76,0.08)', border: '1px solid var(--border-gold)' }}>
                  <p className="mb-1 text-[0.6rem] font-ancient uppercase tracking-[0.18em]" style={{ color: 'var(--gold)' }}>
                    World-Forge Hook
                  </p>
                  <p className="text-xs break-words" style={{ color: 'var(--text-parchment)', fontFamily: 'Crimson Text, serif' }}>
                    {hoveredIntel.quest_hook}
                  </p>
                </div>
              )}
              <div className="rounded p-2 text-xs font-lore italic" style={{ background: 'rgba(139,32,32,0.2)', borderLeft: '2px solid var(--iron-red)', color: '#f0c0c0' }}>
                {hovered.currentEvent}
              </div>
              <div className="flex flex-wrap gap-1.5 pt-1">
                {hovered.threats.map((threat) => (
                  <span key={threat} className="rounded px-2 py-0.5 text-xs font-ancient" style={{ background: 'rgba(139,32,32,0.2)', border: '1px solid var(--blood)', color: '#c04040', fontSize: '0.6rem', letterSpacing: '0.05em' }}>
                    {threat}
                  </span>
                ))}
              </div>
              <p className="mt-2 text-xs font-ancient" style={{ color: 'var(--text-dim)', letterSpacing: '0.1em' }}>
                Click to read lore and forge a chain →
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {selected && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 z-40 flex items-center justify-center p-3 sm:p-6 lg:p-8">
            <div className="absolute inset-0 bg-black/75 backdrop-blur-sm" onClick={() => setSelected(null)} />
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9 }}
              className="relative z-10 flex max-h-[92vh] w-full max-w-5xl flex-col overflow-hidden rounded-xl"
              style={{ background: 'var(--bg-panel)', border: '1px solid var(--border-gold)', boxShadow: '0 0 80px rgba(0,0,0,0.95)' }}
            >
              <div className="absolute left-0 right-0 top-0 h-0.5" style={{ background: 'linear-gradient(90deg, transparent, var(--gold), transparent)' }} />

              <div className="relative h-40 overflow-hidden sm:h-44">
                <motion.img
                  src={selected.imageThumb}
                  alt={selected.name}
                  className="h-full w-full object-cover"
                  style={{ filter: 'brightness(0.55) saturate(1.4)' }}
                  animate={{ scale: [1, 1.05] }}
                  transition={{ duration: 10, repeat: Infinity, repeatType: 'reverse' }}
                />
                <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, var(--bg-panel) 0%, transparent 60%)' }} />
                <button onClick={() => setSelected(null)} className="absolute right-4 top-4 rounded-full p-2 transition-colors hover:opacity-80" style={{ background: 'rgba(0,0,0,0.7)', border: '1px solid var(--border-stone)', color: 'var(--text-faded)' }}>
                  <X size={16} />
                </button>
                <div className="absolute bottom-4 left-6">
                  <h3 className="text-xl font-black uppercase sm:text-2xl" style={{ color: 'var(--text-parchment)', fontFamily: 'Cinzel, serif' }}>{selected.name}</h3>
                </div>
              </div>

              <div className="grid flex-1 grid-cols-1 gap-6 overflow-y-auto p-4 custom-scrollbar sm:p-6 lg:grid-cols-[1.05fr_0.95fr]">
                <div className="space-y-4">
                  <div>
                    <p className="mb-2 text-xs font-ancient uppercase" style={{ color: 'var(--gold)', letterSpacing: '0.15em' }}>Ancient Lore</p>
                    <p className="break-words text-sm font-lore italic leading-relaxed" style={{ color: 'var(--text-parchment)', borderLeft: '2px solid var(--gold-dim)', paddingLeft: '1rem' }}>
                      "{selected.lore}"
                    </p>
                  </div>

                  <div className="rounded p-3" style={{ background: 'rgba(139,32,32,0.2)', borderLeft: '2px solid var(--iron-red)' }}>
                    <p className="mb-1 text-xs font-ancient uppercase" style={{ color: 'var(--iron-red)', letterSpacing: '0.1em' }}>Current Situation</p>
                    <p className="break-words text-sm font-bold font-lore" style={{ color: '#f0c0c0' }}>{selected.currentEvent}</p>
                  </div>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                    {[
                      ['Terrain', selected.terrain, Mountain],
                      ['Threats', selected.threats.join(' · '), Skull],
                      ['Inhabitants', selected.population, Users],
                    ].map(([label, value, Icon]) => (
                      <div key={label}>
                        <p className="mb-1 flex items-center gap-1 text-xs font-ancient uppercase" style={{ color: 'var(--text-dim)', letterSpacing: '0.05em' }}>
                          <Icon size={10} /> {label}
                        </p>
                        <p className="break-words text-xs font-lore" style={{ color: 'var(--text-faded)' }}>{value}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="ancient-panel rounded-lg p-4">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <p className="mb-1 text-[0.62rem] font-ancient uppercase tracking-[0.18em]" style={{ color: 'var(--gold)' }}>
                          World-Forge Region
                        </p>
                        <h4 className="break-words text-lg font-black uppercase" style={{ color: 'var(--text-parchment)' }}>
                          {selectedIntel?.region_title || selected.name}
                        </h4>
                      </div>
                      <span className="badge-ancient">Danger {selectedIntel?.danger_level || '—'}</span>
                    </div>

                    <p className="mt-3 break-words text-sm" style={{ color: 'var(--text-faded)', fontFamily: 'Crimson Text, serif' }}>
                      {selectedIntel?.quest_hook || 'Forge a campaign chain for this region to reveal its strategic purpose.'}
                    </p>

                    {selectedIntel && (
                      <div className="mt-4 grid grid-cols-1 gap-3 text-xs sm:grid-cols-2">
                        <div>
                          <p className="mb-1 font-ancient uppercase" style={{ color: 'var(--text-dim)' }}>Controlling Force</p>
                          <p className="break-words" style={{ color: 'var(--text-parchment)', fontFamily: 'Crimson Text, serif' }}>{selectedIntel.controlling_force}</p>
                        </div>
                        <div>
                          <p className="mb-1 font-ancient uppercase" style={{ color: 'var(--text-dim)' }}>Notable NPC</p>
                          <p className="break-words" style={{ color: 'var(--text-parchment)', fontFamily: 'Crimson Text, serif' }}>{selectedIntel.notable_npc}</p>
                        </div>
                        <div>
                          <p className="mb-1 font-ancient uppercase" style={{ color: 'var(--text-dim)' }}>Relic</p>
                          <p className="break-words" style={{ color: 'var(--text-parchment)', fontFamily: 'Crimson Text, serif' }}>{selectedIntel.relic}</p>
                        </div>
                        <div>
                          <p className="mb-1 font-ancient uppercase" style={{ color: 'var(--text-dim)' }}>Connections</p>
                          <p className="break-words" style={{ color: 'var(--text-parchment)', fontFamily: 'Crimson Text, serif' }}>{(selectedIntel.connections || []).join(' · ')}</p>
                        </div>
                      </div>
                    )}

                    <button
                      onClick={() => onForgeRegion?.(selected.name)}
                      disabled={!onForgeRegion || forgeLoadingRegion === selected.name}
                      className="btn-ancient mt-4 flex w-full items-center justify-center gap-2 rounded-sm px-4 py-3 disabled:opacity-40"
                    >
                      {forgeLoadingRegion === selected.name ? <Sparkles size={14} className="animate-pulse" /> : <ScrollText size={14} />}
                      {forgeLoadingRegion === selected.name ? 'Forging Chain...' : 'Forge Quest Chain For This Region'}
                    </button>
                  </div>

                  {chainPreview && (
                    <div className="ancient-panel rounded-lg p-4">
                      <p className="mb-2 text-[0.62rem] font-ancient uppercase tracking-[0.18em]" style={{ color: 'var(--gold)' }}>
                        Active Regional Chain
                      </p>
                      <h5 className="break-words text-sm font-bold uppercase" style={{ color: 'var(--text-parchment)' }}>{chainPreview.title}</h5>
                      <div className="mt-3 space-y-2">
                        {chainPreview.stages?.map((stage) => (
                          <div key={stage.id} className="rounded-sm border px-3 py-2" style={{ background: 'rgba(201,168,76,0.06)', borderColor: 'var(--border-stone)' }}>
                            <div className="flex flex-wrap items-center justify-between gap-2">
                              <p className="break-words text-xs font-ancient uppercase" style={{ color: 'var(--text-parchment)' }}>{stage.title}</p>
                              <span className={stage.status === 'completed' ? 'badge-forest' : stage.status === 'active' ? 'badge-ancient' : 'badge-danger'}>
                                {stage.status}
                              </span>
                            </div>
                            <p className="mt-1 break-words text-xs" style={{ color: 'var(--text-dim)', fontFamily: 'Crimson Text, serif' }}>{stage.objective}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="absolute bottom-5 left-1/2 z-20 hidden -translate-x-1/2 items-center gap-5 rounded-full px-6 py-3 lg:flex" style={{ background: 'rgba(8,6,3,0.85)', border: '1px solid var(--border-stone)' }}>
        {Object.entries(atmosphereMeta).slice(0, 6).map(([key, color]) => (
          <div key={key} className="flex items-center gap-1.5">
            <div className="h-2 w-2 rounded-full" style={{ background: color.dot, boxShadow: color.glow }} />
            <span className="text-xs font-ancient uppercase" style={{ color: 'var(--text-dim)', fontSize: '0.55rem', letterSpacing: '0.1em' }}>
              {key}
            </span>
          </div>
        ))}
        <div className="flex items-center gap-1.5">
          <div className="h-2 w-2 rounded-full" style={{ background: '#e8c56a', boxShadow: '0 0 10px rgba(232,197,106,0.75)' }} />
          <span className="text-xs font-ancient uppercase" style={{ color: 'var(--text-dim)', fontSize: '0.55rem', letterSpacing: '0.1em' }}>
            forged regions
          </span>
        </div>
      </div>
    </motion.div>
  );
};

export default FullMap;
