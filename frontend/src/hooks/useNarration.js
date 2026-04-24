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

const pickVoice = (voices, profile) => {
  if (!voices.length) return null;
  const keywords = (profile?.keywords || []).map((item) => item.toLowerCase());
  const scoreVoice = (voice) => {
    const name = voice.name.toLowerCase();
    let score = /en/i.test(voice.lang) ? 10 : 0;

    keywords.forEach((keyword) => {
      if (name.includes(keyword)) score += 40;
    });

    ['natural', 'neural', 'online', 'enhanced'].forEach((token) => {
      if (name.includes(token)) score += 12;
    });

    ['google', 'default', 'basic'].forEach((token) => {
      if (name.includes(token)) score -= 8;
    });

    return score;
  };

  return [...voices].sort((left, right) => scoreVoice(right) - scoreVoice(left))[0] || null;
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
