"use client";

import { useState, useCallback } from "react";
import { useTuner } from "@/hooks/useTuner";

const NOTES = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
const OCTAVES = [2, 3, 4, 5, 6];

export default function Tuner() {
  const { isListening, frequency, cents, note, octave, volume, error, startListening, stopListening, getNoteFrequency } = useTuner();
  
  const [targetNote, setTargetNote] = useState("A");
  const [targetOctave, setTargetOctave] = useState(4);
  const [isPlayingTarget, setIsPlayingTarget] = useState(false);

  const needlePosition = Math.max(-50, Math.min(50, cents));

  const getColor = () => {
    if (Math.abs(cents) <= 5) return "bg-green-500";
    if (Math.abs(cents) <= 15) return "bg-yellow-500";
    return "bg-red-500";
  };

  const getNoteColor = () => {
    if (Math.abs(cents) <= 5) return "text-green-400";
    if (Math.abs(cents) <= 15) return "text-yellow-400";
    return "text-red-400";
  };

  const playNote = useCallback((noteToPlay: string, noteOctave: number, duration: number = 2) => {
    const freq = getNoteFrequency(noteToPlay, noteOctave);
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.frequency.value = freq;
    osc.type = "sine";
    gain.gain.setValueAtTime(0.3, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration);
    osc.start();
    osc.stop(ctx.currentTime + duration);
    return ctx;
  }, [getNoteFrequency]);

  const handlePlayTarget = useCallback(() => {
    if (isPlayingTarget) return;
    setIsPlayingTarget(true);
    const ctx = playNote(targetNote, targetOctave, 3);
    setTimeout(() => {
      setIsPlayingTarget(false);
    }, 3000);
  }, [isPlayingTarget, playNote, targetNote, targetOctave]);

  const handlePlayCurrent = useCallback(() => {
    if (!note) return;
    playNote(note, octave, 1.5);
  }, [note, octave, playNote]);

  const targetFreq = getNoteFrequency(targetNote, targetOctave);

  return (
    <div className="bg-gray-900 border border-gray-700 rounded-lg p-3">
      <h3 className="text-sm font-bold text-white mb-2 flex items-center gap-2">
        <span>🎤</span> Tuner
      </h3>

      {error && (
        <div className="text-red-400 text-xs mb-2 p-2 bg-red-900/30 rounded">
          {error}
        </div>
      )}

      <div className="bg-gray-800/50 rounded-lg p-2 mb-3">
        <label className="text-xs text-gray-400 mb-1 block">Target Pitch</label>
        <div className="flex gap-2">
          <select
            value={targetNote}
            onChange={(e) => setTargetNote(e.target.value)}
            className="flex-1 bg-gray-700 text-white text-sm rounded px-2 py-1 border border-gray-600"
          >
            {NOTES.map((n) => (
              <option key={n} value={n}>{n}</option>
            ))}
          </select>
          <select
            value={targetOctave}
            onChange={(e) => setTargetOctave(parseInt(e.target.value))}
            className="w-16 bg-gray-700 text-white text-sm rounded px-2 py-1 border border-gray-600"
          >
            {OCTAVES.map((o) => (
              <option key={o} value={o}>{o}</option>
            ))}
          </select>
          <button
            onClick={handlePlayTarget}
            disabled={isPlayingTarget}
            className={`px-3 py-1 text-sm rounded font-bold transition-colors ${
              isPlayingTarget
                ? "bg-gray-600 text-gray-400 cursor-not-allowed"
                : "bg-cyan-600 hover:bg-cyan-500 text-white"
            }`}
          >
            ▶
          </button>
        </div>
        <div className="text-xs text-gray-500 mt-1 text-center">
          {targetFreq.toFixed(1)} Hz
        </div>
      </div>

      {!isListening ? (
        <button
          onClick={startListening}
          className="w-full py-2 bg-cyan-600 hover:bg-cyan-500 text-white text-sm rounded font-bold transition-colors"
        >
          Start Tuner
        </button>
      ) : (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs text-gray-400 mb-1">
            <span>Volume</span>
            <span>{Math.round(volume * 100)}%</span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-1.5">
            <div 
              className="bg-cyan-500 h-1.5 rounded-full transition-all"
              style={{ width: `${Math.min(100, volume * 500)}%` }}
            />
          </div>

          <div className="text-center">
            <div className={`text-3xl font-bold ${note ? getNoteColor() : "text-gray-500"}`}>
              {note || "---"}
              {note && <span className="text-lg text-gray-400 ml-1">{octave}</span>}
            </div>
            <div className="text-gray-500 text-xs">
              {frequency ? `${frequency.toFixed(1)} Hz` : "listening..."}
            </div>
          </div>

          <div className="relative h-10 bg-gray-800 rounded overflow-hidden">
            <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-gray-500 -translate-x-1/2" />
            <div 
              className={`absolute top-0 bottom-0 w-1.5 ${note ? getColor() : "bg-gray-600"} rounded-full`}
              style={{ 
                left: note ? `${50 + needlePosition * 0.8}%` : '50%',
                transform: 'translateX(-50%)',
                transition: note ? 'left 50ms ease-out' : 'none'
              }}
            />
            <div className="absolute bottom-0.5 left-0 right-0 flex justify-between px-1 text-[8px] text-gray-600">
              <span>-50</span>
              <span>0</span>
              <span>+50</span>
            </div>
          </div>

          <div className="text-center text-sm">
            <span className={note ? getNoteColor() : "text-gray-500"}>
              {note ? (cents > 0 ? "+" : "") + cents + "¢" : "---"}
            </span>
          </div>

          <div className="flex gap-2">
            <button
              onClick={stopListening}
              className="flex-1 py-1 text-xs bg-red-600 hover:bg-red-500 text-white rounded font-bold transition-colors"
            >
              Stop
            </button>
            <button
              onClick={handlePlayCurrent}
              disabled={!note}
              className={`flex-1 py-1 text-xs rounded font-bold transition-colors ${
                note
                  ? "bg-green-600 hover:bg-green-500 text-white"
                  : "bg-gray-600 text-gray-400 cursor-not-allowed"
              }`}
            >
              ▶ {note || "--"}{note ? octave : ""}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
