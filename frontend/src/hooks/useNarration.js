import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

const stripMarkdown = (text = '') =>
  String(text)
    .replace(/\*\*/g, '')
    .replace(/`/g, '')
    .replace(/^#{1,6}\s+/gm, '')
    .replace(/^\d+\.\s+/gm, '')
    .replace(/\[(.*?)\]\(.*?\)/g, '$1')
    .replace(/\s+/g, ' ')
    .trim();

export const chunkNarrationText = (text = '', maxChars = 150) => {
  const cleaned = stripMarkdown(text);
  if (!cleaned) return [];

  const sentenceParts = cleaned
    .split(/(?<=[.!?])\s+/)
    .map((part) => part.trim())
    .filter(Boolean);

  if (!sentenceParts.length) {
    return [cleaned];
  }

  const chunks = [];
  let current = '';

  sentenceParts.forEach((sentence) => {
    const next = current ? `${current} ${sentence}` : sentence;
    if (next.length <= maxChars && current.split(/[.!?]/).filter(Boolean).length < 2) {
      current = next;
      return;
    }

    if (current) {
      chunks.push(current);
    }

    if (sentence.length <= maxChars) {
      current = sentence;
      return;
    }

    const words = sentence.split(/\s+/);
    let working = '';
    words.forEach((word) => {
      const candidate = working ? `${working} ${word}` : word;
      if (candidate.length > maxChars && working) {
        chunks.push(working);
        working = word;
      } else {
        working = candidate;
      }
    });
    current = working;
  });

  if (current) {
    chunks.push(current);
  }

  return chunks;
};

const POSITIVE_VOICE_TOKENS = ['natural', 'neural', 'online', 'enhanced', 'premium'];
const NEGATIVE_VOICE_TOKENS = ['basic', 'desktop', 'robotic', 'legacy'];

const pickVoice = (voices, profile) => {
  if (!voices.length) return null;

  const preferredNames = (profile?.preferredNames || []).map((item) => item.toLowerCase());
  const preferredTokens = (profile?.preferredTokens || []).map((item) => item.toLowerCase());
  const avoidedTokens = (profile?.avoidedTokens || []).map((item) => item.toLowerCase());
  const preferredGender = profile?.gender?.toLowerCase();

  const scoreVoice = (voice) => {
    const name = voice.name.toLowerCase();
    const lang = voice.lang.toLowerCase();
    let score = lang.startsWith('en') ? 30 : 8;

    preferredNames.forEach((token) => {
      if (name.includes(token)) score += 55;
    });

    preferredTokens.forEach((token) => {
      if (name.includes(token)) score += 18;
    });

    POSITIVE_VOICE_TOKENS.forEach((token) => {
      if (name.includes(token)) score += 12;
    });

    NEGATIVE_VOICE_TOKENS.forEach((token) => {
      if (name.includes(token)) score -= 14;
    });

    avoidedTokens.forEach((token) => {
      if (name.includes(token)) score -= 28;
    });

    if (preferredGender === 'female' && /(aria|jenny|sonia|sara|ava|female)/i.test(voice.name)) score += 16;
    if (preferredGender === 'male' && /(guy|ryan|davis|brian|christopher|david|mark|james|george|male)/i.test(voice.name)) score += 16;

    return score;
  };

  return [...voices].sort((left, right) => scoreVoice(right) - scoreVoice(left))[0] || null;
};

const buildFxPreset = (effect = {}) => {
  const intensity = effect.intensity ?? 0.3;

  switch (effect.type) {
    case 'shadow':
      return { tones: [196, 247], noise: 'bandpass', decay: 0.24, gain: 0.04 + intensity * 0.05 };
    case 'arcane':
      return { tones: [220, 330, 440], noise: null, decay: 0.34, gain: 0.045 + intensity * 0.05 };
    case 'cathedral':
      return { tones: [146, 220, 293], noise: null, decay: 0.42, gain: 0.05 + intensity * 0.05 };
    case 'wind':
      return { tones: [247, 370], noise: 'highpass', decay: 0.2, gain: 0.035 + intensity * 0.04 };
    case 'grave':
      return { tones: [98, 123, 147], noise: 'lowpass', decay: 0.45, gain: 0.06 + intensity * 0.05 };
    case 'beast':
      return { tones: [110, 165, 220], noise: 'lowpass', decay: 0.28, gain: 0.055 + intensity * 0.05 };
    case 'storm':
      return { tones: [174, 261, 392], noise: 'highpass', decay: 0.32, gain: 0.05 + intensity * 0.05 };
    case 'sanctuary':
      return { tones: [262, 392, 524], noise: null, decay: 0.26, gain: 0.04 + intensity * 0.04 };
    default:
      return { tones: [220, 330], noise: null, decay: 0.24, gain: 0.04 };
  }
};

const playNarrationSting = (ctx, effect) => {
  if (!ctx || !effect) return;

  const preset = buildFxPreset(effect);
  const start = ctx.currentTime;
  const master = ctx.createGain();
  master.gain.setValueAtTime(0.0001, start);
  master.gain.exponentialRampToValueAtTime(preset.gain, start + 0.03);
  master.gain.exponentialRampToValueAtTime(0.0001, start + preset.decay);
  master.connect(ctx.destination);

  preset.tones.forEach((frequency, index) => {
    const osc = ctx.createOscillator();
    const oscGain = ctx.createGain();
    osc.type = index === 0 ? 'sine' : 'triangle';
    osc.frequency.setValueAtTime(frequency, start);
    osc.frequency.exponentialRampToValueAtTime(Math.max(60, frequency * 0.85), start + preset.decay);
    oscGain.gain.setValueAtTime(0.0001, start);
    oscGain.gain.exponentialRampToValueAtTime(0.55 / (index + 1), start + 0.02 + index * 0.015);
    oscGain.gain.exponentialRampToValueAtTime(0.0001, start + preset.decay);
    osc.connect(oscGain);
    oscGain.connect(master);
    osc.start(start + index * 0.01);
    osc.stop(start + preset.decay + 0.05);
  });

  if (preset.noise) {
    const bufferSize = Math.max(1, Math.floor(ctx.sampleRate * 0.18));
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i += 1) {
      data[i] = (Math.random() * 2 - 1) * 0.45;
    }

    const noiseSource = ctx.createBufferSource();
    const filter = ctx.createBiquadFilter();
    const noiseGain = ctx.createGain();
    filter.type = preset.noise;
    filter.frequency.setValueAtTime(preset.noise === 'highpass' ? 1200 : 340, start);
    noiseGain.gain.setValueAtTime(0.0001, start);
    noiseGain.gain.exponentialRampToValueAtTime(0.08, start + 0.02);
    noiseGain.gain.exponentialRampToValueAtTime(0.0001, start + Math.min(0.2, preset.decay));
    noiseSource.buffer = buffer;
    noiseSource.connect(filter);
    filter.connect(noiseGain);
    noiseGain.connect(master);
    noiseSource.start(start);
    noiseSource.stop(start + Math.min(0.22, preset.decay + 0.02));
  }
};

export const useNarration = ({ enabled, character, voiceVolume = 1 }) => {
  const [voices, setVoices] = useState([]);
  const lastSpokenRef = useRef('');
  const audioCtxRef = useRef(null);
  const pendingSpeechTimeoutRef = useRef(null);

  useEffect(() => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return undefined;

    const loadVoices = () => setVoices(window.speechSynthesis.getVoices());
    loadVoices();
    window.speechSynthesis.addEventListener('voiceschanged', loadVoices);
    return () => window.speechSynthesis.removeEventListener('voiceschanged', loadVoices);
  }, []);

  useEffect(() => () => {
    if (pendingSpeechTimeoutRef.current) {
      window.clearTimeout(pendingSpeechTimeoutRef.current);
    }
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
  }, []);

  const selectedVoice = useMemo(
    () => pickVoice(voices, character?.voiceProfile),
    [voices, character]
  );

  const stopNarration = useCallback(() => {
    if (pendingSpeechTimeoutRef.current) {
      window.clearTimeout(pendingSpeechTimeoutRef.current);
      pendingSpeechTimeoutRef.current = null;
    }
    if (typeof window === 'undefined' || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();
  }, []);

  const speak = useCallback((text, { force = false } = {}) => {
    if (!enabled || typeof window === 'undefined' || !window.speechSynthesis) return;
    const cleaned = stripMarkdown(text);
    if (!cleaned) return;
    if (!force && cleaned === lastSpokenRef.current) return;

    lastSpokenRef.current = cleaned;
    stopNarration();
    window.speechSynthesis.resume();

    if (!audioCtxRef.current) {
      audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (audioCtxRef.current.state === 'suspended') {
      audioCtxRef.current.resume();
    }

    playNarrationSting(audioCtxRef.current, character?.voiceProfile?.fx);

    const utterance = new SpeechSynthesisUtterance(cleaned);
    if (selectedVoice) utterance.voice = selectedVoice;
    utterance.volume = Math.max(0, Math.min(1, voiceVolume * (character?.voiceProfile?.volume || 1)));
    utterance.rate = character?.voiceProfile?.rate || 0.95;
    utterance.pitch = character?.voiceProfile?.pitch || 1;
    utterance.lang = selectedVoice?.lang || 'en-US';

    const speechDelay = character?.voiceProfile?.fx?.delayMs || 0;
    pendingSpeechTimeoutRef.current = window.setTimeout(() => {
      window.speechSynthesis.speak(utterance);
      pendingSpeechTimeoutRef.current = null;
    }, speechDelay);
  }, [enabled, selectedVoice, character, voiceVolume, stopNarration]);

  return {
    speak,
    stopNarration,
    narrationSupported: typeof window !== 'undefined' && Boolean(window.speechSynthesis),
    selectedVoiceName: selectedVoice?.name || 'System Voice',
  };
};

export default useNarration;
