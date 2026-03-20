class ScaleGenerator:
    def __init__(self):
        # We use a list of tuples to handle sharps/flats (Enharmonics)
        self.chromatic = [
            ("C",),
            ("C#", "Db"),
            ("D",),
            ("D#", "Eb"),
            ("E",),
            ("F",),
            ("F#", "Gb"),
            ("G",),
            ("G#", "Ab"),
            ("A",),
            ("A#", "Bb"),
            ("B",),
        ]

        # Interval formulas (semitones from root)
        self.formulas = {
            "Major": [0, 2, 4, 5, 7, 9, 11],
            "Natural Minor": [0, 2, 3, 5, 7, 8, 10],
            "Harmonic Minor": [0, 2, 3, 5, 7, 8, 11],
        }

    def get_scale(self, root, scale_type):
        # 1. Find the starting index
        start_index = -1
        for i, notes in enumerate(self.chromatic):
            if root in notes:
                start_index = i
                break

        if start_index == -1:
            return "Invalid Root"

        # 2. Re-order the chromatic scale starting from root
        shifted_chromatic = self.chromatic[start_index:] + self.chromatic[:start_index]

        # 3. Pick the notes based on the formula
        raw_scale = [shifted_chromatic[i] for i in self.formulas[scale_type]]

        # 4. Clean up names (Picking the right sharp/flat so every letter is used once)
        return self._format_scale(raw_scale, root)

    def _format_scale(self, raw_scale, root):
        final_notes = [root]
        letters = ["A", "B", "C", "D", "E", "F", "G"]

        # Get the starting letter index (e.g., 'C' is index 2)
        current_letter_idx = letters.index(root[0])

        for chord_tone_options in raw_scale[1:]:
            current_letter_idx = (current_letter_idx + 1) % 7
            target_letter = letters[current_letter_idx]

            # Pick the version of the note that matches the next letter in the alphabet
            pick = next(
                (n for n in chord_tone_options if n.startswith(target_letter)),
                chord_tone_options[0],
            )
            final_notes.append(pick)

        return final_notes


# --- EXECUTION ---
gen = ScaleGenerator()
roots = ["C", "Db", "D", "Eb", "E", "F", "F#", "G", "Ab", "A", "Bb", "B"]
types = ["Major", "Natural Minor", "Harmonic Minor"]

for s_type in types:
    print(f"\n--- {s_type.upper()} SCALES ---")
    for r in roots:
        scale = gen.get_scale(r, s_type)
        print(f"{r.ljust(2)} : {' - '.join(scale)}")
