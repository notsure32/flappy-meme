import React, { useState, useCallback, useEffect, useMemo } from 'react';
import Game from './components/Game';
import StartScreen from './components/StartScreen';
import AdminPanel from './components/AdminPanel';
import { GameSettings, Difficulty } from './types';
import { INITIAL_SETTINGS, DIFFICULTY_SETTINGS } from './constants';

const App: React.FC = () => {
  const [gameState, setGameState] = useState<'waiting' | 'loading' | 'playing' | 'gameOver'>('waiting');
  const [settings, setSettings] = useState<GameSettings>(INITIAL_SETTINGS);
  const [assets, setAssets] = useState<{
    character: string | null;
    jumpSound: string | null;
    deathSound: string | null;
  }>({ character: null, jumpSound: null, deathSound: null });
  const [audioBuffers, setAudioBuffers] = useState<{
    jump: AudioBuffer | null;
    death: AudioBuffer | null;
  }>({ jump: null, death: null });
  const [isAdminPanelOpen, setIsAdminPanelOpen] = useState(false);
  const [highScore, setHighScore] = useState<number>(() => {
    return parseInt(localStorage.getItem('flappyMemeHighScore') || '0', 10);
  });
  const [currentScore, setCurrentScore] = useState(0);
  const [loadingMessage, setLoadingMessage] = useState('Loading assets...');

  const audioContext = useMemo(() => new (window.AudioContext || (window as any).webkitAudioContext)(), []);
  
  const popSoundBuffer = useMemo(() => {
    const buffer = audioContext.createBuffer(1, audioContext.sampleRate, audioContext.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < 480; i++) {
        data[i] = Math.sin(i / 480 * Math.PI * 2) * Math.exp(-i / 100);
    }
    return buffer;
  }, [audioContext]);

  const sparkleSoundBuffer = useMemo(() => {
    const duration = 0.5;
    const sampleRate = audioContext.sampleRate;
    const buffer = audioContext.createBuffer(1, sampleRate * duration, sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < sampleRate * duration; i++) {
        const t = i / sampleRate;
        data[i] = (Math.random() * 2 - 1) * Math.exp(-t * 20) * Math.sin(2 * Math.PI * 2000 * t * (1 - t * 0.5));
    }
    return buffer;
  }, [audioContext]);

  useEffect(() => {
    if (assets.jumpSound && assets.deathSound && gameState === 'loading') {
      const loadAudio = async () => {
        try {
          setLoadingMessage('Decoding audio...');
          const [jumpResponse, deathResponse] = await Promise.all([
            fetch(assets.jumpSound!),
            fetch(assets.deathSound!)
          ]);

          if (!jumpResponse.ok || !deathResponse.ok) {
            throw new Error('Failed to fetch audio files');
          }

          const [jumpArrayBuffer, deathArrayBuffer] = await Promise.all([
            jumpResponse.arrayBuffer(),
            deathResponse.arrayBuffer()
          ]);

          const [jumpAudioBuffer, deathAudioBuffer] = await Promise.all([
            audioContext.decodeAudioData(jumpArrayBuffer),
            audioContext.decodeAudioData(deathArrayBuffer)
          ]);
          
          setAudioBuffers({ jump: jumpAudioBuffer, death: deathAudioBuffer });
          setGameState('playing');
        } catch (error) {
          console.error("Error loading audio assets:", error);
          alert("Failed to load audio assets. Please try again with different files (e.g., MP3, WAV).");
          setGameState('waiting');
        }
      };
      loadAudio();
    }
  }, [assets.jumpSound, assets.deathSound, audioContext, gameState]);

  const playPopSound = useCallback(() => {
    const source = audioContext.createBufferSource();
    source.buffer = popSoundBuffer;
    source.connect(audioContext.destination);
    source.start();
  }, [audioContext, popSoundBuffer]);

  const playSparkleSound = useCallback(() => {
    const source = audioContext.createBufferSource();
    source.buffer = sparkleSoundBuffer;
    const gainNode = audioContext.createGain();
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    source.connect(gainNode);
    gainNode.connect(audioContext.destination);
    source.start();
  }, [audioContext, sparkleSoundBuffer]);

  const playJumpSound = useCallback(() => {
    if (!audioBuffers.jump) return;
    const source = audioContext.createBufferSource();
    source.buffer = audioBuffers.jump;
    source.connect(audioContext.destination);
    source.start(0);
  }, [audioContext, audioBuffers.jump]);
  
  const playDeathSound = useCallback(() => {
    if (!audioBuffers.death) return;
    const source = audioContext.createBufferSource();
    source.buffer = audioBuffers.death;
    source.connect(audioContext.destination);
    source.start(0);
  }, [audioContext, audioBuffers.death]);
  
  const handleStartGame = async (
    characterFile: File,
    jumpSoundFile: File,
    deathSoundFile: File,
    difficulty: Difficulty
  ) => {
    setGameState('loading');
    setCurrentScore(0);
    
    setSettings(prev => ({
        ...prev,
        ...DIFFICULTY_SETTINGS[difficulty],
    }));
      
    try {
        setLoadingMessage('Preparing assets...');
        setAssets({
            character: URL.createObjectURL(characterFile),
            jumpSound: URL.createObjectURL(jumpSoundFile),
            deathSound: URL.createObjectURL(deathSoundFile),
        });
        // The useEffect for loading audio will now trigger.
    } catch (error) {
        console.error(error);
        alert(error instanceof Error ? error.message : "An unknown error occurred during setup.");
        setGameState('waiting');
    }
  };
  
  const handleGameOver = useCallback((score: number) => {
    if (score > highScore) {
      setHighScore(score);
      localStorage.setItem('flappyMemeHighScore', score.toString());
      playSparkleSound();
    }
    setGameState('gameOver');
    setCurrentScore(score);
  }, [highScore, playSparkleSound]);

  const handleRestart = () => {
    setCurrentScore(0);
    setGameState('playing');
  };

  const resetHighScore = () => {
    setHighScore(0);
    localStorage.setItem('flappyMemeHighScore', '0');
  }

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === 'o') {
        setIsAdminPanelOpen(prev => !prev);
      }
      if (e.key === 'Escape') {
        setIsAdminPanelOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, []);

  return (
    <div className="relative w-screen h-screen bg-gray-900 overflow-hidden select-none">
      {gameState === 'waiting' && <StartScreen onStart={handleStartGame} />}
      
      {(gameState === 'loading') && (
        <div className="w-full h-full flex flex-col items-center justify-center bg-gray-900 text-white">
          <svg className="animate-spin -ml-1 mr-3 h-10 w-10 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8_0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p className="mt-4 text-lg">{loadingMessage}</p>
        </div>
      )}

      {(gameState === 'playing' || gameState === 'gameOver') && assets.character && (
        <Game
          gameState={gameState}
          settings={settings}
          assets={{ character: assets.character }}
          onGameOver={handleGameOver}
          onRestart={handleRestart}
          highScore={highScore}
          currentScore={currentScore}
          setCurrentScore={setCurrentScore}
          playPopSound={playPopSound}
          playJumpSound={playJumpSound}
          playDeathSound={playDeathSound}
        />
      )}

      {isAdminPanelOpen && <AdminPanel settings={settings} setSettings={setSettings} resetHighScore={resetHighScore} />}
    </div>
  );
};

export default App;
