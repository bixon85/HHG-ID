import React from 'react';
import { Volume2, VolumeX, Sparkles, ExternalLink } from 'lucide-react';
import { sounds } from '../utils/soundEffects';

interface NavbarProps {
  soundEnabled: boolean;
  onToggleSound: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ soundEnabled, onToggleSound }) => {
  return (
    <header className="header-nav glass-panel">
      <div className="brand-logo-wrap">
        <div className="brand-logo-icon">
          <span style={{ fontSize: '1.4rem' }}>🌴</span>
        </div>
        <div className="brand-title-group">
          <div className="brand-title-main">
            <span>HACKER</span>
            <span className="brand-title-hindi">गोवा</span>
            <span>HOUSE</span>
          </div>
          <span className="brand-subtitle">BUILDER ID & FRAME GENERATOR • 2026</span>
        </div>
      </div>

      <div className="nav-badges">
        <div className="event-date-pill">
          <span className="pulsing-dot"></span>
          <span>28-31 OCT 2026 • GOA</span>
        </div>

        <button
          className="btn-icon-sm"
          onClick={onToggleSound}
          title={soundEnabled ? 'Mute Sound Effects' : 'Enable Sound Effects'}
          style={{ padding: '0.45rem 0.65rem' }}
        >
          {soundEnabled ? <Volume2 size={16} color="#f3db47" /> : <VolumeX size={16} color="#888" />}
        </button>

        <a
          href="https://twitter.com/intent/tweet?hashtags=FrameInGoa,HackerHouseGoa&text=Building%20at%20Hacker%20House%20Goa%202026!%20%F0%9F%8C%B4%E2%9A%A1"
          target="_blank"
          rel="noopener noreferrer"
          className="btn-icon-sm"
          title="Official Hashtag #FrameInGoa"
          style={{ textDecoration: 'none', color: '#ff2a85', fontWeight: 'bold', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '4px' }}
        >
          <span>#FrameInGoa</span>
          <ExternalLink size={12} />
        </a>
      </div>
    </header>
  );
};
