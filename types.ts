
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
  value: string | string[];
}

export interface SlideData {
  id: SlideType;
  title: string;
  subtitle: string;
  description?: string;
  // Optional specific fields for structured slides
  person?: string;
  details?: SlideContentBlock[];
}
