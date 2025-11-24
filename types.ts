
import type { ReactNode } from 'react';

export enum SlideType {
  COVER = 'COVER',
  TOC = 'TOC',
  CONCEPTS = 'CONCEPTS',
  NEWTON = 'NEWTON',
  EINSTEIN = 'EINSTEIN',
  QUANTUM = 'QUANTUM',
  ANDERSON = 'ANDERSON',
  SUMMARY = 'SUMMARY',
  ENDING = 'ENDING'
}

export interface SlideContentBlock {
  label: string;
  value: string | string[] | ReactNode;
  pptValue?: string;
}

export interface SlideData {
  id: SlideType;
  title: string;
  subtitle: string;
  description?: string;
  // Optional specific fields for structured slides
  person?: string;
  details?: SlideContentBlock[];
  image?: string;
  imageCaption?: string;
  isChapterTitle?: boolean;
  isInteractive?: boolean;
}

export interface CanvasSize {
  width: number;
  height: number;
}

export interface CelestialBody {
  id: number;
  mass: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  color: string;
  trail: { x: number; y: number }[];
  dashed?: boolean;
  label?: string;
  maxTrailLength?: number;
}

// Augment the global JSX namespace to include React Three Fiber intrinsic elements
declare global {
  namespace JSX {
    interface IntrinsicElements {
      mesh: any;
      planeGeometry: any;
      shaderMaterial: any;
      sphereGeometry: any;
      meshStandardMaterial: any;
      pointLight: any;
      ambientLight: any;
      color: any;
    }
  }
}

// Augment React's JSX namespace for React 18+ compatibility where JSX is under React namespace
declare module 'react' {
  namespace JSX {
    interface IntrinsicElements {
      mesh: any;
      planeGeometry: any;
      shaderMaterial: any;
      sphereGeometry: any;
      meshStandardMaterial: any;
      pointLight: any;
      ambientLight: any;
      color: any;
    }
  }
}
