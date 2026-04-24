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

const pickVoice = (voices, profile) => {
  if (!voices.length) return null;
  const keywords = (profile?.keywords || []).map((item) => item.toLowerCase());
  for (const keyword of keywords) {
    const match = voices.find((voice) => voice.name.toLowerCase().includes(keyword));
    if (match) return match;
  }
  return voices.find((voice) => /en/i.test(voice.lang)) || voices[0] || null;
};

export const useNarration = ({ enabled, character, voiceVolume = 1 }) => {
  const [voices, setVoices] = useState([]);
  const lastSpokenRef = useRef('');

  useEffect(() => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return undefined;

    const loadVoices = () => setVoices(window.speechSynthesis.getVoices());
    loadVoices();
    window.speechSynthesis.addEventListener('voiceschanged', loadVoices);
    return () => window.speechSynthesis.removeEventListener('voiceschanged', loadVoices);
  }, []);

  useEffect(() => () => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
  }, []);

  const selectedVoice = useMemo(
    () => pickVoice(voices, character?.voiceProfile),
    [voices, character]
  );

  const stopNarration = useCallback(() => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();
  }, []);

  const speak = useCallback((text, { force = false } = {}) => {
    if (!enabled || typeof window === 'undefined' || !window.speechSynthesis) return;
    const cleaned = stripMarkdown(text);
    if (!cleaned) return;
    if (!force && cleaned === lastSpokenRef.current) return;

    lastSpokenRef.current = cleaned;
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(cleaned);
    if (selectedVoice) utterance.voice = selectedVoice;
    utterance.volume = Math.max(0, Math.min(1, voiceVolume));
    utterance.rate = character?.voiceProfile?.rate || 0.95;
    utterance.pitch = character?.voiceProfile?.pitch || 1;
    utterance.lang = selectedVoice?.lang || 'en-US';

    window.speechSynthesis.speak(utterance);
  }, [enabled, selectedVoice, character, voiceVolume]);

  return {
    speak,
    stopNarration,
    narrationSupported: typeof window !== 'undefined' && Boolean(window.speechSynthesis),
    selectedVoiceName: selectedVoice?.name || 'System Voice',
  };
};

export default useNarration;
