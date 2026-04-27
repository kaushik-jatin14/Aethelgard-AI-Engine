import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { characters } from '../data/characters';
import { useUISounds } from '../hooks/useUISounds';
import VideoBackground from './VideoBackground';

const CharacterSelect = ({ onSelectCharacter }) => {
  const { withSounds } = useUISounds();
  const [hovered, setHovered] = useState(null);
  const [selected, setSelected] = useState(null);
  const [starting, setStarting] = useState(false);

  const display = selected || hovered || characters[0];
  
  const leftChars = characters.slice(0, 4);
  const rightChars = characters.slice(4, 8);

  const handleBegin = () => {
    if (!selected) return;
    setStarting(true);
    setTimeout(() => onSelectCharacter(selected), 1500);
  };

  return (
    <div className="relative w-full h-screen overflow-hidden" style={{ background: 'var(--bg-dark)', fontFamily: 'var(--font-ui)' }}>

      {/* Background - cinematic video background on hover/select */}
      <AnimatePresence mode="wait">
        <motion.div key={display.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.5 }}
          className="absolute inset-0 z-0 overflow-hidden">
          {display.videoLoop ? (
            <VideoBackground videoId={display.videoLoop} opacity={0.3} blur={8} />
          ) : (
            <motion.img src={display.image || '/assets/fallback.jpg'} alt=""
              className="absolute inset-0 w-full h-full object-cover object-top"
              style={{ filter: `brightness(0.18) saturate(1.5) blur(12px)`, transformOrigin: 'center' }}
              animate={{ scale: [1, 1.07] }} transition={{ duration: 25, ease: 'linear', repeat: Infinity, repeatType: 'reverse' }}
              onError={e => { e.target.style.display = 'none'; }}/>
          )}
          {display.fantasyOverlay && (
            <div className="absolute inset-0" style={{ background: display.fantasyOverlay.replace('0.45','0.25').replace('0.50','0.20'), mixBlendMode: 'overlay' }}/>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Gradient overlays */}
      <div className="absolute inset-0 z-0" style={{ background: 'linear-gradient(to right, rgba(4,10,18,0.96) 0%, rgba(7,16,28,0.56) 55%, rgba(4,10,18,0.9) 100%)' }}/>
      <div className="absolute inset-0 z-0" style={{ background: 'linear-gradient(to top, rgba(3,8,15,0.98) 0%, transparent 42%)' }}/>

      {/* Header */}
      <div className="relative z-20 text-center pt-6 pb-2">
        <div className="divider-ancient mb-4 mx-24"/>
        <h1 className="text-4xl font-black uppercase" style={{ color: 'var(--gold)', fontFamily: 'var(--font-display)', textShadow: '0 0 40px rgba(113,220,245,0.4)' }}>
          Choose Your Champion
        </h1>
        <p className="text-xs mt-2 italic" style={{ color: 'var(--text-dim)', fontFamily: 'var(--font-body)', letterSpacing: '0.2em' }}>
          {selected ? `${selected.name} - Destiny Sealed` : 'Hover to inspect · Click to seal thy fate'}
        </p>
        <div className="divider-ancient mt-4 mx-24"/>
      </div>

      <div className="relative z-20 flex flex-1 overflow-hidden px-6 pb-6 gap-8 max-w-[1900px] mx-auto w-full justify-between" style={{ height: 'calc(100vh - 120px)' }}>

        {/* Left side - 4 characters */}
        <div className="w-[22%] flex flex-col gap-4 py-2 overflow-y-auto custom-scrollbar pr-2">
          {leftChars.map((char, idx) => {
            const isChosen = selected?.id === char.id;
            const isHov = hovered?.id === char.id;
            const isFemale = char.gender === 'female';

            return (
              <motion.div key={char.id}
                initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: idx * 0.06 }}
                {...withSounds({
                  onMouseEnter: () => !selected && setHovered(char),
                  onMouseLeave: () => !selected && setHovered(null),
                  onClick: () => setSelected(char === selected ? null : char)
                })}
                className="relative overflow-hidden cursor-pointer"
                style={{
                  height: '22vh',
                  minHeight: '160px',
                  border: `2px solid ${isChosen ? 'var(--gold)' : 'var(--border-stone)'}`,
                  transform: isChosen ? 'scale(1.02)' : isHov ? 'scale(1.01)' : 'scale(1)',
                  transition: 'all 0.25s',
                  zIndex: isChosen || isHov ? 10 : 1,
                }}
              >
                {/* Cinematic Card Content */}
                {char.image ? (
                  <div className="absolute inset-0">
                    {/* Hover GIF effect - If hovered, show the cinematic video behind the card tint */}
                    {(isHov || isChosen) && char.videoLoop ? (
                      <div className="absolute inset-0 pointer-events-none opacity-80" style={{ mixBlendMode: 'screen' }}>
                        <img src={`https://img.youtube.com/vi/${char.videoLoop}/maxresdefault.jpg`} className="w-full h-full object-cover" />
                      </div>
                    ) : null}
                    <img src={char.image} alt={char.name}
                      className="w-full h-full object-cover object-top"
                      style={{ filter: isFemale && char.fantasyFilter ? char.fantasyFilter : 'contrast(1.1) brightness(0.85) saturate(1.2)', transition: 'transform 3s ease', opacity: (isHov || isChosen) ? 0.7 : 1 }}
                      onError={e => { e.target.style.display='none'; }}/>
                    {isFemale && char.fantasyOverlay && (
                      <div className="absolute inset-0" style={{ background: char.fantasyOverlay, mixBlendMode: 'color' }}/>
                    )}
                  </div>
                ) : (
                  <div className={`absolute inset-0 bg-gradient-to-br ${char.fallbackColor || 'from-slate-900 to-slate-950'}`}/>
                )}

                {/* Name plate */}
                <div className="absolute bottom-0 left-0 right-0 p-3"
                  style={{ background: 'linear-gradient(to top, rgba(4,9,16,0.98) 0%, rgba(5,12,22,0.62) 60%, transparent 100%)' }}>
                  <p className="text-sm font-black uppercase leading-tight" style={{ color: isChosen ? 'var(--gold)' : 'var(--text-parchment)', fontFamily: 'var(--font-ui)' }}>{char.name}</p>
                  <p className="text-xs italic" style={{ color: 'var(--text-dim)', fontFamily: 'var(--font-body)' }}>{char.title}</p>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Center - detail */}
        <div className="w-[45%] flex flex-col h-full mx-auto">
          <AnimatePresence mode="wait">
            <motion.div key={display.id + (selected?'-S':'-H')}
              initial={{ opacity: 0, x: 15 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}
              className="flex flex-col h-full overflow-hidden rounded-lg"
              style={{ background: 'var(--bg-panel)', border: '1px solid var(--border-gold)', boxShadow: '0 0 50px rgba(0,0,0,0.8)' }}>

              {/* Portrait top */}
              <div className="relative h-48 overflow-hidden flex-shrink-0">
                {display.image ? (
                  <div className="absolute inset-0">
                    <img src={display.image} alt={display.name}
                      className="w-full h-full object-cover object-top"
                      style={{ filter: display.gender === 'female' && display.fantasyFilter ? display.fantasyFilter : 'contrast(1.1) brightness(0.8)' }}
                      onError={e => { e.target.style.display='none'; }}/>
                    {display.gender === 'female' && display.fantasyOverlay && (
                      <div className="absolute inset-0" style={{ background: display.fantasyOverlay, mixBlendMode: 'color' }}/>
                    )}
                  </div>
                ) : (
                  <div className={`absolute inset-0 bg-gradient-to-br ${display.fallbackColor}`}/>
                )}
                <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, var(--bg-panel) 0%, transparent 60%)' }}/>
                <div className="absolute bottom-3 left-5">
                  <h2 className="text-2xl font-black uppercase" style={{ color: 'var(--text-parchment)', fontFamily: 'var(--font-ui)', textShadow: '0 2px 10px rgba(0,0,0,0.9)' }}>{display.name}</h2>
                  <p className="text-xs font-bold italic" style={{ color: 'var(--gold)', fontFamily: 'var(--font-body)', letterSpacing: '0.2em' }}>{display.title}</p>
                </div>
              </div>

              {/* Stats */}
              <div className="px-5 pt-4 pb-3 flex-shrink-0">
                <p className="text-xs font-ancient uppercase mb-3" style={{ color: 'var(--text-dim)', letterSpacing: '0.15em' }}>Combat Metrics</p>
                {[
                  ['Strength', display.stats.strength, 'stat-bar-fill-str'],
                  ['Agility', display.stats.agility, 'stat-bar-fill-agi'],
                  ['Magic', display.stats.magic, 'stat-bar-fill-mag'],
                  ['Stealth', display.stats.stealth, 'stat-bar-fill-stl'],
                  ['Weakness', display.stats.weakness, 'stat-bar-fill-weak'],
                ].map(([label, val, fillClass]) => (
                  <div key={label} className="flex items-center gap-3 mb-2">
                    <span className="text-xs font-ancient w-16 flex-shrink-0 text-right" style={{ color: label==='Weakness'?'var(--gold)':'var(--text-dim)', fontSize:'0.6rem', letterSpacing:'0.08em' }}>{label}</span>
                    <div className="flex-1 stat-bar-track rounded-sm">
                      <motion.div key={val} initial={{ width: 0 }} animate={{ width: `${val}%` }}
                        transition={{ duration: 0.7 }} className={`h-full ${fillClass}`}/>
                    </div>
                    <span className="text-xs w-8 text-right font-ancient" style={{ color: 'var(--text-dim)', fontSize:'0.6rem' }}>{val}%</span>
                  </div>
                ))}
              </div>

              {/* Lore (when selected) */}
              <div className="flex-1 overflow-y-auto custom-scrollbar px-5 pb-4">
                {selected ? (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4 border-t pt-4" style={{ borderColor: 'var(--border-stone)' }}>
                    <div>
                      <p className="text-xs font-ancient uppercase mb-2" style={{ color: 'var(--text-dim)', letterSpacing:'0.1em' }}>Ancient Lore</p>
                      <p className="text-sm font-lore italic leading-relaxed" style={{ color: 'var(--text-parchment)', borderLeft:'2px solid var(--gold-dim)', paddingLeft:'0.75rem' }}>
                        "{display.lore}"
                      </p>
                    </div>
                    <div className="p-3 rounded" style={{ background: 'rgba(113,220,245,0.07)', border: '1px solid var(--border-gold)' }}>
                      <p className="text-xs font-ancient uppercase mb-1" style={{ color: 'var(--gold)', letterSpacing:'0.1em' }}>Mission</p>
                      <p className="text-sm font-lore font-bold" style={{ color: 'var(--text-parchment)' }}>{display.mission}</p>
                    </div>
                    <div>
                      <p className="text-xs font-ancient uppercase mb-1.5" style={{ color: 'var(--text-dim)', letterSpacing:'0.1em' }}>Starting Territory</p>
                      <p className="text-sm font-lore" style={{ color: 'var(--text-faded)', fontStyle:'italic' }}>{display.startLocation}</p>
                    </div>
                  </motion.div>
                ) : (
                  <div className="h-full flex items-center justify-center text-center p-4 my-4 rounded"
                    style={{ border: '1px dashed var(--border-stone)' }}>
                    <div>
                      <div className="text-2xl mb-3 opacity-40">✦</div>
                      <p className="text-xs font-ancient" style={{ color: 'var(--text-dim)', letterSpacing:'0.1em' }}>Click a Champion<br/>to reveal their ancient lore</p>
                    </div>
                  </div>
                )}
              </div>

              {/* CTA */}
              <div className="p-4 border-t flex-shrink-0" style={{ borderColor: 'var(--border-stone)' }}>
                <button {...withSounds({ onClick: handleBegin })} disabled={!selected || starting}
                  className="btn-ancient w-full py-3.5 px-4 rounded text-sm flex items-center justify-center gap-2 disabled:opacity-40">
                  {starting ? (
                    <><div className="w-4 h-4 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: 'var(--gold)', borderTopColor: 'transparent' }}/> Entering the Realm...</>
                  ) : selected ? (
                    `Enter the Realm as ${selected.name}`
                  ) : 'Select a Champion First'}
                </button>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Right side - 4 characters */}
        <div className="w-[22%] flex flex-col gap-4 py-2 overflow-y-auto custom-scrollbar pl-2">
          {rightChars.map((char, idx) => {
            const isChosen = selected?.id === char.id;
            const isHov = hovered?.id === char.id;
            const isFemale = char.gender === 'female';

            return (
              <motion.div key={char.id}
                initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: idx * 0.06 }}
                {...withSounds({
                  onMouseEnter: () => !selected && setHovered(char),
                  onMouseLeave: () => !selected && setHovered(null),
                  onClick: () => setSelected(char === selected ? null : char)
                })}
                className="relative overflow-hidden cursor-pointer"
                style={{
                  height: '22vh',
                  minHeight: '160px',
                  border: `2px solid ${isChosen ? 'var(--gold)' : 'var(--border-stone)'}`,
                  transform: isChosen ? 'scale(1.02)' : isHov ? 'scale(1.01)' : 'scale(1)',
                  transition: 'all 0.25s',
                  zIndex: isChosen || isHov ? 10 : 1,
                }}
              >
                {/* Cinematic Card Content */}
                {char.image ? (
                  <div className="absolute inset-0">
                    {(isHov || isChosen) && char.videoLoop ? (
                      <div className="absolute inset-0 pointer-events-none opacity-80" style={{ mixBlendMode: 'screen' }}>
                        <img src={`https://img.youtube.com/vi/${char.videoLoop}/maxresdefault.jpg`} className="w-full h-full object-cover" />
                      </div>
                    ) : null}
                    <img src={char.image} alt={char.name}
                      className="w-full h-full object-cover object-top"
                      style={{ filter: isFemale && char.fantasyFilter ? char.fantasyFilter : 'contrast(1.1) brightness(0.85) saturate(1.2)', transition: 'transform 3s ease', opacity: (isHov || isChosen) ? 0.7 : 1 }}
                      onError={e => { e.target.style.display='none'; }}/>
                    {isFemale && char.fantasyOverlay && (
                      <div className="absolute inset-0" style={{ background: char.fantasyOverlay, mixBlendMode: 'color' }}/>
                    )}
                  </div>
                ) : (
                  <div className={`absolute inset-0 bg-gradient-to-br ${char.fallbackColor || 'from-slate-900 to-slate-950'}`}/>
                )}

                {/* Name plate */}
                <div className="absolute bottom-0 left-0 right-0 p-3"
                  style={{ background: 'linear-gradient(to top, rgba(4,9,16,0.98) 0%, rgba(5,12,22,0.62) 60%, transparent 100%)' }}>
                  <p className="text-sm font-black uppercase leading-tight" style={{ color: isChosen ? 'var(--gold)' : 'var(--text-parchment)', fontFamily: 'var(--font-ui)' }}>{char.name}</p>
                  <p className="text-xs italic" style={{ color: 'var(--text-dim)', fontFamily: 'var(--font-body)' }}>{char.title}</p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Start cinematic overlay */}
      <AnimatePresence>
        {starting && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="absolute inset-0 z-50 flex flex-col items-center justify-center gap-6"
            style={{ background: 'var(--bg-dark)' }}>
            <div className="w-16 h-16 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: 'var(--border-gold)', borderTopColor: 'var(--gold)' }}/>
            <div className="text-center">
              <p className="text-xs font-ancient uppercase mb-2" style={{ color: 'var(--gold)', letterSpacing:'0.4em' }}>Destiny Sealed</p>
              <p className="text-2xl font-black uppercase" style={{ color: 'var(--text-parchment)', fontFamily: 'var(--font-display)' }}>{selected?.name}</p>
              <p className="text-sm italic mt-1" style={{ color: 'var(--text-dim)', fontFamily: 'var(--font-body)' }}>{selected?.title}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CharacterSelect;

