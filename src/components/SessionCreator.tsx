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
  const totalPercentage = segments.reduce((sum, s) => sum + s.percentage, 0);
  const isValid = totalPercentage === 100;

  return (
    <div className="max-w-4xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="space-y-4">
          <div className="bg-gray-900 border border-gray-700 rounded-lg p-4">
            <h2 className="text-xl font-bold text-white mb-4">Practice Session</h2>
            
            <div className="mb-4">
              <label className="block text-gray-300 mb-2 text-center">
                Total: <span className="text-cyan-400 font-bold text-xl">{totalMinutes}</span> min
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
            </div>

            <div className={`text-center p-2 rounded mb-4 ${isValid ? "bg-green-900/30 text-green-400" : "bg-red-900/30 text-red-400"}`}>
              {isValid ? "✓ Ready" : `${totalPercentage}% (need 100%)`}
            </div>

            <button
              onClick={onStartSession}
              disabled={!isValid}
              className={`w-full py-3 rounded-lg font-bold text-lg transition-colors ${
                isValid
                  ? "bg-green-600 hover:bg-green-500 text-white cursor-pointer"
                  : "bg-gray-700 text-gray-500 cursor-not-allowed"
              }`}
            >
              START SESSION
            </button>
          </div>
        </div>

        <div className="bg-gray-900 border border-gray-700 rounded-lg p-4">
          <h3 className="text-lg font-bold text-white mb-3">Segments</h3>
          
          <div className="space-y-3">
            {segments.map((segment) => {
              const defaults = SEGMENT_DEFAULTS[segment.id as SegmentType];
              const minutes = Math.round((segment.percentage / 100) * totalMinutes);
              return (
                <div key={segment.id} className="bg-gray-800 rounded-lg p-3">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{defaults.icon}</span>
                      <span className="font-medium text-white text-sm">{defaults.name}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={segment.percentage}
                        onChange={(e) =>
                          onSegmentPercentageChange(segment.id, Math.max(0, Math.min(100, parseInt(e.target.value) || 0)))
                        }
                        className="w-14 bg-gray-700 text-white text-center rounded px-2 py-1 text-sm border border-gray-600"
                      />
                      <span className="text-gray-400 text-sm">%</span>
                      <span className="text-gray-500 text-sm w-10 text-right">{minutes}m</span>
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
                    className="w-full h-1.5 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                  />
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
