import { SimulationParams } from "./types";

export const DEFAULT_PARAMS: SimulationParams = {
  separation: 1.8,
  alignment: 1.2,
  cohesion: 1.0,
  speed: 3.5,
  perceptionRadius: 60,
  particleCount: 600, // Balanced for performance and visual density
  trailLength: 0.15, // Lower is longer trails (opacity of clear rect)
};

export const COLORS = {
  background: "#020617", // slate-950
  particle: "100, 255, 218", // Cyan-ish teal for high contrast glow
  secondary: "148, 163, 184", // slate-400
  accent: "56, 189, 248", // sky-400
};