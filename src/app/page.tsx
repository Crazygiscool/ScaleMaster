"use client";

import { useState, useEffect, useCallback } from "react";
import { Scale, MetronomeSettings } from "@/types/scale";
import { generateScale, getScaleDisplayText } from "@/lib/scale-engine";
import { useMetronome } from "@/hooks/useMetronome";
import { usePlayNote } from "@/hooks/usePlayNote";
import MetronomeSettingsModal from "@/components/MetronomeSettings";

const DEFAULT_SETTINGS: MetronomeSettings = {
  tone: 800,
  speed: 120,
  beatsPerMeasure: 4,
  highFirst: true,
  enabled: false,
};

export default function Home() {
  const [timeMinutes, setTimeMinutes] = useState(20);
  const [seconds, setSeconds] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [currentScale, setCurrentScale] = useState<Scale | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [settings, setSettings] = useState<MetronomeSettings>(DEFAULT_SETTINGS);

  const { playClick } = useMetronome(settings, isRunning);
  const { playNote } = usePlayNote();

  const formatTime = (mins: number, secs: number) => {
    return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  };

  const handleNextScale = useCallback(() => {
    const scale = generateScale();
    setCurrentScale(scale);
  }, []);

  useEffect(() => {
    if (!isRunning) return;

    const interval = setInterval(() => {
      setSeconds((prev) => {
        if (prev === 0) {
          const newMins = timeMinutes - 1;
          if (newMins < 0) {
            setIsRunning(false);
            return 0;
          }
          setTimeMinutes(newMins);
          return 59;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isRunning, timeMinutes]);

  useEffect(() => {
    if (!isRunning) return;

    const scaleInterval = setInterval(() => {
      handleNextScale();
    }, 60000);

    return () => clearInterval(scaleInterval);
  }, [isRunning, handleNextScale]);

  const handleStart = () => {
    handleNextScale();
    setIsRunning(true);
  };

  const handleStop = () => {
    setIsRunning(false);
    setTimeMinutes(20);
    setSeconds(0);
    setCurrentScale(null);
  };

  return (
    <main className="min-h-screen bg-gray-950 text-white flex flex-col items-center justify-center p-8">
      <h1 className="text-4xl font-bold text-green-400 mb-8">ScaleMaster</h1>

      <div className="w-full max-w-xl border-2 border-green-600 rounded-lg p-6">
        <div className="text-center mb-6">
          <p className="text-gray-400 mb-2">Practice Time</p>
          <div className="text-8xl font-mono text-cyan-400">
            {formatTime(timeMinutes, seconds)}
          </div>
        </div>

        {!isRunning && (
          <div className="mb-6 text-center">
            <label className="text-gray-400 mr-2">Minutes:</label>
            <input
              type="number"
              value={timeMinutes}
              onChange={(e) => setTimeMinutes(Math.max(1, parseInt(e.target.value) || 1))}
              className="w-20 bg-gray-800 text-white border border-gray-600 rounded px-3 py-1 text-center"
              min="1"
            />
          </div>
        )}

        {currentScale && (
          <div className="text-center mb-6 p-4 bg-gray-800 rounded">
            <p className="text-gray-400 text-sm mb-1">Scale to practice:</p>
            <p className="text-2xl font-bold text-green-400">
              {currentScale.root} {currentScale.name}
            </p>
            <p className="text-cyan-300 mt-2 flex flex-wrap justify-center gap-2">
              {currentScale.notes.map((note, i) => (
                <button
                  key={i}
                  onClick={() => playNote(note)}
                  className="hover:text-white hover:scale-110 transition-all cursor-pointer px-2 py-1 rounded hover:bg-cyan-500/20"
                  title={`Play ${note}`}
                >
                  {note}
                </button>
              ))}
            </p>
            <p className="text-gray-500 text-xs mt-1">{currentScale.category}</p>
          </div>
        )}

        <div className="flex flex-col gap-3">
          {!isRunning ? (
            <>
              <button
                onClick={handleStart}
                className="w-full bg-green-600 hover:bg-green-500 text-white py-3 rounded font-bold transition-colors"
              >
                START SESSION
              </button>
              <button
                onClick={() => setShowSettings(true)}
                className="w-full bg-gray-700 hover:bg-gray-600 text-white py-2 rounded transition-colors"
              >
                METRONOME SETTINGS
              </button>
            </>
          ) : (
            <>
              <button
                onClick={handleNextScale}
                className="w-full bg-blue-600 hover:bg-blue-500 text-white py-2 rounded transition-colors"
              >
                NEXT SCALE (R)
              </button>
              <div className="flex gap-3">
                <button
                  onClick={() => setSettings({ ...settings, enabled: !settings.enabled })}
                  className={`flex-1 py-2 rounded transition-colors ${
                    settings.enabled
                      ? "bg-green-600 hover:bg-green-500"
                      : "bg-gray-700 hover:bg-gray-600"
                  } text-white`}
                >
                  {settings.enabled ? "METRONOME ON" : "METRONOME OFF"}
                </button>
                <button
                  onClick={() => setShowSettings(true)}
                  className="flex-1 bg-gray-700 hover:bg-gray-600 text-white py-2 rounded transition-colors"
                >
                  SETTINGS
                </button>
              </div>
              <button
                onClick={handleStop}
                className="w-full bg-red-600 hover:bg-red-500 text-white py-2 rounded transition-colors"
              >
                STOP
              </button>
            </>
          )}
        </div>
      </div>

      {settings.enabled && (
        <p className="mt-4 text-gray-500 text-sm">
          Metronome: {settings.speed} BPM
        </p>
      )}

      <p className="mt-8 text-gray-500 text-sm">
        Press <kbd className="bg-gray-800 px-2 py-1 rounded">R</kbd> for next scale
      </p>

      {showSettings && (
        <MetronomeSettingsModal
          settings={settings}
          onSettingsChange={setSettings}
          onClose={() => setShowSettings(false)}
        />
      )}
    </main>
  );
}
