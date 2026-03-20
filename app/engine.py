import random

from app.models import Scale


class ScaleEngine:
    # 12 Pitch Classes (Sharps/Flats grouped)
    CHROMATIC = [
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

    LIBRARY = {
        "Core": {
            "Major": [0, 2, 4, 5, 7, 9, 11],
            "Natural Minor": [0, 2, 3, 5, 7, 8, 10],
            "Harmonic Minor": [0, 2, 3, 5, 7, 8, 11],
        },
        "Jazz & Modes": {
            "Dorian": [0, 2, 3, 5, 7, 9, 10],
            "Mixolydian": [0, 2, 4, 5, 7, 9, 10],
            "Lydian b7": [0, 2, 4, 6, 7, 9, 10],
            "Altered": [0, 1, 3, 4, 6, 8, 10],
        },
        "Symmetrical": {
            "Whole Tone": [0, 2, 4, 6, 8, 10],
            "Half-Whole Dim": [0, 1, 3, 4, 6, 7, 9, 10],
            "Augmented": [0, 3, 4, 7, 8, 11],
        },
    }

    @classmethod
    def generate(cls, root=None, category=None):
        root = root or random.choice([n[0] for n in cls.CHROMATIC])
        cat_name = (
            category
            if category in cls.LIBRARY
            else random.choice(list(cls.LIBRARY.keys()))
        )
        scale_name = random.choice(list(cls.LIBRARY[cat_name].keys()))

        intervals = cls.LIBRARY[cat_name][scale_name]

        root_idx = next(i for i, notes in enumerate(cls.CHROMATIC) if root in notes)
        shifted = cls.CHROMATIC[root_idx:] + cls.CHROMATIC[:root_idx]

        raw_notes = [shifted[i] for i in intervals]
        clean_notes = cls._spell_correctly(raw_notes, root)

        return Scale(
            root=root,
            name=scale_name,
            category=cat_name,
            notes=clean_notes,
            interval_formula=intervals,
        )

    @staticmethod
    def _spell_correctly(raw_notes, root):
        """Ensures each letter (A-G) is used once if possible."""
        alphabet = ["A", "B", "C", "D", "E", "F", "G"]
        res = [root]
        curr_letter_idx = alphabet.index(root[0])

        for options in raw_notes[1:]:
            curr_letter_idx = (curr_letter_idx + 1) % 7
            target = alphabet[curr_letter_idx]
            matched = next((n for n in options if n[0].upper() == target), None)
            pick = matched if matched else options[0]
            res.append(pick)
        return res
