"use client";

import { SessionSegment } from "@/types/scale";
import { SEGMENT_DEFAULTS, SegmentType } from "@/types/scale";

interface SessionSummaryProps {
  segments: SessionSegment[];
  totalMinutes: number;
  onNewSession: () => void;
}

export default function SessionSummary({
  segments,
  totalMinutes,
  onNewSession,
}: SessionSummaryProps) {
  const completedSegments = segments.filter((s) => s.isCompleted);
  const totalSeconds = segments.reduce((sum, s) => sum + s.durationSeconds, 0);
  const completedSeconds = completedSegments.reduce((sum, s) => sum + s.durationSeconds, 0);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${String(secs).padStart(2, "0")}`;
  };

  return (
    <div className="w-full max-w-2xl">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-green-400 mb-2">Session Complete!</h2>
        <p className="text-gray-400">Great work on your practice</p>
      </div>

      <div className="bg-gray-900 border border-gray-700 rounded-lg p-6 mb-6">
        <h3 className="text-xl font-bold text-white mb-4">Session Summary</h3>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-gray-800 rounded-lg p-4 text-center">
            <p className="text-gray-400 text-sm">Total Time</p>
            <p className="text-2xl font-bold text-cyan-400">{formatTime(totalSeconds)}</p>
          </div>
          <div className="bg-gray-800 rounded-lg p-4 text-center">
            <p className="text-gray-400 text-sm">Practice Time</p>
            <p className="text-2xl font-bold text-green-400">{formatTime(completedSeconds)}</p>
          </div>
        </div>

        <div className="space-y-3">
          {segments.map((segment) => {
            const defaults = SEGMENT_DEFAULTS[segment.id as SegmentType];
            return (
              <div
                key={segment.id}
                className={`flex items-center justify-between p-3 rounded-lg ${
                  segment.isCompleted ? "bg-gray-800" : "bg-gray-800/50"
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-xl">{defaults.icon}</span>
                  <div>
                    <p className="text-white font-medium">{defaults.name}</p>
                    <p className="text-gray-500 text-sm">{formatTime(segment.durationSeconds)}</p>
                  </div>
                </div>
                <div className={`px-3 py-1 rounded-full text-sm ${
                  segment.isCompleted
                    ? "bg-green-500/20 text-green-400"
                    : "bg-gray-700 text-gray-400"
                }`}>
                  {segment.isCompleted ? "✓" : "○"}
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-6 pt-6 border-t border-gray-700">
          <div className="flex justify-between items-center mb-2">
            <span className="text-gray-400">Progress</span>
            <span className="text-white font-bold">
              {completedSegments.length} / {segments.length} segments
            </span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-3">
            <div
              className="bg-green-500 h-3 rounded-full transition-all duration-500"
              style={{ width: `${(completedSeconds / totalSeconds) * 100}%` }}
            />
          </div>
          <p className="text-right text-sm text-gray-400 mt-1">
            {Math.round((completedSeconds / totalSeconds) * 100)}% complete
          </p>
        </div>
      </div>

      <button
        onClick={onNewSession}
        className="w-full py-4 bg-green-600 hover:bg-green-500 text-white rounded-lg font-bold text-lg transition-colors"
      >
        START NEW SESSION
      </button>
    </div>
  );
}
