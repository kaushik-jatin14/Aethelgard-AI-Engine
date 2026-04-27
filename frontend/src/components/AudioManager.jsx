import React, { useEffect, useMemo, useState } from 'react';
import ReactPlayer from 'react-player';

const AUDIO_TRACKS = {
  epic: 'https://www.youtube.com/watch?v=6l4Y0U4M8x0',
  terrifying: 'https://www.youtube.com/watch?v=TJwYQWGF4lU',
  mystical: 'https://www.youtube.com/watch?v=qt0ybYlqQvg',
  adventurous: 'https://www.youtube.com/watch?v=Q0pBzowOKU4',
  scary: 'https://www.youtube.com/watch?v=6JHu3b-pbh8',
  dark: 'https://www.youtube.com/watch?v=Gm3Kj8X3K4Q',
  tense: 'https://www.youtube.com/watch?v=K6BRna4_bmg',
  intimidating: 'https://www.youtube.com/watch?v=K6BRna4_bmg',
  desolate: 'https://www.youtube.com/watch?v=3cxixDgHUYw',
  soothing: 'https://www.youtube.com/watch?v=PZQ6V8e3L9I',
  default: 'https://www.youtube.com/watch?v=qt0ybYlqQvg',
};

const CHARACTER_THEME_TRACKS = {
  shadowveil: 'https://www.youtube.com/watch?v=Gm3Kj8X3K4Q',
  astral: 'https://www.youtube.com/watch?v=qt0ybYlqQvg',
  cathedral: 'https://www.youtube.com/watch?v=6l4Y0U4M8x0',
  wildwood: 'https://www.youtube.com/watch?v=PZQ6V8e3L9I',
  graveborn: 'https://www.youtube.com/watch?v=TJwYQWGF4lU',
  tundra: 'https://www.youtube.com/watch?v=Q0pBzowOKU4',
  stormheart: 'https://www.youtube.com/watch?v=K6BRna4_bmg',
  moonbloom: 'https://www.youtube.com/watch?v=PZQ6V8e3L9I',
};

const AudioManager = ({ atmosphere = 'epic', character = null, volume = 0.7, muted = false }) => {
  const [playing, setPlaying] = useState(false);

  const trackUrl = useMemo(() => {
    if (character?.audioTheme && CHARACTER_THEME_TRACKS[character.audioTheme]) {
      return CHARACTER_THEME_TRACKS[character.audioTheme];
    }
    return AUDIO_TRACKS[atmosphere] || AUDIO_TRACKS.default;
  }, [atmosphere, character]);

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
        loop
        volume={muted ? 0 : volume}
        muted={muted}
        width="0"
        height="0"
        config={{
          youtube: {
            playerVars: { autoplay: 1, controls: 0, modestbranding: 1 },
          },
        }}
      />
    </div>
  );
};

export default AudioManager;
