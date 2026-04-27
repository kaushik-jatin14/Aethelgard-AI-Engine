import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UserPlus, LogIn, UserCircle2, ArrowRight, HelpCircle, X, Send, Loader2 } from 'lucide-react';
import { SettingsButton } from './SettingsPanel';
import { useUISounds } from '../hooks/useUISounds';

const LoginScreen = ({ onLogin, onOpenSettings, onOpenHelp }) => {
  const { withSounds } = useUISounds();
  const [mode, setMode] = useState('menu');
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [generatedPin, setGeneratedPin] = useState(null);

  // Slow, deliberate dragon presence rather than a constant cheap shake.
  const shakeAnimation = {
    x: [0, -1, 1, 0],
    y: [0, 1, -1, 0],
    transition: { duration: 1.6, repeat: Infinity, repeatDelay: 9 }
  };

  const handleCreate = (e) => {
    e.preventDefault();
    if (!name || !age) { setError('Provide thy true name and age of soul.'); return; }
    const newPin = Math.random().toString(36).substring(2,6).toUpperCase();
    const users = JSON.parse(localStorage.getItem('AETHELGARD_USERS') || '{}');
    users[newPin] = { name, age, created: Date.now() };
    localStorage.setItem('AETHELGARD_USERS', JSON.stringify(users));
    setGeneratedPin(newPin);
  };

  const handleReturn = (e) => {
    e.preventDefault();
    const users = JSON.parse(localStorage.getItem('AETHELGARD_USERS') || '{}');
    if (users[pin.toUpperCase()]) {
      onLogin({ pin: pin.toUpperCase(), isGuest: false, name: users[pin.toUpperCase()].name });
    } else {
      setError('The Gate Keeper denies thee. Invalid access key.');
    }
  };

  return (
    <motion.div animate={shakeAnimation} className="flex h-screen w-full items-center justify-center relative overflow-hidden" style={{ background: 'var(--bg-dark)', fontFamily: 'var(--font-ui)' }}>

      {/* Always-visible settings button */}
      <SettingsButton onClick={onOpenSettings} />

      {/* Cinematic animated background */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none bg-black">
        {/* Slow panning Dragon background */}
        <div 
          className="absolute inset-[-8%] w-[116%] h-[116%] bg-center bg-cover bg-no-repeat opacity-70"
          style={{ 
            backgroundImage: 'url(/dragon_bg.png)', 
            filter: 'contrast(1.08) saturate(1.08) brightness(0.82)',
            animation: 'pan-background 22s ease-in-out infinite alternate' 
          }}
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              'radial-gradient(circle at 58% 36%, rgba(214,121,58,0.34), transparent 20%), radial-gradient(circle at 62% 41%, rgba(255,202,140,0.18), transparent 12%)',
            mixBlendMode: 'screen',
          }}
        />
        
        {/* CSS Embers overlay */}
        <div className="absolute inset-0 opacity-80" style={{ background: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 200 200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noiseFilter\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.85\' numOctaves=\'3\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noiseFilter)\' opacity=\'0.15\' mix-blend-mode=\'screen\'/%3E%3C/svg%3E")', animation: 'flicker 4s infinite alternate' }} />
        
        <style>{`
          @keyframes pan-background {
            0% { transform: scale(1) translate(0, 0); }
            35% { transform: scale(1.04) translate(-1.2%, -0.8%); }
            70% { transform: scale(1.08) translate(1.4%, -1.1%); }
            100% { transform: scale(1.02) translate(0.6%, 1%); }
          }
          @keyframes flicker {
            0% { opacity: 0.7; }
            25% { opacity: 0.9; }
            50% { opacity: 0.6; }
            75% { opacity: 0.8; }
            100% { opacity: 0.7; }
          }
        `}</style>
      </div>

      {/* Overlays to make UI readable */}
      <div className="absolute inset-0 z-0" style={{ background: 'linear-gradient(to top, rgba(3,8,15,1) 0%, rgba(4,10,18,0.42) 50%, rgba(3,8,15,0.88) 100%)' }}/>
      <div className="absolute inset-0 z-0" style={{ background: 'radial-gradient(ellipse at center, transparent 20%, rgba(3,8,15,0.84) 100%)' }}/>

      {/* Title */}
      <motion.div initial={{ y: -50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 1.2 }}
        className="absolute top-16 left-1/2 -translate-x-1/2 flex flex-col items-center z-20 text-center">
        <motion.div className="text-6xl mb-4" animate={{ opacity: [0.7,1,0.7] }} transition={{ duration: 4, repeat: Infinity }}>✦</motion.div>
        <h1 className="text-6xl md:text-8xl font-black uppercase" style={{ color: 'var(--gold)', fontFamily: 'var(--font-display)', textShadow: '0 0 60px rgba(113,220,245,0.4)' }}>
          Aethelgard
        </h1>
        <div className="flex items-center gap-4 mt-3">
          <div className="divider-ancient w-20"/>
          <p className="text-xs italic" style={{ color: 'var(--text-dim)', fontFamily: 'var(--font-body)', letterSpacing: '0.4em' }}>The Shattered Realm</p>
          <div className="divider-ancient w-20"/>
        </div>
      </motion.div>

      {/* Main form */}
      <div className="relative z-30 w-full max-w-sm mt-28">
        <AnimatePresence mode="wait">

          {mode === 'menu' && (
            <motion.div key="menu" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -15 }} className="space-y-3">
              <MenuBtn icon={<UserPlus size={18} style={{ color: 'var(--gold)' }}/>} label="Forge New Destiny" sub="Create a save profile" onClick={() => { setMode('new'); setError(''); }} gold/>
              <MenuBtn icon={<LogIn size={18} style={{ color: 'var(--text-faded)' }}/>} label="Resume thy Journey" sub="Enter your 4-key access code" onClick={() => { setMode('return'); setError(''); }}/>
              <div className="divider-ancient my-2"/>
              <div className="flex gap-3">
                <button {...withSounds({ onClick: () => onLogin({ pin:'GUEST', isGuest:true, name:'Guest Explorer' }) })}
                  className="flex-1 py-2.5 text-xs font-ancient uppercase flex items-center justify-center gap-2 transition-all hover:opacity-80"
                  style={{ background:'var(--bg-card)', border:'1px solid var(--border-stone)', color:'var(--text-dim)', letterSpacing:'0.1em' }}>
                  <UserCircle2 size={13}/> Guest
                </button>
                <button {...withSounds({ onClick: onOpenHelp })}
                  className="flex-1 py-2.5 text-xs font-ancient uppercase flex items-center justify-center gap-2 transition-all hover:opacity-80"
                  style={{ background:'var(--bg-card)', border:'1px solid var(--border-stone)', color:'var(--text-dim)', letterSpacing:'0.1em' }}>
                  <HelpCircle size={13}/> Help
                </button>
              </div>
            </motion.div>
          )}

          {mode === 'new' && !generatedPin && (
            <motion.div key="new" initial={{ opacity:0,x:20 }} animate={{ opacity:1,x:0 }} exit={{ opacity:0,x:-20 }}>
              <button onClick={() => setMode('menu')} className="text-xs mb-4 hover:opacity-80 flex items-center gap-1" style={{ color:'var(--text-dim)', fontFamily:'var(--font-body)' }}>← Back</button>
              <div className="p-6 space-y-4" style={{ background:'var(--bg-panel)', border:'1px solid var(--border-gold)' }}>
                <div className="text-0 left-0 right-0 h-0.5 -mt-6 mb-6" style={{ background:'linear-gradient(90deg, transparent, var(--gold), transparent)' }}/>
                <h3 className="font-ancient text-base font-bold" style={{ color:'var(--text-parchment)' }}>Identity Matrix</h3>
                {error && <p className="text-xs italic" style={{ color:'var(--iron-red)', fontFamily:'var(--font-body)' }}>{error}</p>}
                <AncientField label="True Name" type="text" value={name} onChange={setName} placeholder="Speak thy name..."/>
                <AncientField label="Age of Soul" type="number" value={age} onChange={setAge} placeholder="Thy age..."/>
                <button {...withSounds({ onClick: handleCreate })} className="btn-ancient w-full py-3 rounded text-sm">Generate Access Key</button>
              </div>
            </motion.div>
          )}

          {mode === 'new' && generatedPin && (
            <motion.div key="pin" initial={{ opacity:0,scale:0.9 }} animate={{ opacity:1,scale:1 }}
              className="p-8 text-center" style={{ background:'var(--bg-panel)', border:'1px solid var(--gold)' }}>
              <p className="text-xs font-ancient uppercase mb-2" style={{ color:'var(--gold)', letterSpacing:'0.2em' }}>Thine Access Key</p>
              <p className="text-xs italic mb-6" style={{ color:'var(--text-dim)', fontFamily:'var(--font-body)' }}>
                Write it in thine own tome. Losing it means losing thy progress forever.
              </p>
              <div className="text-5xl font-black py-6 mb-6 select-all tracking-[0.5em]"
                style={{ color:'var(--text-parchment)', background:'var(--bg-dark)', border:'1px solid var(--border-gold)' }}>{generatedPin}</div>
              <button {...withSounds({ onClick: () => onLogin({ pin:generatedPin, isGuest:false, name }) })}
                className="btn-ancient w-full py-3 rounded">I Remember It - Begin the Journey</button>
            </motion.div>
          )}

          {mode === 'return' && (
            <motion.div key="return" initial={{ opacity:0,x:-20 }} animate={{ opacity:1,x:0 }} exit={{ opacity:0,x:20 }}>
              <button onClick={() => setMode('menu')} className="text-xs mb-4 hover:opacity-80" style={{ color:'var(--text-dim)', fontFamily:'var(--font-body)' }}>← Back</button>
              <div className="p-6 space-y-4" style={{ background:'var(--bg-panel)', border:'1px solid var(--border-gold)' }}>
                <h3 className="font-ancient text-base font-bold" style={{ color:'var(--text-parchment)' }}>Speak Thine Access Key</h3>
                {error && <p className="text-xs italic" style={{ color:'var(--iron-red)', fontFamily:'var(--font-body)' }}>{error}</p>}
                <input type="text" maxLength={4} value={pin} onChange={e => setPin(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleReturn(e)}
                  placeholder="XXXX"
                  className="input-ancient w-full px-4 py-5 text-center text-4xl font-black rounded-sm uppercase tracking-[0.6em]"/>
                <button {...withSounds({ onClick: handleReturn })} className="btn-ancient w-full py-3 rounded text-sm">Enter the Realm</button>
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </motion.div>
  );
};

const MenuBtn = ({ icon, label, sub, onClick, gold }) => {
  const { withSounds } = useUISounds();
  return (
    <button {...withSounds({ onClick })}
      className="w-full p-4 flex items-center justify-between gap-4 transition-all hover:scale-[1.01] text-left"
      style={{ background:'var(--bg-card)', border:`1px solid ${gold?'var(--border-gold)':'var(--border-stone)'}`, boxShadow:gold?'0 0 15px rgba(113,220,245,0.1)':'none' }}>
      <div className="flex items-center gap-3">
        <div className="p-2 rounded" style={{ background:'var(--bg-panel)' }}>{icon}</div>
        <div>
          <p className="font-ancient font-bold text-sm uppercase" style={{ color:gold?'var(--gold)':'var(--text-parchment)', letterSpacing:'0.08em' }}>{label}</p>
          <p className="text-xs italic" style={{ color:'var(--text-dim)', fontFamily:'var(--font-body)' }}>{sub}</p>
        </div>
      </div>
      <ArrowRight size={14} style={{ color:'var(--text-dim)' }}/>
    </button>
  );
};

const AncientField = ({ label, type, value, onChange, placeholder }) => {
  const { withSounds } = useUISounds();
  return (
    <div>
      <label className="block text-xs font-ancient uppercase mb-1.5" style={{ color:'var(--text-dim)', letterSpacing:'0.1em' }}>{label}</label>
      <input {...withSounds()} type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
        className="input-ancient w-full px-4 py-3 rounded-sm text-sm"/>
    </div>
  );
};

export default LoginScreen;

