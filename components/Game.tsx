import React, { useState, useEffect, useRef, useCallback } from 'react';
import { GameSettings, Pipe as PipeType, Particle } from '../types';
import {
  CHARACTER_SIZE, PIPE_WIDTH, GROUND_HEIGHT, PIPE_SPAWN_INTERVAL
} from '../constants';
import GameOverScreen from './GameOverScreen';
import ScoreDisplay from './ScoreDisplay';

interface GameProps {
  gameState: 'playing' | 'gameOver';
  settings: GameSettings;
  assets: {
    character: string;
  };
  onGameOver: (score: number) => void;
  onRestart: () => void;
  highScore: number;
  currentScore: number;
  setCurrentScore: React.Dispatch<React.SetStateAction<number>>;
  playPopSound: () => void;
  playJumpSound: () => void;
  playDeathSound: () => void;
}

const Game: React.FC<GameProps> = ({
  gameState,
  settings,
  assets,
  onGameOver,
  onRestart,
  highScore,
  currentScore,
  setCurrentScore,
  playPopSound,
  playJumpSound,
  playDeathSound,
}) => {
  const gameContainerRef = useRef<HTMLDivElement>(null);
  const gameLoopRef = useRef(0);
  const lastPipeTimeRef = useRef(0);
  
  const [gameStarted, setGameStarted] = useState(false);
  const [charPos, setCharPos] = useState({ x: 50, y: 150 });
  const [charVel, setCharVel] = useState(0);
  const [charRotation, setCharRotation] = useState(0);
  const [pipes, setPipes] = useState<PipeType[]>([]);
  const [isJumping, setIsJumping] = useState(false);
  const [isScorePopping, setIsScorePopping] = useState(false);
  const [particles, setParticles] = useState<Particle[]>([]);
  const [screenShake, setScreenShake] = useState(false);
  const [flash, setFlash] = useState(false);

  const resetGame = useCallback(() => {
    setGameStarted(false);
    setCharPos({ x: 50, y: 150 });
    setCharVel(0);
    setPipes([]);
    setCurrentScore(0);
    lastPipeTimeRef.current = 0;
  }, [setCurrentScore]);
  
  useEffect(() => {
    if (gameState === 'playing') {
      resetGame();
    }
  }, [gameState, resetGame]);

  const handleJump = useCallback(() => {
    if (gameState !== 'playing') return;

    if (!gameStarted) {
        setGameStarted(true);
    }

    setCharVel(settings.jumpForce);
    setIsJumping(true);
    setTimeout(() => setIsJumping(false), 100);

    // Particles
    const newParticles: Particle[] = [];
    for (let i = 0; i < 15; i++) {
      newParticles.push({
        id: Math.random(),
        x: charPos.x + CHARACTER_SIZE / 2,
        y: charPos.y + CHARACTER_SIZE / 2,
        vx: (Math.random() - 0.5) * 3,
        vy: -Math.random() * 5 - 2,
        alpha: 1,
      });
    }
    setParticles(p => [...p, ...newParticles]);

    playJumpSound();
  }, [gameState, gameStarted, settings.jumpForce, charPos.x, charPos.y, playJumpSound]);

  useEffect(() => {
    if (gameState !== 'playing') return;

    const handleInput = (e: Event) => {
      e.preventDefault();
      if (e instanceof KeyboardEvent && e.code !== 'Space') return;
      handleJump();
    };
    
    window.addEventListener('keydown', handleInput);
    window.addEventListener('mousedown', handleInput);
    window.addEventListener('touchstart', handleInput);

    return () => {
      window.removeEventListener('keydown', handleInput);
      window.removeEventListener('mousedown', handleInput);
      window.removeEventListener('touchstart', handleInput);
    };
  }, [gameState, handleJump]);
  
  const gameLoop = useCallback((timestamp: number) => {
    if (!gameContainerRef.current) {
      gameLoopRef.current = requestAnimationFrame(gameLoop);
      return;
    }

    const gameHeight = gameContainerRef.current.clientHeight;
    const isGrounded = charPos.y >= gameHeight - GROUND_HEIGHT;

    // --- Character Physics (runs after first jump and during gameOver until grounded) ---
    if (gameStarted && !isGrounded) {
        setCharVel(v => v + settings.gravity);
        setCharPos(p => {
            const newY = p.y + charVel;
            if (newY >= gameHeight - GROUND_HEIGHT) {
                return { ...p, y: gameHeight - GROUND_HEIGHT };
            }
            if (newY < 0 && gameState === 'playing') {
              setCharVel(0);
              return { ...p, y: 0 };
            }
            return { ...p, y: newY };
        });
    }
    setCharRotation(Math.max(-30, Math.min(90, charVel * 5)));


    // --- Core Game Logic (runs only when 'playing' and started) ---
    if (gameState === 'playing' && gameStarted) {
        const gameWidth = gameContainerRef.current.clientWidth;

        // Dynamic difficulty based on score (leveling)
        const level = Math.floor(currentScore / 10); // Level up every 10 pipes
        const currentPipeSpeed = settings.pipeSpeed + level * 0.25;
        const currentPipeGap = Math.max(150, settings.pipeGap - level * 5); // Minimum gap of 150

        // Update particles
        setParticles(prev =>
          prev.map(p => ({
            ...p,
            x: p.x + p.vx,
            y: p.y + p.vy,
            vy: p.vy + 0.1,
            alpha: p.alpha - 0.02,
          })).filter(p => p.alpha > 0)
        );

        // Update pipes & score
        setPipes(prevPipes => {
            let newScore = currentScore;
            const updatedPipes = prevPipes
            .map(pipe => ({ ...pipe, x: pipe.x - currentPipeSpeed }))
            .filter(pipe => pipe.x > -PIPE_WIDTH);
            
            updatedPipes.forEach(pipe => {
                if (!pipe.passed && pipe.x < charPos.x) {
                    pipe.passed = true;
                    newScore += 1;
                    playPopSound();
                }
            });
            if(newScore !== currentScore) {
              setCurrentScore(newScore);
              setIsScorePopping(true);
              setTimeout(() => setIsScorePopping(false), 300);
            }
            return updatedPipes;
        });

        // Spawn new pipes
        if (timestamp - lastPipeTimeRef.current > PIPE_SPAWN_INTERVAL) {
          lastPipeTimeRef.current = timestamp;
          const gapY = Math.random() * (gameHeight - GROUND_HEIGHT - currentPipeGap - 100) + 50;
          setPipes(p => [
            ...p,
            { id: timestamp, x: gameWidth, gapY: gapY, gap: currentPipeGap, passed: false },
          ]);
        }
        
        // Collision detection
        const charRect = {
          top: charPos.y,
          bottom: charPos.y + CHARACTER_SIZE,
          left: charPos.x,
          right: charPos.x + CHARACTER_SIZE,
        };

        const handleCollision = () => {
          playDeathSound();
          onGameOver(currentScore);
          setScreenShake(true);
          setFlash(true);
          setTimeout(() => setScreenShake(false), 300);
          setTimeout(() => setFlash(false), 150);
        };

        // Ground collision check
        if (isGrounded) {
          handleCollision();
        } else {
            // Pipe collision check (only if not hitting ground)
            for (const pipe of pipes) {
                const topPipeRect = { top: 0, bottom: pipe.gapY, left: pipe.x, right: pipe.x + PIPE_WIDTH };
                const bottomPipeRect = { top: pipe.gapY + pipe.gap, bottom: gameHeight, left: pipe.x, right: pipe.x + PIPE_WIDTH };

                if (
                    (charRect.right > topPipeRect.left && charRect.left < topPipeRect.right && charRect.top < topPipeRect.bottom) ||
                    (charRect.right > bottomPipeRect.left && charRect.left < bottomPipeRect.right && charRect.bottom > bottomPipeRect.top)
                ) {
                    handleCollision();
                    break;
                }
            }
        }
    }
    
    gameLoopRef.current = requestAnimationFrame(gameLoop);
  }, [charPos.x, charPos.y, charVel, currentScore, gameState, gameStarted, onGameOver, pipes, playDeathSound, playPopSound, setCurrentScore, settings]);


  useEffect(() => {
    gameLoopRef.current = requestAnimationFrame(gameLoop);
    return () => {
      if (gameLoopRef.current) {
        cancelAnimationFrame(gameLoopRef.current);
      }
    };
  }, [gameLoop]);

  const characterStyle: React.CSSProperties = {
    transform: `translate(${charPos.x}px, ${charPos.y}px) rotate(${charRotation}deg) scaleY(${isJumping ? 0.9 : 1})`,
    transition: 'transform 0.1s linear',
  };

  return (
    <div
      ref={gameContainerRef}
      className={`relative w-full h-full bg-gradient-to-b from-purple-800 to-blue-900 overflow-hidden ${screenShake ? 'animate-shake' : ''}`}
    >
      {/* Score */}
      <ScoreDisplay currentScore={currentScore} highScore={highScore} isPopping={isScorePopping} />

      {/* Character */}
      <div
        style={characterStyle}
        className={`absolute w-[80px] h-[80px] z-20 ${!gameStarted ? 'animate-bob' : ''}`}
      >
        <img
            src={assets.character}
            alt="character"
            className="w-full h-full object-contain filter drop-shadow-[0_0_5px_rgba(255,255,255,0.7)]"
        />
        {isJumping && <div className="absolute inset-0 rounded-full bg-white opacity-50 animate-ping"></div>}
      </div>

      {/* Particles */}
      {particles.map(p => (
        <div
          key={p.id}
          className="absolute w-1.5 h-1.5 bg-white rounded-full z-20"
          style={{ left: p.x, top: p.y, opacity: p.alpha }}
        />
      ))}

      {/* Pipes */}
      {pipes.map(pipe => (
        <div key={pipe.id} style={{ transform: `translateX(${pipe.x}px)` }} className="absolute top-0 h-full z-10">
          <div
            className="absolute top-0 bg-gradient-to-b from-green-600 to-green-800 border-4 border-green-900 rounded-b-lg"
            style={{ width: PIPE_WIDTH, height: pipe.gapY }}
          />
          <div
            className="absolute bg-gradient-to-t from-green-600 to-green-800 border-4 border-green-900 rounded-t-lg"
            style={{ top: pipe.gapY + pipe.gap, width: PIPE_WIDTH, bottom: GROUND_HEIGHT }}
          />
        </div>
      ))}
      
      {/* Ground */}
      <div
        className="absolute bottom-0 left-0 w-full z-30 bg-gradient-to-t from-[#6B4226] to-[#8E562E]"
        style={{
          height: GROUND_HEIGHT,
        }}
      />
      
      {/* Flash Overlay */}
      {flash && <div className="absolute inset-0 bg-red-500 opacity-50 z-40"></div>}

      {/* Game Over Screen */}
      {gameState === 'gameOver' && (
        <GameOverScreen
          score={currentScore}
          bestScore={highScore}
          onRestart={onRestart}
        />
      )}
    </div>
  );
};

export default Game;