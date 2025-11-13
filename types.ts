
export interface GameSettings {
  gravity: number;
  jumpForce: number;
  pipeSpeed: number;
  memeBackground: boolean;
  scoreVoiceLines: boolean;
}

export interface Pipe {
  id: number;
  x: number;
  gapY: number;
  gap: number;
  passed: boolean;
}

export interface Particle {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  alpha: number;
}
   