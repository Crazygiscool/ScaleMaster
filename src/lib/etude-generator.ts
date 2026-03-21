export interface EtudeStyle {
  id: string;
  name: string;
  era: string;
  styleHint: string;
  focusPoints: string[];
  tempoGuidance: string;
  articulationGuidance: string;
}

export interface MethodBook {
  title: string;
  author: string;
  publisher: string;
  year: string;
  pages: { page: number; description: string; measures?: string }[];
  imslpUrl?: string;
  directPdfUrl?: string;
}

export interface GeneratedEtude {
  style: EtudeStyle;
  book: MethodBook;
  pageInfo: { page: number; description: string; measures?: string };
  practiceSuggestion: string;
  difficulty: "beginner" | "intermediate" | "advanced";
}

export const ETUDE_STYLES: EtudeStyle[] = [
  {
    id: "baroque",
    name: "Baroque",
    era: "1600-1750",
    styleHint: "Crisp tongue articulation and straight tone (no vibrato). Focus on terraced dynamics and ornamental figures.",
    focusPoints: [
      "Clean articulation (ta-ka-ta patterns)",
      "Dynamic contrast without gradual swells",
      "Trills and ornaments as indicated",
      "Rhythmic precision on dotted figures",
    ],
    tempoGuidance: "Moderate tempo, letting the music breathe naturally",
    articulationGuidance: "Light, crisp tonguing. Think 'detached but connected'.",
  },
  {
    id: "romantic",
    name: "Romantic",
    era: "1820-1900",
    styleHint: "Expressive long lines with gradual dynamic shaping. Vibrato can be added for warmth on sustained notes.",
    focusPoints: [
      "Long, singing phrases",
      "Gradual crescendo/diminuendo",
      "Flexible tempo for expression",
      "Rich, warm tone quality",
    ],
    tempoGuidance: "Slower, expressive tempo allowing for phrase shaping",
    articulationGuidance: "Legato primary, with lyrical tonguing on attack notes.",
  },
  {
    id: "jazz-bop",
    name: "Jazz-Bop",
    era: "1940-1960",
    styleHint: "Syncopated rhythms, swing feel, and bluesy inflections. Focus on articulation variety and groove.",
    focusPoints: [
      "Swing eighth-note feel",
      "Accent patterns on '2' and '4'",
      "Articulation variation (legato vs. detached)",
      "Call-and-response phrase structure",
    ],
    tempoGuidance: "Moderate swing tempo, focusing on groove over speed",
    articulationGuidance: "Mix of smooth connected lines and punchy accents.",
  },
  {
    id: "modern",
    name: "Modern",
    era: "1945-Present",
    styleHint: "Contemporary techniques including extended intervals, mixed meters, and avant-garde effects.",
    focusPoints: [
      "Extended techniques (slap, growls, multiphonics)",
      "Unconventional articulation",
      "Meter changes and asymmetric rhythms",
      "Contemporary tone colors",
    ],
    tempoGuidance: "Take at comfortable tempo, prioritize accuracy over speed",
    articulationGuidance: "Vary articulation to match contemporary notation - follow directions literally.",
  },
];

export const METHOD_BOOKS: MethodBook[] = [
  {
    title: "48 Famous Studies for Saxophone",
    author: "Franz Wilhelm Ferling",
    publisher: "Johann André",
    year: "1840",
    pages: [
      { page: 1, description: "Andante in C major", measures: "1-16" },
      { page: 3, description: "Allegro in G minor", measures: "1-24" },
      { page: 5, description: "Andante in B-flat major", measures: "1-20" },
      { page: 7, description: "Presto in C minor", measures: "1-32" },
      { page: 9, description: "Andante con moto in F major", measures: "1-24" },
      { page: 11, description: "Allegro in D major", measures: "1-28" },
    ],
    directPdfUrl: "/pdfs/ferling-48-studies-sax.pdf",
  },
  {
    title: "Rose 32 Studies for Saxophone",
    author: "Cyrille Rose",
    publisher: "Alphonse Leduc",
    year: "1900",
    pages: [
      { page: 1, description: "Study No. 1 - Legato", measures: "1-16" },
      { page: 2, description: "Study No. 2 - Staccato", measures: "1-20" },
      { page: 3, description: "Study No. 3 - Expression", measures: "1-24" },
      { page: 4, description: "Study No. 4 - Agility", measures: "1-16" },
      { page: 5, description: "Study No. 5 - Articulation", measures: "1-20" },
    ],
    directPdfUrl: "/pdfs/rose-32-studies.pdf",
  },
  {
    title: "25 Daily Exercises for Saxophone",
    author: "Hyacinthe Klosé",
    publisher: "Alphonse Leduc",
    year: "1881",
    pages: [
      { page: 1, description: "Exercise 1 - Scales", measures: "Full" },
      { page: 3, description: "Exercise 2 - Intervals", measures: "Full" },
      { page: 5, description: "Exercise 3 - Articulation", measures: "Full" },
      { page: 7, description: "Exercise 4 - Velocity", measures: "Full" },
      { page: 9, description: "Exercise 5 - Expression", measures: "Full" },
    ],
    directPdfUrl: "/pdfs/klose-scales.pdf",
  },
  {
    title: "Elementary Method for Saxophone",
    author: "Lemoine",
    publisher: "Various",
    year: "1800s",
    pages: [
      { page: 1, description: "First Exercises", measures: "1-16" },
      { page: 3, description: "Scales and Chords", measures: "Full" },
      { page: 5, description: "Articulation Studies", measures: "1-20" },
      { page: 7, description: "Easy Melodies", measures: "1-16" },
      { page: 9, description: "Expression Pieces", measures: "Full" },
    ],
    directPdfUrl: "/pdfs/lemoine-elementary.pdf",
  },
];

export const STYLE_BOOK_PREFERENCES: Record<string, string[]> = {
  baroque: ["48 Famous Studies for Saxophone", "Elementary Method for Saxophone"],
  romantic: ["Rose 32 Studies for Saxophone", "25 Daily Exercises for Saxophone"],
  "jazz-bop": ["25 Daily Exercises for Saxophone", "Rose 32 Studies for Saxophone"],
  modern: ["Rose 32 Studies for Saxophone", "25 Daily Exercises for Saxophone"],
};

function getRandomElement<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

export function generateEtude(): GeneratedEtude {
  const style = getRandomElement(ETUDE_STYLES);
  
  const preferredBooks = STYLE_BOOK_PREFERENCES[style.id] || METHOD_BOOKS.map(b => b.title);
  const availableBooks = METHOD_BOOKS.filter(b => preferredBooks.includes(b.title));
  const book = availableBooks.length > 0 ? getRandomElement(availableBooks) : getRandomElement(METHOD_BOOKS);
  
  const pageInfo = getRandomElement(book.pages);
  
  const suggestions: Record<string, string[]> = {
    baroque: [
      "Start slowly to nail the ornaments, then gradually increase tempo.",
      "Practice with a metronome, focusing on clean articulation between notes.",
      "Listen to recordings of Baroque chamber music for stylistic reference.",
    ],
    romantic: [
      "Sing the melody first to internalize the phrase shapes.",
      "Practice with a drone on the tonic to focus on intonation.",
      "Record yourself and listen back for expressive shaping.",
    ],
    "jazz-bop": [
      "Tap your foot to internalize the swing feel before playing.",
      "Practice the rhythm section patterns separately first.",
      "Focus on the 'blue notes' and bent pitches characteristic of the style.",
    ],
    modern: [
      "Read through once slowly, marking any unfamiliar notation.",
      "Experiment with extended techniques - there's no 'wrong' way!",
      "Focus on precision of rhythm and pitch in unconventional meters.",
    ],
  };

  const difficulty = Math.random() > 0.7 ? "advanced" : Math.random() > 0.4 ? "intermediate" : "beginner";

  return {
    style,
    book,
    pageInfo,
    practiceSuggestion: getRandomElement(suggestions[style.id]),
    difficulty,
  };
}

export function getStyleById(id: string): EtudeStyle | undefined {
  return ETUDE_STYLES.find((s) => s.id === id);
}

export function getRandomResourceLink(): { title: string; url: string; type: "pdf" | "image" } {
  const resources = [
    {
      title: "Ferling 48 Studies - IMSLP",
      url: "https://s9.imslp.org/files/imglnks/usimg/3/33/IMSLP123461-WEH.48_Famous_Studies.pdf",
      type: "pdf" as const,
    },
    {
      title: "Rose 32 Studies - IMSLP",
      url: "https://imslp.org/wiki/32_Études_(Rose,_Cyrille)",
      type: "pdf" as const,
    },
    {
      title: "8notes Saxophone Resources",
      url: "https://www.8notes.com/saxophone/",
      type: "pdf" as const,
    },
    {
      title: "Saxophone Literature Database",
      url: "https://imslp.org/wiki/Category:Saxophone",
      type: "pdf" as const,
    },
    {
      title: "Public Domain Sax Methods",
      url: "https://imslp.org/wiki/Category:Method_Books",
      type: "pdf" as const,
    },
  ];
  
  return getRandomElement(resources);
}
