import React, { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, Crosshair, MapPin, Orbit, Wind } from 'lucide-react';
import { locations } from '../data/locations';
import LocationEffects from './LocationEffects';

const atmosphereBackdrop = {
  mystical: 'radial-gradient(circle at 50% 28%, rgba(85, 165, 255, 0.28), transparent 32%), radial-gradient(circle at 68% 62%, rgba(134, 98, 231, 0.2), transparent 34%), linear-gradient(180deg, rgba(7,12,27,0.9) 0%, rgba(6,14,26,0.82) 55%, rgba(5,9,18,0.98) 100%)',
  scary: 'radial-gradient(circle at 50% 28%, rgba(196, 84, 118, 0.22), transparent 32%), radial-gradient(circle at 76% 58%, rgba(114, 160, 255, 0.14), transparent 28%), linear-gradient(180deg, rgba(14,8,18,0.92) 0%, rgba(18,10,24,0.82) 55%, rgba(8,6,12,0.98) 100%)',
  dark: 'radial-gradient(circle at 50% 22%, rgba(94, 110, 152, 0.18), transparent 24%), linear-gradient(180deg, rgba(8,12,20,0.94) 0%, rgba(9,14,22,0.86) 55%, rgba(5,8,14,0.99) 100%)',
  desolate: 'radial-gradient(circle at 50% 22%, rgba(120, 155, 190, 0.14), transparent 26%), linear-gradient(180deg, rgba(14,18,24,0.94) 0%, rgba(15,20,28,0.86) 55%, rgba(8,10,15,0.99) 100%)',
  adventurous: 'radial-gradient(circle at 50% 25%, rgba(79, 182, 220, 0.18), transparent 30%), radial-gradient(circle at 70% 58%, rgba(160, 212, 255, 0.14), transparent 26%), linear-gradient(180deg, rgba(8,18,28,0.9) 0%, rgba(10,22,33,0.8) 58%, rgba(5,11,19,0.99) 100%)',
  soothing: 'radial-gradient(circle at 46% 24%, rgba(88, 196, 174, 0.24), transparent 30%), linear-gradient(180deg, rgba(7,18,18,0.92) 0%, rgba(9,22,24,0.82) 55%, rgba(5,10,12,0.99) 100%)',
  tense: 'radial-gradient(circle at 50% 26%, rgba(99, 157, 255, 0.2), transparent 30%), linear-gradient(180deg, rgba(9,14,23,0.94) 0%, rgba(10,18,28,0.84) 55%, rgba(5,8,13,0.99) 100%)',
  intimidating: 'radial-gradient(circle at 50% 18%, rgba(115, 96, 226, 0.22), transparent 24%), linear-gradient(180deg, rgba(9,10,24,0.96) 0%, rgba(12,12,28,0.86) 55%, rgba(5,6,14,0.99) 100%)',
  terrifying: 'radial-gradient(circle at 50% 18%, rgba(173, 65, 116, 0.24), transparent 24%), radial-gradient(circle at 78% 62%, rgba(76, 110, 204, 0.2), transparent 26%), linear-gradient(180deg, rgba(12,8,22,0.97) 0%, rgba(13,9,24,0.88) 55%, rgba(5,5,14,1) 100%)',
};

const moodTint = {
  watchful: 'rgba(56, 122, 196, 0.18)',
  tense: 'rgba(116, 88, 210, 0.18)',
  volatile: 'rgba(184, 71, 118, 0.22)',
  cataclysmic: 'rgba(116, 67, 184, 0.28)',
  resolute: 'rgba(58, 140, 132, 0.18)',
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
      <motion.div
        className="absolute inset-[-12%]"
        style={{
          background: `
            radial-gradient(circle at 20% 24%, rgba(86, 133, 184, 0.18), transparent 24%),
            radial-gradient(circle at 78% 22%, rgba(211, 122, 66, 0.16), transparent 24%),
            radial-gradient(circle at 52% 76%, rgba(109, 47, 61, 0.16), transparent 28%)
          `,
          filter: 'blur(30px)',
        }}
        animate={{ scale: [1, 1.08, 1], rotate: [0, 1.2, 0] }}
        transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut' }}
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
            'linear-gradient(180deg, rgba(4,9,16,0.82) 0%, rgba(4,9,16,0.18) 18%, rgba(4,9,16,0.12) 62%, rgba(4,9,16,0.84) 100%)',
        }}
      />

      <LocationEffects atmosphere={locData.atmosphere} locationName={location} isProcessing={isProcessing} dynamicScene={dynamicScene} />

      <div className="relative z-20 flex h-full w-full flex-col justify-between px-4 py-5 sm:px-6 sm:py-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div
            className="stage-panel-strong max-w-[18rem] rounded-2xl px-4 py-3"
            data-keep-dialogue
          >
            <p className="stage-text-secondary text-[0.58rem] uppercase tracking-[0.18em] flex items-center gap-2">
              <Wind size={11} />
              Realm Pulse
            </p>
            <p className="mt-1 text-sm font-semibold" style={{ color: 'var(--stage-text-primary)', fontFamily: 'var(--font-body)' }}>
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
            <p className="mt-1 text-sm" style={{ fontFamily: 'var(--font-ui)', color: 'var(--stage-text-primary)' }}>
              LAT {locData.x}.{Math.floor(Math.random() * 900 + 100)} N
            </p>
            <p className="text-sm" style={{ fontFamily: 'var(--font-ui)', color: 'var(--stage-text-primary)' }}>
              LNG {locData.y}.{Math.floor(Math.random() * 900 + 100)} W
            </p>
          </div>
        </div>

        <div className="pointer-events-none flex flex-1 items-center justify-center px-4 py-3">
          <div
            className="max-w-[min(88vw,40rem)] rounded-[2rem] px-6 py-5 text-center"
            style={{
              background: 'linear-gradient(180deg, rgba(9,18,29,0.72) 0%, rgba(7,14,24,0.9) 100%)',
              border: '1px solid rgba(113,220,245,0.22)',
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
                  fontFamily: 'var(--font-display)',
                  textShadow: '0 2px 24px rgba(0,0,0,0.7)',
                }}
              >
                {location}
              </motion.h2>
            </AnimatePresence>
            <p className="stage-text-muted mt-2 text-sm italic" style={{ fontFamily: 'var(--font-body)' }}>
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
            <p className="mt-1 text-sm leading-relaxed" style={{ color: 'var(--stage-text-primary)', fontFamily: 'var(--font-body)' }}>
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
                <div className="h-2 overflow-hidden rounded-full" style={{ background: 'rgba(9,16,24,0.92)' }}>
                  <motion.div
                    className="h-full"
                    animate={{ width: `${tension}%` }}
                    transition={{ duration: 0.7 }}
                    style={{
                      background:
                        tension >= 70
                          ? 'linear-gradient(90deg, #8d4d9b, #ff7396)'
                          : 'linear-gradient(90deg, #4d9bc2, #8ce5ff)',
                    }}
                  />
                </div>
              </div>
              <div className="text-right">
                <p className="stage-text-secondary text-[0.56rem] uppercase tracking-[0.14em] flex items-center justify-end gap-2">
                  <AlertTriangle size={11} />
                  Threat
                </p>
                <p className="mt-1 text-lg font-bold" style={{ color: 'var(--stage-text-primary)', fontFamily: 'var(--font-ui)' }}>
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
          style={{ borderColor: 'rgba(113,220,245,0.25)' }}
        />
      ))}
    </div>
  );
};

export default EnvironmentViewer;

