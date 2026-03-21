"use client";

import { useState } from "react";
import { Scale, MetronomeSettings, SessionSegment } from "@/types/scale";
import { SEGMENT_DEFAULTS, SegmentType } from "@/types/scale";
import { TONE_WORKOUTS, getRandomToneWorkout, ToneWorkout } from "@/lib/tone-workouts";
import DonutChart from "./DonutChart";

interface ActiveSessionProps {
  segments: SessionSegment[];
  masterTimeSeconds: number;
  isPaused: boolean;
  settings: MetronomeSettings;
  currentScale: Scale | null;
  onTogglePause: () => void;
  onSkipSegment: () => void;
  onMetronomeToggle: () => void;
  onSettingsClick: () => void;
  onNextScale: () => void;
  onStop: () => void;
  onPlayNote: (note: string) => void;
  onSegmentPercentageChange: (id: string, percentage: number) => void;
  onSegmentPercentageChangeMinutes: (minutes: number) => void;
  onOpenTuner: () => void;
}

export default function ActiveSession({
  segments,
  masterTimeSeconds,
  isPaused,
  settings,
  currentScale,
  onTogglePause,
  onSkipSegment,
  onMetronomeToggle,
  onSettingsClick,
  onNextScale,
  onStop,
  onPlayNote,
  onSegmentPercentageChange,
  onSegmentPercentageChangeMinutes,
  onOpenTuner,
}: ActiveSessionProps) {
  const activeSegment = segments.find((s) => s.isActive);
  const defaults = activeSegment ? SEGMENT_DEFAULTS[activeSegment.id as SegmentType] : null;
  const [currentWorkout, setCurrentWorkout] = useState<ToneWorkout | null>(null);

  const activeWorkout = activeSegment?.id === "warmup" && activeSegment.workoutId
    ? TONE_WORKOUTS.find((w) => w.id === activeSegment.workoutId) || currentWorkout
    : null;

  const handleNewWorkout = () => {
    const newWorkout = getRandomToneWorkout();
    setCurrentWorkout(newWorkout);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  };

  return (
    <div className="w-full max-w-4xl">
      <div className="text-center mb-6">
        <h2 className="text-xl font-bold text-cyan-400 mb-1">Master Timer</h2>
        <div className="text-6xl font-mono font-bold text-white">
          {formatTime(masterTimeSeconds)}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="bg-gray-900 border border-gray-700 rounded-lg p-6">
          {activeSegment && defaults && (
            <div className="text-center mb-4">
              <div className="flex items-center justify-center gap-3 mb-2">
                <span className="text-4xl">{defaults.icon}</span>
                <h3 className="text-xl font-bold text-white">{defaults.name}</h3>
              </div>
              <p className="text-gray-400 text-sm mb-4">{defaults.description}</p>
              
              <div className="text-3xl font-mono text-cyan-400 mb-4">
                {formatTime(activeSegment.durationSeconds - activeSegment.elapsedSeconds)}
              </div>

              <div className="w-full bg-gray-700 rounded-full h-2 mb-4">
                <div
                  className={`h-2 rounded-full transition-all duration-1000 ${defaults.color}`}
                  style={{ width: `${(activeSegment.elapsedSeconds / activeSegment.durationSeconds) * 100}%` }}
                />
              </div>

              <div className="flex items-center gap-2 mb-4">
                <input
                  type="number"
                  min="1"
                  max={Math.floor(activeSegment.durationSeconds / 60)}
                  value={Math.ceil((activeSegment.durationSeconds - activeSegment.elapsedSeconds) / 60)}
                  onChange={(e) => onSegmentPercentageChangeMinutes(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-20 bg-gray-700 text-white text-center rounded px-2 py-1 border border-gray-600"
                />
                <span className="text-gray-400">min remaining</span>
              </div>
            </div>
          )}

          <div className="flex gap-2">
            <button
              onClick={onTogglePause}
              className={`flex-1 py-3 rounded-lg font-bold transition-colors ${
                isPaused
                  ? "bg-green-600 hover:bg-green-500 text-white"
                  : "bg-yellow-600 hover:bg-yellow-500 text-white"
              }`}
            >
              {isPaused ? "▶ RESUME" : "⏸ PAUSE"}
            </button>
            <button
              onClick={onSkipSegment}
              className="flex-1 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-bold transition-colors"
            >
              SKIP →
            </button>
          </div>
        </div>

        <div className="bg-gray-900 border border-gray-700 rounded-lg p-6 flex flex-col items-center">
          <h3 className="text-lg font-bold text-white mb-4">Progress</h3>
          <DonutChart segments={segments} size={180} />
          <div className="mt-4 w-full">
            {segments.map((segment) => {
              const segDefaults = SEGMENT_DEFAULTS[segment.id as SegmentType];
              return (
                <div key={segment.id} className="flex items-center gap-2 mb-2">
                  <div className={`w-3 h-3 rounded-full ${segment.isCompleted ? "bg-green-500" : "bg-gray-600"}`} />
                  <span className="text-gray-300 text-sm flex-1">{segDefaults.name}</span>
                  <span className="text-gray-500 text-sm">{segDefaults.percentage}%</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {activeSegment?.id === "technical" && currentScale && (
        <div className="bg-gray-900 border border-gray-700 rounded-lg p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h3 className="text-lg font-bold text-green-400">
                {currentScale.root} {currentScale.name}
              </h3>
              <p className="text-gray-500 text-sm">{currentScale.category}</p>
            </div>
            <button
              onClick={onNextScale}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded font-bold transition-colors"
            >
              NEW SCALE (R)
            </button>
          </div>
          <p className="text-cyan-300 text-lg flex flex-wrap justify-center gap-2">
            {currentScale.notes.map((note, i) => (
              <button
                key={i}
                onClick={() => onPlayNote(note)}
                className="hover:text-white hover:scale-110 transition-all cursor-pointer px-2 py-1 rounded hover:bg-cyan-500/20"
                title={`Play ${note}`}
              >
                {note}
              </button>
            ))}
          </p>
        </div>
      )}

      {activeSegment?.id === "warmup" && activeWorkout && (
        <div className="bg-gray-900 border border-gray-700 rounded-lg p-6 mb-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="px-2 py-0.5 bg-orange-500/20 text-orange-400 text-xs font-medium rounded">
                  {activeWorkout.techniqueFocus}
                </span>
              </div>
              <h3 className="text-xl font-bold text-orange-400 mb-1">{activeWorkout.title}</h3>
              <p className="text-gray-400 text-sm">{activeWorkout.description}</p>
            </div>
            <button
              onClick={handleNewWorkout}
              className="px-3 py-1.5 bg-gray-800 hover:bg-gray-700 text-gray-300 text-sm rounded transition-colors"
            >
              New Workout
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div className="bg-gray-800/50 rounded-lg p-4">
              <h4 className="text-sm font-medium text-gray-300 mb-2">Instructions</h4>
              <ul className="space-y-1.5">
                {activeWorkout.instructions.map((instruction, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-sm text-gray-400">
                    <span className="text-orange-500 mt-0.5">{idx + 1}.</span>
                    {instruction}
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-gray-800/50 rounded-lg p-4">
              <h4 className="text-sm font-medium text-gray-300 mb-3 flex items-center gap-2">
                <span className="text-cyan-400">🎤</span> Pitch Reference
              </h4>
              <div className="flex flex-col items-center justify-center py-4">
                <div className="relative w-full max-w-[200px]">
                  <div className="h-20 bg-gray-900 rounded-lg relative overflow-hidden">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t-2 border-dashed border-gray-700" />
                    </div>
                    <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-gray-600 -translate-x-1/2">
                      <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-3 h-3 bg-cyan-500 rounded-full" />
                    </div>
                    <div className="absolute inset-0 flex flex-col justify-between py-2 px-2">
                      <div className="flex justify-between text-[10px] text-gray-600">
                        <span>-50</span>
                        <span>0</span>
                        <span>+50</span>
                      </div>
                    </div>
                  </div>
                  <p className="text-center text-xs text-gray-500 mt-2">Open Tuner to check pitch</p>
                </div>
                <div className="flex gap-2 mt-3 w-full">
                  <button
                    onClick={onOpenTuner}
                    className="flex-1 py-2 bg-cyan-600 hover:bg-cyan-500 text-white text-sm rounded font-medium transition-colors"
                  >
                    Open Tuner
                  </button>
                  <button
                    onClick={() => onPlayNote("A")}
                    className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white text-sm rounded font-medium transition-colors"
                    title="Play A reference"
                  >
                    ♪ A
                  </button>
                </div>
              </div>
            </div>
          </div>

          <p className="text-gray-500 text-xs">Click notes below to hear reference pitches</p>
          <div className="flex flex-wrap gap-1 mt-2">
            {["C", "D", "E", "F", "G", "A", "B"].map((note) => (
              <button
                key={note}
                onClick={() => onPlayNote(note)}
                className="px-3 py-1.5 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded text-sm transition-colors"
              >
                {note}
              </button>
            ))}
          </div>
        </div>
      )}

      {(activeSegment?.id === "written" || activeSegment?.id === "performance") && (
        <div className="bg-gray-900 border border-gray-700 rounded-lg p-6 mb-6">
          <h3 className="text-lg font-bold text-purple-400 mb-4">
            {activeSegment?.id === "written" ? "Written Material" : "Performance & Creative"}
          </h3>
          <p className="text-gray-300 mb-4">
            {activeSegment?.id === "written"
              ? "Practice your etudes, sight-reading, or method book. Focus on articulation and phrasing."
              : "Play through your repertoire, jam with backing tracks, or work on improvisation."}
          </p>
          <p className="text-gray-500 text-sm">
            This is your time to make music - no timer distractions!
          </p>
        </div>
      )}

      <div className="flex gap-3">
        <button
          onClick={onMetronomeToggle}
          className={`flex-1 py-3 rounded-lg font-bold transition-colors ${
            settings.enabled
              ? "bg-green-600 hover:bg-green-500 text-white"
              : "bg-gray-700 hover:bg-gray-600 text-white"
          }`}
        >
          {settings.enabled ? `METRONOME ${settings.speed}BPM` : "METRONOME OFF"}
        </button>
        <button
          onClick={onOpenTuner}
          className="py-3 px-4 bg-cyan-700 hover:bg-cyan-600 text-white rounded-lg font-bold transition-colors"
          title="Open Tuner"
        >
          🎤 TUNER
        </button>
        <button
          onClick={onSettingsClick}
          className="py-3 px-4 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-bold transition-colors"
        >
          ⚙
        </button>
        <button
          onClick={onStop}
          className="py-3 px-4 bg-red-600 hover:bg-red-500 text-white rounded-lg font-bold transition-colors"
        >
          ✕
        </button>
      </div>
    </div>
  );
}
