import React, { useState, useRef } from 'react';
import { Difficulty } from '../types';

interface StartScreenProps {
  onStart: (characterFile: File, jumpSoundFile: File, deathSoundFile: File, difficulty: Difficulty) => void;
}

const FileInput: React.FC<{ label: string; accept: string; file: File | null; onChange: (file: File | null) => void; }> = ({ label, accept, file, onChange }) => {
    const inputRef = useRef<HTMLInputElement>(null);

    return (
        <div className="w-full">
            <button
                type="button"
                onClick={() => inputRef.current?.click()}
                className="w-full text-left p-3 bg-purple-700 hover:bg-purple-600 rounded-lg border-2 border-purple-500 transition-colors duration-200 truncate"
            >
                <span className="font-bold">{label}: </span>
                <span className="text-gray-200">{file ? file.name : 'Click to upload'}</span>
            </button>
            <input
                ref={inputRef}
                type="file"
                accept={accept}
                onChange={(e) => onChange(e.target.files ? e.target.files[0] : null)}
                className="hidden"
            />
        </div>
    );
};

const StartScreen: React.FC<StartScreenProps> = ({ onStart }) => {
  const [characterFile, setCharacterFile] = useState<File | null>(null);
  const [jumpSoundFile, setJumpSoundFile] = useState<File | null>(null);
  const [deathSoundFile, setDeathSoundFile] = useState<File | null>(null);
  const [difficulty, setDifficulty] = useState<Difficulty>('medium');
  const [isStarting, setIsStarting] = useState(false);

  const canStart = characterFile && jumpSoundFile && deathSoundFile;
  const audioAcceptTypes = "audio/mp3, audio/wav, audio/ogg, audio/aac";
  const imageAcceptTypes = "image/png, image/jpeg, image/gif, image/webp";

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (canStart && !isStarting) {
      setIsStarting(true);
      onStart(characterFile, jumpSoundFile, deathSoundFile, difficulty);
    }
  };

  return (
    <div className="w-full h-full bg-gradient-to-b from-purple-900 to-blue-900 flex items-center justify-center p-4">
      <div className="bg-black bg-opacity-50 backdrop-blur-md p-8 rounded-2xl shadow-2xl border border-purple-600 text-white max-w-lg w-full">
        <h1 className="font-bangers text-6xl md:text-7xl text-center text-yellow-300 drop-shadow-[0_4px_2px_rgba(0,0,0,0.5)]">
          Flappy Meme
        </h1>
        <p className="text-center text-gray-300 mt-2 mb-6">
          Create your own parody game. Upload assets and select a difficulty!
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <FileInput label="Your Character" accept={imageAcceptTypes} file={characterFile} onChange={setCharacterFile} />
          <FileInput label="Jump Sound" accept={audioAcceptTypes} file={jumpSoundFile} onChange={setJumpSoundFile} />
          <FileInput label="Death Sound" accept={audioAcceptTypes} file={deathSoundFile} onChange={setDeathSoundFile} />
          
          <p className="text-center text-sm text-gray-400 !mt-2">
            Need sounds?{' '}
            <a href="https://www.myinstants.com/en/search/" target="_blank" rel="noopener noreferrer" className="text-purple-400 hover:underline">
              Click to get meme sounds
            </a>
          </p>

          <div className="flex justify-center space-x-2 my-2 !mt-4">
            {(['easy', 'medium', 'hard'] as Difficulty[]).map(d => (
                <button
                    key={d}
                    type="button"
                    onClick={() => setDifficulty(d)}
                    className={`px-4 py-2 rounded-lg font-bold transition-all text-lg capitalize w-full ${
                        difficulty === d 
                        ? 'bg-purple-600 text-white shadow-lg scale-105' 
                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    }`}
                >
                    {d}
                </button>
            ))}
          </div>
          
          <div className="pt-2">
            <button
              type="submit"
              disabled={!canStart || isStarting}
              className="w-full font-bangers text-4xl p-3 rounded-lg transition-all duration-300 ease-in-out
                         disabled:bg-gray-600 disabled:text-gray-400 disabled:cursor-not-allowed
                         bg-green-500 text-white hover:bg-green-400 hover:scale-105 shadow-lg
                         transform active:scale-95 flex items-center justify-center"
            >
              {isStarting ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-8 w-8 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Starting...
                </>
              ) : 'Start Game'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default StartScreen;