import React, { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, Crosshair, MapPin, Orbit, Wind } from 'lucide-react';
import { locations } from '../data/locations';
import LocationEffects from './LocationEffects';

const atmosphereBackdrop = {
  mystical: 'radial-gradient(circle at 50% 28%, rgba(70, 121, 197, 0.34), transparent 32%), radial-gradient(circle at 68% 62%, rgba(92, 49, 128, 0.28), transparent 34%), linear-gradient(180deg, rgba(8,6,20,0.88) 0%, rgba(6,8,22,0.78) 55%, rgba(7,5,12,0.96) 100%)',
  scary: 'radial-gradient(circle at 50% 28%, rgba(147, 25, 25, 0.28), transparent 32%), radial-gradient(circle at 76% 58%, rgba(213, 95, 33, 0.18), transparent 28%), linear-gradient(180deg, rgba(17,6,6,0.9) 0%, rgba(24,8,8,0.78) 55%, rgba(10,5,6,0.96) 100%)',
  dark: 'radial-gradient(circle at 50% 22%, rgba(83, 73, 115, 0.2), transparent 24%), linear-gradient(180deg, rgba(10,10,16,0.92) 0%, rgba(11,12,20,0.82) 55%, rgba(7,6,10,0.98) 100%)',
  desolate: 'radial-gradient(circle at 50% 22%, rgba(120, 101, 64, 0.16), transparent 26%), linear-gradient(180deg, rgba(24,18,12,0.92) 0%, rgba(33,24,15,0.84) 55%, rgba(13,9,6,0.98) 100%)',
  adventurous: 'radial-gradient(circle at 50% 25%, rgba(214, 110, 28, 0.2), transparent 30%), radial-gradient(circle at 70% 58%, rgba(247, 183, 56, 0.16), transparent 26%), linear-gradient(180deg, rgba(18,11,7,0.88) 0%, rgba(32,18,9,0.76) 58%, rgba(10,7,5,0.98) 100%)',
  soothing: 'radial-gradient(circle at 46% 24%, rgba(88, 148, 120, 0.24), transparent 30%), linear-gradient(180deg, rgba(8,18,12,0.9) 0%, rgba(10,22,14,0.78) 55%, rgba(7,10,8,0.98) 100%)',
  tense: 'radial-gradient(circle at 50% 26%, rgba(190, 77, 35, 0.22), transparent 30%), linear-gradient(180deg, rgba(20,10,7,0.92) 0%, rgba(26,14,8,0.8) 55%, rgba(9,7,5,0.98) 100%)',
  intimidating: 'radial-gradient(circle at 50% 18%, rgba(98, 71, 164, 0.2), transparent 24%), linear-gradient(180deg, rgba(12,9,18,0.94) 0%, rgba(18,10,22,0.82) 55%, rgba(7,5,10,0.98) 100%)',
  terrifying: 'radial-gradient(circle at 50% 18%, rgba(132, 13, 44, 0.26), transparent 24%), radial-gradient(circle at 78% 62%, rgba(58, 9, 42, 0.22), transparent 26%), linear-gradient(180deg, rgba(18,6,12,0.96) 0%, rgba(17,7,14,0.84) 55%, rgba(7,4,8,0.99) 100%)',
};

const moodTint = {
  watchful: 'rgba(92, 64, 27, 0.22)',
  tense: 'rgba(126, 50, 27, 0.26)',
  volatile: 'rgba(134, 32, 32, 0.28)',
  cataclysmic: 'rgba(89, 18, 45, 0.36)',
  resolute: 'rgba(72, 93, 63, 0.24)',
};

const EnvironmentViewer = ({ location, isProcessing, dynamicScene = null }) => {
  const locData = useMemo(() => locations.find((entry) => entry.name === location) || locations[0], [location]);
  const tension = dynamicScene?.tension || 35;
  const threatLevel = dynamicScene?.threat_level || 2;
  const overlayTint = moodTint[dynamicScene?.visual_mood] || 'rgba(0,0,0,0.18)';

  return (
    <div
      className="relative h-full w-full overflow-hidden"
      style={{
        background: atmosphereBackdrop[locData.atmosphere] || atmosphereBackdrop.mystical,
      }}
    >
      <motion.img
        src="/assets/map_bg.png"
        alt=""
        className="absolute inset-0 h-full w-full object-cover opacity-16"
        style={{ mixBlendMode: 'screen' }}
        animate={{ scale: [1, 1.05, 1] }}
        transition={{ duration: 22, repeat: Infinity, ease: 'easeInOut' }}
      />

      <motion.div
        className="absolute inset-0"
        style={{ background: `radial-gradient(circle at 50% 50%, transparent 15%, ${overlayTint} 100%)` }}
        animate={{ opacity: [0.42, 0.78, 0.42] }}
        transition={{ duration: Math.max(2.4, 7 - (tension / 24)), repeat: Infinity, ease: 'easeInOut' }}
      />

      <div
        className="absolute inset-0"
        style={{
          background:
            'linear-gradient(180deg, rgba(7,5,3,0.84) 0%, rgba(7,5,3,0.18) 18%, rgba(7,5,3,0.12) 62%, rgba(7,5,3,0.86) 100%)',
        }}
      />

      <LocationEffects atmosphere={locData.atmosphere} locationName={location} isProcessing={isProcessing} dynamicScene={dynamicScene} />

      <div className="relative z-20 flex h-full w-full flex-col justify-between px-4 pb-5 pt-20 sm:px-6 sm:pb-6 sm:pt-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div
            className="stage-panel-strong max-w-[18rem] rounded-2xl px-4 py-3"
            data-keep-dialogue
          >
            <p className="stage-text-secondary text-[0.58rem] uppercase tracking-[0.18em] flex items-center gap-2">
              <Wind size={11} />
              Realm Pulse
            </p>
            <p className="mt-1 text-sm font-semibold" style={{ color: 'var(--stage-text-primary)', fontFamily: 'Crimson Text, serif' }}>
              {dynamicScene?.weather || 'The air stirs with forgotten magic.'}
            </p>
            {dynamicScene?.objective_focus && (
              <p className="stage-text-muted mt-2 text-[0.68rem] leading-5 uppercase tracking-[0.12em]">
                {dynamicScene.objective_focus}
              </p>
            )}
          </div>

          <div
            className="stage-panel rounded-2xl px-4 py-3 text-right"
            data-keep-dialogue
          >
            <p className="text-[0.58rem] uppercase tracking-[0.18em] stage-text-secondary flex items-center justify-end gap-2">
              <MapPin size={11} />
              Drift Coordinates
            </p>
            <p className="mt-1 text-sm" style={{ fontFamily: 'Cinzel, serif', color: 'var(--stage-text-primary)' }}>
              LAT {locData.x}.{Math.floor(Math.random() * 900 + 100)} N
            </p>
            <p className="text-sm" style={{ fontFamily: 'Cinzel, serif', color: 'var(--stage-text-primary)' }}>
              LNG {locData.y}.{Math.floor(Math.random() * 900 + 100)} W
            </p>
          </div>
        </div>

        <div className="pointer-events-none flex flex-1 items-center justify-center px-4">
          <div
            className="max-w-[min(88vw,40rem)] rounded-[2rem] px-6 py-5 text-center"
            style={{
              background: 'linear-gradient(180deg, rgba(14,10,7,0.76) 0%, rgba(11,8,6,0.9) 100%)',
              border: '1px solid rgba(201,168,76,0.22)',
              boxShadow: '0 18px 60px rgba(0,0,0,0.45)',
              backdropFilter: 'blur(18px)',
            }}
          >
            <span className="stage-text-secondary flex items-center justify-center gap-2 text-[0.62rem] uppercase tracking-[0.32em]">
              <Crosshair size={12} />
              Active Zone
            </span>
            <AnimatePresence mode="wait">
              <motion.h2
                key={location}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mt-3 text-4xl font-black uppercase sm:text-6xl"
                style={{
                  color: 'var(--stage-text-primary)',
                  fontFamily: 'Cinzel Decorative, serif',
                  textShadow: '0 2px 24px rgba(0,0,0,0.7)',
                }}
              >
                {location}
              </motion.h2>
            </AnimatePresence>
            <p className="stage-text-muted mt-2 text-sm italic" style={{ fontFamily: 'Crimson Text, serif' }}>
              {locData.atmosphere} frontier
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-end justify-between gap-3">
          <div
            className="stage-panel max-w-[18rem] rounded-2xl px-4 py-3"
            data-keep-dialogue
          >
            <p className="stage-text-secondary text-[0.56rem] uppercase tracking-[0.18em] flex items-center gap-2">
              <Orbit size={11} />
              Hazard Feed
            </p>
            <p className="mt-1 text-sm leading-relaxed" style={{ color: 'var(--stage-text-primary)', fontFamily: 'Crimson Text, serif' }}>
              {dynamicScene?.hazard || locData.currentEvent}
            </p>
          </div>

          <div
            className="stage-panel-strong min-w-[16rem] rounded-2xl px-4 py-3"
            data-keep-dialogue
          >
            <div className="flex items-center justify-between gap-4">
              <div className="flex-1">
                <p className="stage-text-muted text-[0.56rem] uppercase tracking-[0.14em] mb-1">
                  Tension
                </p>
                <div className="h-2 overflow-hidden rounded-full" style={{ background: 'rgba(24,18,12,0.9)' }}>
                  <motion.div
                    className="h-full"
                    animate={{ width: `${tension}%` }}
                    transition={{ duration: 0.7 }}
                    style={{
                      background:
                        tension >= 70
                          ? 'linear-gradient(90deg, #7a1010, #d24724)'
                          : 'linear-gradient(90deg, #876229, #d1a049)',
                    }}
                  />
                </div>
              </div>
              <div className="text-right">
                <p className="stage-text-secondary text-[0.56rem] uppercase tracking-[0.14em] flex items-center justify-end gap-2">
                  <AlertTriangle size={11} />
                  Threat
                </p>
                <p className="mt-1 text-lg font-bold" style={{ color: 'var(--stage-text-primary)', fontFamily: 'Cinzel, serif' }}>
                  {threatLevel}/5
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {['top-0 left-0 border-t border-l', 'top-0 right-0 border-t border-r', 'bottom-0 left-0 border-b border-l', 'bottom-0 right-0 border-b border-r'].map((cls, index) => (
        <div
          key={index}
          className={`absolute z-20 m-3 h-8 w-8 pointer-events-none ${cls}`}
          style={{ borderColor: 'rgba(201,168,76,0.25)' }}
        />
      ))}
    </div>
  );
};

export default EnvironmentViewer;
