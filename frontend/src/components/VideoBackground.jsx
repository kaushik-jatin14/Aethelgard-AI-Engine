import React from 'react';
import { motion } from 'framer-motion';
import ReactPlayer from 'react-player';

const VideoBackground = ({ videoId, opacity = 1, blur = 0, className = "" }) => {
  if (!videoId) return null;

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity }}
      transition={{ duration: 2 }}
      className={`absolute inset-0 z-0 overflow-hidden pointer-events-none ${className}`}
      style={{ filter: blur ? `blur(${blur}px)` : 'none' }}
    >
      <div className="absolute top-1/2 left-1/2 w-[150vw] h-[150vh] min-w-full min-h-full -translate-x-1/2 -translate-y-1/2 opacity-70 pointer-events-none">
        <ReactPlayer
          url={`https://www.youtube.com/watch?v=${videoId}`}
          playing={true}
          loop={true}
          muted={true}
          width="100%"
          height="100%"
          config={{
            youtube: {
              playerVars: { autoplay: 1, controls: 0, modestbranding: 1, rel: 0, showinfo: 0, disablekb: 1 }
            }
          }}
          style={{ position: 'absolute', top: 0, left: 0, objectFit: 'cover' }}
        />
      </div>
    </motion.div>
  );
};

export default VideoBackground;
