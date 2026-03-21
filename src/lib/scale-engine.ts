import { Scale } from "@/types/scale";

const CHROMATIC = [
  ["C"],
  ["C#", "Db"],
  ["D"],
  ["D#", "Eb"],
  ["E"],
  ["F"],
  ["F#", "Gb"],
  ["G"],
  ["G#", "Ab"],
  ["A"],
  ["A#", "Bb"],
  ["B"],
];

const LIBRARY: Record<string, Record<string, number[]>> = {
  Core: {
    Major: [0, 2, 4, 5, 7, 9, 11],
    "Natural Minor": [0, 2, 3, 5, 7, 8, 10],
    "Harmonic Minor": [0, 2, 3, 5, 7, 8, 11],
  },
  "Jazz & Modes": {
    Dorian: [0, 2, 3, 5, 7, 9, 10],
    Mixolydian: [0, 2, 4, 5, 7, 9, 10],
    "Lydian b7": [0, 2, 4, 6, 7, 9, 10],
    Altered: [0, 1, 3, 4, 6, 8, 10],
  },
  Symmetrical: {
    "Whole Tone": [0, 2, 4, 6, 8, 10],
    "Half-Whole Dim": [0, 1, 3, 4, 6, 7, 9, 10],
    Augmented: [0, 3, 4, 7, 8, 11],
  },
};

function spellCorrectly(rawNotes: string[][], root: string, rootIdx: number): string[] {
  const alphabet = ["A", "B", "C", "D", "E", "F", "G"];
  const result: { note: string; chromaticIdx: number }[] = [];
  let currLetterIdx = alphabet.indexOf(root[0]);
  let baseOctave = 0;

  for (let i = 0; i < rawNotes.length; i++) {
    const options = rawNotes[i];
    let chosen: string;

    if (i === 0) {
      chosen = root;
    } else {
      currLetterIdx = (currLetterIdx + 1) % 7;
      const target = alphabet[currLetterIdx];
      const matched = options.find((n) => n[0].toUpperCase() === target);
      chosen = matched ?? options[0];
    }

    const chromaticIdx = CHROMATIC.findIndex((notes) => notes.includes(chosen));
    let octave = baseOctave;

    if (i > 0 && chromaticIdx < result[i - 1].chromaticIdx) {
      octave += 1;
      const newChromaticIdx = chromaticIdx + 12;
      result.push({ note: chosen, chromaticIdx: newChromaticIdx });
      baseOctave = octave;
    } else {
      result.push({ note: chosen, chromaticIdx: chromaticIdx });
    }
  }

  return result.map((r) => r.note);
}

export function generateScale(root?: string, category?: string): Scale {
  const chosenRoot = root ?? CHROMATIC[Math.floor(Math.random() * CHROMATIC.length)][0];
  const categories = Object.keys(LIBRARY);
  const chosenCategory = category && categories.includes(category) 
    ? category 
    : categories[Math.floor(Math.random() * categories.length)];
  const scaleNames = Object.keys(LIBRARY[chosenCategory]);
  const scaleName = scaleNames[Math.floor(Math.random() * scaleNames.length)];
  const intervals = LIBRARY[chosenCategory][scaleName];

  const rootIdx = CHROMATIC.findIndex((notes) => notes.includes(chosenRoot));
  const shifted = [...CHROMATIC.slice(rootIdx), ...CHROMATIC.slice(0, rootIdx)];

  const rawNotes = intervals.map((i) => shifted[i]);
  const cleanNotes = spellCorrectly(rawNotes, chosenRoot, rootIdx);

  return {
    root: chosenRoot,
    name: scaleName,
    category: chosenCategory,
    notes: cleanNotes,
    intervalFormula: intervals,
  };
}

export function getScaleDisplayText(scale: Scale): string {
  return scale.notes.join(" ➔ ");
}

export { LIBRARY };
