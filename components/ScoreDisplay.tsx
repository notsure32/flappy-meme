
import React from 'react';

interface ScoreDisplayProps {
    currentScore: number;
    highScore: number;
    isPopping: boolean;
}

const ScoreDisplay: React.FC<ScoreDisplayProps> = ({ currentScore, highScore, isPopping }) => {
    return (
        <div className="absolute top-0 left-0 right-0 p-4 flex justify-between items-start z-40">
            {/* Current Score */}
            <div className="text-left">
                <p className={`font-bangers text-yellow-300 text-7xl drop-shadow-[0_4px_2px_rgba(0,0,0,0.5)] transition-transform duration-300 ${isPopping ? 'animate-score-pop' : ''}`}>
                    {currentScore}
                </p>
            </div>
            {/* Best Score */}
            <div className="text-right">
                <p className="font-bangers text-gray-300 text-2xl">Best</p>
                <p className="font-bangers text-white text-4xl drop-shadow-md">
                    {highScore}
                </p>
            </div>
        </div>
    );
}

export default ScoreDisplay;
   