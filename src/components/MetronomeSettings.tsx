"use client";

import { MetronomeSettings } from "@/types/scale";

interface MetronomeSettingsProps {
  settings: MetronomeSettings;
  onSettingsChange: (settings: MetronomeSettings) => void;
  onClose: () => void;
}

export default function MetronomeSettingsModal({
  settings,
  onSettingsChange,
  onClose,
}: MetronomeSettingsProps) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-gray-900 border-2 border-cyan-500 rounded-lg p-6 w-full max-w-md">
        <h2 className="text-2xl font-bold text-cyan-400 mb-6">Metronome Settings</h2>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <label className="text-gray-300">Tone (Hz)</label>
            <input
              type="number"
              value={settings.tone}
              onChange={(e) =>
                onSettingsChange({ ...settings, tone: parseInt(e.target.value) || 800 })
              }
              className="w-24 bg-gray-800 text-white border border-gray-600 rounded px-3 py-1"
            />
          </div>

          <div className="flex items-center justify-between">
            <label className="text-gray-300">Speed (BPM)</label>
            <input
              type="number"
              value={settings.speed}
              onChange={(e) =>
                onSettingsChange({ ...settings, speed: parseInt(e.target.value) || 120 })
              }
              className="w-24 bg-gray-800 text-white border border-gray-600 rounded px-3 py-1"
            />
          </div>

          <div className="flex items-center justify-between">
            <label className="text-gray-300">Beats per measure</label>
            <input
              type="number"
              value={settings.beatsPerMeasure}
              onChange={(e) =>
                onSettingsChange({ ...settings, beatsPerMeasure: parseInt(e.target.value) || 4 })
              }
              className="w-24 bg-gray-800 text-white border border-gray-600 rounded px-3 py-1"
            />
          </div>

          <div className="flex items-center justify-between">
            <label className="text-gray-300">High pitch on beat 1</label>
            <input
              type="checkbox"
              checked={settings.highFirst}
              onChange={(e) =>
                onSettingsChange({ ...settings, highFirst: e.target.checked })
              }
              className="w-5 h-5"
            />
          </div>

          <div className="flex items-center justify-between">
            <label className="text-gray-300">Metronome enabled</label>
            <input
              type="checkbox"
              checked={settings.enabled}
              onChange={(e) =>
                onSettingsChange({ ...settings, enabled: e.target.checked })
              }
              className="w-5 h-5"
            />
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <button
            onClick={onClose}
            className="flex-1 bg-gray-700 hover:bg-gray-600 text-white py-2 rounded transition-colors"
          >
            Back
          </button>
          <button
            onClick={onClose}
            className="flex-1 bg-green-600 hover:bg-green-500 text-white py-2 rounded transition-colors"
          >
            Save & Back
          </button>
        </div>
      </div>
    </div>
  );
}
