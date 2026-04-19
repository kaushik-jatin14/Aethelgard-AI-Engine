import React, { useState, useEffect } from 'react';
import ReactPlayer from 'react-player';

// ================================================================
// AUDIO MANAGER COMPONENT
// Uses ReactPlayer to securely stream Epic/LotR cinematic ambient soundtracks from YouTube
// ================================================================
const AUDIO_TRACKS = {
  epic:        'https://www.youtube.com/watch?v=1XkG1b8sNnI', // LotR Epic Theme
  terrifying:  'https://www.youtube.com/watch?v=6PqO9eK00K0', // Dark Mordor Ambient
  mystical:    'https://www.youtube.com/watch?v=S2XvxJpE2mU', // Shire / Mystical
  adventurous: 'https://www.youtube.com/watch?v=1XkG1b8sNnI', 
  scary:       'https://www.youtube.com/watch?v=6PqO9eK00K0',
  dark:        'https://www.youtube.com/watch?v=6PqO9eK00K0',
  tense:       'https://www.youtube.com/watch?v=1XkG1b8sNnI',
  intimidating:'https://www.youtube.com/watch?v=6PqO9eK00K0',
  desolate:    'https://www.youtube.com/watch?v=6PqO9eK00K0',
  default:     'https://www.youtube.com/watch?v=6PqO9eK00K0', // Default to terrifying ancient
};

const AudioManager = ({ atmosphere = 'epic', volume = 0.7, muted = false }) => {
  const [playing, setPlaying] = useState(false);
  const trackUrl = AUDIO_TRACKS[atmosphere] || AUDIO_TRACKS.default;

  useEffect(() => {
    const handleInteract = () => {
      setPlaying(true);
      document.removeEventListener('click', handleInteract);
      document.removeEventListener('keydown', handleInteract);
    };
    document.addEventListener('click', handleInteract);
    document.addEventListener('keydown', handleInteract);
    return () => {
      document.removeEventListener('click', handleInteract);
      document.removeEventListener('keydown', handleInteract);
    };
  }, []);

  return (
    <div style={{ display: 'none' }}>
      <ReactPlayer
        url={trackUrl}
        playing={playing}
        loop={true}
        volume={muted ? 0 : volume}
        muted={muted}
        width="0"
        height="0"
        config={{
          youtube: {
            playerVars: { autoplay: 1, controls: 0, modestbranding: 1 }
          }
        }}
      />
    </div>
  );
};

export default AudioManager;
