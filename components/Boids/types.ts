export interface Vector2D {
  x: number;
  y: number;
}

export interface Boid {
  id: number;
  position: Vector2D;
  velocity: Vector2D;
  acceleration: Vector2D;
}

export interface SimulationParams {
  separation: number;
  alignment: number;
  cohesion: number;
  speed: number;
  perceptionRadius: number;
  particleCount: number;
  trailLength: number;
}