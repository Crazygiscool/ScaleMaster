import asyncio
import subprocess
import sys
import platform

from app.engine import ScaleEngine
from app.practice import save_session
from app.models import PracticeSession, PracticeBlock
from textual.app import App, ComposeResult
from textual.containers import Horizontal, Vertical
from textual.widgets import Button, Digits, Footer, Header, Input, Label, Static


class SaxMasterTUI(App):
    CSS = """
    #timer-container { align: center middle; border: double green; margin: 1; padding: 1; }
    #display { text-align: center; color: cyan; margin: 1; }
    Input { width: 20%; margin: 1; }
    """

    def __init__(self):
        super().__init__()
        self.metronome_enabled = False
        self.current_session = None
        self.session_id = 1

    def compose(self) -> ComposeResult:
        yield Header()
        with Vertical():
            yield Label("Enter practice time (minutes):")
            yield Input(placeholder="20", id="time_input", type="integer")
            yield Button("START SESSION", id="start_btn", variant="success")
            yield Button("TOGGLE METRONOME (M)", id="metronome_btn", variant="default")

            with Vertical(id="timer-container"):
                yield Digits("00:00", id="clock")
                yield Static("Scale to practice:", id="task_label")
                yield Static("---", id="display")
                yield Button("NEXT SCALE (R)", id="next_btn")
        yield Footer()

    async def action_start_timer(self, minutes):
        total_seconds = int(minutes) * 60
        self.current_session = PracticeSession(
            id=self.session_id, total_duration_minutes=int(minutes)
        )
        self.session_id += 1

        interval = 60
        seconds = total_seconds
        while seconds > 0:
            m, s = divmod(seconds, 60)
            self.query_one("#clock").update(f"{m:02d}:{s:02d}")

            if seconds % interval == 0:
                self.action_new_scale()

            if self.metronome_enabled:
                self.play_click()

            await asyncio.sleep(1)
            seconds -= 1

        self.current_session.blocks.append(
            PracticeBlock(
                task_name="Session Complete",
                duration_seconds=total_seconds,
                is_completed=True,
            )
        )
        save_session(self.current_session)
        self.query_one("#clock").update("DONE!")
        self.query_one("#display").update("Session saved to history.json")

    def play_click(self):
        if sys.platform == "win32":
            import winsound

            winsound.Beep(800, 100)
        elif sys.platform == "darwin":
            subprocess.run(
                ["say", "-v", "Boing", "-r", "200", "."], capture_output=True
            )
        else:
            try:
                subprocess.run(["paplay"], input=b"\x00", capture_output=True)
            except FileNotFoundError:
                sys.stdout.write("\a")
                sys.stdout.flush()

    def action_new_scale(self):
        scale = ScaleEngine.generate()
        self.query_one("#display").update(
            f"[b]{scale.root} {scale.name}[/b]\n{scale.display_text}"
        )
        if self.current_session:
            self.current_session.blocks.append(
                PracticeBlock(
                    task_name=f"{scale.root} {scale.name}",
                    duration_seconds=60,
                    scale_focus=scale,
                )
            )

    def action_toggle_metronome(self):
        self.metronome_enabled = not self.metronome_enabled
        status = "ON" if self.metronome_enabled else "OFF"
        self.notify(f"Metronome {status}")

    def action_set_interval(self, interval_seconds):
        self.interval_seconds = interval_seconds

    async def on_button_pressed(self, event: Button.Pressed):
        if event.button.id == "start_btn":
            mins = self.query_one("#time_input").value or "1"
            asyncio.create_task(self.action_start_timer(mins))
        elif event.button.id == "next_btn":
            self.action_new_scale()
        elif event.button.id == "metronome_btn":
            self.action_toggle_metronome()

    def on_key(self, event):
        if event.key == "r":
            self.action_new_scale()
        elif event.key == "m":
            self.action_toggle_metronome()


if __name__ == "__main__":
    SaxMasterTUI().run()
