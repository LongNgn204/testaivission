
import React from 'react';

interface AmslerGridProps {
  size?: number;
  onCellClick?: (x: number, y: number) => void;
  distortedCells?: { x: number; y: number }[];
  isInteractive: boolean;
}

export const AmslerGrid: React.FC<AmslerGridProps> = ({
  size = 300,
  onCellClick,
  distortedCells = [],
  isInteractive,
}) => {
  const divisions = 20;
  const step = size / divisions;

  const handleClick = (e: React.MouseEvent<SVGRectElement>) => {
    if (!onCellClick || !isInteractive) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = Math.floor((e.clientX - rect.left) / step);
    const y = Math.floor((e.clientY - rect.top) / step);
    onCellClick(x, y);
  };

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <rect width={size} height={size} className="fill-white dark:fill-gray-800" />
        {/* Grid lines */}
        {Array.from({ length: divisions + 1 }).map((_, i) => (
          <g key={i}>
            <line x1={i * step} y1={0} x2={i * step} y2={size} className="stroke-black dark:stroke-gray-400" strokeWidth="1" />
            <line x1={0} y1={i * step} x2={size} y2={i * step} className="stroke-black dark:stroke-gray-400" strokeWidth="1" />
          </g>
        ))}
        {/* Distorted cells overlay - Improved visibility */}
        {distortedCells.map(({ x, y }, i) => (
          <rect
            key={i}
            x={x * step}
            y={y * step}
            width={step}
            height={step}
            fill="rgba(239, 68, 68, 0.7)"
            stroke="rgba(220, 38, 38, 0.9)"
            strokeWidth="2"
            className="dark:fill-red-500/80 dark:stroke-red-600"
          />
        ))}
        {/* Fixation point - Larger and more visible */}
        <circle cx={size / 2} cy={size / 2} r="6" fill="#000" className="dark:fill-white" />
        <circle cx={size / 2} cy={size / 2} r="3" fill="#fff" className="dark:fill-gray-800" />
        {/* Interaction layer */}
        <rect
            width={size}
            height={size}
            fill="transparent"
            onClick={handleClick}
            className={isInteractive ? "cursor-pointer" : ""}
        />
      </svg>
    </div>
  );
};
