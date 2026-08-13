export type TemplateId = 
  | 'hacker-desk'
  | 'beach-shack'
  | 'bamboo-vip'
  | 'notice-board'
  | 'villa-coders'
  | 'palm-lanyard'
  | 'pfp-frame';

export type BadgeSticker =
  | 'goa-verified'
  | 'coffee-fueled'
  | 'coconut-water'
  | 'ship-it'
  | 'triangle-day'
  | 'beach-chill';

export type PhotoFilter = 'normal' | 'tropical' | 'cyber' | 'vintage' | 'bw';

export interface TemplateConfig {
  id: TemplateId;
  name: string;
  subtitle: string;
  aspectRatio: '4:5' | '16:9' | '1:1';
  width: number;
  height: number;
  formatType: 'A' | 'B';
  icon: string;
  themeColor: string;
}

export interface BuilderData {
  name: string;
  role: string;
  quote: string;
  handle?: string;
  location?: string;
  badgeNumber: string;
  customId?: string;
  prereq?: string;
  track?: string;
  stickers?: BadgeSticker[];
  filter?: PhotoFilter;
}

export interface PhotoTransform {
  zoom: number;       // 0.5 to 3.0 (default 1.0)
  offsetX: number;    // -200 to 200
  offsetY: number;    // -200 to 200
  rotation: number;   // 0, 90, 180, 270 degrees
  flipH: boolean;
}

export interface SampleAvatar {
  id: string;
  name: string;
  role: string;
  quote: string;
  url: string;
}
