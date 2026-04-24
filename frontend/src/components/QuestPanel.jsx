import React from 'react';
import { Target, CheckCircle2, LockKeyhole, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const stageTone = (status) => {
  if (status === 'completed') {
    return {
      border: 'var(--forest-light)',
      badge: 'badge-forest',
      label: 'Sealed',
      icon: <CheckCircle2 size={12} />,
    };
  }

  if (status === 'active') {
    return {
      border: 'var(--gold)',
      badge: 'badge-ancient',
      label: 'Active',
      icon: <Sparkles size={12} />,
    };
  }

  return {
    border: 'var(--border-stone)',
    badge: 'badge-danger',
    label: 'Locked',
    icon: <LockKeyhole size={12} />,
  };
};

const QuestPanel = ({ questChain }) => {
  const stages = questChain?.stages || [];

  return (
    <div className="space-y-3">
      <div>
        <p className="text-[0.65rem] uppercase tracking-[0.25em] mb-2 font-ancient" style={{ color: 'var(--gold)' }}>
          World-Forged Quest Chain
        </p>
        <h3 className="text-base font-black uppercase tracking-wide" style={{ color: 'var(--text-parchment)' }}>
          {questChain?.title || 'No forged quest yet'}
        </h3>
        <p className="text-sm italic mt-2 leading-relaxed" style={{ color: 'var(--text-dim)', fontFamily: 'Crimson Text, serif' }}>
          {questChain?.arc || 'Choose a region on the map to forge a quest chain bound to that land.'}
        </p>
      </div>

      <AnimatePresence>
        {stages.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="rounded-md p-4 ancient-panel"
            style={{ color: 'var(--text-dim)' }}
          >
            No active chain has been carved into the Tome.
          </motion.div>
        ) : (
          stages.map((stage, idx) => {
            const tone = stageTone(stage.status);
            return (
              <motion.div
                key={stage.id || idx}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.98 }}
                className="rounded-md p-4 ancient-panel"
                style={{ borderLeft: `3px solid ${tone.border}` }}
              >
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="flex items-start gap-2">
                    <Target size={14} className="mt-1 shrink-0" style={{ color: tone.border }} />
                    <div>
                      <p className="text-[0.62rem] uppercase tracking-[0.18em] font-ancient" style={{ color: 'var(--text-dim)' }}>
                        Stage {idx + 1} · {stage.kind}
                      </p>
                      <h4 className="text-sm font-bold uppercase tracking-wide" style={{ color: 'var(--text-parchment)' }}>
                        {stage.title}
                      </h4>
                    </div>
                  </div>
                  <span className={`${tone.badge} flex items-center gap-1`}>
                    {tone.icon}
                    {tone.label}
                  </span>
                </div>

                <p className="text-sm italic leading-relaxed" style={{ color: 'var(--text-faded)', fontFamily: 'Crimson Text, serif' }}>
                  {stage.objective}
                </p>

                <div className="mt-3 grid grid-cols-1 gap-2">
                  <div className="rounded-sm px-3 py-2" style={{ background: 'rgba(201,168,76,0.06)', border: '1px solid var(--border-stone)' }}>
                    <p className="text-[0.58rem] uppercase tracking-[0.16em] font-ancient mb-1" style={{ color: 'var(--gold)' }}>
                      Hint
                    </p>
                    <p className="text-xs" style={{ color: 'var(--text-dim)', fontFamily: 'Crimson Text, serif' }}>
                      {stage.hint}
                    </p>
                  </div>
                  <div className="rounded-sm px-3 py-2" style={{ background: 'rgba(139,32,32,0.08)', border: '1px solid var(--blood)' }}>
                    <p className="text-[0.58rem] uppercase tracking-[0.16em] font-ancient mb-1" style={{ color: 'var(--iron-red)' }}>
                      Risk
                    </p>
                    <p className="text-xs" style={{ color: '#cfa6a6', fontFamily: 'Crimson Text, serif' }}>
                      {stage.risk}
                    </p>
                  </div>
                </div>

                {stage.resolution && (
                  <p className="text-xs mt-3 italic" style={{ color: 'var(--forest-light)', fontFamily: 'Crimson Text, serif' }}>
                    {stage.resolution}
                  </p>
                )}
              </motion.div>
            );
          })
        )}
      </AnimatePresence>

      {questChain?.reward && (
        <div className="rounded-md p-4 ancient-panel">
          <p className="text-[0.62rem] uppercase tracking-[0.18em] font-ancient mb-1" style={{ color: 'var(--gold)' }}>
            Reward of the Region
          </p>
          <p className="text-sm" style={{ color: 'var(--text-faded)', fontFamily: 'Crimson Text, serif' }}>
            {questChain.reward}
          </p>
        </div>
      )}
    </div>
  );
};

export default QuestPanel;
