export interface Scale {
  root: string;
  name: string;
  category: string;
  notes: string[];
  intervalFormula: number[];
}

export interface PracticeBlock {
  taskName: string;
  durationSeconds: number;
  scaleFocus?: Scale;
  isCompleted: boolean;
}

export interface PracticeSession {
  id: number;
  startTime: Date;
  totalDurationMinutes: number;
  blocks: PracticeBlock[];
}

export interface MetronomeSettings {
  tone: number;
  speed: number;
  beatsPerMeasure: number;
  highFirst: boolean;
  enabled: boolean;
}

export interface SessionSegment {
  id: string;
  name: string;
  percentage: number;
  durationSeconds: number;
  description: string;
  icon: string;
  color: string;
  isActive: boolean;
  isCompleted: boolean;
  elapsedSeconds: number;
  workoutId?: string;
  etudeStyleId?: string;
}

export interface PracticeSessionConfig {
  totalMinutes: number;
  segments: SessionSegment[];
}

export type SegmentType = "warmup" | "technical" | "written" | "performance";

export const SEGMENT_DEFAULTS: Record<SegmentType, { name: string; percentage: number; description: string; icon: string; color: string }> = {
  warmup: {
    name: "Tone & Warmup",
    percentage: 10,
    description: "Long Tones & Overtones - Focus on keeping the tuner needle steady",
    icon: "🎺",
    color: "bg-orange-500",
  },
  technical: {
    name: "Technical Drills",
    percentage: 30,
    description: "Scales & Arpeggios - Use the scale generator for variety",
    icon: "🎼",
    color: "bg-blue-500",
  },
  written: {
    name: "Written Material",
    percentage: 30,
    description: "Etudes, Sight-Reading, or Method Book pages",
    icon: "📖",
    color: "bg-purple-500",
  },
  performance: {
    name: "Performance & Creative",
    percentage: 30,
    description: "Repertoire, Backing Tracks, or Jazz Improvisation",
    icon: "🎵",
    color: "bg-green-500",
  },
};
