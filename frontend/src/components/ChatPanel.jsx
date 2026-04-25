import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Send, Loader2, X, ChevronDown, Volume2, VolumeX, ScrollText } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const QUICK_GUIDES = [
  { label: 'I know not what to do', action: "I don't know what to do. Guide me, Oracle." },
  { label: 'Grant a hint', action: 'Oracle, grant me a clear hint for the current objective.' },
  { label: 'My backstory', action: 'Tell me my backstory and who I am in this realm.' },
  { label: 'Map omen', action: 'What does this region reveal about the world map and its hidden connections?' },
  { label: 'Past choices', action: 'Recall the consequences of my recent choices and what they mean now.' },
  { label: 'Ease the trial', action: 'Oracle, make this trial easier and guide me more directly.' },
];

const stripMarkdownPreview = (text = '') =>
  String(text)
    .replace(/\*\*/g, '')
    .replace(/`/g, '')
    .replace(/^#{1,6}\s+/gm, '')
    .replace(/^\d+\.\s+/gm, '')
    .replace(/\[(.*?)\]\(.*?\)/g, '$1')
    .replace(/\s+/g, ' ')
    .trim();

const SectionToggle = ({ title, description, open, onToggle, count = null }) => (
  <button
    onClick={onToggle}
    className="flex w-full items-center justify-between rounded-2xl px-4 py-3 text-left transition-all hover:opacity-90"
    style={{ background: 'rgba(20,14,8,0.7)', border: '1px solid var(--border-stone)' }}
  >
    <div>
      <p className="text-[0.62rem] uppercase tracking-[0.18em]" style={{ color: 'var(--gold)' }}>
        {title}{count !== null ? ` · ${count}` : ''}
      </p>
      <p className="mt-1 text-xs italic" style={{ color: 'var(--text-dim)', fontFamily: 'Crimson Text, serif' }}>
        {description}
      </p>
    </div>
    <ChevronDown
      size={16}
      style={{
        color: 'var(--text-faded)',
        transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
        transition: 'transform 0.2s ease',
      }}
    />
  </button>
);

const ChatPanel = ({
  isOpen,
  onToggle,
  history,
  onSend,
  isProcessing,
  characterName,
  characterImage,
  characterFilter,
  serviceBanner,
  dynamicScene = null,
  onReadMessage,
  onStopReading,
  activeNarrationId = null,
  narrationEnabled = true,
  onClearNarration,
}) => {
  const [input, setInput] = useState('');
  const [toolboxOpen, setToolboxOpen] = useState(false);
  const [routesOpen, setRoutesOpen] = useState(false);
  const [actionsOpen, setActionsOpen] = useState(true);
  const [expandedMessages, setExpandedMessages] = useState({});
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (isOpen) messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [history, isProcessing, isOpen]);

  const handleSubmit = (event) => {
    event.preventDefault();
    if (input.trim() && !isProcessing) {
      onSend(input);
      setInput('');
    }
  };

  const handleQuickAction = (action) => {
    if (!isProcessing) {
      onSend(action);
      setInput('');
    }
  };

  const actionChoices = useMemo(() => {
    const lastGmMessage = [...history].reverse().find((message) => message.role === 'gm');
    if (!lastGmMessage) return [];

    const matches = lastGmMessage.text.matchAll(/^\d+\.\s+(.+)$/gm);
    const picks = [];
    for (const match of matches) {
      if (picks.length < 3) picks.push(match[1].trim());
    }
    return picks;
  }, [history]);

  const botName = characterName ? `The Oracle of ${characterName}` : 'The Ancient Oracle';

  return (
    <>
      <div className="fixed bottom-6 right-6 z-[95] flex flex-col items-end gap-3">
        <AnimatePresence>
          {!isOpen && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="flex flex-col items-end gap-2"
            >
              <div
                className="px-3 py-1.5 rounded-2xl text-[0.62rem] font-ancient uppercase"
                style={{ background: 'rgba(12,8,5,0.9)', border: '1px solid var(--border-gold)', color: 'var(--gold)', letterSpacing: '0.12em' }}
              >
                Commune with the Oracle
              </div>

              <button
                onClick={() => onToggle(true)}
                className="relative h-16 w-16 overflow-hidden rounded-full transition-all hover:scale-110"
                style={{ border: '2px solid var(--gold)', boxShadow: '0 0 25px var(--glow-gold)' }}
              >
                <div
                  className="absolute -inset-1 rounded-full border border-dashed animate-[spin_8s_linear_infinite] pointer-events-none"
                  style={{ borderColor: 'var(--gold-dim)' }}
                />

                {characterImage ? (
                  <img
                    src={characterImage}
                    alt={characterName}
                    className="h-full w-full object-cover object-top"
                    style={{ filter: characterFilter || 'none' }}
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-2xl" style={{ background: 'var(--bg-card)' }}>
                    ⚔
                  </div>
                )}

                {!isProcessing && history.length > 0 && history[history.length - 1].role === 'gm' && (
                  <div
                    className="absolute right-0 top-0 h-3 w-3 rounded-full border-2"
                    style={{ background: 'var(--iron-red)', borderColor: 'var(--bg-dark)' }}
                  />
                )}
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.aside
            initial={{ opacity: 0, x: '100%' }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 220 }}
            className="fixed right-0 top-0 bottom-0 z-[90] flex w-full min-w-[22rem] max-w-[30rem] flex-col lg:w-[30vw]"
            style={{ background: 'var(--bg-panel)', borderLeft: '1px solid var(--border-stone)', boxShadow: '-20px 0 60px rgba(0,0,0,0.75)' }}
          >
            <div className="absolute inset-0 opacity-10 pointer-events-none parchment-texture" />

            <div
              className="relative flex items-center justify-between px-5 py-4 border-b"
              style={{ borderColor: 'var(--border-stone)', background: 'rgba(10,8,5,0.96)' }}
            >
              <div className="absolute top-0 left-0 right-0 h-0.5" style={{ background: 'linear-gradient(90deg, transparent, var(--gold), transparent)' }} />
              <div className="flex min-w-0 items-center gap-3">
                <div className="h-11 w-11 overflow-hidden rounded-full" style={{ border: '2px solid var(--border-gold)' }}>
                  {characterImage ? (
                    <img src={characterImage} alt="" className="h-full w-full object-cover object-top" style={{ filter: characterFilter || 'none' }} />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center" style={{ background: 'var(--bg-card)', color: 'var(--gold)' }}>
                      ⚔
                    </div>
                  )}
                </div>
                <div className="min-w-0">
                  <h2 className="truncate text-sm font-ancient font-bold" style={{ color: 'var(--gold)' }}>
                    {botName}
                  </h2>
                  <div className="mt-0.5 flex items-center gap-1.5">
                    <div className="h-1.5 w-1.5 rounded-full animate-pulse" style={{ background: serviceBanner ? 'var(--iron-red)' : 'var(--forest-light)' }} />
                    <span className="text-xs italic" style={{ color: 'var(--text-dim)', fontFamily: 'Crimson Text, serif' }}>
                      {serviceBanner ? 'Hosted service warning' : 'Ancient counsel available'}
                    </span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => onToggle(false)}
                className="rounded-xl p-2 transition-colors hover:opacity-80"
                style={{ background: 'var(--bg-card)', border: '1px solid var(--border-stone)', color: 'var(--text-faded)' }}
              >
                <X size={16} />
              </button>
            </div>

            <div className="relative border-b px-4 py-3 space-y-3" style={{ borderColor: 'var(--border-stone)', background: 'rgba(11,9,6,0.96)' }}>
              <SectionToggle
                title="Oracle tools"
                description="Hints, memory, difficulty, and guidance"
                open={toolboxOpen}
                onToggle={() => setToolboxOpen((prev) => !prev)}
              />
              <AnimatePresence>
                {toolboxOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    className="grid grid-cols-2 gap-2"
                  >
                    {QUICK_GUIDES.map((guide) => (
                      <button
                        key={guide.label}
                        onClick={() => handleQuickAction(guide.action)}
                        disabled={isProcessing}
                        className="rounded-xl px-3 py-2 text-left text-[0.68rem] uppercase transition-all hover:opacity-85 disabled:opacity-40"
                        style={{ background: 'var(--bg-card)', border: '1px solid var(--border-gold)', color: 'var(--gold)', letterSpacing: '0.05em', fontFamily: 'Cinzel, serif' }}
                      >
                        {guide.label}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>

              <SectionToggle
                title="Live routes"
                description="Only the current path options"
                open={routesOpen}
                count={dynamicScene?.route_options?.length || 0}
                onToggle={() => setRoutesOpen((prev) => !prev)}
              />
              <AnimatePresence>
                {routesOpen && dynamicScene?.route_options?.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    className="space-y-2"
                  >
                    {dynamicScene.route_options.map((route) => (
                      <button
                        key={route}
                        onClick={() => handleQuickAction(route)}
                        disabled={isProcessing}
                        className="w-full rounded-xl px-4 py-3 text-left text-sm transition-all hover:opacity-85 disabled:opacity-40"
                        style={{ background: 'rgba(20,14,8,0.72)', border: '1px solid var(--border-stone)', color: 'var(--text-parchment)', fontFamily: 'Crimson Text, serif' }}
                      >
                        {route}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div
              className="relative flex-1 overflow-y-auto px-4 py-4 space-y-4 custom-scrollbar"
              style={{ background: 'var(--bg-dark)' }}
              onClick={(event) => {
                if (event.target === event.currentTarget) {
                  onClearNarration?.();
                }
              }}
            >
              {serviceBanner && (
                <div className="rounded-2xl border px-4 py-3" style={{ background: 'rgba(90,18,18,0.24)', borderColor: 'var(--blood)', color: '#f2dada' }}>
                  <p className="text-[0.62rem] uppercase tracking-[0.16em]" style={{ color: 'var(--gold)' }}>
                    Hosted Service Warning
                  </p>
                  <p className="mt-2 text-sm whitespace-pre-line" style={{ fontFamily: 'Crimson Text, serif' }}>
                    {serviceBanner.text.replace(/\*\*/g, '')}
                  </p>
                </div>
              )}

              {dynamicScene && (
                <div className="rounded-2xl border px-4 py-3" style={{ background: 'rgba(18,12,8,0.65)', borderColor: 'var(--border-gold)', color: 'var(--text-parchment)' }}>
                  <p className="text-[0.62rem] uppercase tracking-[0.16em]" style={{ color: 'var(--gold)' }}>
                    Scene feed
                  </p>
                  <p className="mt-1 text-sm font-semibold" style={{ fontFamily: 'Cinzel, serif' }}>
                    {dynamicScene.turn_title}
                  </p>
                  <p className="mt-1 text-xs italic" style={{ color: 'var(--text-dim)', fontFamily: 'Crimson Text, serif' }}>
                    {dynamicScene.ambient_cue}
                  </p>
                </div>
              )}

              {history.length === 0 && (
                <div className="flex h-full items-center justify-center px-6 text-center">
                  <div>
                    <div className="mb-3 text-4xl">⚔</div>
                    <p className="text-sm font-ancient" style={{ color: 'var(--text-dim)' }}>
                      The Oracle awaits thy first word, {characterName || 'Traveler'}...
                    </p>
                  </div>
                </div>
              )}

              {history.map((message, index) => {
                const messageId = `${message.role}-${index}`;
                const previewText = stripMarkdownPreview(message.text);
                const needsExpansion = message.role === 'gm' && previewText.length > 240;
                const expanded = Boolean(expandedMessages[messageId]);
                const isActiveNarration = activeNarrationId === messageId;

                return (
                  <motion.div
                    key={messageId}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex flex-col ${message.role === 'player' ? 'items-end ml-10' : 'items-start mr-4'}`}
                  >
                    <div className="mb-2 flex items-center gap-2 px-1">
                      {message.role === 'gm' ? (
                        <>
                          <div
                            className="flex h-5 w-5 items-center justify-center rounded-sm text-xs font-ancient font-bold"
                            style={{ background: 'rgba(201,168,76,0.15)', border: '1px solid var(--border-gold)', color: 'var(--gold)' }}
                          >
                            ⚔
                          </div>
                          <span className="text-xs font-ancient" style={{ color: 'var(--gold)', letterSpacing: '0.1em' }}>
                            Oracle
                          </span>
                        </>
                      ) : (
                        <>
                          <span className="text-xs font-ancient" style={{ color: 'var(--text-faded)', letterSpacing: '0.1em' }}>
                            Thee
                          </span>
                          <div className="h-5 w-5 overflow-hidden rounded-sm" style={{ border: '1px solid var(--border-stone)' }}>
                            {characterImage ? (
                              <img src={characterImage} alt="" className="h-full w-full object-cover object-top" style={{ filter: characterFilter || 'none' }} />
                            ) : (
                              <div className="h-full w-full" style={{ background: 'var(--bg-card)' }} />
                            )}
                          </div>
                        </>
                      )}
                    </div>

                    <div
                      className="w-full overflow-hidden rounded-3xl border px-4 py-4"
                      style={{
                        background: message.role === 'gm' ? 'rgba(201,168,76,0.05)' : 'var(--bg-card)',
                        borderColor: isActiveNarration ? 'var(--gold)' : message.role === 'gm' ? 'var(--gold-dim)' : 'var(--border-stone)',
                        boxShadow: isActiveNarration ? '0 0 22px rgba(201,168,76,0.18)' : 'none',
                        color: message.role === 'gm' ? 'var(--text-parchment)' : 'var(--text-faded)',
                      }}
                    >
                      <div
                        className="prose prose-sm max-w-none font-lore"
                        style={{
                          '--tw-prose-body': 'var(--text-parchment)',
                          '--tw-prose-bold': 'var(--gold-bright)',
                          maxHeight: needsExpansion && !expanded ? '8rem' : 'none',
                          overflow: needsExpansion && !expanded ? 'hidden' : 'visible',
                          position: 'relative',
                        }}
                      >
                        {message.role === 'gm' ? (
                          <ReactMarkdown remarkPlugins={[remarkGfm]}>{message.text}</ReactMarkdown>
                        ) : (
                          <span className="italic">{message.text}</span>
                        )}
                      </div>

                      {message.role === 'gm' && (
                        <div className="mt-3 flex flex-wrap items-center gap-2">
                          <button
                            onClick={() => (isActiveNarration ? onStopReading?.() : onReadMessage?.(message.text, messageId))}
                            className="btn-ancient rounded-full px-3 py-2"
                            title="Read this oracle message aloud"
                          >
                            {isActiveNarration ? <VolumeX size={14} /> : <Volume2 size={14} />}
                          </button>

                          {needsExpansion && (
                            <button
                              onClick={() => setExpandedMessages((prev) => ({ ...prev, [messageId]: !prev[messageId] }))}
                              className="rounded-full px-3 py-2 text-[0.62rem] uppercase tracking-[0.12em]"
                              style={{ background: 'rgba(20,14,8,0.78)', border: '1px solid var(--border-stone)', color: 'var(--text-faded)', fontFamily: 'Cinzel, serif' }}
                            >
                              {expanded ? 'Show less' : 'View full lore'}
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </motion.div>
                );
              })}

              {isProcessing && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-start gap-3 mr-4">
                  <div className="flex items-center gap-3 rounded-2xl border px-4 py-3 text-sm" style={{ background: 'rgba(201,168,76,0.05)', borderColor: 'var(--gold-dim)' }}>
                    <Loader2 size={16} className="animate-spin" style={{ color: 'var(--gold)' }} />
                    <span className="italic" style={{ color: 'var(--text-dim)', fontFamily: 'Crimson Text, serif' }}>
                      The Oracle consults the ancient scrolls...
                    </span>
                  </div>
                </motion.div>
              )}

              <div ref={messagesEndRef} />
            </div>

            <div className="relative border-t px-4 py-3 space-y-3" style={{ borderColor: 'var(--border-stone)', background: 'rgba(10,8,5,0.96)' }}>
              <SectionToggle
                title="Action choices"
                description="Show only the current possible moves"
                open={actionsOpen}
                count={actionChoices.length}
                onToggle={() => setActionsOpen((prev) => !prev)}
              />
              <AnimatePresence>
                {actionsOpen && actionChoices.length > 0 && !isProcessing && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 8 }}
                    className="space-y-2"
                  >
                    {actionChoices.map((choice, index) => (
                      <button
                        key={index}
                        onClick={() => handleQuickAction(choice)}
                        className="w-full rounded-2xl px-4 py-3 text-left text-sm transition-all hover:opacity-85"
                        style={{ background: 'var(--bg-dark)', border: '1px solid var(--border-gold)', color: 'var(--text-parchment)', fontFamily: 'Crimson Text, serif' }}
                      >
                        <span style={{ color: 'var(--gold)' }}>{index + 1}. </span>
                        {choice}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>

              <form onSubmit={handleSubmit} className="flex items-center gap-2">
                <input
                  type="text"
                  value={input}
                  onChange={(event) => setInput(event.target.value)}
                  disabled={isProcessing}
                  placeholder="Speak thy will, Champion..."
                  className="input-ancient flex-1 rounded-2xl px-4 py-3 text-sm"
                />
                <button type="submit" disabled={isProcessing || !input.trim()} className="btn-ancient rounded-2xl px-4 py-3 disabled:opacity-40">
                  <Send size={16} />
                </button>
              </form>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>
    </>
  );
};

export default ChatPanel;
