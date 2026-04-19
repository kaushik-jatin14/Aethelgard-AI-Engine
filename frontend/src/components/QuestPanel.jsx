import React from 'react';
import { Target, CheckCircle2, AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const QuestPanel = ({ quests }) => {
  return (
    <div className="flex-1 flex flex-col mt-4 min-h-0 border-t border-slate-800 pt-4">
      <h2 className="text-[10px] uppercase font-mono tracking-widest text-slate-500 mb-3 flex items-center gap-2">
        <AlertTriangle size={12} className="text-amber-500" /> 
        Active Objectives
      </h2>
      
      <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-2">
        <AnimatePresence>
          {quests.length === 0 ? (
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="text-center py-6 text-slate-600 text-xs font-mono border border-slate-800 rounded-sm"
            >
              NO ACTIVE DIRECTIVES
            </motion.div>
          ) : (
            quests.map((quest, idx) => (
              <motion.div 
                key={quest.id || idx}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.2 }}
                className="bg-black border-l-2 border-amber-500 border-t border-r border-b border-slate-800 p-3 relative"
              >
                <h3 className="font-bold text-slate-200 text-xs uppercase tracking-wider flex items-start gap-2 mb-1">
                  <Target size={12} className="text-amber-500 mt-0.5 shrink-0" />
                  <span className="leading-tight">{quest.title}</span>
                </h3>
                
                <p className="text-[10px] text-slate-500 font-mono leading-relaxed pl-5 mb-2">
                  {quest.description}
                </p>

                <div className="pl-5 flex items-center justify-between text-[8px] uppercase font-bold tracking-widest">
                  <span className={`${quest.status === 'completed' ? 'text-green-500' : 'text-amber-500'}`}>
                    {quest.status === 'completed' ? 'COMPLETED' : 'IN PROGRESS'}
                  </span>
                  {quest.status === 'completed' && <CheckCircle2 size={10} className="text-green-500" />}
                </div>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default QuestPanel;
