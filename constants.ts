import { GameSettings } from './types';

export const DIFFICULTY_SETTINGS = {
  easy: { pipeSpeed: 3.5, pipeGap: 250 },
  medium: { pipeSpeed: 4.5, pipeGap: 220 },
  hard: { pipeSpeed: 5.5, pipeGap: 200 },
};

export const INITIAL_SETTINGS: GameSettings = {
  gravity: 0.30,
  jumpForce: -6.0,
  ...DIFFICULTY_SETTINGS.medium,
  memeBackground: true,
};

export const CHARACTER_SIZE = 80;
export const PIPE_WIDTH = 100;
export const GROUND_HEIGHT = 80;
export const PIPE_SPAWN_INTERVAL = 1800; // in milliseconds
