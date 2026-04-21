import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, Loader2, RotateCcw, AlertTriangle } from 'lucide-react';
import { generateHelpResponse } from '../services/gemini';

const HelpModal = ({ isOpen, onClose, onLogin }) => {
  const [helpInput, setHelpInput] = useState('');
  const [helpHistory, setHelpHistory] = useState([]);
  const [helpLoading, setHelpLoading] = useState(false);
  const [serviceError, setServiceError] = useState(null);
  const [lastQuestion, setLastQuestion] = useState('');

  const submitQuestion = async (question) => {
    setLastQuestion(question);
    setServiceError(null);
    setHelpHistory((history) => [...history, { role: 'user', text: question }]);
    setHelpLoading(true);

    try {
      const reply = await generateHelpResponse(question);
      setHelpHistory((history) => [...history, { role: 'gk', text: reply.message }]);

      if (reply.action === 'LOGIN_GUEST') {
        setTimeout(() => onLogin({ pin: 'GUEST', isGuest: true, name: 'Guest Explorer' }), 1000);
      } else if (reply.action === 'LOGIN_PIN' && reply.pin) {
        const users = JSON.parse(localStorage.getItem('AETHELGARD_USERS') || '{}');
        if (users[reply.pin.toUpperCase()]) {
          setTimeout(() => onLogin({ pin: reply.pin.toUpperCase(), isGuest: false, name: users[reply.pin.toUpperCase()].name }), 1000);
        } else {
          setHelpHistory((history) => [...history, { role: 'gk', text: 'Alas, that key is not found in the ancient logs. Art thou sure it is correct?' }]);
        }
      } else if (reply.action === 'CREATE_PROFILE' && reply.name && reply.age) {
        const newPin = Math.random().toString(36).substring(2, 6).toUpperCase();
        const users = JSON.parse(localStorage.getItem('AETHELGARD_USERS') || '{}');
        users[newPin] = { name: reply.name, age: reply.age, created: Date.now() };
        localStorage.setItem('AETHELGARD_USERS', JSON.stringify(users));
        setHelpHistory((history) => [...history, { role: 'gk', text: `Thy soul is registered. Thy permanent Access Key is **${newPin}**. Memorize it, for I shall now open the gates...` }]);
        setTimeout(() => onLogin({ pin: newPin, isGuest: false, name: reply.name }), 3000);
      }
    } catch (error) {
      setServiceError({
        message: error?.message || 'The Gate Keeper could not answer right now.',
        retryable: error?.retryable !== false,
      });
    } finally {
      setHelpLoading(false);
    }
  };

  const handleHelp = async (event) => {
    event.preventDefault();
    if (!helpInput.trim() || helpLoading) return;

    const question = helpInput;
    setHelpInput('');
    await submitQuestion(question);
  };

  const handleRetry = async () => {
    if (!lastQuestion || helpLoading) return;
    await submitQuestion(lastQuestion);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 z-[300] flex items-center justify-center p-8">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />
          <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9 }}
            className="relative z-10 w-full max-w-sm flex flex-col overflow-hidden rounded-lg"
            style={{ background: 'var(--bg-panel)', border: '1px solid var(--border-gold)', maxHeight: '70vh' }}>
            <div className="p-4 border-b flex items-center justify-between" style={{ borderColor: 'var(--border-stone)', background: 'var(--bg-dark)' }}>
              <div>
                <h3 className="font-ancient font-bold text-sm" style={{ color: 'var(--gold)' }}>The Gate Keeper</h3>
                <p className="text-xs italic" style={{ color: 'var(--text-dim)', fontFamily: 'Crimson Text, serif' }}>Hosted login and guidance service</p>
              </div>
              <button onClick={onClose} style={{ color: 'var(--text-faded)' }}><X size={16} /></button>
            </div>

            {serviceError && (
              <div className="px-4 py-3 border-b flex items-start gap-3" style={{ borderColor: 'var(--blood)', background: 'rgba(90, 18, 18, 0.88)' }}>
                <AlertTriangle size={16} style={{ color: '#ffb0b0', marginTop: '2px' }} />
                <div className="flex-1">
                  <p className="text-xs uppercase tracking-[0.16em]" style={{ color: '#ffcece' }}>Service Warning</p>
                  <p className="text-sm mt-1 leading-relaxed" style={{ color: '#f7dfdf', fontFamily: 'Crimson Text, serif' }}>
                    {serviceError.message}
                  </p>
                  {serviceError.retryable && lastQuestion && (
                    <button
                      onClick={handleRetry}
                      className="mt-3 text-xs uppercase flex items-center gap-2"
                      style={{ color: 'var(--gold)', letterSpacing: '0.1em' }}>
                      <RotateCcw size={13} /> Retry last question
                    </button>
                  )}
                </div>
              </div>
            )}

            <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar" style={{ background: 'var(--bg-dark)' }}>
              {helpHistory.length === 0 && (
                <p className="text-xs italic text-center py-4" style={{ color: 'var(--text-dim)', fontFamily: 'Crimson Text, serif' }}>
                  Ask the Gate Keeper anything about entering or surviving the realm...
                </p>
              )}
              {helpHistory.map((message, index) => (
                <div key={index} className={`text-sm p-3 border-l-2 ${message.role === 'gk' ? 'font-lore italic' : ''}`}
                  style={{
                    background: message.role === 'gk' ? 'rgba(201,168,76,0.05)' : 'var(--bg-card)',
                    borderColor: message.role === 'gk' ? 'var(--gold-dim)' : 'var(--border-stone)',
                    color: 'var(--text-parchment)',
                    fontFamily: message.role === 'gk' ? 'Crimson Text, serif' : 'Cinzel, serif',
                  }}>
                  {message.text}
                </div>
              ))}
              {helpLoading && (
                <div className="flex items-center gap-2 p-3 text-xs italic" style={{ color: 'var(--text-dim)', fontFamily: 'Crimson Text, serif' }}>
                  <Loader2 size={14} className="animate-spin" style={{ color: 'var(--gold)' }} /> The Gate Keeper ponders...
                </div>
              )}
            </div>

            <form onSubmit={handleHelp} className="flex gap-2 p-3 border-t" style={{ borderColor: 'var(--border-stone)', background: 'var(--bg-dark)' }}>
              <input
                value={helpInput}
                onChange={(event) => setHelpInput(event.target.value)}
                placeholder="Ask for guidance..."
                className="input-ancient flex-1 px-3 py-2 text-sm rounded-sm"
              />
              <button type="submit" disabled={helpLoading} className="btn-ancient px-3 py-2 rounded-sm disabled:opacity-40">
                <Send size={14} />
              </button>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default HelpModal;
