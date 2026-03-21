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
