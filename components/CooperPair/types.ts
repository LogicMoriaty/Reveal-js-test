
export interface Vector2 {
  x: number;
  y: number;
}

export interface Particle {
  id: number;
  pos: Vector2;
  vel: Vector2;
  acc: Vector2;
  pairId: number | null;
  colorOffset: number;
  mass: number;
}

export interface SimulationConfig {
  particleCount: number;
  temperature: number;
  couplingRange: number;
  couplingStrength: number;
  friction: number;
}
