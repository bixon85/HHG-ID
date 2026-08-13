import React, { useState } from 'react';
import { Dices, Sparkles, Hash, User, Briefcase, MessageSquare, Tag } from 'lucide-react';
import { BuilderData, BadgeSticker } from '../types';
import { POPULAR_ROLES, POPULAR_TRACKS, STICKER_OPTIONS, getRandomQuote, generateRandomBuilderId } from '../constants/quotes';
import { sounds } from '../utils/soundEffects';

interface BuilderFormProps {
  builder: BuilderData;
  onChange: (updated: Partial<BuilderData>) => void;
  isPfpOnly?: boolean;
}

export const BuilderForm: React.FC<BuilderFormProps> = ({
  builder,
  onChange,
  isPfpOnly = false
}) => {
  const [isRolling, setIsRolling] = useState(false);

  const handleRandomQuote = () => {
    sounds.playPop();
    setIsRolling(true);
    setTimeout(() => setIsRolling(false), 600);

    const newQuote = getRandomQuote();
    onChange({ quote: newQuote });
  };

  const handleRoleSelect = (role: string) => {
    sounds.playPop();
    onChange({ role });
  };

  const handleToggleSticker = (stickerId: BadgeSticker) => {
    sounds.playPop();
    const current = builder.stickers || [];
    if (current.includes(stickerId)) {
      onChange({ stickers: current.filter((s) => s !== stickerId) });
    } else {
      onChange({ stickers: [stickerId] }); // Set active sticker
    }
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newName = e.target.value;
    const newBadgeId = generateRandomBuilderId(newName);
    onChange({ name: newName, badgeNumber: newBadgeId });
  };

  return (
    <div className="glass-panel" style={{ padding: '1.25rem' }}>
      <div className="section-header">
        <h2 className="section-title">
          <span>⚡</span>
          <span>{isPfpOnly ? 'Profile Details' : 'Builder Badge Credentials'}</span>
        </h2>
        <span className="section-badge">Live Sync</span>
      </div>

      {/* Name Field */}
      <div className="form-group">
        <label className="form-label" htmlFor="builder-name">
          <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <User size={14} color="#f3db47" />
            <span>Builder Name</span>
          </span>
          <span style={{ fontSize: '0.7rem', color: '#ff2a85', fontWeight: 600 }}>REQUIRED</span>
        </label>
        <input
          id="builder-name"
          type="text"
          value={builder.name}
          onChange={handleNameChange}
          placeholder="e.g. Koushik S or Satoshi"
          className="form-input"
          maxLength={35}
        />
      </div>

      {/* Role / Stack Field */}
      <div className="form-group">
        <label className="form-label" htmlFor="builder-role">
          <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <Briefcase size={14} color="#f3db47" />
            <span>Role / Tech Stack</span>
          </span>
        </label>
        <input
          id="builder-role"
          type="text"
          value={builder.role}
          onChange={(e) => onChange({ role: e.target.value })}
          placeholder="e.g. Solana Smart Contract Eng"
          className="form-input"
          maxLength={40}
        />

        {/* Quick Role Preset Chips */}
        <div className="role-chips-wrap">
          {POPULAR_ROLES.slice(0, 8).map((role) => {
            const isSelected = builder.role.toUpperCase() === role;
            return (
              <button
                key={role}
                type="button"
                className={`role-chip ${isSelected ? 'active' : ''}`}
                onClick={() => handleRoleSelect(role)}
              >
                {role}
              </button>
            );
          })}
        </div>
      </div>

      {/* Fun Sticker Badges (Creative Add-on) */}
      {!isPfpOnly && (
        <div className="form-group">
          <label className="form-label">
            <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              <Tag size={14} color="#f3db47" />
              <span>Event Stamp / Sticker Badge</span>
            </span>
          </label>
          <div className="role-chips-wrap">
            {STICKER_OPTIONS.map((stk) => {
              const isSelected = (builder.stickers || []).includes(stk.id as BadgeSticker);
              return (
                <button
                  key={stk.id}
                  type="button"
                  className={`role-chip ${isSelected ? 'active' : ''}`}
                  onClick={() => handleToggleSticker(stk.id as BadgeSticker)}
                  style={{
                    borderColor: isSelected ? stk.color : undefined,
                    color: isSelected ? stk.color : undefined
                  }}
                >
                  <span>{stk.emoji}</span>
                  <span>{stk.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Hackathon Track / Specialty */}
      {!isPfpOnly && (
        <div className="form-group">
          <label className="form-label" htmlFor="builder-track">
            <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              <Sparkles size={14} color="#f3db47" />
              <span>Hackathon Track / Specialty</span>
            </span>
          </label>
          <input
            id="builder-track"
            type="text"
            value={builder.track || 'AI AGENTS & DEPIN'}
            onChange={(e) => onChange({ track: e.target.value })}
            placeholder="e.g. AI AGENTS & DEPIN or SOLANA DEFI"
            className="form-input"
            maxLength={45}
          />
          {/* Quick Track Chips */}
          <div className="role-chips-wrap">
            {POPULAR_TRACKS.map((trk) => {
              const isSelected = (builder.track || '').toUpperCase() === trk;
              return (
                <button
                  key={trk}
                  type="button"
                  className={`role-chip ${isSelected ? 'active' : ''}`}
                  onClick={() => {
                    sounds.playPop();
                    onChange({ track: trk });
                  }}
                >
                  {trk}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Builder Punchline / Fun Quote */}
      {!isPfpOnly && (
        <div className="form-group">
          <label className="form-label" htmlFor="builder-quote">
            <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              <MessageSquare size={14} color="#f3db47" />
              <span>Builder Title / Quirk</span>
            </span>
          </label>
          <div className="quote-input-wrap">
            <input
              id="builder-quote"
              type="text"
              value={builder.quote}
              onChange={(e) => onChange({ quote: e.target.value })}
              placeholder="e.g. Documentation Sensei or Caffeine Powered"
              className="form-input"
              maxLength={60}
            />
            <button
              type="button"
              className="btn-randomize"
              onClick={handleRandomQuote}
              title="Generate a random hilarious builder quote"
            >
              <Dices size={18} className={`dice-icon ${isRolling ? 'rolling' : ''}`} />
              <span>Random</span>
            </button>
          </div>
        </div>
      )}

      {/* Builder Badge ID / Hash */}
      {!isPfpOnly && (
        <div className="form-group" style={{ marginBottom: 0 }}>
          <label className="form-label" htmlFor="builder-badge-id">
            <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              <Hash size={14} color="#f3db47" />
              <span>Badge Verification Code</span>
            </span>
          </label>
          <input
            id="builder-badge-id"
            type="text"
            value={builder.badgeNumber}
            onChange={(e) => onChange({ badgeNumber: e.target.value.toUpperCase() })}
            className="form-input font-mono"
            style={{ letterSpacing: '1px', fontSize: '0.85rem' }}
          />
        </div>
      )}
    </div>
  );
};

