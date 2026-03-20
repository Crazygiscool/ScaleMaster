import json
from dataclasses import dataclass, field, asdict
from datetime import datetime
from typing import List, Optional


@dataclass
class Scale:
    """Represents a single generated scale with its musical properties."""

    root: str
    name: str
    category: str
    notes: List[str]
    interval_formula: List[int]

    @property
    def display_text(self) -> str:
        return " ➔ ".join(self.notes)

    def to_json(self) -> str:
        return json.dumps(asdict(self))


@dataclass
class PracticeBlock:
    """A specific segment of a practice session (e.g., 5 mins of Long Tones)."""

    task_name: str
    duration_seconds: int
    scale_focus: Optional[Scale] = None
    is_completed: bool = False


@dataclass
class PracticeSession:
    """The high-level container for a user's practice session."""

    id: int
    start_time: datetime = field(default_factory=datetime.now)
    total_duration_minutes: int = 0
    blocks: List[PracticeBlock] = field(default_factory=list)

    def get_progress_percentage(self) -> float:
        if not self.blocks:
            return 0.0
        completed = sum(1 for b in self.blocks if b.is_completed)
        return (completed / len(self.blocks)) * 100
