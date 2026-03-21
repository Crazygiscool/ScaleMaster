"use client";

import { useState, useEffect, useCallback } from "react";
import { Scale, MetronomeSettings, SessionSegment, SEGMENT_DEFAULTS } from "@/types/scale";
import { generateScale } from "@/lib/scale-engine";
import { useMetronome } from "@/hooks/useMetronome";
import { usePlayNote } from "@/hooks/usePlayNote";
import MetronomeSettingsModal from "@/components/MetronomeSettings";
import SessionCreator from "@/components/SessionCreator";
import ActiveSession from "@/components/ActiveSession";
import SessionSummary from "@/components/SessionSummary";

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
    };
  });
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

  const { playNote, playNoteUp } = usePlayNote();

  const activeSegment = segments.find((s) => s.isActive);

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

  const handleSegmentPercentageChangeMinutes = useCallback((minutes: number) => {
    if (!activeSegment) return;
    const newDurationSeconds = minutes * 60;
    const newPercentage = (newDurationSeconds / (totalMinutes * 60)) * 100;
    
    setSegments((prev) => {
      const scaleRemaining = prev.reduce((sum, s) => {
        if (s.id === "technical") return sum;
        return sum + s.durationSeconds;
      }, 0);
      
      return prev.map((s) => {
        if (s.id === "technical") {
          return {
            ...s,
            percentage: ((totalMinutes * 60 - scaleRemaining - newDurationSeconds) / (totalMinutes * 60)) * 100,
            durationSeconds: totalMinutes * 60 - scaleRemaining - newDurationSeconds,
          };
        }
        if (s.id === activeSegment.id) {
          return {
            ...s,
            durationSeconds: newDurationSeconds,
            percentage: (newDurationSeconds / (totalMinutes * 60)) * 100,
          };
        }
        return s;
      });
    });
  }, [activeSegment, totalMinutes]);

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
    
    if (segments.find((s) => s.isActive)?.id === "technical") {
      setCurrentScale(generateScale());
    }
  }, [segments]);

  useEffect(() => {
    if (view !== "active" || isPaused) return;

    const interval = setInterval(() => {
      setMasterTimeSeconds((prev) => {
        if (prev <= 0) {
          setView("summary");
          return 0;
        }
        return prev - 1;
      });

      setSegments((prev) => {
        const updated = prev.map((s) => {
          if (s.isActive) {
            const newElapsed = s.elapsedSeconds + 1;
            if (newElapsed >= s.durationSeconds) {
              return { ...s, elapsedSeconds: newElapsed, isCompleted: true };
            }
            return { ...s, elapsedSeconds: newElapsed };
          }
          return s;
        });

        const justCompleted = updated.find(
          (s, i) => s.isCompleted && !prev[i].isCompleted
        );
        if (justCompleted && justCompleted.id === "technical") {
          setCurrentScale(generateScale());
        }

        const completedIndex = updated.findIndex((s) => s.isCompleted && !s.isActive);
        if (completedIndex !== -1 && completedIndex < updated.length - 1) {
          const nextIndex = completedIndex + 1;
          if (!updated[nextIndex].isActive) {
            updated[nextIndex] = { ...updated[nextIndex], isActive: true };
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

  const handleTogglePause = () => {
    setIsPaused((prev) => !prev);
  };

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
    <main className="min-h-screen bg-gray-950 text-white flex flex-col items-center justify-center p-4 md:p-8">
      <h1 className="text-4xl font-bold text-green-400 mb-8">ScaleMaster</h1>

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
        <ActiveSession
          segments={segments}
          masterTimeSeconds={masterTimeSeconds}
          isPaused={isPaused}
          settings={settings}
          currentScale={currentScale}
          onTogglePause={handleTogglePause}
          onSkipSegment={nextSegment}
          onMetronomeToggle={() => setSettings({ ...settings, enabled: !settings.enabled })}
          onSettingsClick={() => setShowSettings(true)}
          onNextScale={handleNextScale}
          onStop={handleStop}
          onPlayNote={(note) => playNote(note, 3)}
          onSegmentPercentageChange={handleSegmentPercentageChange}
          onSegmentPercentageChangeMinutes={handleSegmentPercentageChangeMinutes}
        />
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
    </main>
  );
}
