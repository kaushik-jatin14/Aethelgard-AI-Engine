import React, { useState, useRef, useEffect } from 'react';
import { Send, Loader2, X, HelpCircle, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const ChatPanel = ({ isOpen, onToggle, history, onSend, isProcessing, characterName, characterImage, characterFilter, serviceBanner }) => {
  const [input, setInput] = useState('');
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (isOpen) messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [history, isProcessing, isOpen]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (input.trim() && !isProcessing) { onSend(input); setInput(''); }
  };

  const handleQuickAction = (action) => {
    if (!isProcessing) { onSend(action); setInput(''); }
  };

  // Extract action choices from last GM message
  const lastGmMsg = [...history].reverse().find(m => m.role === 'gm');
  const actionChoices = [];
  if (lastGmMsg) {
    const matches = lastGmMsg.text.matchAll(/^\d+\.\s+(.+)$/gm);
    for (const m of matches) {
      if (actionChoices.length < 3) actionChoices.push(m[1].trim());
    }
  }

  const botName = characterName ? `The Oracle of ${characterName}` : 'The Ancient Oracle';

  return (
    <>
      {/* ── FLOATING CHARACTER ICON (chat launcher) ── */}
      <div className="fixed bottom-8 right-8 z-[80] flex flex-col items-end gap-3">
        <AnimatePresence>
          {!isOpen && (
            <motion.div
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.8 }}
              className="flex flex-col items-end gap-2"
            >
              {/* Tooltip */}
              <div className="px-3 py-1.5 rounded text-xs font-ancient uppercase"
                style={{ background: 'var(--bg-panel)', border: '1px solid var(--border-gold)', color: 'var(--gold)', letterSpacing: '0.1em' }}>
                Commune with the Oracle
              </div>

              {/* Character portrait as chat button */}
              <button onClick={() => onToggle(true)}
                className="relative w-16 h-16 rounded-full overflow-hidden transition-all hover:scale-110"
                style={{ border: '2px solid var(--gold)', boxShadow: '0 0 25px var(--glow-gold)' }}
              >
                {/* Spinning golden ring */}
                <div className="absolute -inset-1 rounded-full border border-dashed animate-[spin_8s_linear_infinite] pointer-events-none"
                  style={{ borderColor: 'var(--gold-dim)' }} />

                {characterImage ? (
                  <img
                    src={characterImage}
                    alt={characterName}
                    className="w-full h-full object-cover object-top"
                    style={{ filter: characterFilter || 'none' }}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-2xl"
                    style={{ background: 'var(--bg-card)' }}>⚗</div>
                )}

                {/* Notification dot */}
                {!isProcessing && history.length > 0 && history[history.length - 1].role === 'gm' && (
                  <div className="absolute top-0 right-0 w-3 h-3 rounded-full border-2"
                    style={{ background: 'var(--iron-red)', borderColor: 'var(--bg-dark)' }} />
                )}
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── EXPANDED CHAT PANEL ── */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, x: '100%' }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 220 }}
            className="fixed top-0 right-0 bottom-0 w-[30%] flex flex-col z-[90]"
            style={{ background: 'var(--bg-panel)', borderLeft: '1px solid var(--border-stone)', boxShadow: '-20px 0 60px rgba(0,0,0,0.8)' }}
          >
            {/* Parchment texture */}
            <div className="absolute inset-0 opacity-10 pointer-events-none parchment-texture" />

            {/* ── Header ── */}
            <div className="relative flex items-center justify-between p-5 border-b"
              style={{ borderColor: 'var(--border-stone)', background: 'var(--bg-dark)' }}>
              <div className="absolute top-0 left-0 right-0 h-0.5"
                style={{ background: 'linear-gradient(90deg, transparent, var(--gold), transparent)' }} />

              <div className="flex items-center gap-3">
                {/* Character avatar in header */}
                <div className="w-10 h-10 rounded-full overflow-hidden"
                  style={{ border: '2px solid var(--border-gold)' }}>
                  {characterImage ? (
                    <img src={characterImage} alt="" className="w-full h-full object-cover object-top"
                      style={{ filter: characterFilter || 'none' }} />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center"
                      style={{ background: 'var(--bg-card)', color: 'var(--gold)', fontSize: '1.2rem' }}>⚗</div>
                  )}
                </div>
                <div>
                  <h2 className="text-sm font-ancient font-bold" style={{ color: 'var(--gold)' }}>
                    {botName}
                  </h2>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: serviceBanner ? 'var(--iron-red)' : 'var(--forest-light)' }} />
                    <span className="text-xs font-lore italic" style={{ color: 'var(--text-dim)' }}>
                      {serviceBanner ? 'Hosted Oracle issue detected' : 'Ancient lore link active'}
                    </span>
                  </div>
                </div>
              </div>

              <button onClick={() => onToggle(false)}
                className="p-2 rounded transition-colors hover:opacity-80"
                style={{ background: 'var(--bg-card)', border: '1px solid var(--border-stone)', color: 'var(--text-faded)' }}>
                <X size={16} />
              </button>
            </div>

            {/* ── Quick Guide Buttons ── */}
            <div className="relative flex flex-wrap gap-2 px-4 py-3 border-b"
              style={{ borderColor: 'var(--border-stone)', background: 'var(--bg-dark)' }}>
              {[
                { label: "I know not what to do", action: "I don't know what to do. Guide me, Oracle." },
                { label: "My backstory", action: "Tell me my backstory and who I am in this realm." },
                { label: "The endgame", action: "What is the endgame? How do I end this?" },
              ].map((q) => (
                <button key={q.label} onClick={() => handleQuickAction(q.action)}
                  disabled={isProcessing}
                  className="text-xs px-3 py-1.5 rounded transition-all hover:opacity-80 font-ancient uppercase disabled:opacity-40"
                  style={{ background: 'var(--bg-card)', border: '1px solid var(--border-gold)', color: 'var(--gold)', letterSpacing: '0.05em' }}>
                  {q.label}
                </button>
              ))}
            </div>

            {/* ── Messages ── */}
            <div className="relative flex-1 overflow-y-auto p-5 space-y-6 custom-scrollbar"
              style={{ background: 'var(--bg-dark)' }}>
              {serviceBanner && (
                <div className="p-3 border rounded-md" style={{ background: 'rgba(90,18,18,0.32)', borderColor: 'var(--blood)', color: '#f2dada' }}>
                  <p className="text-xs uppercase tracking-[0.16em]" style={{ color: 'var(--gold)' }}>
                    Hosted Service Warning
                  </p>
                  <p className="text-sm mt-1 whitespace-pre-line font-lore">
                    {serviceBanner.text.replace(/\*\*/g, '')}
                  </p>
                </div>
              )}
              {history.length === 0 && (
                <div className="h-full flex items-center justify-center text-center px-8">
                  <div>
                    <div className="text-4xl mb-4">⚗</div>
                    <p className="font-ancient text-sm" style={{ color: 'var(--text-dim)' }}>
                      The Oracle awaits thy first word, {characterName || 'Traveler'}...
                    </p>
                    <p className="text-xs mt-2 font-lore italic" style={{ color: 'var(--text-dim)' }}>
                      Type below or use the quick scrolls above
                    </p>
                  </div>
                </div>
              )}

              {history.map((msg, idx) => (
                <motion.div key={idx} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                  className={`flex flex-col ${msg.role === 'player' ? 'items-end ml-8' : 'items-start mr-4'}`}>

                  <div className="flex items-center gap-2 mb-2 px-1">
                    {msg.role === 'gm' ? (
                      <>
                        <div className="w-5 h-5 rounded-sm flex items-center justify-center text-xs font-ancient font-bold"
                          style={{ background: 'rgba(201,168,76,0.15)', border: '1px solid var(--border-gold)', color: 'var(--gold)' }}>
                          ⚗
                        </div>
                        <span className="text-xs font-ancient" style={{ color: 'var(--gold)', letterSpacing: '0.1em' }}>Oracle</span>
                      </>
                    ) : (
                      <>
                        <span className="text-xs font-ancient" style={{ color: 'var(--text-faded)', letterSpacing: '0.1em' }}>Thee</span>
                        <div className="w-5 h-5 rounded-sm overflow-hidden"
                          style={{ border: '1px solid var(--border-stone)' }}>
                          {characterImage
                            ? <img src={characterImage} alt="" className="w-full h-full object-cover object-top" style={{ filter: characterFilter || 'none' }} />
                            : <div className="w-full h-full" style={{ background: 'var(--bg-card)' }} />}
                        </div>
                      </>
                    )}
                  </div>

                  <div className={`p-4 text-sm leading-relaxed border-l-2 ${msg.role === 'player' ? 'border-r-2 border-l-0' : ''}`}
                    style={msg.role === 'gm'
                      ? { background: 'rgba(201,168,76,0.05)', borderColor: 'var(--gold-dim)', color: 'var(--text-parchment)' }
                      : { background: 'var(--bg-card)', borderColor: 'var(--border-stone)', color: 'var(--text-faded)' }
                    }>
                    {msg.role === 'gm' ? (
                      <div className="prose prose-sm max-w-none font-lore"
                        style={{ '--tw-prose-body': 'var(--text-parchment)', '--tw-prose-bold': 'var(--gold-bright)' }}>
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>{msg.text}</ReactMarkdown>
                      </div>
                    ) : (
                      <span className="font-lore italic">{msg.text}</span>
                    )}
                  </div>
                </motion.div>
              ))}

              {isProcessing && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-start gap-3 mr-4">
                  <div className="p-4 border-l-2 text-sm flex items-center gap-3"
                    style={{ background: 'rgba(201,168,76,0.05)', borderColor: 'var(--gold-dim)' }}>
                    <Loader2 size={16} className="animate-spin" style={{ color: 'var(--gold)' }} />
                    <span className="font-lore italic" style={{ color: 'var(--text-dim)' }}>
                      The Oracle consults the ancient scrolls...
                    </span>
                  </div>
                </motion.div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* ── Action Choices (from last GM message) ── */}
            <AnimatePresence>
              {actionChoices.length > 0 && !isProcessing && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                  className="relative border-t px-4 py-3 space-y-2"
                  style={{ borderColor: 'var(--border-stone)', background: 'var(--bg-card)' }}>
                  <p className="text-xs font-ancient uppercase" style={{ color: 'var(--text-dim)', letterSpacing: '0.1em' }}>
                    Available Actions:
                  </p>
                  {actionChoices.map((choice, i) => (
                    <button key={i} onClick={() => handleQuickAction(choice)}
                      className="w-full text-left px-4 py-2.5 text-sm rounded transition-all hover:scale-[1.01] font-lore"
                      style={{ background: 'var(--bg-dark)', border: '1px solid var(--border-gold)', color: 'var(--text-parchment)', boxShadow: '0 0 8px rgba(201,168,76,0.05)' }}>
                      <span style={{ color: 'var(--gold)' }}>{i + 1}. </span>{choice}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>

            {/* ── Input ── */}
            <div className="relative border-t p-4"
              style={{ borderColor: 'var(--border-stone)', background: 'var(--bg-dark)' }}>
              <form onSubmit={handleSubmit} className="flex items-center gap-2">
                <input
                  type="text" value={input} onChange={e => setInput(e.target.value)}
                  disabled={isProcessing}
                  placeholder="Speak thy will, Champion..."
                  className="input-ancient flex-1 px-4 py-3 text-sm rounded-sm"
                />
                <button type="submit" disabled={isProcessing || !input.trim()}
                  className="btn-ancient px-4 py-3 rounded-sm disabled:opacity-40">
                  <Send size={16} />
                </button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default ChatPanel;
