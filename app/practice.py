import json
import time
from datetime import datetime
from pathlib import Path
from typing import List, Optional

from app.models import PracticeSession


def save_session(session: PracticeSession, filepath: str = "history.json") -> None:
    """Save a practice session to history.json"""
    path = Path(filepath)
    history = []
    if path.exists():
        try:
            with open(path, "r") as f:
                history = json.load(f)
        except json.JSONDecodeError:
            history = []

    history.append(
        {
            "id": session.id,
            "start_time": session.start_time.isoformat(),
            "total_duration_minutes": session.total_duration_minutes,
            "blocks": [
                {
                    "task_name": b.task_name,
                    "duration_seconds": b.duration_seconds,
                    "is_completed": b.is_completed,
                }
                for b in session.blocks
            ],
        }
    )

    with open(path, "w") as f:
        json.dump(history, f, indent=2)


def load_history(filepath: str = "history.json") -> List[dict]:
    """Load practice session history from file"""
    path = Path(filepath)
    if not path.exists():
        return []
    try:
        with open(path, "r") as f:
            return json.load(f)
    except json.JSONDecodeError:
        return []
