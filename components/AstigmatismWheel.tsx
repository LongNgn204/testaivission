
import React from 'react';

export const AstigmatismWheel: React.FC = () => {
  const lines = 12;
  const radius = 100;
  const center = 120;

  return (
    <svg width="240" height="240" viewBox="0 0 240 240">
      <circle cx={center} cy={center} r={radius + 5} className="fill-white dark:fill-gray-800" />
      {Array.from({ length: lines }).map((_, i) => {
        const angle = (i * 180) / lines;
        const x1 = center - radius * Math.cos((angle * Math.PI) / 180);
        const y1 = center - radius * Math.sin((angle * Math.PI) / 180);
        const x2 = center + radius * Math.cos((angle * Math.PI) / 180);
        const y2 = center + radius * Math.sin((angle * Math.PI) / 180);
        return (
          <line
            key={i}
            x1={x1}
            y1={y1}
            x2={x2}
            y2={y2}
            className="stroke-black dark:stroke-gray-300"
            strokeWidth="3"
            strokeLinecap="round"
          />
        );
      })}
      <circle cx={center} cy={center} r="10" className="fill-white stroke-black dark:fill-gray-800 dark:stroke-gray-300" strokeWidth="2" />
    </svg>
  );
};
