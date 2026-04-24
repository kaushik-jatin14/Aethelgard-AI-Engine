import React from 'react';
import { ChevronLeft, ChevronRight, Volume2, VolumeX } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const NarrationOverlay = ({
  dialogueLog = [],
  dialogueCursor = 0,
  dialoguePageIndex = 0,
  onPrevious,
  onNext,
  onReplay,
  onClose,
  narrationEnabled = true,
}) => {
  const activeEntry = dialogueLog[dialogueCursor];
  const pages = activeEntry?.pages || [];
  const activePage = pages[dialoguePageIndex];

  if (!activeEntry || !activePage) {
    return null;
  }

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={`${activeEntry.id}-${dialoguePageIndex}`}
        initial={{ opacity: 0, y: 24, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 18, scale: 0.98 }}
        transition={{ duration: 0.28, ease: 'easeOut' }}
        className="absolute left-4 right-4 bottom-4 z-[62] sm:left-6 sm:right-auto sm:max-w-[34rem] lg:max-w-[38rem]"
      >
        <div
          className="relative overflow-hidden rounded-[1.6rem] pl-28 pr-4 py-4 sm:pl-32 sm:pr-5 ancient-panel"
          style={{
            background: 'linear-gradient(180deg, rgba(33,23,13,0.97) 0%, rgba(17,11,7,0.98) 100%)',
            border: '1px solid var(--border-gold)',
            boxShadow: '0 22px 60px rgba(0,0,0,0.6)',
          }}
        >
          <div className="absolute inset-y-0 left-0 w-24 sm:w-28" style={{ background: 'linear-gradient(90deg, rgba(201,168,76,0.16), transparent)' }} />
          <div className="absolute left-3 bottom-3 top-3 w-20 sm:w-24 overflow-hidden rounded-[1.2rem] border" style={{ borderColor: 'var(--border-gold)', background: 'rgba(8,6,3,0.85)' }}>
            {activeEntry.portrait ? (
              <img src={activeEntry.portrait} alt={activeEntry.speaker} className="h-full w-full object-cover object-top" style={{ filter: activeEntry.portraitFilter || 'none' }} />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-3xl" style={{ color: 'var(--gold)' }}>
                ⚔
              </div>
            )}
          </div>

          <button
            onClick={onClose}
            className="absolute right-3 top-3 rounded-full px-2 py-1 text-[0.62rem] uppercase tracking-[0.18em] transition-opacity hover:opacity-80"
            style={{ color: 'var(--text-dim)', background: 'rgba(8,6,3,0.55)', border: '1px solid var(--border-stone)' }}
          >
            Hide
          </button>

          <div className="space-y-3">
            <div className="pr-10">
              <p className="text-[0.62rem] uppercase tracking-[0.24em]" style={{ color: activeEntry.accent || 'var(--gold)' }}>
                {activeEntry.label}
              </p>
              <h3 className="mt-1 text-base font-black uppercase sm:text-lg" style={{ color: 'var(--text-parchment)', fontFamily: 'Cinzel, serif' }}>
                {activeEntry.speaker}
              </h3>
            </div>

            <div className="min-h-[6.5rem] rounded-[1.1rem] px-4 py-3" style={{ background: 'rgba(236, 220, 182, 0.08)', border: '1px solid rgba(201,168,76,0.24)' }}>
              <p
                className="text-base leading-7 sm:text-[1.05rem] sm:leading-8"
                style={{
                  color: 'var(--text-parchment)',
                  fontFamily: 'Crimson Text, serif',
                  textShadow: '0 1px 12px rgba(0,0,0,0.45)',
                }}
              >
                {activePage}
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <button
                  onClick={onPrevious}
                  disabled={dialogueCursor === 0 && dialoguePageIndex === 0}
                  className="btn-ancient rounded-full px-3 py-2 disabled:opacity-35"
                >
                  <ChevronLeft size={15} />
                </button>
                <button
                  onClick={onReplay}
                  className="btn-ancient rounded-full px-3 py-2"
                  title="Replay this dialogue page"
                >
                  {narrationEnabled ? <Volume2 size={15} /> : <VolumeX size={15} />}
                </button>
                <button
                  onClick={onNext}
                  disabled={dialogueCursor === dialogueLog.length - 1 && dialoguePageIndex === pages.length - 1}
                  className="btn-ancient rounded-full px-3 py-2 disabled:opacity-35"
                >
                  <ChevronRight size={15} />
                </button>
              </div>

              <div className="text-right">
                <p className="text-[0.6rem] uppercase tracking-[0.18em]" style={{ color: 'var(--text-dim)' }}>
                  Dialogue {dialogueCursor + 1}/{dialogueLog.length}
                </p>
                <p className="text-[0.6rem] uppercase tracking-[0.18em]" style={{ color: activeEntry.accent || 'var(--gold)' }}>
                  Page {dialoguePageIndex + 1}/{pages.length}
                </p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default NarrationOverlay;
