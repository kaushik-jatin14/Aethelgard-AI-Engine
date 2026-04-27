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
  visible = true,
}) => {
  const activeEntry = dialogueLog[dialogueCursor];
  const pages = activeEntry?.pages || [];
  const activePage = pages[dialoguePageIndex];

  if (!visible || !activeEntry || !activePage) {
    return null;
  }

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={`${activeEntry.id}-${dialoguePageIndex}`}
        initial={{ opacity: 0, y: 18, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 12, scale: 0.98 }}
        transition={{ duration: 0.24, ease: 'easeOut' }}
        className="absolute bottom-5 left-5 z-[62] w-[min(26rem,calc(100vw-2.5rem))]"
        data-keep-dialogue
      >
        <div
          className="relative overflow-hidden rounded-[1.8rem] border px-4 py-4 pl-[6.4rem]"
          style={{
            background: 'linear-gradient(180deg, rgba(22,16,11,0.96) 0%, rgba(14,10,7,0.98) 100%)',
            borderColor: 'rgba(113,220,245,0.34)',
            boxShadow: '0 22px 60px rgba(0,0,0,0.5)',
            backdropFilter: 'blur(18px)',
          }}
        >
              <div className="absolute left-4 top-4 bottom-4 w-[4.3rem] overflow-hidden rounded-[1.2rem] border" style={{ borderColor: 'var(--border-gold)', background: 'rgba(7,15,24,0.86)' }}>
            {activeEntry.portrait ? (
              <img src={activeEntry.portrait} alt={activeEntry.speaker} className="h-full w-full object-cover object-top" style={{ filter: activeEntry.portraitFilter || 'none' }} />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-2xl" style={{ color: 'var(--gold)' }}>
                  ✦
              </div>
            )}
          </div>

          <button
            onClick={onClose}
            className="absolute right-4 top-4 rounded-full px-3 py-1 text-[0.58rem] uppercase tracking-[0.2em] transition-opacity hover:opacity-80"
                    style={{ color: 'var(--text-dim)', background: 'rgba(8,17,28,0.6)', border: '1px solid var(--border-stone)' }}
          >
            Hide
          </button>

          <div className="pr-16">
            <p className="text-[0.58rem] uppercase tracking-[0.24em]" style={{ color: activeEntry.accent || 'var(--gold)' }}>
              {activeEntry.label}
            </p>
            <h3 className="mt-1 text-lg font-black uppercase" style={{ color: 'var(--text-parchment)', fontFamily: 'var(--font-ui)' }}>
              {activeEntry.speaker}
            </h3>
          </div>

          <div className="mt-3 rounded-[1.1rem] border px-4 py-3" style={{ background: 'rgba(236,220,182,0.06)', borderColor: 'rgba(113,220,245,0.2)' }}>
            <p
              className="text-lg leading-8"
              style={{
                color: 'var(--text-parchment)',
                fontFamily: 'var(--font-body)',
                textShadow: '0 1px 12px rgba(0,0,0,0.45)',
              }}
            >
              {activePage}
            </p>
          </div>

          <div className="mt-4 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <button onClick={onPrevious} disabled={dialogueCursor === 0 && dialoguePageIndex === 0} className="btn-ancient rounded-full px-3 py-2 disabled:opacity-35">
                <ChevronLeft size={15} />
              </button>
              <button onClick={onReplay} className="btn-ancient rounded-full px-3 py-2" title="Replay this dialogue page">
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
              <p className="text-[0.58rem] uppercase tracking-[0.18em]" style={{ color: 'var(--text-dim)' }}>
                Chronicle {dialogueCursor + 1}/{dialogueLog.length}
              </p>
              <p className="text-[0.58rem] uppercase tracking-[0.18em]" style={{ color: activeEntry.accent || 'var(--gold)' }}>
                Page {dialoguePageIndex + 1}/{pages.length}
              </p>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default NarrationOverlay;

