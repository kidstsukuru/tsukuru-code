import React from 'react';

interface Point {
    x: number;
    y: number;
}

interface MapPathProps {
    points: Point[];
}

const MapPath: React.FC<MapPathProps> = ({ points }) => {
    if (points.length < 2) return null;

    // Convert percentage points to SVG path commands
    // We'll assume a 100x100 coordinate system for simplicity in the SVG viewBox
    const pathData = points.reduce((acc, point, index) => {
        if (index === 0) {
            return `M ${point.x} ${point.y}`;
        }
        // Simple straight lines for now, could be curves later
        return `${acc} L ${point.x} ${point.y}`;
    }, '');

    return (
        <svg className="absolute inset-0 w-full h-full pointer-events-none z-0">
            {/* Background thick line */}
            <path
                d={pathData}
                fill="none"
                stroke="rgba(255, 255, 255, 0.5)"
                strokeWidth="12"
                strokeLinecap="round"
                strokeLinejoin="round"
                vectorEffect="non-scaling-stroke"
            />
            {/* Foreground dashed line */}
            <path
                d={pathData}
                fill="none"
                stroke="#d97706" // amber-600
                strokeWidth="4"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeDasharray="10 10"
                vectorEffect="non-scaling-stroke"
            />
        </svg>
    );
};

export default MapPath;
