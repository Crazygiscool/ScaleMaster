export interface ToneWorkout {
  id: string;
  title: string;
  description: string;
  techniqueFocus: string;
  instructions: string[];
}

export const TONE_WORKOUTS: ToneWorkout[] = [
  {
    id: "long-tones",
    title: "Long Tones",
    description: "Master dynamic control with steady, controlled swells",
    techniqueFocus: "Dynamic swells (p → f → p)",
    instructions: [
      "Play each note for 5-8 seconds",
      "Start soft (piano) and gradually increase to loud (forte)",
      "Hold at the peak, then decrease back to soft",
      "Keep the tuner needle centered throughout",
      "Maintain steady air flow - don't strain",
    ],
  },
  {
    id: "overtones",
    title: "Overtones",
    description: "Unlock the harmonic series through resonant fingerings",
    techniqueFocus: "Harmonic pop-out (octave & 5th)",
    instructions: [
      "Finger low Bb and voice to the octave without octave key",
      "Then try to pop out the 5th above the fundamental",
      "Focus on throat position, not embouchure changes",
      "Listen for a pure, clear tone on each harmonic",
      "Use tuner to verify pitch accuracy",
    ],
  },
  {
    id: "vibrato-waves",
    title: "Vibrato Waves",
    description: "Develop rhythmic jaw vibrato at various speeds",
    techniqueFocus: "Rhythmic jaw movement (triplets/quadruplets)",
    instructions: [
      "Set metronome to 60 BPM",
      "Practice triplet jaw movements on a comfortable note",
      "Then practice quadruplet (16th note) divisions",
      "Keep the vibrato centered in pitch",
      "Match the metronome pulse consistently",
    ],
  },
  {
    id: "mouthpiece-pitch",
    title: "Mouthpiece Pitch",
    description: "Train your embouchure with mouthpiece-only practice",
    techniqueFocus: "Concert A (Alto) / G (Tenor)",
    instructions: [
      "Remove neck strap and play on mouthpiece alone",
      "Target concert A for Alto Sax (440 Hz)",
      "Target concert G for Tenor Sax (196 Hz)",
      "Focus on centered, pure tone",
      "Use tuner to check pitch - aim for green zone",
    ],
  },
  {
    id: "subtones",
    title: "Subtones",
    description: "Develop quiet, breathy jazz textures",
    techniqueFocus: "Quiet dynamics with breathy texture",
    instructions: [
      "Play the lowest register notes (C, B, Bb, A)",
      "Aim for the quietest sound while maintaining pitch",
      "Add a slight 'breathy' quality like a jazz whisper",
      "Focus on air speed rather than pressure",
      "Keep pitch centered using tuner feedback",
    ],
  },
];

export function getRandomToneWorkout(): ToneWorkout {
  const index = Math.floor(Math.random() * TONE_WORKOUTS.length);
  return TONE_WORKOUTS[index];
}

export function getToneWorkoutById(id: string): ToneWorkout | undefined {
  return TONE_WORKOUTS.find((w) => w.id === id);
}
