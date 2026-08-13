import React, { useState, useCallback, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { TemplateSelector } from './components/TemplateSelector';
import { PhotoUploader } from './components/PhotoUploader';
import { BuilderForm } from './components/BuilderForm';
import { CanvasPreview } from './components/CanvasPreview';
import { ActionToolbar } from './components/ActionToolbar';
import { Toast, ToastMessage } from './components/Toast';
import { BuilderData, PhotoTransform, SampleAvatar, TemplateId } from './types';
import { TEMPLATES } from './constants/templates';
import { SAMPLE_AVATARS } from './constants/samplePhotos';
import { generateRandomBuilderId, getRandomQuote } from './constants/quotes';
import { sounds } from './utils/soundEffects';

export const App: React.FC = () => {
  // Sound effect state
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Template selection (Default: Hacker Desk Pass)
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateId>('hacker-desk');

  // User photo & transform
  const [userImageSrc, setUserImageSrc] = useState<string | null>(SAMPLE_AVATARS[0].url);
  const [transform, setTransform] = useState<PhotoTransform>({
    zoom: 1.0,
    offsetX: 0,
    offsetY: 0,
    rotation: 0,
    flipH: false
  });

  // Builder credentials
  const [builder, setBuilder] = useState<BuilderData>({
    name: 'Koushik S',
    role: 'Full Stack Dev',
    quote: 'Documentation Sensei',
    handle: '@koushiks',
    location: 'Goa, India',
    badgeNumber: 'BLD-GOA26-KS-8FA9',
    customId: '8FA9',
    prereq: 'Voice-Enabled RAG (#4FA)',
    track: 'AI AGENTS & DEPIN',
    stickers: ['goa-verified']
  });

  // Active rendered canvas reference
  const [activeCanvas, setActiveCanvas] = useState<HTMLCanvasElement | null>(null);

  // Toast notifications
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const showToast = useCallback((message: string, type: 'success' | 'info' | 'error' = 'success') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3500);
  }, []);

  const handleToggleSound = () => {
    sounds.enabled = !soundEnabled;
    setSoundEnabled(!soundEnabled);
  };

  const handleSelectSampleAvatar = (avatar: SampleAvatar) => {
    setUserImageSrc(avatar.url);
    const newBadge = generateRandomBuilderId(avatar.name);
    setBuilder((prev) => ({
      ...prev,
      name: avatar.name,
      role: avatar.role,
      quote: avatar.quote,
      badgeNumber: newBadge
    }));
    setTransform({
      zoom: 1.0,
      offsetX: 0,
      offsetY: 0,
      rotation: 0,
      flipH: false
    });
    showToast(`Loaded ${avatar.name}'s demo badge!`, 'info');
  };

  const handleCanvasReady = useCallback((canvas: HTMLCanvasElement) => {
    setActiveCanvas(canvas);
  }, []);

  const activeTemplateConfig =
    TEMPLATES.find((t) => t.id === selectedTemplate) || TEMPLATES[0];

  return (
    <div className="app-container">
      {/* Navigation Header */}
      <Navbar soundEnabled={soundEnabled} onToggleSound={handleToggleSound} />

      {/* Main Grid Layout */}
      <main className="main-builder-layout">
        {/* Left Column: Creator Controls */}
        <div className="controls-column">
          {/* 1. Template Chooser */}
          <TemplateSelector
            selectedTemplate={selectedTemplate}
            onSelectTemplate={setSelectedTemplate}
          />

          {/* 2. Photo Uploader with HEIC & Transforms */}
          <PhotoUploader
            userImageSrc={userImageSrc}
            onImageChange={setUserImageSrc}
            transform={transform}
            onTransformChange={setTransform}
            onSelectSampleAvatar={handleSelectSampleAvatar}
            filter={builder.filter || 'normal'}
            onFilterChange={(filter) => setBuilder((prev) => ({ ...prev, filter }))}
          />

          {/* 3. Builder Credentials & Quotes */}
          <BuilderForm
            builder={builder}
            onChange={(updated) => setBuilder((prev) => ({ ...prev, ...updated }))}
            isPfpOnly={selectedTemplate === 'pfp-frame'}
          />
        </div>

        {/* Right Column: Live HD Preview & Action Toolbar */}
        <div className="preview-column">
          <CanvasPreview
            templateId={selectedTemplate}
            userImageSrc={userImageSrc}
            builder={builder}
            transform={transform}
            onCanvasReady={handleCanvasReady}
          />

          {/* Action Toolbar */}
          <ActionToolbar
            canvas={activeCanvas}
            builder={builder}
            template={activeTemplateConfig}
            onShowToast={showToast}
          />
        </div>
      </main>

      {/* Footer */}
      <footer className="app-footer">
        <div>
          <span>🌴 Official <strong>Hacker House Goa 2026</strong> Builder Tool</span>
          <span style={{ margin: '0 0.5rem' }}>•</span>
          <span style={{ color: 'var(--hh-pink-neon)' }}>#FrameInGoa</span>
        </div>
        <div className="footer-links">
          <a
            href="https://twitter.com/intent/tweet?hashtags=FrameInGoa,HackerHouseGoa&text=Ready%20to%20hack%20in%20Goa!%20%F0%9F%8C%B4"
            target="_blank"
            rel="noopener noreferrer"
            className="footer-link"
          >
            Post on X
          </a>
          <a
            href="https://forms.gle/jM5hTaGvsrfEfixPA"
            target="_blank"
            rel="noopener noreferrer"
            className="footer-link"
            style={{ color: 'var(--hh-gold-primary)' }}
          >
            Submit Entry ↗
          </a>
        </div>
      </footer>

      {/* Toast Notifications */}
      <Toast toasts={toasts} />
    </div>
  );
};

export default App;
