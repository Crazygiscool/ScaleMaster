import sys
import uvicorn

def run():
    if len(sys.argv) < 2:
        print("Usage: python main.py [tui | api]")
        return

    mode = sys.argv[1].lower()
    if mode == "tui":
        from tui.interface import SaxMasterTUI
        SaxMasterTUI().run()
    elif mode == "api":
        uvicorn.run("api.main:app", host="127.0.0.1", port=8000, reload=True)

if __name__ == "__main__":
    run()
