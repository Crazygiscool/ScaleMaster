"use client";

import { useCallback, useRef, useEffect } from "react";
import { MetronomeSettings } from "@/types/scale";

export function useMetronome(settings: MetronomeSettings, isRunning: boolean) {
  const audioContextRef = useRef<AudioContext | null>(null);
  const beatRef = useRef(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const isPlaying = isRunning;

  const getAudioContext = useCallback(() => {
    if (!audioContextRef.current) {
      audioContextRef.current = new AudioContext();
    }
    return audioContextRef.current;
  }, []);

  const playClick = useCallback(() => {
    const ctx = getAudioContext();
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    const frequency = (beatRef.current === 0 && settings.highFirst)
      ? settings.tone * 1.5
      : settings.tone;

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    oscillator.frequency.value = frequency;
    oscillator.type = "sine";

    gainNode.gain.setValueAtTime(0.3, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.05);

    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + 0.05);

    beatRef.current = (beatRef.current + 1) % settings.beatsPerMeasure;
  }, [getAudioContext, settings.tone, settings.highFirst, settings.beatsPerMeasure]);

  useEffect(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    if (isRunning && settings.enabled) {
      const intervalMs = (60 / settings.speed) * 1000;
      beatRef.current = 0;
      playClick();
      intervalRef.current = setInterval(playClick, intervalMs);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isRunning, settings.enabled, settings.speed, playClick]);

  useEffect(() => {
    return () => {
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  return { playClick, isPlaying };
}
