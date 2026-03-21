"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Scale, MetronomeSettings, SessionSegment, SEGMENT_DEFAULTS } from "@/types/scale";
import { generateScale } from "@/lib/scale-engine";
import { useMetronome } from "@/hooks/useMetronome";
import { usePlayNote } from "@/hooks/usePlayNote";
import MetronomeSettingsModal from "@/components/MetronomeSettings";
import SessionCreator from "@/components/SessionCreator";
import SessionSummary from "@/components/SessionSummary";
import Tuner from "@/components/Tuner";
import DonutChart from "@/components/DonutChart";
import { SEGMENT_DEFAULTS as SEGMENT_DEFS, SegmentType } from "@/types/scale";
import { TONE_WORKOUTS, getRandomToneWorkout, ToneWorkout } from "@/lib/tone-workouts";
import { generateEtude, getRandomResourceLink, ETUDE_STYLES, GeneratedEtude } from "@/lib/etude-generator";

type AppView = "creator" | "active" | "summary";

const DEFAULT_SETTINGS: MetronomeSettings = {
  tone: 800,
  speed: 120,
  beatsPerMeasure: 4,
  highFirst: true,
  enabled: false,
};

function createSegments(totalMinutes: number): SessionSegment[] {
  const segmentTypes = ["warmup", "technical", "written", "performance"] as const;
  const warmupWorkout = getRandomToneWorkout();
  const etudeStyle = ETUDE_STYLES[Math.floor(Math.random() * ETUDE_STYLES.length)];
  return segmentTypes.map((type) => {
    const defaults = SEGMENT_DEFAULTS[type];
    const durationSeconds = Math.round((defaults.percentage / 100) * totalMinutes * 60);
    return {
      id: type,
      name: defaults.name,
      percentage: defaults.percentage,
      durationSeconds,
      description: defaults.description,
      icon: defaults.icon,
      color: defaults.color,
      isActive: false,
      isCompleted: false,
      elapsedSeconds: 0,
      workoutId: type === "warmup" ? warmupWorkout.id : undefined,
      etudeStyleId: type === "written" ? etudeStyle.id : undefined,
    };
  });
}

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
}

export default function Home() {
  const [view, setView] = useState<AppView>("creator");
  const [totalMinutes, setTotalMinutes] = useState(60);
  const [segments, setSegments] = useState<SessionSegment[]>(createSegments(60));
  const [masterTimeSeconds, setMasterTimeSeconds] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [currentScale, setCurrentScale] = useState<Scale | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [settings, setSettings] = useState<MetronomeSettings>(DEFAULT_SETTINGS);
  const [currentWorkout, setCurrentWorkout] = useState<ToneWorkout | null>(null);
  const [currentEtude, setCurrentEtude] = useState<GeneratedEtude | null>(null);
  const [resourceLink, setResourceLink] = useState<{ title: string; url: string; type: "pdf" | "image" } | null>(null);

  const { playNote } = usePlayNote();
  const isSessionActive = view === "active";
  useMetronome(settings, isSessionActive && !isPaused);

  const activeSegment = segments.find((s) => s.isActive);

  const prevActiveSegmentId = useRef<string | null>(null);

  useEffect(() => {
    if (activeSegment?.id === "warmup" && activeSegment.workoutId) {
      const workout = TONE_WORKOUTS.find((w) => w.id === activeSegment.workoutId);
      if (workout) {
        setCurrentWorkout(workout);
      }
    }
  }, [activeSegment]);

  useEffect(() => {
    if (activeSegment?.id === "written" && prevActiveSegmentId.current !== "written") {
      const etude = generateEtude();
      setCurrentEtude(etude);
      const link = getRandomResourceLink();
      setResourceLink(link);
    }
    prevActiveSegmentId.current = activeSegment?.id || null;
  }, [activeSegment]);

  const handleSegmentPercentageChange = useCallback((id: string, percentage: number) => {
    setSegments((prev) => {
      const updated = prev.map((s) => {
        if (s.id === id) {
          return {
            ...s,
            percentage,
            durationSeconds: Math.round((percentage / 100) * totalMinutes * 60),
          };
        }
        return s;
      });
      return updated;
    });
  }, [totalMinutes]);

  const startSession = useCallback(() => {
    const totalSeconds = totalMinutes * 60;
    setMasterTimeSeconds(totalSeconds);
    setSegments((prev) => {
      const updated = prev.map((s, i) => ({
        ...s,
        isActive: i === 0,
        isCompleted: false,
        elapsedSeconds: 0,
        durationSeconds: Math.round((s.percentage / 100) * totalSeconds),
      }));
      return updated;
    });
    setView("active");
  }, [totalMinutes]);

  const nextSegment = useCallback(() => {
    setSegments((prev) => {
      const currentIndex = prev.findIndex((s) => s.isActive);
      const updated = prev.map((s) => ({
        ...s,
        isActive: false,
        isCompleted: s.isCompleted || (s.isActive && s.elapsedSeconds >= s.durationSeconds),
      }));

      if (currentIndex < prev.length - 1) {
        updated[currentIndex + 1].isActive = true;
        updated[currentIndex + 1].isCompleted = false;
      }

      const allCompleted = updated.every((s) => s.isCompleted || s.isActive);
      if (allCompleted) {
        setView("summary");
      }

      return updated;
    });
  }, []);

  useEffect(() => {
    if (view !== "active" || isPaused) return;

    const interval = setInterval(() => {
      setMasterTimeSeconds((prev) => {
        if (prev <= 0) {
          return 0;
        }
        return prev - 1;
      });

      setSegments((prev) => {
        const updated = prev.map((s) => {
          if (s.isActive) {
            const newElapsed = s.elapsedSeconds + 1;
            if (newElapsed >= s.durationSeconds) {
              return { ...s, elapsedSeconds: s.durationSeconds, isCompleted: true };
            }
            return { ...s, elapsedSeconds: newElapsed };
          }
          return s;
        });

        const justCompleted = updated.find(
          (s, i) => s.isCompleted && !prev[i].isCompleted
        );
        if (justCompleted?.id === "technical") {
          setCurrentScale(generateScale());
        }

        const completedIndex = updated.findIndex((s) => s.isCompleted && !s.isActive);
        if (completedIndex !== -1 && completedIndex < updated.length - 1) {
          const nextIndex = completedIndex + 1;
          if (!updated[nextIndex].isActive) {
            updated[nextIndex] = { ...updated[nextIndex], isActive: true, isCompleted: false, elapsedSeconds: 0 };
            setMasterTimeSeconds((current) => Math.max(0, current));
          }
        }

        const allCompleted = updated.every((s) => s.isCompleted);
        if (allCompleted) {
          setTimeout(() => setView("summary"), 100);
        }

        return updated;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [view, isPaused]);

  useEffect(() => {
    if (view === "active" && activeSegment?.id === "technical" && !currentScale) {
      setCurrentScale(generateScale());
    }
  }, [view, activeSegment, currentScale]);

  const handleNextScale = useCallback(() => {
    setCurrentScale(generateScale());
  }, []);

  const handleStop = () => {
    setSegments((prev) => prev.map((s) => ({ ...s, isCompleted: true })));
    setView("summary");
  };

  const handleNewSession = () => {
    setView("creator");
    setSegments(createSegments(totalMinutes));
    setCurrentScale(null);
    setMasterTimeSeconds(0);
    setIsPaused(false);
  };

  useEffect(() => {
    setSegments(createSegments(totalMinutes));
  }, [totalMinutes]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "r" || e.key === "R") {
        if (view === "active" && activeSegment?.id === "technical") {
          handleNextScale();
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [view, activeSegment, handleNextScale]);

  return (
    <main className="min-h-screen bg-gray-950 text-white p-4">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-2xl font-bold text-green-400 text-center mb-4">ScaleMaster</h1>

        {view === "creator" && (
          <SessionCreator
            totalMinutes={totalMinutes}
            onTotalMinutesChange={setTotalMinutes}
            segments={segments}
            onSegmentPercentageChange={handleSegmentPercentageChange}
            onStartSession={startSession}
          />
        )}

        {view === "active" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="lg:col-span-2 space-y-4">
              <div className="bg-gray-900 border border-gray-700 rounded-lg p-4">
                <div className="text-center mb-4">
                  <div className="text-gray-400 text-sm mb-1">Master Timer</div>
                  <div className="text-5xl font-mono font-bold text-cyan-400">
                    {formatTime(masterTimeSeconds)}
                  </div>
                </div>

                {activeSegment && (
                  <div className="text-center mb-4">
                    <div className="flex items-center justify-center gap-2 mb-1">
                      <span className="text-2xl">{SEGMENT_DEFS[activeSegment.id as SegmentType].icon}</span>
                      <span className="text-lg font-bold text-white">{SEGMENT_DEFS[activeSegment.id as SegmentType].name}</span>
                    </div>
                    <div className="text-2xl font-mono text-white">
                      {formatTime(activeSegment.durationSeconds - activeSegment.elapsedSeconds)}
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2 mt-2">
                      <div
                        className={`h-2 rounded-full transition-all ${SEGMENT_DEFS[activeSegment.id as SegmentType].color}`}
                        style={{ width: `${(activeSegment.elapsedSeconds / activeSegment.durationSeconds) * 100}%` }}
                      />
                    </div>
                  </div>
                )}

                <div className="flex gap-2">
                  <button
                    onClick={() => setIsPaused(!isPaused)}
                    className={`flex-1 py-2 rounded font-bold transition-colors ${
                      isPaused
                        ? "bg-green-600 hover:bg-green-500"
                        : "bg-yellow-600 hover:bg-yellow-500"
                    } text-white`}
                  >
                    {isPaused ? "▶" : "⏸"}
                  </button>
                  <button
                    onClick={nextSegment}
                    className="flex-1 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded font-bold transition-colors"
                  >
                    Next →
                  </button>
                  <button
                    onClick={() => setSettings({ ...settings, enabled: !settings.enabled })}
                    className={`py-2 px-4 rounded font-bold transition-colors ${
                      settings.enabled
                        ? "bg-green-600 hover:bg-green-500"
                        : "bg-gray-700 hover:bg-gray-600"
                    } text-white`}
                  >
                    ♩ {settings.speed}
                  </button>
                  <button
                    onClick={handleStop}
                    className="py-2 px-4 bg-red-600 hover:bg-red-500 text-white rounded font-bold transition-colors"
                  >
                    ✕
                  </button>
                </div>
              </div>

              {activeSegment?.id === "technical" && currentScale && (
                <div className="bg-gray-900 border border-gray-700 rounded-lg p-4">
                  <div className="flex justify-between items-center mb-2">
                    <div>
                      <span className="text-xl font-bold text-green-400">
                        {currentScale.root} {currentScale.name}
                      </span>
                      <span className="text-gray-500 text-sm ml-2">{currentScale.category}</span>
                    </div>
                    <button
                      onClick={handleNextScale}
                      className="px-3 py-1 text-sm bg-blue-600 hover:bg-blue-500 text-white rounded font-bold transition-colors"
                    >
                      R
                    </button>
                  </div>
                  <div className="flex flex-wrap justify-center gap-2">
                    {currentScale.notes.map((note, i) => (
                      <button
                        key={i}
                        onClick={() => playNote(note, 4)}
                        className="w-12 h-12 text-lg font-bold bg-gray-800 hover:bg-gray-700 text-cyan-300 hover:text-white rounded transition-colors"
                      >
                        {note}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {activeSegment?.id === "warmup" && currentWorkout && (
                <div className="bg-gray-900 border border-gray-700 rounded-lg p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="px-2 py-0.5 bg-orange-500/20 text-orange-400 text-xs font-medium rounded">
                          {currentWorkout.techniqueFocus}
                        </span>
                      </div>
                      <h3 className="text-lg font-bold text-orange-400">{currentWorkout.title}</h3>
                      <p className="text-gray-400 text-sm">{currentWorkout.description}</p>
                    </div>
                    <button
                      onClick={() => {
                        const newWorkout = getRandomToneWorkout();
                        setCurrentWorkout(newWorkout);
                        setSegments((prev) =>
                          prev.map((s) =>
                            s.id === "warmup" ? { ...s, workoutId: newWorkout.id } : s
                          )
                        );
                      }}
                      className="px-3 py-1.5 bg-gray-800 hover:bg-gray-700 text-gray-300 text-sm rounded transition-colors"
                    >
                      New Workout
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                    <div className="bg-gray-800/50 rounded-lg p-3">
                      <h4 className="text-sm font-medium text-gray-300 mb-2">Instructions</h4>
                      <ul className="space-y-1">
                        {currentWorkout.instructions.map((instruction, idx) => (
                          <li key={idx} className="flex items-start gap-2 text-sm text-gray-400">
                            <span className="text-orange-500 mt-0.5">{idx + 1}.</span>
                            {instruction}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="bg-gray-800/50 rounded-lg p-3">
                      <h4 className="text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
                        <span className="text-cyan-400">🎤</span> Pitch Reference
                      </h4>
                      <div className="flex flex-col items-center py-2">
                        <div className="relative w-full">
                          <div className="h-16 bg-gray-900 rounded-lg relative overflow-hidden">
                            <div className="absolute inset-0 flex items-center">
                              <div className="w-full border-t-2 border-dashed border-gray-700" />
                            </div>
                            <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-gray-600 -translate-x-1/2">
                              <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-cyan-500 rounded-full" />
                            </div>
                            <div className="absolute inset-0 flex flex-col justify-between py-1 px-2">
                              <div className="flex justify-between text-[8px] text-gray-600">
                                <span>-50</span>
                                <span>0</span>
                                <span>+50</span>
                              </div>
                            </div>
                          </div>
                          <p className="text-center text-xs text-gray-500 mt-1">Open Tuner to check pitch</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <p className="text-gray-500 text-xs mb-2">Click notes to hear references</p>
                  <div className="flex flex-wrap gap-1">
                    {["C", "D", "E", "F", "G", "A", "B"].map((note) => (
                      <button
                        key={note}
                        onClick={() => playNote(note, 4)}
                        className="w-10 h-10 text-sm font-bold bg-gray-800 hover:bg-gray-700 text-orange-300 hover:text-white rounded transition-colors"
                      >
                        {note}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {activeSegment?.id === "written" && currentEtude && (
                <div className="bg-gray-900 border border-gray-700 rounded-lg p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="px-2 py-0.5 bg-purple-500/20 text-purple-400 text-xs font-medium rounded">
                          {currentEtude.style.name} ({currentEtude.style.era})
                        </span>
                        <span className={`px-2 py-0.5 text-xs font-medium rounded ${
                          currentEtude.difficulty === "beginner" ? "bg-green-500/20 text-green-400" :
                          currentEtude.difficulty === "intermediate" ? "bg-yellow-500/20 text-yellow-400" :
                          "bg-red-500/20 text-red-400"
                        }`}>
                          {currentEtude.difficulty}
                        </span>
                      </div>
                      <h3 className="text-lg font-bold text-purple-400">Mini-Etude Challenge</h3>
                      <p className="text-gray-400 text-sm mt-1">{currentEtude.style.styleHint}</p>
                    </div>
                    <button
                      onClick={() => {
                        const newEtude = generateEtude();
                        setCurrentEtude(newEtude);
                        const link = getRandomResourceLink();
                        setResourceLink(link);
                      }}
                      className="px-3 py-1.5 bg-gray-800 hover:bg-gray-700 text-gray-300 text-sm rounded transition-colors"
                    >
                      New Etude
                    </button>
                  </div>

                  <div className="bg-gray-800/50 rounded-lg p-3 mb-3">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-purple-400 text-lg">📖</span>
                      <div>
                        <p className="text-white font-medium">{currentEtude.book.title}</p>
                        <p className="text-gray-500 text-xs">{currentEtude.book.author}</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div className="bg-gray-900 rounded p-2">
                        <span className="text-gray-500 text-xs">Page</span>
                        <p className="text-white font-bold">{currentEtude.pageInfo.page}</p>
                      </div>
                      <div className="bg-gray-900 rounded p-2">
                        <span className="text-gray-500 text-xs">Measures</span>
                        <p className="text-white font-bold">{currentEtude.pageInfo.measures || "Full"}</p>
                      </div>
                    </div>
                    <p className="text-gray-400 text-sm mt-2">{currentEtude.pageInfo.description}</p>
                  </div>

                  <div className="bg-gray-800/50 rounded-lg p-3 mb-3">
                    <h4 className="text-sm font-medium text-gray-300 mb-2">Focus Points</h4>
                    <ul className="space-y-1">
                      {currentEtude.style.focusPoints.map((point, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-sm text-gray-400">
                          <span className="text-purple-500 mt-0.5">•</span>
                          {point}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="bg-gray-800/50 rounded-lg p-3 mb-3">
                    <h4 className="text-sm font-medium text-gray-300 mb-1">Practice Tip</h4>
                    <p className="text-sm text-gray-400">{currentEtude.practiceSuggestion}</p>
                  </div>

                  {currentEtude.book.directPdfUrl && (
                    <div className="space-y-2">
                      <div className="bg-purple-500/20 border border-purple-500/30 rounded-lg p-3">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-purple-400 text-lg">📄</span>
                          <span className="text-white font-medium">Navigate to Page {currentEtude.pageInfo.page}</span>
                        </div>
                        <p className="text-gray-400 text-xs">
                          Open the PDF and scroll to page {currentEtude.pageInfo.page} to find the exercise.
                          Most PDF viewers support Ctrl+F / Cmd+F to search for page numbers.
                        </p>
                      </div>
                      
                      <div className="flex gap-2">
                        <a
                          href={currentEtude.book.directPdfUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-1 flex items-center gap-2 px-3 py-2 bg-purple-600 hover:bg-purple-500 text-white text-sm rounded transition-colors justify-center"
                        >
                          📄 Open PDF (Page {currentEtude.pageInfo.page})
                        </a>
                        {currentEtude.book.imslpUrl && (
                          <a
                            href={currentEtude.book.imslpUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex-1 flex items-center gap-2 px-3 py-2 bg-gray-700 hover:bg-gray-600 text-white text-sm rounded transition-colors justify-center"
                          >
                            📚 View on IMSLP
                          </a>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {activeSegment?.id === "performance" && (
                <div className="bg-gray-900 border border-gray-700 rounded-lg p-4">
                  <h3 className="text-lg font-bold text-green-400 mb-2">Performance & Creative</h3>
                  <p className="text-gray-400 text-sm mb-4">
                    Play through your repertoire, jam with backing tracks, or work on improvisation.
                  </p>
                  <div className="bg-gray-800/50 rounded-lg p-3">
                    <h4 className="text-sm font-medium text-gray-300 mb-2">Resources</h4>
                    {resourceLink && (
                      <a
                        href={resourceLink.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 px-3 py-2 bg-green-600 hover:bg-green-500 text-white text-sm rounded transition-colors w-full justify-center"
                      >
                        🎵 {resourceLink.title}
                      </a>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-4">
              <div className="bg-gray-900 border border-gray-700 rounded-lg p-4">
                <h3 className="text-sm font-bold text-white mb-3">Progress</h3>
                <div className="flex justify-center mb-3">
                  <DonutChart segments={segments} size={140} />
                </div>
                <div className="space-y-1">
                  {segments.map((segment) => {
                    const segDefaults = SEGMENT_DEFS[segment.id as SegmentType];
                    return (
                      <div key={segment.id} className="flex items-center gap-2 text-sm">
                        <div className={`w-2 h-2 rounded-full ${segment.isCompleted ? "bg-green-500" : segment.isActive ? segDefaults.color.replace('bg-', 'bg-') : "bg-gray-600"}`} />
                        <span className={`flex-1 ${segment.isActive ? "text-white font-bold" : "text-gray-400"}`}>
                          {segDefaults.icon} {segDefaults.name}
                        </span>
                        <span className="text-gray-500">{segDefaults.percentage}%</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              <Tuner />

              <button
                onClick={() => setShowSettings(true)}
                className="w-full py-2 bg-gray-700 hover:bg-gray-600 text-white rounded font-bold transition-colors"
              >
                ⚙ Settings
              </button>
            </div>
          </div>
        )}

        {view === "summary" && (
          <SessionSummary
            segments={segments}
            totalMinutes={totalMinutes}
            onNewSession={handleNewSession}
          />
        )}

        {showSettings && (
          <MetronomeSettingsModal
            settings={settings}
            onSettingsChange={setSettings}
            onClose={() => setShowSettings(false)}
          />
        )}
      </div>

      <footer className="fixed bottom-0 left-0 right-0 text-center py-2 text-gray-600 text-sm">
        <a
          href="https://github.com/crazygiscool"
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-gray-400 transition-colors"
        >
          GitHub: crazygiscool
        </a>
      </footer>
    </main>
  );
}
