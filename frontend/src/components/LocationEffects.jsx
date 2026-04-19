import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

// ================================================================
// LOCATION EFFECTS — Dynamic visual overlays per location atmosphere
// Each effect is pure CSS animation — no external libs
// ================================================================

// Particle: single ember for lava zones
const Ember = ({ style }) => (
  <div
    className="absolute w-1 h-1 rounded-full bg-orange-500 pointer-events-none"
    style={{
      ...style,
      animation: `ember-rise ${2 + Math.random() * 3}s ease-out forwards`,
      '--drift': `${(Math.random() - 0.5) * 60}px`,
    }}
  />
);

// Particle: snowflake for tundra
const Snowflake = ({ style }) => (
  <div
    className="absolute pointer-events-none text-white/60 select-none"
    style={{
      ...style,
      fontSize: `${6 + Math.random() * 8}px`,
      animation: `snow-fall ${4 + Math.random() * 4}s linear forwards`,
      '--drift': `${(Math.random() - 0.5) * 40}px`,
    }}
  >❄</div>
);

// Particle: butterfly for forest/grove
const Butterfly = ({ style }) => (
  <div
    className="absolute pointer-events-none text-emerald-300/70 select-none"
    style={{
      ...style,
      fontSize: `${10 + Math.random() * 8}px`,
      animation: `butterfly-drift ${12 + Math.random() * 10}s linear forwards`,
      top: `${20 + Math.random() * 60}%`,
    }}
  >🦋</div>
);

// Particle: bird/creature for plains
const Bird = ({ style }) => (
  <div
    className="absolute pointer-events-none text-amber-200/50 select-none"
    style={{
      ...style,
      fontSize: `${8 + Math.random() * 6}px`,
      animation: `float-creature ${15 + Math.random() * 10}s linear forwards`,
      top: `${15 + Math.random() * 40}%`,
    }}
  >🦅</div>
);

// Generate a stable set of particles
const useParticles = (count, key) => {
  return Array.from({ length: count }, (_, i) => ({
    id: `${key}-${i}`,
    style: {
      left: `${Math.random() * 100}%`,
      animationDelay: `${Math.random() * 8}s`,
      bottom: key === 'ember' ? `${Math.random() * 30}%` : undefined,
    },
  }));
};

// ================================================================
// MAIN EFFECTS COMPONENT
// ================================================================
const LocationEffects = ({ atmosphere, locationName, isProcessing }) => {
  const particles = useRef({});
  if (!particles.current[atmosphere]) {
    particles.current[atmosphere] = {
      embers:     useParticles(18, 'ember'),
      snow:       useParticles(20, 'snow'),
      butterflies:useParticles(6,  'butterfly'),
      birds:      useParticles(4,  'bird'),
    };
  }
  const p = particles.current[atmosphere];

  // Screen shake trigger — for mountains + lava + void
  const shouldShake = ['scary', 'terrifying', 'adventurous'].includes(atmosphere) && locationName && (
    locationName.includes('Crimson') || locationName.includes("Dragon") ||
    locationName.includes('Molten') || locationName.includes('Howling') ||
    locationName.includes('Obsidian')
  );

  return (
    <motion.div
      className="absolute inset-0 pointer-events-none z-20 overflow-hidden"
      animate={shouldShake ? {
        x: [0, -3, 4, -2, 3, -1, 0],
        y: [0, 2, -3, 1, -2, 3, 0],
      } : { x: 0, y: 0 }}
      transition={shouldShake ? {
        duration: 0.5,
        repeat: Infinity,
        repeatDelay: 15 + Math.random() * 10,
        ease: 'easeInOut',
      } : {}}
    >

      {/* LAVA / MOLTEN — ember particles + orange glow pulse */}
      {(atmosphere === 'adventurous' && locationName?.includes('Molten')) && (
        <>
          <div className="absolute inset-0 animate-[lava-pulse_3s_ease-in-out_infinite]" />
          <div className="absolute inset-0 bg-gradient-to-t from-orange-900/30 via-transparent to-transparent" />
          {p.embers.map(e => <Ember key={e.id} style={e.style} />)}
        </>
      )}

      {/* FOREST / GROVE — butterflies + green mist */}
      {(atmosphere === 'soothing' || locationName?.includes('Grove') || locationName?.includes('Wood')) && (
        <>
          <div className="absolute inset-0 bg-gradient-to-b from-emerald-950/20 via-transparent to-emerald-950/30" />
          {p.butterflies.map(b => <Butterfly key={b.id} style={b.style} />)}
        </>
      )}

      {/* FROZEN TUNDRA — snowflakes */}
      {(atmosphere === 'adventurous' && locationName?.includes('Frozen')) && (
        <>
          <div className="absolute inset-0 bg-gradient-to-b from-cyan-950/25 via-transparent to-transparent" />
          {p.snow.map(s => <Snowflake key={s.id} style={s.style} />)}
        </>
      )}

      {/* PLAINS / SANDS — birds, animals drifting */}
      {(atmosphere === 'adventurous' && !locationName?.includes('Frozen') && !locationName?.includes('Dragon') && !locationName?.includes('Molten')) && (
        <>
          {p.birds.map(b => <Bird key={b.id} style={b.style} />)}
        </>
      )}

      {/* VOID / TERRIFYING — glitch pulse vignette */}
      {atmosphere === 'terrifying' && (
        <>
          <motion.div
            className="absolute inset-0 bg-purple-950/20 mix-blend-overlay"
            animate={{ opacity: [0.1, 0.5, 0.1] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          />
          <div className="absolute inset-0 pointer-events-none"
            style={{ boxShadow: 'inset 0 0 120px rgba(80,0,120,0.5)' }}
          />
        </>
      )}

      {/* SCARY — dark red vignette + subtle pulse */}
      {atmosphere === 'scary' && !shouldShake && (
        <motion.div
          className="absolute inset-0 pointer-events-none"
          style={{ boxShadow: 'inset 0 0 100px rgba(100,0,0,0.4)' }}
          animate={{ opacity: [0.6, 1, 0.6] }}
          transition={{ duration: 4, repeat: Infinity }}
        />
      )}

      {/* MYSTICAL — blue shimmer */}
      {atmosphere === 'mystical' && (
        <motion.div
          className="absolute inset-0 bg-gradient-to-t from-blue-950/20 via-transparent to-transparent"
          animate={{ opacity: [0.3, 0.7, 0.3] }}
          transition={{ duration: 6, repeat: Infinity }}
        />
      )}

      {/* SANCTUARY OF LIGHT — golden glow bloom */}
      {atmosphere === 'soothing' && locationName?.includes('Sanctuary') && (
        <motion.div
          className="absolute inset-0 bg-amber-500/10"
          animate={{ opacity: [0.2, 0.6, 0.2] }}
          transition={{ duration: 5, repeat: Infinity, style: 'animate-[golden-glow-pulse_5s_ease-in-out_infinite]' }}
        />
      )}

      {/* INTIMIDATING — dark pulse */}
      {atmosphere === 'intimidating' && (
        <motion.div
          className="absolute inset-0 pointer-events-none"
          style={{ boxShadow: 'inset 0 0 80px rgba(60,0,80,0.35)' }}
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 3, repeat: Infinity }}
        />
      )}

      {/* PROCESSING — bright flash */}
      {isProcessing && (
        <motion.div
          className="absolute inset-0 bg-amber-800/15 mix-blend-screen"
          animate={{ opacity: [0, 0.4, 0] }}
          transition={{ duration: 0.25, repeat: Infinity }}
        />
      )}

      {/* MOUNTAIN SHAKE rock debris */}
      {shouldShake && (
        <div className="absolute inset-0">
          {[...Array(6)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 bg-stone-600/60 rounded-sm"
              style={{ left: `${10 + i * 15}%`, top: '-10px' }}
              animate={{ y: ['0vh', '110vh'], rotate: [0, 360], opacity: [0.8, 0] }}
              transition={{ duration: 2 + i * 0.3, repeat: Infinity, repeatDelay: 18 + i * 2 }}
            />
          ))}
        </div>
      )}

    </motion.div>
  );
};

export default LocationEffects;
