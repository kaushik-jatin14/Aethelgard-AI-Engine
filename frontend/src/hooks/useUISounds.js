import { useCallback, useRef } from 'react';

const createNoiseBuffer = (ctx, duration = 0.2) => {
  const size = Math.max(1, Math.floor(ctx.sampleRate * duration));
  const buffer = ctx.createBuffer(1, size, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < size; i += 1) {
    data[i] = (Math.random() * 2 - 1) * 0.55;
  }
  return buffer;
};

export const useUISounds = () => {
  const audioCtxRef = useRef(null);

  const initAudio = () => {
    if (!audioCtxRef.current) {
      audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (audioCtxRef.current.state === 'suspended') {
      audioCtxRef.current.resume();
    }
  };

  const playHover = useCallback(() => {
    initAudio();
    const ctx = audioCtxRef.current;
    if (!ctx) return;

    const start = ctx.currentTime;
    const bufferSource = ctx.createBufferSource();
    bufferSource.buffer = createNoiseBuffer(ctx, 0.16);

    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(1450, start);
    filter.Q.setValueAtTime(1.4, start);

    const shimmer = ctx.createOscillator();
    const shimmerGain = ctx.createGain();
    shimmer.type = 'triangle';
    shimmer.frequency.setValueAtTime(740, start);
    shimmer.frequency.exponentialRampToValueAtTime(910, start + 0.12);

    const gainNode = ctx.createGain();
    gainNode.gain.setValueAtTime(0.0001, start);
    gainNode.gain.exponentialRampToValueAtTime(0.045, start + 0.03);
    gainNode.gain.exponentialRampToValueAtTime(0.0001, start + 0.16);

    shimmerGain.gain.setValueAtTime(0.0001, start);
    shimmerGain.gain.exponentialRampToValueAtTime(0.015, start + 0.02);
    shimmerGain.gain.exponentialRampToValueAtTime(0.0001, start + 0.14);

    bufferSource.connect(filter);
    filter.connect(gainNode);
    shimmer.connect(shimmerGain);
    shimmerGain.connect(gainNode);
    gainNode.connect(ctx.destination);

    bufferSource.start(start);
    bufferSource.stop(start + 0.16);
    shimmer.start(start);
    shimmer.stop(start + 0.14);
  }, []);

  const playClick = useCallback(() => {
    initAudio();
    const ctx = audioCtxRef.current;
    if (!ctx) return;

    const start = ctx.currentTime;
    const master = ctx.createGain();
    master.gain.setValueAtTime(0.0001, start);
    master.gain.exponentialRampToValueAtTime(0.14, start + 0.015);
    master.gain.exponentialRampToValueAtTime(0.0001, start + 0.32);
    master.connect(ctx.destination);

    const impact = ctx.createOscillator();
    impact.type = 'triangle';
    impact.frequency.setValueAtTime(182, start);
    impact.frequency.exponentialRampToValueAtTime(84, start + 0.28);

    const overtone = ctx.createOscillator();
    overtone.type = 'sine';
    overtone.frequency.setValueAtTime(510, start);
    overtone.frequency.exponentialRampToValueAtTime(240, start + 0.18);

    const overtoneGain = ctx.createGain();
    overtoneGain.gain.setValueAtTime(0.0001, start);
    overtoneGain.gain.exponentialRampToValueAtTime(0.08, start + 0.01);
    overtoneGain.gain.exponentialRampToValueAtTime(0.0001, start + 0.14);

    const impulse = ctx.createBufferSource();
    impulse.buffer = createNoiseBuffer(ctx, 0.09);
    const impulseFilter = ctx.createBiquadFilter();
    impulseFilter.type = 'lowpass';
    impulseFilter.frequency.setValueAtTime(560, start);

    const impulseGain = ctx.createGain();
    impulseGain.gain.setValueAtTime(0.0001, start);
    impulseGain.gain.exponentialRampToValueAtTime(0.11, start + 0.01);
    impulseGain.gain.exponentialRampToValueAtTime(0.0001, start + 0.09);

    impact.connect(master);
    overtone.connect(overtoneGain);
    overtoneGain.connect(master);
    impulse.connect(impulseFilter);
    impulseFilter.connect(impulseGain);
    impulseGain.connect(master);

    impact.start(start);
    impact.stop(start + 0.32);
    overtone.start(start);
    overtone.stop(start + 0.18);
    impulse.start(start);
    impulse.stop(start + 0.09);
  }, []);

  const withSounds = useCallback((props = {}) => ({
    ...props,
    onMouseEnter: (event) => {
      playHover();
      if (props.onMouseEnter) props.onMouseEnter(event);
    },
    onClick: (event) => {
      playClick();
      if (props.onClick) props.onClick(event);
    },
  }), [playClick, playHover]);

  return { playClick, playHover, withSounds };
};
