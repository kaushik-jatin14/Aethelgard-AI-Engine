import React from 'react';
import { Compass, Map as MapIcon, Navigation } from 'lucide-react';
import { motion } from 'framer-motion';

const MapViewer = ({ location, isProcessing }) => {
  return (
    <div className="w-full max-w-3xl aspect-video relative flex items-center justify-center rounded-3xl border border-cyan-500/20 bg-cyan-950/10 backdrop-blur-sm overflow-hidden shadow-[0_0_50px_rgba(6,182,212,0.1)]">
      
      {/* Grid Background */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(6,182,212,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(6,182,212,0.1)_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_at_center,black_40%,transparent_70%)]"></div>

      {/* Radar Sweep Effect */}
      {isProcessing && (
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
          className="absolute inset-0 origin-center opacity-30"
          style={{
            background: 'conic-gradient(from 0deg, transparent 0deg, transparent 270deg, rgba(168, 85, 247, 0.4) 360deg)',
          }}
        />
      )}

      {/* Center Reticle */}
      <div className="relative z-10 flex flex-col items-center justify-center">
        <motion.div 
          animate={isProcessing ? { scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] } : {}}
          transition={{ duration: 2, repeat: Infinity }}
          className="w-32 h-32 rounded-full border border-cyan-500/30 flex items-center justify-center relative mb-6"
        >
          <div className="absolute w-40 h-40 rounded-full border border-purple-500/10 animate-[spin_10s_linear_infinite]"></div>
          <div className="absolute w-48 h-48 rounded-full border border-cyan-500/10 animate-[spin_15s_linear_infinite_reverse]"></div>
          
          <div className="w-4 h-4 bg-cyan-400 rounded-full shadow-[0_0_20px_rgba(34,211,238,0.8)] z-10"></div>
          <Navigation className="absolute -top-6 text-cyan-500/50" size={24} />
          <Compass className="absolute -bottom-6 text-cyan-500/50" size={24} />
        </motion.div>

        {/* Location Text Container */}
        <div className="bg-slate-900/80 border border-slate-700/50 backdrop-blur-md px-8 py-4 rounded-2xl flex flex-col items-center shadow-xl transform transition-all duration-500 hover:scale-105">
          <span className="text-[10px] text-cyan-500 font-bold tracking-[0.2em] uppercase mb-1 flex items-center gap-2">
            <MapIcon size={12} />
            Current Location
          </span>
          <h2 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-400 text-center tracking-tight">
            {location || "Unknown Territory"}
          </h2>
        </div>
      </div>

      {/* Corner Accents */}
      <div className="absolute top-4 left-4 w-8 h-8 border-t-2 border-l-2 border-cyan-500/30"></div>
      <div className="absolute top-4 right-4 w-8 h-8 border-t-2 border-r-2 border-cyan-500/30"></div>
      <div className="absolute bottom-4 left-4 w-8 h-8 border-b-2 border-l-2 border-cyan-500/30"></div>
      <div className="absolute bottom-4 right-4 w-8 h-8 border-b-2 border-r-2 border-cyan-500/30"></div>
    </div>
  );
};

export default MapViewer;
