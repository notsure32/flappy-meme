import React from 'react';
import { GameSettings } from '../types';

interface AdminPanelProps {
  settings: GameSettings;
  setSettings: React.Dispatch<React.SetStateAction<GameSettings>>;
  resetHighScore: () => void;
}

const Slider: React.FC<{ label: string; value: number; min: number; max: number; step: number; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; }> = 
({ label, value, min, max, step, onChange }) => (
  <div className="w-full">
    <label className="block text-sm font-medium text-gray-300">
      {label}: <span className="font-bold text-white">{value.toFixed(2)}</span>
    </label>
    <input
      type="range"
      min={min}
      max={max}
      step={step}
      value={value}
      onChange={onChange}
      className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
    />
  </div>
);

const Toggle: React.FC<{ label: string; checked: boolean; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; }> = 
({ label, checked, onChange }) => (
    <label className="relative inline-flex items-center cursor-pointer">
        <input type="checkbox" checked={checked} onChange={onChange} className="sr-only peer" />
        <div className="w-11 h-6 bg-gray-600 rounded-full peer peer-focus:ring-2 peer-focus:ring-purple-400 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
        <span className="ml-3 text-sm font-medium text-gray-300">{label}</span>
    </label>
);


const AdminPanel: React.FC<AdminPanelProps> = ({ settings, setSettings, resetHighScore }) => {
  const handleSettingChange = (key: keyof GameSettings, value: number | boolean) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="fixed top-4 right-4 w-72 bg-black bg-opacity-60 backdrop-blur-md p-4 rounded-lg shadow-2xl z-50 text-white border border-purple-500">
      <h2 className="font-bangers text-2xl text-center mb-4 text-yellow-300">Admin Panel</h2>
      <div className="space-y-4">
        <Slider 
          label="Gravity"
          value={settings.gravity}
          min={0.1} max={1} step={0.01}
          onChange={(e) => handleSettingChange('gravity', parseFloat(e.target.value))}
        />
        <Slider 
          label="Jump Force"
          value={settings.jumpForce}
          min={-12} max={-3} step={0.1}
          onChange={(e) => handleSettingChange('jumpForce', parseFloat(e.target.value))}
        />
        <Slider 
          label="Pipe Speed"
          value={settings.pipeSpeed}
          min={1} max={10} step={0.1}
          onChange={(e) => handleSettingChange('pipeSpeed', parseFloat(e.target.value))}
        />

        <div className="border-t border-gray-600 my-4"></div>

        <Toggle
            label="Meme Background"
            checked={settings.memeBackground}
            onChange={(e) => handleSettingChange('memeBackground', e.target.checked)}
        />
       
        <div className="border-t border-gray-600 my-4"></div>

        <button
          onClick={resetHighScore}
          className="w-full p-2 bg-red-600 hover:bg-red-500 rounded-lg text-white font-bold transition-colors"
        >
          Reset High Score
        </button>
        <p className="text-xs text-center text-gray-400">Press 'O' to toggle, 'ESC' to close.</p>
      </div>
    </div>
  );
};

export default AdminPanel;
