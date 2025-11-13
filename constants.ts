
import { GameSettings } from './types';

export const INITIAL_SETTINGS: GameSettings = {
  gravity: 0.30,
  jumpForce: -6.0,
  pipeSpeed: 3,
  memeBackground: true,
  scoreVoiceLines: true,
};

export const CHARACTER_SIZE = 80;
export const PIPE_WIDTH = 100;
export const GROUND_HEIGHT = 80;
export const PIPE_SPAWN_INTERVAL = 1400; // in milliseconds

export const GAPS = {
    easy: 250,
    medium: 220,
    hard: 200,
};

export const VOICE_LINES = [
    "PRO MAX GAMER!",
    "He's cooking!",
    "EZ clap!",
    "UNSTOPPABLE!",
    "GOATed!",
];
   