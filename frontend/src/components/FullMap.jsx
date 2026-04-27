import React, { useEffect, useMemo, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Skull, Users, Mountain, ZoomIn, ZoomOut, Maximize, Sparkles, ScrollText } from 'lucide-react';
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch';
import { locations } from '../data/locations';

const atmosphereMeta = {
  mystical: { dot: '#7ec7ff', glow: '0 0 18px rgba(126,199,255,0.95)' },
  scary: { dot: '#ff7ba4', glow: '0 0 18px rgba(255,123,164,0.88)' },
  dark: { dot: '#b1c4df', glow: '0 0 12px rgba(177,196,223,0.68)' },
  desolate: { dot: '#9fb4c8', glow: '0 0 10px rgba(159,180,200,0.52)' },
  adventurous: { dot: '#75dff0', glow: '0 0 18px rgba(117,223,240,0.92)' },
  soothing: { dot: '#72e8d3', glow: '0 0 18px rgba(114,232,211,0.9)' },
  tense: { dot: '#98a8ff', glow: '0 0 18px rgba(152,168,255,0.88)' },
  intimidating: { dot: '#c59cff', glow: '0 0 18px rgba(197,156,255,0.92)' },
  terrifying: { dot: '#ff7aa7', glow: '0 0 22px rgba(255,122,167,0.96)' },
};

const labelOffsets = [
  [14, -16],
  [-14, 18],
  [16, 18],
  [-16, -16],
];

const zoneBackdrop = {
  mystical: 'linear-gradient(180deg, rgba(10,16,33,0.95) 0%, rgba(7,12,24,0.92) 100%)',
  scary: 'linear-gradient(180deg, rgba(24,10,24,0.96) 0%, rgba(14,8,18,0.92) 100%)',
  dark: 'linear-gradient(180deg, rgba(11,16,25,0.95) 0%, rgba(8,12,18,0.92) 100%)',
  desolate: 'linear-gradient(180deg, rgba(14,19,28,0.95) 0%, rgba(9,13,20,0.92) 100%)',
  adventurous: 'linear-gradient(180deg, rgba(9,20,30,0.95) 0%, rgba(7,15,24,0.92) 100%)',
  soothing: 'linear-gradient(180deg, rgba(8,21,21,0.95) 0%, rgba(7,14,17,0.92) 100%)',
  tense: 'linear-gradient(180deg, rgba(12,15,30,0.95) 0%, rgba(8,11,22,0.92) 100%)',
  intimidating: 'linear-gradient(180deg, rgba(12,12,31,0.95) 0%, rgba(8,8,20,0.92) 100%)',
  terrifying: 'linear-gradient(180deg, rgba(18,8,27,0.96) 0%, rgba(11,7,18,0.92) 100%)',
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
  const [mapScale, setMapScale] = useState(1.1);
  const rootRef = useRef(null);

  const playerLoc = locations.find((location) => location.name === currentLocationName) || locations[0];
  const selectedIntel = selected ? regionIntelByName[selected.name] : null;
  const chainPreview = useMemo(
    () => (currentQuestChain?.region === selected?.name ? currentQuestChain : null),
    [currentQuestChain, selected]
  );

  useEffect(() => {
    if (!selected || !onNarrateRegion) return;
    onNarrateRegion(selected, selectedIntel, chainPreview);
  }, [selected, selectedIntel, chainPreview, onNarrateRegion]);

  const handleFullscreenToggle = async () => {
    if (!rootRef.current) return;

    if (document.fullscreenElement) {
      await document.exitFullscreen();
      return;
    }

    await rootRef.current.requestFullscreen?.();
  };

  return (
    <motion.div
      ref={rootRef}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] overflow-hidden"
      style={{ background: 'linear-gradient(180deg, #050b13 0%, #02060b 100%)', fontFamily: 'var(--font-ui)' }}
    >
      <div className="absolute inset-0">
        <img src="/assets/map_bg.png" alt="" className="h-full w-full object-cover opacity-18" style={{ filter: 'blur(16px) saturate(0.7)' }} />
        <div className="absolute inset-0" style={{ background: 'linear-gradient(180deg, rgba(4,10,18,0.92) 0%, rgba(4,10,18,0.82) 28%, rgba(4,10,18,0.9) 100%)' }} />
      </div>

      <div className="absolute inset-x-0 top-0 z-20 flex items-start justify-between px-5 py-5 sm:px-8">
        <div className="max-w-[32rem]">
          <p className="mb-1 text-xs uppercase" style={{ color: 'var(--iron-red)', letterSpacing: '0.28em' }}>
            Aethelgard Realm Map
          </p>
          <h2 className="text-3xl font-black uppercase sm:text-5xl" style={{ color: 'var(--text-parchment)', fontFamily: 'var(--font-display)' }}>
            The Known World
          </h2>
          <p className="mt-1 text-xs italic" style={{ color: 'var(--text-dim)', fontFamily: 'var(--font-body)' }}>
            Scroll to zoom · drag to travel the world · click a region for forged lore
          </p>
        </div>

        <button
          onClick={onClose}
          title="Close the map"
          data-tooltip="Close the map"
          className="tooltip-shell rounded-full p-3 transition-all hover:scale-110"
          style={{ background: 'rgba(8,17,28,0.92)', border: '1px solid var(--border-stone)', color: 'var(--text-faded)' }}
        >
          <X size={20} />
        </button>
      </div>

      <div className="absolute inset-x-5 top-28 bottom-24 z-10 sm:inset-x-8 sm:top-32 sm:bottom-28">
        <div
          className="relative h-full w-full overflow-hidden rounded-[2rem] border"
          style={{ borderColor: 'var(--border-stone)', background: 'rgba(6,12,20,0.94)', boxShadow: '0 0 80px rgba(0,0,0,0.85)' }}
        >
          <TransformWrapper
            initialScale={1.1}
            minScale={1}
            maxScale={3.4}
            centerOnInit
            wheel={{ step: 0.12 }}
            doubleClick={{ disabled: true }}
            onZoom={(ref) => setMapScale(ref.scale)}
            onZoomStop={(ref) => setMapScale(ref.scale)}
            onInit={(ref) => setMapScale(ref.scale)}
          >
            {({ zoomIn, zoomOut, resetTransform }) => (
              <>
                <div className="absolute bottom-5 right-5 z-50 flex flex-col gap-2 rounded-2xl border p-2" style={{ background: 'rgba(8,17,28,0.92)', borderColor: 'var(--border-stone)' }}>
                  <button onClick={() => zoomIn()} className="tooltip-shell rounded-xl p-2 transition-opacity hover:opacity-80" style={{ color: 'var(--gold)' }} data-tooltip="Zoom in"><ZoomIn size={18} /></button>
                  <div className="h-px w-full bg-slate-700/50" />
                  <button onClick={() => zoomOut()} className="tooltip-shell rounded-xl p-2 transition-opacity hover:opacity-80" style={{ color: 'var(--gold)' }} data-tooltip="Zoom out"><ZoomOut size={18} /></button>
                  <div className="h-px w-full bg-slate-700/50" />
                  <button onClick={() => handleFullscreenToggle()} className="tooltip-shell rounded-xl p-2 transition-opacity hover:opacity-80" style={{ color: 'var(--gold)' }} data-tooltip="Toggle fullscreen"><Maximize size={18} /></button>
                  <div className="h-px w-full bg-slate-700/50" />
                  <button onClick={() => resetTransform()} className="tooltip-shell rounded-xl p-2 transition-opacity hover:opacity-80" style={{ color: 'var(--gold)' }} data-tooltip="Reset map view">
                    <Sparkles size={18} />
                  </button>
                </div>

                <TransformComponent wrapperClass="!w-full !h-full !overflow-hidden" contentClass="!w-full !h-full !flex !items-center !justify-center">
                  <svg viewBox="0 0 1000 700" className="h-full w-full max-h-full max-w-full" preserveAspectRatio="xMidYMid meet">
                    <image href="/assets/map_bg.png" x="0" y="0" width="1000" height="700" preserveAspectRatio="xMidYMid meet" />

                    {locations.map((location, index) => {
                      const cx = (location.x / 100) * 1000;
                      const cy = (location.y / 100) * 700;
                      const isPlayer = location.id === playerLoc.id;
                      const isHovered = hovered?.id === location.id;
                      const isSelected = selected?.id === location.id;
                      const isForged = Boolean(regionIntelByName[location.name]);
                      const colors = atmosphereMeta[location.atmosphere] || atmosphereMeta.dark;
                      const [dx, dy] = labelOffsets[index % labelOffsets.length];
                      const effectiveScale = Math.max(1, mapScale);
                      const showLabel = isPlayer || isSelected || isHovered || effectiveScale >= 1.7;
                      const baseSize = isPlayer ? 15 : isSelected ? 14 : 11;
                      const fontSize = Math.max(9, baseSize / effectiveScale + 4.5);

                      return (
                        <g
                          key={location.id}
                          onMouseEnter={() => setHovered(location)}
                          onMouseLeave={() => setHovered(null)}
                          onClick={() => {
                            setSelected(location);
                            onForgeRegion?.(location.name);
                          }}
                          style={{ cursor: 'pointer' }}
                        >
                          {(isPlayer || isHovered || isSelected) && (
                            <circle cx={cx} cy={cy} r={isSelected ? 22 : 18} fill={colors.dot} opacity="0.16" />
                          )}

                          {isPlayer && (
                            <circle cx={cx} cy={cy} r="18">
                              <animate attributeName="r" values="10;20;10" dur="3s" repeatCount="indefinite" />
                              <animate attributeName="opacity" values="0.55;0;0.55" dur="3s" repeatCount="indefinite" />
                              <animate attributeName="fill" values={colors.dot} dur="3s" repeatCount="indefinite" />
                            </circle>
                          )}

                          <circle
                            cx={cx}
                            cy={cy}
                            r={isPlayer ? 8 : isSelected ? 7 : isHovered ? 6 : 5}
                            fill={colors.dot}
                            stroke="#1d1209"
                            strokeWidth="1.6"
                          />

                          {showLabel && (
                            <text
                              x={cx + dx}
                              y={cy + dy}
                              textAnchor={dx > 0 ? 'start' : 'end'}
                              fontSize={fontSize}
                              fill={isPlayer || isSelected ? '#f4fbff' : '#d9ecff'}
                              stroke="rgba(5,10,18,0.94)"
                              strokeWidth={2.8 / effectiveScale}
                              paintOrder="stroke"
                              fontFamily="var(--font-ui)"
                              fontWeight={isPlayer || isSelected ? '700' : '600'}
                              opacity={isHovered || isSelected || isPlayer ? 1 : 0.82}
                            >
                              {isPlayer ? `Current: ${location.name}` : location.name}
                            </text>
                          )}
                        </g>
                      );
                    })}
                  </svg>
                </TransformComponent>
              </>
            )}
          </TransformWrapper>
        </div>
      </div>

      <AnimatePresence>
        {selected && (
          <motion.aside
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 24 }}
            className="absolute bottom-28 right-8 z-30 w-[min(28rem,calc(100vw-4rem))] overflow-hidden rounded-[1.8rem] border"
            style={{
              background: zoneBackdrop[selected.atmosphere] || zoneBackdrop.mystical,
              borderColor: 'rgba(113,220,245,0.28)',
              boxShadow: '0 20px 60px rgba(0,0,0,0.55)',
            }}
          >
            <div className="border-b px-5 py-4" style={{ borderColor: 'rgba(113,220,245,0.16)' }}>
              <p className="text-[0.62rem] uppercase tracking-[0.22em]" style={{ color: 'var(--gold)' }}>
                Region Chronicle
              </p>
              <h3 className="mt-2 text-2xl font-black uppercase" style={{ color: 'var(--text-parchment)', fontFamily: 'var(--font-ui)' }}>
                {selected.name}
              </h3>
              <p className="mt-1 text-sm italic" style={{ color: 'var(--text-dim)', fontFamily: 'var(--font-body)' }}>
                {selected.terrain}
              </p>
            </div>

            <div className="max-h-[26rem] space-y-4 overflow-y-auto px-5 py-4 custom-scrollbar">
              <div>
                <p className="mb-2 text-[0.62rem] uppercase tracking-[0.18em]" style={{ color: 'var(--gold)' }}>
                  Ancient lore
                </p>
                <p className="text-sm leading-relaxed" style={{ color: 'var(--text-parchment)', fontFamily: 'var(--font-body)' }}>
                  {selected.lore}
                </p>
              </div>

              <div className="rounded-2xl border px-4 py-3" style={{ background: 'rgba(97,39,83,0.18)', borderColor: 'rgba(205,120,173,0.24)' }}>
                <p className="text-[0.62rem] uppercase tracking-[0.18em]" style={{ color: '#ffb8da' }}>
                  Current omen
                </p>
                <p className="mt-1 text-sm leading-relaxed" style={{ color: '#ffe7f2', fontFamily: 'var(--font-body)' }}>
                  {selected.currentEvent}
                </p>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <p className="mb-1 flex items-center gap-1 text-[0.62rem] uppercase tracking-[0.12em]" style={{ color: 'var(--text-dim)' }}>
                    <Mountain size={11} /> Terrain
                  </p>
                  <p className="text-sm" style={{ color: 'var(--text-faded)', fontFamily: 'var(--font-body)' }}>{selected.terrain}</p>
                </div>
                <div>
                  <p className="mb-1 flex items-center gap-1 text-[0.62rem] uppercase tracking-[0.12em]" style={{ color: 'var(--text-dim)' }}>
                    <Users size={11} /> Inhabitants
                  </p>
                  <p className="text-sm" style={{ color: 'var(--text-faded)', fontFamily: 'var(--font-body)' }}>{selected.population}</p>
                </div>
                <div className="sm:col-span-2">
                  <p className="mb-1 flex items-center gap-1 text-[0.62rem] uppercase tracking-[0.12em]" style={{ color: 'var(--text-dim)' }}>
                    <Skull size={11} /> Threats
                  </p>
                  <p className="text-sm" style={{ color: 'var(--text-faded)', fontFamily: 'var(--font-body)' }}>{selected.threats.join(' · ')}</p>
                </div>
              </div>

              {selectedIntel && (
                <div className="rounded-2xl border px-4 py-3" style={{ background: 'rgba(113,220,245,0.08)', borderColor: 'rgba(113,220,245,0.2)' }}>
                  <p className="text-[0.62rem] uppercase tracking-[0.18em]" style={{ color: 'var(--gold)' }}>
                    Forged regional thread
                  </p>
                  <p className="mt-2 text-lg font-black uppercase" style={{ color: 'var(--text-parchment)' }}>
                    {selectedIntel.region_title}
                  </p>
                  <p className="mt-2 text-sm leading-relaxed" style={{ color: 'var(--text-faded)', fontFamily: 'var(--font-body)' }}>
                    {selectedIntel.quest_hook}
                  </p>
                </div>
              )}

              {chainPreview && (
                <div className="rounded-2xl border px-4 py-3" style={{ background: 'rgba(255,255,255,0.03)', borderColor: 'rgba(113,220,245,0.16)' }}>
                  <p className="text-[0.62rem] uppercase tracking-[0.18em]" style={{ color: 'var(--gold)' }}>
                    Active chain
                  </p>
                  <p className="mt-2 text-sm font-bold uppercase" style={{ color: 'var(--text-parchment)' }}>
                    {chainPreview.title}
                  </p>
                  <div className="mt-3 space-y-2">
                    {chainPreview.stages?.slice(0, 3).map((stage) => (
                      <div key={stage.id} className="rounded-xl border px-3 py-2" style={{ borderColor: 'rgba(113,220,245,0.14)', background: 'rgba(7,15,24,0.58)' }}>
                        <p className="text-[0.62rem] uppercase tracking-[0.14em]" style={{ color: 'var(--text-parchment)' }}>
                          {stage.title}
                        </p>
                        <p className="mt-1 text-xs" style={{ color: 'var(--text-dim)', fontFamily: 'var(--font-body)' }}>
                          {stage.objective}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <button
                onClick={() => onForgeRegion?.(selected.name)}
                disabled={!onForgeRegion || forgeLoadingRegion === selected.name}
                className="btn-ancient flex w-full items-center justify-center gap-2 rounded-2xl px-4 py-3 disabled:opacity-40"
              >
                {forgeLoadingRegion === selected.name ? <Sparkles size={14} className="animate-pulse" /> : <ScrollText size={14} />}
                {forgeLoadingRegion === selected.name ? 'Forging chain...' : 'Forge quest chain'}
              </button>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      <div className="absolute bottom-5 left-1/2 z-20 hidden -translate-x-1/2 items-center gap-5 rounded-full px-6 py-3 lg:flex" style={{ background: 'rgba(6,14,23,0.86)', border: '1px solid var(--border-stone)' }}>
        {Object.entries(atmosphereMeta).slice(0, 6).map(([key, color]) => (
          <div key={key} className="flex items-center gap-1.5">
            <div className="h-2 w-2 rounded-full" style={{ background: color.dot, boxShadow: color.glow }} />
            <span className="text-xs uppercase" style={{ color: 'var(--text-dim)', fontSize: '0.55rem', letterSpacing: '0.1em' }}>
              {key}
            </span>
          </div>
        ))}
        <div className="flex items-center gap-1.5">
          <div className="h-2 w-2 rounded-full" style={{ background: '#d8f7ff', boxShadow: '0 0 10px rgba(216,247,255,0.82)' }} />
          <span className="text-xs uppercase" style={{ color: 'var(--text-dim)', fontSize: '0.55rem', letterSpacing: '0.1em' }}>
            forged regions
          </span>
        </div>
      </div>
    </motion.div>
  );
};

export default FullMap;

