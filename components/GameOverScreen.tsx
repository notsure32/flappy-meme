
import React, { useState, useEffect } from 'react';

interface GameOverScreenProps {
  score: number;
  bestScore: number;
  onRestart: () => void;
}

const GameOverScreen: React.FC<GameOverScreenProps> = ({ score, bestScore, onRestart }) => {
  const [isNewHighScore, setIsNewHighScore] = useState(false);

  useEffect(() => {
    if (score > 0 && score === bestScore) {
      setIsNewHighScore(true);
    }
  }, [score, bestScore]);

  return (
    <div className="absolute inset-0 bg-black bg-opacity-70 flex flex-col items-center justify-center z-50 p-4">
      <div className="w-full max-w-md bg-purple-900 bg-opacity-80 backdrop-blur-sm border-4 border-yellow-400 rounded-2xl p-6 text-center text-white space-y-4">
        <h2 className="font-bangers text-6xl text-red-500 drop-shadow-lg">Game Over</h2>
        
        <p className="font-bangers text-2xl text-gray-300">"BROO TUMSE NA HO PAYEGA 💀"</p>

        {isNewHighScore && (
          <div className="font-bangers text-3xl text-yellow-300 animate-pulse">
            NEW HIGH SCORE 🔥
          </div>
        )}

        <div className="flex justify-around items-center w-full text-3xl font-bangers pt-4">
          <div>
            <p className="text-yellow-400">Score</p>
            <p className="text-5xl">{score}</p>
          </div>
          <div>
            <p className="text-gray-400">Best</p>
            <p className="text-5xl">{bestScore}</p>
          </div>
        </div>

        <p className="font-bangers text-2xl text-gray-300">"Bhai… bas thoda aur chala leta 💀"</p>
        
        <button
          onClick={onRestart}
          className="w-full font-bangers text-4xl p-3 mt-4 rounded-lg transition-all duration-300 ease-in-out
                     bg-green-500 text-white hover:bg-green-400 hover:scale-105 shadow-lg
                     transform active:scale-95"
        >
          Restart
        </button>
      </div>
    </div>
  );
};

export default GameOverScreen;
   