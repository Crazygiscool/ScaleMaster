"use client";

import { SEGMENT_DEFAULTS, SegmentType, SessionSegment } from "@/types/scale";

interface SessionCreatorProps {
  totalMinutes: number;
  onTotalMinutesChange: (minutes: number) => void;
  segments: SessionSegment[];
  onSegmentPercentageChange: (id: string, percentage: number) => void;
  onStartSession: () => void;
}

export default function SessionCreator({
  totalMinutes,
  onTotalMinutesChange,
  segments,
  onSegmentPercentageChange,
  onStartSession,
}: SessionCreatorProps) {
  return (
    <div className="w-full max-w-2xl">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-white mb-2">Create Your Practice Session</h2>
        <p className="text-gray-400">Design your session structure</p>
      </div>

      <div className="bg-gray-900 border border-gray-700 rounded-lg p-6 mb-6">
        <div className="mb-6">
          <label className="block text-gray-300 mb-2 text-center">
            Total Session Length: <span className="text-cyan-400 font-bold">{totalMinutes}</span> minutes
          </label>
          <input
            type="range"
            min="15"
            max="120"
            step="5"
            value={totalMinutes}
            onChange={(e) => onTotalMinutesChange(parseInt(e.target.value))}
            className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-cyan-500"
          />
          <div className="flex justify-between text-gray-500 text-sm mt-1">
            <span>15 min</span>
            <span>60 min</span>
            <span>120 min</span>
          </div>
        </div>

        <div className="space-y-4">
          {segments.map((segment) => {
            const defaults = SEGMENT_DEFAULTS[segment.id as SegmentType];
            return (
              <div key={segment.id} className="bg-gray-800 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{defaults.icon}</span>
                    <span className="font-medium text-white">{defaults.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={segment.percentage}
                      onChange={(e) =>
                        onSegmentPercentageChange(segment.id, Math.max(0, Math.min(100, parseInt(e.target.value) || 0)))
                      }
                      className="w-16 bg-gray-700 text-white text-center rounded px-2 py-1 border border-gray-600"
                    />
                    <span className="text-gray-400">%</span>
                    <span className="text-gray-500 text-sm w-16 text-right">
                      ({Math.round((segment.percentage / 100) * totalMinutes)}m)
                    </span>
                  </div>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={segment.percentage}
                  onChange={(e) =>
                    onSegmentPercentageChange(segment.id, parseInt(e.target.value))
                  }
                  className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                />
                <p className="text-gray-500 text-sm mt-2">{defaults.description}</p>
              </div>
            );
          })}
        </div>

        <div className="mt-6 p-4 bg-gray-800 rounded-lg">
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">Total allocated:</span>
            <span className={segments.reduce((sum, s) => sum + s.percentage, 0) === 100 ? "text-green-400" : "text-red-400"}>
              {segments.reduce((sum, s) => sum + s.percentage, 0)}%
            </span>
          </div>
          {segments.reduce((sum, s) => sum + s.percentage, 0) !== 100 && (
            <p className="text-red-400 text-sm mt-2">Percentages must add up to 100%</p>
          )}
        </div>
      </div>

      <button
        onClick={onStartSession}
        disabled={segments.reduce((sum, s) => sum + s.percentage, 0) !== 100}
        className={`w-full py-4 rounded-lg font-bold text-lg transition-colors ${
          segments.reduce((sum, s) => sum + s.percentage, 0) === 100
            ? "bg-green-600 hover:bg-green-500 text-white cursor-pointer"
            : "bg-gray-700 text-gray-500 cursor-not-allowed"
        }`}
      >
        START SESSION
      </button>
    </div>
  );
}
