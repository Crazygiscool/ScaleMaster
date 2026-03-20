import asyncio
import subprocess
import sys
import platform

from app.engine import ScaleEngine
from app.practice import save_session
from app.models import PracticeSession, PracticeBlock
from textual.app import App, ComposeResult
from textual.containers import Horizontal, Vertical
from textual.binding import Binding
from textual.screen import Screen
from textual.widgets import Button, Digits, Footer, Header, Input, Label, Static, Switch


class SaxMasterTUI(App):
    BINDINGS = [Binding("q", "quit", "Quit", priority=True)]
    CSS = """
    #timer-container { align: center middle; border: double green; margin: 1; padding: 1; }
    #display { text-align: center; color: cyan; margin: 1; }
    Input { width: 20%; margin: 1; }
    .setting-row { height: auto; margin: 1; }
    """

    def __init__(self):
        super().__init__()
        self.metronome_enabled = False
        self.current_session = None
        self.session_id = 1
        self.metronome_tone = 800
        self.metronome_speed = 120
        self.metronome_high_first = True
        self.beats_per_measure = 4
        self.current_beat = 0

    def compose(self) -> ComposeResult:
        yield Header()
        with Vertical():
            yield Label("Enter practice time (minutes):")
            yield Input(placeholder="20", id="time_input", type="integer")
            yield Button("START SESSION", id="start_btn", variant="success")
            yield Button("METRONOME SETTINGS (S)", id="settings_btn", variant="default")

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
        beat_interval = 60 / self.metronome_speed
        self.current_beat = 0

        while seconds > 0:
            m, s = divmod(seconds, 60)
            self.query_one("#clock").update(f"{m:02d}:{s:02d}")

            if seconds % interval == 0:
                self.action_new_scale()

            if self.metronome_enabled:
                self.play_click()
                self.current_beat = (self.current_beat + 1) % self.beats_per_measure

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
        if self.current_beat == 0 and self.metronome_high_first:
            frequency = self.metronome_tone * 1.5
        else:
            frequency = self.metronome_tone

        if sys.platform == "win32":
            import winsound

            winsound.Beep(int(frequency), 100)
        elif sys.platform == "darwin":
            subprocess.run(
                ["say", "-v", "Boing", "-r", "200", "."], capture_output=True
            )
        else:
            try:
                subprocess.run(
                    ["play", "-n", "-q", "synth", "0.05", "sine", str(int(frequency))],
                    capture_output=True,
                )
            except FileNotFoundError:
                try:
                    subprocess.run(
                        ["paplay", "/usr/share/sounds/alsa/Front_Center.wav"],
                        capture_output=True,
                    )
                except FileNotFoundError:
                    try:
                        subprocess.run(["beep"], capture_output=True)
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

    async def action_quit(self):
        self.exit()

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
        elif event.button.id == "settings_btn":
            self.push_screen(MetronomeSettings(self))

    def on_key(self, event):
        if event.key == "r":
            self.action_new_scale()
        elif event.key == "s":
            self.push_screen(MetronomeSettings(self))


class MetronomeSettings(Screen):
    CSS = """
    #settings-container { align: center middle; border: double cyan; margin: 1; padding: 1; }
    .setting-row { height: auto; margin: 1; }
    """

    def __init__(self, parent_app):
        super().__init__()
        self.parent_app = parent_app

    def compose(self) -> ComposeResult:
        yield Header()
        with Vertical(id="settings-container"):
            yield Static("Metronome Settings", id="settings_title")
            with Horizontal(classes="setting-row"):
                yield Label("Tone (Hz):")
                yield Input(
                    str(self.parent_app.metronome_tone), id="tone_input", type="integer"
                )
            with Horizontal(classes="setting-row"):
                yield Label("Speed (BPM):")
                yield Input(
                    str(self.parent_app.metronome_speed),
                    id="speed_input",
                    type="integer",
                )
            with Horizontal(classes="setting-row"):
                yield Label("Beats per measure:")
                yield Input(
                    str(self.parent_app.beats_per_measure),
                    id="beats_input",
                    type="integer",
                )
            with Horizontal(classes="setting-row"):
                yield Label("High pitch on beat 1:")
                yield Switch(
                    id="high_first_switch", value=self.parent_app.metronome_high_first
                )
            yield Button("SAVE & BACK", id="save_btn", variant="success")
            yield Button("BACK", id="back_btn", variant="default")
        yield Footer()

    async def on_button_pressed(self, event: Button.Pressed):
        if event.button.id == "save_btn":
            self.parent_app.metronome_tone = int(
                self.query_one("#tone_input").value or 800
            )
            self.parent_app.metronome_speed = int(
                self.query_one("#speed_input").value or 120
            )
            self.parent_app.beats_per_measure = int(
                self.query_one("#beats_input").value or 4
            )
            self.parent_app.metronome_high_first = self.query_one(
                "#high_first_switch"
            ).value
            self.pop_screen()
        elif event.button.id == "back_btn":
            self.pop_screen()
            self.parent_app.metronome_tone = int(
                self.query_one("#tone_input").value or 800
            )
            self.parent_app.metronome_speed = int(
                self.query_one("#speed_input").value or 120
            )
            self.parent_app.beats_per_measure = int(
                self.query_one("#beats_input").value or 4
            )
            self.parent_app.metronome_high_first = self.query_one(
                "#high_first_switch"
            ).value
            self.pop_screen()

    def on_key(self, event):
        if event.key == "escape":
            self.pop_screen()


if __name__ == "__main__":
    SaxMasterTUI().run()
