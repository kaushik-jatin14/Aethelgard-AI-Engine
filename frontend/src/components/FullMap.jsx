import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Skull, Users, Mountain, Flame, ZoomIn, ZoomOut, Maximize } from 'lucide-react';
import { locations } from '../data/locations';
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch';

const atm = {
  mystical:    { dot:'#60a5fa', glow:'0 0 18px rgba(96,165,250,0.9)',  tag:'#1e3a6e' },
  scary:       { dot:'#ef4444', glow:'0 0 18px rgba(239,68,68,0.9)',   tag:'#5a1010' },
  dark:        { dot:'#94a3b8', glow:'0 0 12px rgba(148,163,184,0.7)', tag:'#2a2a3a' },
  desolate:    { dot:'#9ca3af', glow:'0 0 10px rgba(156,163,175,0.5)', tag:'#1e1e2a' },
  adventurous: { dot:'#f59e0b', glow:'0 0 18px rgba(245,158,11,0.9)',  tag:'#4a3000' },
  soothing:    { dot:'#34d399', glow:'0 0 18px rgba(52,211,153,0.9)',  tag:'#0a3a1a' },
  tense:       { dot:'#fb923c', glow:'0 0 18px rgba(251,146,60,0.9)',  tag:'#4a2000' },
  intimidating:{ dot:'#a78bfa', glow:'0 0 18px rgba(167,139,250,0.9)', tag:'#2a1050' },
  terrifying:  { dot:'#f43f5e', glow:'0 0 22px rgba(244,63,94,1.0)',   tag:'#5a0020' },
};

const FullMap = ({ currentLocationName, onClose }) => {
  const [hovered, setHovered] = useState(null);
  const [selected, setSelected] = useState(null);
  const playerLoc = locations.find(l => l.name === currentLocationName) || locations[0];
  const bgLoc = selected || hovered || playerLoc;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] overflow-hidden"
      style={{ fontFamily: 'Cinzel, serif', background: '#0f0b06' }}>

      {/* Background landscape with Ken Burns */}
      <AnimatePresence mode="wait">
        <motion.div key={bgLoc.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.2 }} className="absolute inset-0">
          <motion.img src={bgLoc.landscapeUrl || bgLoc.imageThumb} alt="" className="absolute inset-0 w-full h-full object-cover"
            style={{ filter: 'brightness(0.25) saturate(1.4)' }}
            animate={{ scale: [1, 1.06] }} transition={{ duration: 25, ease: 'linear', repeat: Infinity, repeatType: 'reverse' }} />
        </motion.div>
      </AnimatePresence>
      <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(8,6,3,0.97) 0%, rgba(8,6,3,0.55) 50%, rgba(8,6,3,0.75) 100%)' }} />

      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-20 flex items-start justify-between p-8">
        <div>
          <p className="text-xs uppercase mb-1" style={{ color: 'var(--iron-red)', letterSpacing: '0.4em' }}>● Aethelgard Realm Map</p>
          <h2 className="text-5xl font-black uppercase" style={{ color: 'var(--text-parchment)', fontFamily: 'Cinzel Decorative, serif', textShadow: '0 4px 20px rgba(0,0,0,0.9)' }}>
            The Known World
          </h2>
          <p className="text-xs mt-1 italic" style={{ color: 'var(--text-dim)', fontFamily: 'Crimson Text, serif' }}>
            Hover to preview · Click for ancient lore
          </p>
        </div>
        <button onClick={onClose} className="p-3 rounded-full transition-all hover:scale-110"
          style={{ background: 'var(--bg-panel)', border: '1px solid var(--border-stone)', color: 'var(--text-faded)' }}>
          <X size={20} />
        </button>
      </div>

      {/* ══ 2D ANCIENT TERRAIN MAP CANVAS with PAN/ZOOM ══ */}
      <div className="absolute inset-0 z-10 cursor-grab active:cursor-grabbing">
        <TransformWrapper
          initialScale={1.2}
          minScale={0.8}
          maxScale={4}
          centerOnInit={true}
          wheel={{ step: 0.1 }}
        >
          {({ zoomIn, zoomOut, resetTransform }) => (
            <>
              {/* Map Controls */}
              <div className="absolute bottom-8 right-8 z-50 flex flex-col gap-2" style={{ background: 'var(--bg-panel)', border: '1px solid var(--border-stone)', padding: '8px', borderRadius: '8px' }}>
                <button onClick={() => zoomIn()} className="p-2 hover:opacity-80 transition-opacity text-amber-500"><ZoomIn size={18} /></button>
                <div className="w-full h-px bg-slate-700/50" />
                <button onClick={() => zoomOut()} className="p-2 hover:opacity-80 transition-opacity text-amber-500"><ZoomOut size={18} /></button>
                <div className="w-full h-px bg-slate-700/50" />
                <button onClick={() => resetTransform()} className="p-2 hover:opacity-80 transition-opacity text-amber-500"><Maximize size={18} /></button>
              </div>

              <TransformComponent wrapperClass="!w-full !h-full" contentClass="!w-full !h-full">
                <svg className="w-full h-full object-cover" viewBox="0 0 1000 700" preserveAspectRatio="xMidYMid slice" style={{ width: '100vw', height: '100vh', minWidth: '1000px', minHeight: '700px' }}>
                  <defs>
                    <filter id="blur-sm"><feGaussianBlur stdDeviation="2"/></filter>
                    <filter id="glow-gold"><feGaussianBlur stdDeviation="3" result="blur"/><feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
                  </defs>

                  {/* ── REALISTIC FANTASY MAP BACKGROUND ── */}
                  <image href="/assets/map_bg.png" x="0" y="0" width="1000" height="700" preserveAspectRatio="xMidYMid slice" opacity="0.65" filter="url(#blur-sm)" />
                  <image href="/assets/map_bg.png" x="0" y="0" width="1000" height="700" preserveAspectRatio="xMidYMid slice" opacity="0.85" style={{ mixBlendMode: 'overlay' }} />

                  {/* ── LOCATION NODES ── */}
                  {locations.map((loc) => {
            const cx = (loc.x / 100) * 1000;
            const cy = (loc.y / 100) * 700;
            const isPlayer = loc.id === playerLoc.id;
            const isHov = hovered?.id === loc.id;
            const c = atm[loc.atmosphere] || atm.dark;

            return (
              <g key={loc.id}
                onMouseEnter={() => setHovered(loc)}
                onMouseLeave={() => setHovered(null)}
                onClick={() => setSelected(loc)}
                style={{ cursor: 'pointer' }}>

                {/* Glow halo */}
                {(isPlayer || isHov) && (
                  <circle cx={cx} cy={cy} r="14" fill={c.dot} opacity="0.2" filter="url(#blur-sm)"/>
                )}
                {/* Player pulse rings */}
                {isPlayer && (
                  <>
                    <circle cx={cx} cy={cy} r="18">
                      <animate attributeName="r" values="10;20;10" dur="3s" repeatCount="indefinite"/>
                      <animate attributeName="opacity" values="0.5;0;0.5" dur="3s" repeatCount="indefinite"/>
                      <animate attributeName="fill" values={c.dot} dur="3s" repeatCount="indefinite"/>
                    </circle>
                  </>
                )}

                {/* Main dot */}
                <circle cx={cx} cy={cy} r={isPlayer ? 7 : isHov ? 6 : 4.5}
                  fill={c.dot} stroke={c.tag} strokeWidth="1.5" filter={isHov || isPlayer ? 'url(#glow-gold)' : undefined}/>

                {/* Name label */}
                <text x={cx} y={cy + (isPlayer ? 20 : 16)} textAnchor="middle"
                  fontSize={isPlayer ? 11 : isHov ? 10 : 8}
                  fill={isPlayer ? c.dot : isHov ? '#e8d5a3' : 'rgba(160,140,100,0.7)'}
                  fontFamily="Cinzel, serif"
                  fontWeight={isPlayer || isHov ? 'bold' : 'normal'}>
                  {isPlayer ? '⚑ ' : ''}{loc.name}
                </text>
              </g>
            );
          })}

          {/* Compass Rose */}
          <g transform="translate(50,640)" opacity="0.5">
            <circle cx="0" cy="0" r="22" fill="none" stroke="rgba(201,168,76,0.4)" strokeWidth="1"/>
            <text x="0" y="-26" textAnchor="middle" fontSize="9" fill="#c9a84c" fontFamily="Cinzel">N</text>
            <text x="26" y="3" textAnchor="middle" fontSize="9" fill="#c9a84c" fontFamily="Cinzel">E</text>
            <text x="0" y="32" textAnchor="middle" fontSize="9" fill="#c9a84c" fontFamily="Cinzel">S</text>
            <text x="-26" y="3" textAnchor="middle" fontSize="9" fill="#c9a84c" fontFamily="Cinzel">W</text>
            <line x1="0" y1="-18" x2="0" y2="18" stroke="rgba(201,168,76,0.6)" strokeWidth="1"/>
            <line x1="-18" y1="0" x2="18" y2="0" stroke="rgba(201,168,76,0.6)" strokeWidth="1"/>
          </g>

          {/* Map title scroll */}
          <text x="500" y="688" textAnchor="middle" fontSize="10" fill="rgba(201,168,76,0.4)" fontFamily="Cinzel Decorative, serif">
            ~ Aethelgard — The Shattered Realm ~
          </text>
        </svg>
        </TransformComponent>
        </>
        )}
        </TransformWrapper>
      </div>

      {/* Hover Panel */}
      <AnimatePresence>
        {hovered && !selected && (
          <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 30 }}
            className="absolute right-8 top-1/2 -translate-y-1/2 z-30 w-72 overflow-hidden rounded-lg"
            style={{ background: 'var(--bg-panel)', border: '1px solid var(--border-gold)', boxShadow: '0 0 50px rgba(0,0,0,0.9)' }}>
            <div className="h-36 relative overflow-hidden">
              <img src={hovered.imageThumb} alt={hovered.name} className="w-full h-full object-cover" style={{ filter: 'brightness(0.6) saturate(1.3)' }}/>
              <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, var(--bg-panel) 0%, transparent 100%)' }}/>
              <div className="absolute bottom-3 left-4">
                <h3 className="text-lg font-black uppercase" style={{ color: 'var(--text-parchment)', fontFamily: 'Cinzel, serif' }}>{hovered.name}</h3>
              </div>
            </div>
            <div className="p-4 space-y-2">
              <p className="text-sm font-lore italic" style={{ color: 'var(--text-faded)' }}>{hovered.terrain}</p>
              <div className="p-2 rounded text-xs font-lore italic" style={{ background: 'rgba(139,32,32,0.2)', borderLeft: '2px solid var(--iron-red)', color: '#e08080' }}>
                {hovered.currentEvent}
              </div>
              <div className="flex flex-wrap gap-1.5 pt-1">
                {hovered.threats.map((t,i)=>(
                  <span key={i} className="text-xs px-2 py-0.5 rounded font-ancient" style={{ background: 'rgba(139,32,32,0.2)', border: '1px solid var(--blood)', color: '#c04040', fontSize:'0.6rem', letterSpacing:'0.05em' }}>
                    ⚔ {t}
                  </span>
                ))}
              </div>
              <p className="text-xs mt-2 font-ancient" style={{ color: 'var(--text-dim)', letterSpacing:'0.1em' }}>Click to read ancient lore →</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Lore Modal */}
      <AnimatePresence>
        {selected && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="absolute inset-0 z-40 flex items-center justify-center p-8">
            <div className="absolute inset-0 bg-black/75 backdrop-blur-sm" onClick={() => setSelected(null)}/>
            <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9 }}
              className="relative z-10 w-full max-w-xl overflow-hidden rounded-xl"
              style={{ background: 'var(--bg-panel)', border: '1px solid var(--border-gold)', boxShadow: '0 0 80px rgba(0,0,0,0.95)' }}>
              <div className="absolute top-0 left-0 right-0 h-0.5" style={{ background: 'linear-gradient(90deg, transparent, var(--gold), transparent)' }}/>
              <div className="h-44 relative overflow-hidden">
                <motion.img src={selected.imageThumb} alt={selected.name} className="w-full h-full object-cover"
                  style={{ filter: 'brightness(0.55) saturate(1.4)' }}
                  animate={{ scale: [1, 1.05] }} transition={{ duration: 10, repeat: Infinity, repeatType: 'reverse' }}/>
                <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, var(--bg-panel) 0%, transparent 60%)' }}/>
                <button onClick={() => setSelected(null)} className="absolute top-4 right-4 p-2 rounded-full transition-colors hover:opacity-80"
                  style={{ background: 'rgba(0,0,0,0.7)', border: '1px solid var(--border-stone)', color: 'var(--text-faded)' }}>
                  <X size={16}/>
                </button>
                <div className="absolute bottom-4 left-6">
                  <h3 className="text-2xl font-black uppercase" style={{ color: 'var(--text-parchment)', fontFamily: 'Cinzel, serif' }}>{selected.name}</h3>
                </div>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <p className="text-xs font-ancient uppercase mb-2" style={{ color: 'var(--gold)', letterSpacing:'0.15em' }}>Ancient Lore</p>
                  <p className="text-sm font-lore italic leading-relaxed" style={{ color: 'var(--text-parchment)', borderLeft: '2px solid var(--gold-dim)', paddingLeft: '1rem' }}>
                    "{selected.lore}"
                  </p>
                </div>
                <div className="p-3 rounded" style={{ background: 'rgba(139,32,32,0.2)', borderLeft: '2px solid var(--iron-red)' }}>
                  <p className="text-xs font-ancient uppercase mb-1" style={{ color: 'var(--iron-red)', letterSpacing:'0.1em' }}>⚑ Current Situation</p>
                  <p className="text-sm font-bold font-lore" style={{ color: '#e08080' }}>{selected.currentEvent}</p>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  {[['Terrain', selected.terrain, Mountain], ['Threats', selected.threats.join(' · '), Skull], ['Inhabitants', selected.population, Users]].map(([label, val, Icon])=>(
                    <div key={label}>
                      <p className="text-xs font-ancient uppercase mb-1 flex items-center gap-1" style={{ color: 'var(--text-dim)', letterSpacing:'0.05em' }}>
                        <Icon size={10}/> {label}
                      </p>
                      <p className="text-xs font-lore" style={{ color: 'var(--text-faded)' }}>{val}</p>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Legend */}
      <div className="absolute bottom-5 left-1/2 -translate-x-1/2 z-20 flex items-center gap-5 px-6 py-3 rounded-full"
        style={{ background: 'rgba(8,6,3,0.85)', border: '1px solid var(--border-stone)' }}>
        {Object.entries(atm).slice(0,6).map(([key,c])=>(
          <div key={key} className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full" style={{ background: c.dot, boxShadow: c.glow }}/>
            <span className="text-xs font-ancient" style={{ color: 'var(--text-dim)', fontSize:'0.55rem', letterSpacing:'0.1em', textTransform:'uppercase' }}>{key}</span>
          </div>
        ))}
      </div>
    </motion.div>
  );
};

export default FullMap;
