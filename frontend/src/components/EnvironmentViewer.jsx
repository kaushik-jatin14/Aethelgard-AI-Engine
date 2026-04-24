import React, { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Crosshair, Wind, AlertTriangle, Orbit } from 'lucide-react';
import { locations } from '../data/locations';
import LocationEffects from './LocationEffects';
import VideoBackground from './VideoBackground';

const VIDEO_MAP = {
  mystical: 'yT1a7gIuBwI',
  scary: '6g32h6y6OOM',
  dark: 'v8y8q_27zCg',
  desolate: 'J2mFfT_RGY0',
  adventurous: 'zMvxKryyHeg',
  soothing: '9yv0xWz0y00',
  tense: 'bB_e3T_u108',
  intimidating: '1wP0wA3aE7Q',
  terrifying: 't-e2g8B3_EE'
};

const moodTint = {
  watchful: 'rgba(120, 86, 34, 0.22)',
  tense: 'rgba(128, 44, 26, 0.24)',
  volatile: 'rgba(118, 24, 24, 0.3)',
  cataclysmic: 'rgba(88, 12, 36, 0.38)',
  resolute: 'rgba(116, 98, 36, 0.2)',
};

const EnvironmentViewer = ({ location, isProcessing, dynamicScene = null }) => {
  const locData = useMemo(() => locations.find(l => l.name === location) || locations[0], [location]);
  const imgUrl = locData?.landscapeUrl || locData?.imageThumb;
  const tension = dynamicScene?.tension || 35;
  const threatLevel = dynamicScene?.threat_level || 2;
  const overlayTint = moodTint[dynamicScene?.visual_mood] || 'rgba(0,0,0,0.12)';

  return (
    <div className="relative flex w-full max-w-5xl items-center justify-center overflow-hidden"
      style={{ aspectRatio: '21/9', border: '1px solid var(--border-stone)', boxShadow: '0 0 80px rgba(0,0,0,0.9), inset 0 0 30px rgba(0,0,0,0.5)', background: 'var(--bg-deepest)' }}>

      {/* Cinematic Videographic Background with Image Fallback */}
      <AnimatePresence mode="wait">
        <motion.div key={location} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          transition={{ duration: 2.5 }} className="absolute inset-0 z-0 overflow-hidden">
          
          {/* Image Fallback (renders underneath) */}
          <motion.img src={imgUrl} alt={location}
            className="absolute inset-0 w-full h-full object-cover"
            style={{ filter: 'brightness(0.6) saturate(1.4) contrast(1.05)' }}
            animate={{ scale: [1, 1.07] }}
            transition={{ duration: 30, ease: 'linear', repeat: Infinity, repeatType: 'reverse' }}/>

          {/* YouTube Video (renders on top, opacity 0.65 to blend or hide fallback if it works) */}
          <VideoBackground videoId={VIDEO_MAP[locData.atmosphere] || 'zMvxKryyHeg'} opacity={0.75} blur={0} />
        </motion.div>
      </AnimatePresence>

      {/* Gradient overlays */}
      <div className="absolute inset-0 z-10 pointer-events-none"
        style={{ background: 'linear-gradient(to top, rgba(8,6,3,0.85) 0%, transparent 50%, rgba(8,6,3,0.55) 100%)' }}/>
      <div className="absolute inset-0 z-10 pointer-events-none"
        style={{ background: 'linear-gradient(to right, rgba(8,6,3,0.3) 0%, transparent 40%, transparent 60%, rgba(8,6,3,0.3) 100%)' }}/>
      <motion.div
        className="absolute inset-0 z-10 pointer-events-none"
        style={{ background: `radial-gradient(circle at 50% 50%, transparent 15%, ${overlayTint} 100%)` }}
        animate={{ opacity: [0.45, 0.78, 0.45] }}
        transition={{ duration: Math.max(2.2, 7 - (tension / 20)), repeat: Infinity, ease: 'easeInOut' }}
      />

      {/* Dynamic Location Effects */}
      <LocationEffects atmosphere={locData.atmosphere} locationName={location} isProcessing={isProcessing} dynamicScene={dynamicScene} />

      {/* HUD */}
      <div className="relative z-30 flex h-full w-full flex-col justify-between p-3 sm:p-5">

        {/* Top Row */}
        <div className="flex flex-wrap justify-between gap-3 items-start">
          <div className="stage-panel px-3 py-2 text-xs max-w-[16rem] sm:max-w-[18rem]"
            style={{ fontFamily: 'Cinzel, serif', letterSpacing: '0.08em' }}>
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full" style={{ background: isProcessing ? 'var(--ember)' : 'var(--iron-red)', animation: 'pulse 2s infinite' }}/>
              {isProcessing ? 'Oracle speaks...' : 'Neural Feed Active'}
            </div>
            {dynamicScene?.weather && (
              <div className="stage-text-secondary mt-1 text-[0.58rem]">
                WEATHER: {dynamicScene.weather}
              </div>
            )}
          </div>
          <div className="stage-panel px-3 py-2 text-xs text-right max-w-[14rem]"
            style={{ fontFamily: 'Cinzel, serif', letterSpacing: '0.08em' }}>
            <div>LAT {locData.x}.{Math.floor(Math.random()*900+100)} N</div>
            <div>LNG {locData.y}.{Math.floor(Math.random()*900+100)} W</div>
          </div>
        </div>

        {/* Center Location Name */}
        <div className="flex flex-col items-center gap-3">
          <motion.div className="relative w-12 h-12 flex items-center justify-center"
            animate={isProcessing ? { rotate: 360 } : { rotate: 0 }}
            transition={isProcessing ? { duration: 3, repeat: Infinity, ease: 'linear' } : {}}>
            <div className="absolute inset-0 rounded-full border animate-[spin_10s_linear_infinite]"
              style={{ borderColor: 'rgba(201,168,76,0.2)' }}/>
            <Crosshair size={18} style={{ color: 'rgba(201,168,76,0.6)' }}/>
            {['top-0','bottom-0'].map((pos,i)=>(
              <div key={i} className={`absolute left-1/2 -translate-x-1/2 w-0.5 h-2 ${pos}`} style={{ background: 'var(--iron-red)' }}/>
            ))}
            {['left-0','right-0'].map((pos,i)=>(
              <div key={i} className={`absolute top-1/2 -translate-y-1/2 h-0.5 w-2 ${pos}`} style={{ background: 'var(--iron-red)' }}/>
            ))}
          </motion.div>

          <div className="px-4 py-4 text-center sm:px-8"
            style={{ background: 'var(--stage-surface-strong)', borderLeft: '3px solid var(--iron-red)', borderRight: '3px solid var(--iron-red)', backdropFilter: 'blur(12px)' }}>
            <span className="text-xs uppercase flex items-center justify-center gap-2 mb-1"
              style={{ color: 'var(--iron-red)', fontFamily: 'Cinzel, serif', letterSpacing: '0.35em' }}>
              <MapPin size={10}/> Active Zone
            </span>
            <AnimatePresence mode="wait">
              <motion.h2 key={location} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}
                className="text-2xl font-black uppercase break-words sm:text-3xl"
                style={{ color: 'var(--stage-text-primary)', fontFamily: 'Cinzel Decorative, serif', textShadow: '0 2px 20px rgba(0,0,0,0.9)' }}>
                {location || 'The Unknown'}
              </motion.h2>
            </AnimatePresence>
            <span className="stage-text-muted text-xs italic" style={{ fontFamily: 'Crimson Text, serif' }}>
              {locData.atmosphere} zone
            </span>
            {dynamicScene?.objective_focus && (
              <p className="stage-text-secondary mt-2 max-w-[30rem] break-words text-[0.65rem] uppercase tracking-[0.18em]" style={{ fontFamily: 'Cinzel, serif' }}>
                {dynamicScene.objective_focus}
              </p>
            )}
          </div>
        </div>

        {/* Bottom Row */}
        <div className="flex flex-wrap justify-between gap-3 items-end">
          <div className="stage-panel flex items-center gap-3 px-3 py-2">
            <div className="w-20 h-1 overflow-hidden rounded-full" style={{ background: 'rgba(30,20,10,0.8)' }}>
              <motion.div className="h-full" style={{ background: 'var(--iron-red)' }}
                animate={{ width: [`${Math.max(12, tension - 20)}%`, `${Math.min(100, tension)}%`, `${Math.max(18, tension - 8)}%`] }} transition={{ duration: 6, repeat: Infinity }}/>
            </div>
            <span className="text-xs" style={{ color: 'var(--text-dim)', fontFamily: 'Cinzel, serif', fontSize: '0.6rem', letterSpacing: '0.1em' }}>SIGNAL</span>
          </div>
          <div className="stage-panel flex max-w-[22rem] flex-wrap items-center gap-3 px-3 py-2 text-xs"
            style={{ fontFamily: 'Cinzel, serif', letterSpacing: '0.05em' }}>
            <div className="flex items-center gap-2">
              <Wind size={11}/> <span className="break-words">{dynamicScene?.ambient_cue || locData.threats?.[0] || 'Area Clear'}</span>
            </div>
            <div className="stage-text-secondary flex items-center gap-2">
              <AlertTriangle size={11} />
              <span>THREAT {threatLevel}</span>
            </div>
          </div>
        </div>
      </div>

      {dynamicScene?.hazard && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute bottom-20 left-4 right-4 z-30 rounded-md px-4 py-3 sm:left-1/2 sm:right-auto sm:w-[min(88vw,32rem)] sm:-translate-x-1/2 sm:px-5"
          style={{ background: 'var(--stage-surface-strong)', border: '1px solid rgba(201,168,76,0.3)', color: 'var(--stage-text-primary)', backdropFilter: 'blur(8px)' }}
        >
          <p className="stage-text-secondary text-[0.6rem] uppercase tracking-[0.18em] mb-1 flex items-center gap-2">
            <Orbit size={11} />
            World Hazard Feed
          </p>
          <p className="text-sm break-words" style={{ fontFamily: 'Crimson Text, serif' }}>{dynamicScene.hazard}</p>
        </motion.div>
      )}

      {/* Corner frame ornaments */}
      {['top-0 left-0 border-t border-l','top-0 right-0 border-t border-r','bottom-0 left-0 border-b border-l','bottom-0 right-0 border-b border-r'].map((cls,i)=>(
        <div key={i} className={`absolute w-8 h-8 m-3 z-30 pointer-events-none ${cls}`}
          style={{ borderColor: 'rgba(201,168,76,0.3)' }}/>
      ))}
    </div>
  );
};

export default EnvironmentViewer;
