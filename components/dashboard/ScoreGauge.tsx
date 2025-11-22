import React from 'react';

interface ScoreGaugeProps {
    score: number;
    size?: number;
    strokeWidth?: number;
}

export const ScoreGauge: React.FC<ScoreGaugeProps> = ({
    score,
    size = 160,
    strokeWidth = 14
}) => {
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (score / 100) * circumference;

    const getColor = () => {
        if (score >= 85) return 'text-green-500';
        if (score >= 70) return 'text-blue-500';
        if (score >= 50) return 'text-yellow-500';
        return 'text-red-500';
    };

    return (
        <div className="relative" style={{ width: size, height: size }}>
            <svg className="transform -rotate-90" width={size} height={size}>
                {/* Background Circle */}
                <circle
                    className="text-gray-100 dark:text-gray-700"
                    stroke="currentColor"
                    strokeWidth={strokeWidth}
                    fill="transparent"
                    r={radius}
                    cx={size / 2}
                    cy={size / 2}
                />
                {/* Progress Circle */}
                <circle
                    className={`${getColor()} transition-all duration-1000 ease-out`}
                    stroke="currentColor"
                    strokeWidth={strokeWidth}
                    strokeDasharray={circumference}
                    strokeDashoffset={offset}
                    strokeLinecap="round"
                    fill="transparent"
                    r={radius}
                    cx={size / 2}
                    cy={size / 2}
                    style={{ transitionProperty: 'stroke-dashoffset' }}
                />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className={`text-4xl font-bold ${getColor()}`}>{score}</span>
                <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">/ 100</span>
            </div>
        </div>
    );
};
