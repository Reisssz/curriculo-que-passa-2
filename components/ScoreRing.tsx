"use client";

import { useEffect, useState } from "react";

interface Props {
  score: number;
  label: string;
  size?: number;
}

export default function ScoreRing({ score, label, size = 160 }: Props) {
  const [animated, setAnimated] = useState(0);
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (animated / 100) * circumference;

  const color =
    score >= 80 ? "#5CBF15" :
    score >= 60 ? "#3B82F6" :
    score >= 40 ? "#F59E0B" : "#EF4444";

  const bgColor =
    score >= 80 ? "#DBF2C4" :
    score >= 60 ? "#DBEAFE" :
    score >= 40 ? "#FEF3C7" : "#FEE2E2";

  useEffect(() => {
    const timer = setTimeout(() => setAnimated(score), 100);
    return () => clearTimeout(timer);
  }, [score]);

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative" style={{ width: size, height: size }}>
        {/* Background circle */}
        <div
          className="absolute inset-0 rounded-full"
          style={{ background: bgColor, opacity: 0.4 }}
        />

        <svg
          width={size}
          height={size}
          viewBox="0 0 120 120"
          className="score-ring"
          style={{ transform: "rotate(-90deg)" }}
        >
          {/* Track */}
          <circle
            cx="60" cy="60" r={radius}
            fill="none"
            stroke="#E5E7EB"
            strokeWidth="10"
          />
          {/* Fill */}
          <circle
            cx="60" cy="60" r={radius}
            fill="none"
            stroke={color}
            strokeWidth="10"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            style={{ transition: "stroke-dashoffset 1.2s cubic-bezier(0.4,0,0.2,1)" }}
          />
        </svg>

        {/* Center text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span
            className="font-display font-extrabold leading-none"
            style={{ fontSize: size * 0.22, color }}
          >
            {animated}
          </span>
          <span className="text-gray-400" style={{ fontSize: size * 0.09 }}>/ 100</span>
        </div>
      </div>

      {/* Label */}
      <div
        className="font-display font-bold px-4 py-1 rounded-full text-sm"
        style={{ background: bgColor, color }}
      >
        {label}
      </div>
    </div>
  );
}
