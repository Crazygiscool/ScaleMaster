"use client";

import { SessionSegment } from "@/types/scale";
import { SEGMENT_DEFAULTS, SegmentType } from "@/types/scale";

interface DonutChartProps {
  segments: SessionSegment[];
  size?: number;
}

export default function DonutChart({ segments, size = 200 }: DonutChartProps) {
  const totalPercentage = segments.reduce((sum, s) => sum + s.percentage, 0);
  const radius = (size - 20) / 2;
  const circumference = 2 * Math.PI * radius;
  const centerX = size / 2;
  const centerY = size / 2;

  let currentOffset = 0;
  const segmentPaths = segments.map((segment) => {
    const segmentLength = (segment.percentage / totalPercentage) * circumference;
    const dashArray = `${segmentLength} ${circumference - segmentLength}`;
    const dashOffset = -currentOffset;
    currentOffset += segmentLength;

    const defaults = SEGMENT_DEFAULTS[segment.id as SegmentType];
    const midAngle = dashOffset + segmentLength / 2;
    const x = centerX + (radius * 0.7) * Math.sin((dashOffset / circumference) * 2 * Math.PI + (segmentLength / circumference) * Math.PI);
    const y = centerY - (radius * 0.7) * Math.cos((dashOffset / circumference) * 2 * Math.PI + (segmentLength / circumference) * Math.PI);

    return {
      segment,
      dashArray,
      dashOffset,
      defaults,
      x,
      y,
    };
  });

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="transform -rotate-90">
        <circle
          cx={centerX}
          cy={centerY}
          r={radius}
          fill="none"
          stroke="#374151"
          strokeWidth="20"
        />
        {segmentPaths.map(({ segment, dashArray, dashOffset, defaults }) => (
          <circle
            key={segment.id}
            cx={centerX}
            cy={centerY}
            r={radius}
            fill="none"
            stroke={segment.isCompleted ? "#22c55e" : defaults.color.replace("bg-", "") === "orange" ? "#f97316" : defaults.color.replace("bg-", "") === "blue" ? "#3b82f6" : defaults.color.replace("bg-", "") === "purple" ? "#a855f7" : "#22c55e"}
            strokeWidth="20"
            strokeDasharray={dashArray}
            strokeDashoffset={dashOffset}
            strokeLinecap="butt"
            className="transition-all duration-500"
          />
        ))}
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-3xl font-bold text-white">
          {Math.round(segments.filter((s) => s.isCompleted).length / segments.length * 100)}%
        </span>
        <span className="text-xs text-gray-400">Complete</span>
      </div>
    </div>
  );
}
