
import React from 'react';

interface ProgressBarProps {
    current: number;
    total: number;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({ current, total }) => {
    const percentage = (current / total) * 100;

    return (
        <div className="w-full bg-slate-200 rounded-full h-2.5 my-4">
            <div
                className="bg-sky-600 h-2.5 rounded-full transition-all duration-300 ease-in-out"
                style={{ width: `${percentage}%` }}
            ></div>
        </div>
    );
};
