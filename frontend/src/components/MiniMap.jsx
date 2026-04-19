import React, { useState } from 'react';
import { Map as MapIcon, Radar } from 'lucide-react';

const MiniMap = ({ onOpenMap }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div 
      className="absolute top-8 right-8 z-[60] flex flex-col items-end"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="flex items-center gap-3">
        {/* Title appears on hover */}
        <div className={`transition-all duration-300 overflow-hidden ${isHovered ? 'w-16 opacity-100' : 'w-0 opacity-0'}`}>
          <span className="text-[10px] uppercase font-black tracking-widest text-white bg-red-600 px-2 py-1 rounded-sm shadow-[0_0_10px_rgba(220,38,38,0.5)]">
            MAP
          </span>
        </div>

        {/* Dynamic Map Icon */}
        <button 
          onClick={onOpenMap}
          className={`
            relative flex items-center justify-center bg-[#0a0a0a] border-2 rounded-full p-4 shadow-2xl transition-all duration-300
            ${isHovered ? 'border-red-500 scale-110 shadow-[0_0_20px_rgba(220,38,38,0.3)]' : 'border-slate-700 hover:border-slate-500'}
          `}
        >
          {/* Animated radar rings */}
          <div className="absolute inset-0 rounded-full border border-red-500/30 animate-ping"></div>
          <div className="absolute inset-2 rounded-full border border-red-500/10 animate-[spin_4s_linear_infinite]"></div>
          
          <Radar size={24} className={isHovered ? 'text-red-500' : 'text-slate-400'} />
        </button>
      </div>
    </div>
  );
};

export default MiniMap;
