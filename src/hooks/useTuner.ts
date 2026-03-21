"use client";

import { useEffect, useRef, useState, useCallback } from "react";

const CHROMATIC_NOTES = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
const BUFFER_SIZE = 5;
const CONFIRMATION_FRAMES = 3;

export function useTuner() {
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animationRef = useRef<number | null>(null);
  
  const freqBufferRef = useRef<number[]>([]);
  const noteConfirmationRef = useRef<{ note: string; octave: number; count: number } | null>(null);
  const smoothedCentsRef = useRef(0);
  
  const [isListening, setIsListening] = useState(false);
  const [frequency, setFrequency] = useState<number | null>(null);
  const [cents, setCents] = useState(0);
  const [note, setNote] = useState<string | null>(null);
  const [octave, setOctave] = useState(4);
  const [error, setError] = useState<string | null>(null);
  const [volume, setVolume] = useState(0);

  const frequencyToNote = useCallback((freq: number) => {
    const A4 = 440;
    const halfStepsFromA4 = 12 * Math.log2(freq / A4);
    const nearestHalfStep = Math.round(halfStepsFromA4);
    const centsOff = Math.round((halfStepsFromA4 - nearestHalfStep) * 100);
    
    const noteIndex = ((nearestHalfStep % 12) + 12) % 12;
    const noteOctave = 4 + Math.floor((nearestHalfStep + 9) / 12);
    
    const adjustedNoteIndex = (noteIndex + 9) % 12;
    const adjustedOctave = noteOctave - (noteIndex + 9 < 0 ? 1 : 0);
    
    return {
      note: CHROMATIC_NOTES[adjustedNoteIndex],
      octave: Math.max(0, adjustedOctave),
      centsOff,
    };
  }, []);

  const startListening = async () => {
    try {
      setError(null);
      freqBufferRef.current = [];
      noteConfirmationRef.current = null;
      smoothedCentsRef.current = 0;
      
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: false,
          noiseSuppression: false,
          autoGainControl: false,
        }
      });
      
      streamRef.current = stream;
      const audioContext = new AudioContext();
      audioContextRef.current = audioContext;
      
      const source = audioContext.createMediaStreamSource(stream);
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 8192;
      analyser.smoothingTimeConstant = 0;
      source.connect(analyser);
      analyserRef.current = analyser;
      
      setIsListening(true);

      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);

      const detect = () => {
        if (!analyserRef.current || !audioContextRef.current) return;

        analyserRef.current.getByteTimeDomainData(dataArray);

        let maxVal = 0;
        let sumSquares = 0;
        for (let i = 0; i < bufferLength; i++) {
          const val = (dataArray[i] - 128) / 128;
          maxVal = Math.max(maxVal, Math.abs(val));
          sumSquares += val * val;
        }
        const rms = Math.sqrt(sumSquares / bufferLength);
        setVolume(rms);

        if (rms > 0.02) {
          const freq = findFundamentalFrequency(dataArray, audioContext.sampleRate);
          
          if (freq > 80 && freq < 1200) {
            freqBufferRef.current.push(freq);
            if (freqBufferRef.current.length > BUFFER_SIZE) {
              freqBufferRef.current.shift();
            }
            
            const avgFreq = freqBufferRef.current.reduce((a, b) => a + b, 0) / freqBufferRef.current.length;
            const result = frequencyToNote(avgFreq);
            
            smoothedCentsRef.current = smoothedCentsRef.current * 0.7 + result.centsOff * 0.3;
            const displayCents = Math.round(smoothedCentsRef.current);
            
            if (noteConfirmationRef.current && 
                noteConfirmationRef.current.note === result.note && 
                noteConfirmationRef.current.octave === result.octave) {
              noteConfirmationRef.current.count++;
            } else {
              noteConfirmationRef.current = { ...result, count: 1 };
            }
            
            if (noteConfirmationRef.current.count >= CONFIRMATION_FRAMES) {
              setFrequency(avgFreq);
              setNote(result.note);
              setOctave(result.octave);
              setCents(displayCents);
            }
          } else {
            freqBufferRef.current = [];
          }
        } else {
          freqBufferRef.current = [];
          noteConfirmationRef.current = null;
          smoothedCentsRef.current = 0;
          setFrequency(null);
          setNote(null);
          setCents(0);
        }

        animationRef.current = requestAnimationFrame(detect);
      };

      detect();
    } catch (err) {
      console.error("Tuner error:", err);
      setError(err instanceof Error ? err.message : "Microphone access denied");
      setIsListening(false);
    }
  };

  const stopListening = () => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    setIsListening(false);
    setFrequency(null);
    setNote(null);
    setCents(0);
    setVolume(0);
    freqBufferRef.current = [];
    noteConfirmationRef.current = null;
  };

  const findFundamentalFrequency = (buffer: Uint8Array, sampleRate: number): number => {
    const SIZE = buffer.length;
    const data = new Float32Array(SIZE);
    
    for (let i = 0; i < SIZE; i++) {
      data[i] = (buffer[i] - 128) / 128;
    }

    const correlations = new Float32Array(SIZE / 2);
    
    for (let lag = 0; lag < SIZE / 2; lag++) {
      let sum = 0;
      for (let i = 0; i < SIZE / 2; i++) {
        sum += data[i] * data[i + lag];
      }
      correlations[lag] = sum;
    }

    let bestLag = 0;
    let bestCorrelation = 0;
    const minLag = Math.floor(sampleRate / 1200);
    const maxLag = Math.floor(sampleRate / 60);

    for (let lag = minLag; lag < Math.min(maxLag, SIZE / 2); lag++) {
      if (correlations[lag] > bestCorrelation) {
        bestCorrelation = correlations[lag];
        bestLag = lag;
      }
    }

    if (bestLag === 0) return -1;

    let delta = 0;
    if (bestLag > 0 && bestLag < correlations.length - 1) {
      const d = correlations[bestLag + 1] + correlations[bestLag - 1] - 2 * correlations[bestLag];
      if (d !== 0) {
        delta = (correlations[bestLag + 1] - correlations[bestLag - 1]) / (2 * d);
      }
    }

    const refinedLag = bestLag + delta;
    return sampleRate / refinedLag;
  };

  const getNoteFrequency = (n: string, o: number): number => {
    const A4 = 440;
    const halfStepsFromA4 = CHROMATIC_NOTES.indexOf(n) - 9 + (o - 4) * 12;
    return A4 * Math.pow(2, halfStepsFromA4 / 12);
  };

  useEffect(() => {
    return () => {
      stopListening();
    };
  }, []);

  return {
    isListening,
    frequency,
    cents,
    note,
    octave,
    volume,
    error,
    startListening,
    stopListening,
    getNoteFrequency,
  };
}
