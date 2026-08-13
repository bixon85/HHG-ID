export const BUILDER_QUOTES: string[] = [
  "Touches grass less than the server",
  "Ships directly to prod on Friday evening",
  "Converting coconut water into smart contracts",
  "Solana speed, Goa chill",
  "Proof of Work? More like Proof of Chill",
  "100x Engineer fueled by beachside chai",
  "Here for the hack, stayed for the sunset",
  "Running on 99.99% caffeine and Goan breeze",
  "git push --force and let the waves decide",
  "Smart contracts, sharper tan lines",
  "Debugging with an ocean view",
  "Writing zero-knowledge proofs under the palms",
  "Sleep is deprecated in Goa",
  "Web3 architect with sand in my keyboard",
  "Building the decentralized future from the beach",
  "404: Burnout not found in Goa",
  "My code compiles when the sun sets",
  "Decentralized by design, Goan by vibe"
];

export const POPULAR_ROLES: string[] = [
  "FULL STACK DEVELOPER",
  "SOLANA DEVELOPER",
  "SMART CONTRACT DEV",
  "AI / ML RESEARCHER",
  "UI / UX DESIGNER",
  "FOUNDER & BUILDER",
  "PRODUCT MANAGER",
  "FRONTEND WIZARD",
  "DEVOPS / INFRA",
  "CORE CONTRIBUTOR",
  "COMMUNITY LEAD",
  "BUILDER ATTENDEE"
];

export const POPULAR_TRACKS: string[] = [
  "AI AGENTS & DEPIN",
  "SOLANA DEFI & PAYMENTS",
  "WEB3 CONSUMER APPS",
  "ZERO-KNOWLEDGE / PRIVACY",
  "GAMING & SOCIALFI",
  "INFRASTRUCTURE & DEV TOOLS"
];

export interface StickerOption {
  id: 'goa-verified' | 'coffee-fueled' | 'coconut-water' | 'ship-it' | 'triangle-day' | 'beach-chill';
  label: string;
  emoji: string;
  color: string;
}

export const STICKER_OPTIONS: StickerOption[] = [
  { id: 'goa-verified', label: 'Goa Verified', emoji: '🌴', color: '#00e5a3' },
  { id: 'coffee-fueled', label: '99% Caffeine', emoji: '☕', color: '#f3db47' },
  { id: 'coconut-water', label: 'Coconut Fuel', emoji: '🥥', color: '#00f0ff' },
  { id: 'ship-it', label: 'Ship to Prod', emoji: '🚀', color: '#ff2a85' },
  { id: 'triangle-day', label: 'Day of Triangle', emoji: '🔺', color: '#ff0055' },
  { id: 'beach-chill', label: 'Beach Chill', emoji: '🏖️', color: '#ffbe0b' }
];

export function getRandomQuote(): string {
  const idx = Math.floor(Math.random() * BUILDER_QUOTES.length);
  return BUILDER_QUOTES[idx];
}

export function generateRandomBuilderId(name: string): string {
  const clean = name.trim().toUpperCase().replace(/[^A-Z]/g, '').slice(0, 2) || 'HH';
  const randHex = Math.floor(Math.random() * 0xffff).toString(16).toUpperCase().padStart(4, '0');
  return `BLD-GOA26-${clean}-${randHex}`;
}
