import React from 'react';
import { TEMPLATES } from '../constants/templates';
import { TemplateId } from '../types';
import { sounds } from '../utils/soundEffects';

interface TemplateSelectorProps {
  selectedTemplate: TemplateId;
  onSelectTemplate: (templateId: TemplateId) => void;
}

export const TemplateSelector: React.FC<TemplateSelectorProps> = ({
  selectedTemplate,
  onSelectTemplate
}) => {
  return (
    <div className="glass-panel" style={{ padding: '1.25rem' }}>
      <div className="section-header">
        <h2 className="section-title">
          <span>🎨</span>
          <span>Select Design Style</span>
        </h2>
        <span className="section-badge">{TEMPLATES.length} Styles</span>
      </div>

      <div className="template-grid">
        {TEMPLATES.map((tmpl) => {
          const isActive = tmpl.id === selectedTemplate;
          return (
            <button
              key={tmpl.id}
              className={`template-card-btn ${isActive ? 'active' : ''}`}
              onClick={() => {
                sounds.playPop();
                onSelectTemplate(tmpl.id);
              }}
              type="button"
            >
              <span className="format-tag">{tmpl.aspectRatio}</span>
              <div
                className="template-thumb-icon"
                style={{
                  background: isActive ? 'rgba(243, 219, 71, 0.2)' : 'rgba(255, 255, 255, 0.05)',
                  border: `1px solid ${isActive ? '#f3db47' : 'rgba(255, 255, 255, 0.1)'}`
                }}
              >
                {tmpl.icon}
              </div>
              <span className="template-title">{tmpl.name}</span>
              <span className="template-sub">{tmpl.subtitle}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
