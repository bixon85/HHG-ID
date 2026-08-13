import React, { useState } from 'react';
import { Eye, Share2, Copy, Check, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';
import { BuilderData, TemplateConfig } from '../types';
import { copyCanvasToClipboard, shareViaNativeOrX } from '../utils/shareHelper';
import { sounds } from '../utils/soundEffects';
import { HDPreviewModal } from './HDPreviewModal';
import { ShareToXModal } from './ShareToXModal';

interface ActionToolbarProps {
  canvas: HTMLCanvasElement | null;
  builder: BuilderData;
  template: TemplateConfig;
  onShowToast: (message: string, type?: 'success' | 'info' | 'error') => void;
}

export const ActionToolbar: React.FC<ActionToolbarProps> = ({
  canvas,
  builder,
  template,
  onShowToast
}) => {
  const [copied, setCopied] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isShareToXOpen, setIsShareToXOpen] = useState(false);

  const fireConfetti = () => {
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.65 },
        colors: ['#ff2a85', '#f3db47', '#00e5a3', '#00f0ff', '#ffffff']
      });
    } catch {
      // Ignore
    }
  };

  const handleOpenFullHD = () => {
    sounds.playPop();
    setIsModalOpen(true);
  };

  const handleCopyClipboard = async () => {
    if (!canvas) return;
    sounds.playPop();
    const success = await copyCanvasToClipboard(canvas);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
      onShowToast('📋 Image copied to clipboard! Paste directly into X or Discord.', 'success');
    } else {
      onShowToast('Clipboard copy not supported by your browser.', 'info');
    }
  };

  const handleShareToXClick = async () => {
    sounds.playPop();
    if (canvas) {
      await copyCanvasToClipboard(canvas);
    }
    setIsShareToXOpen(true);
  };

  const handleNativeShare = async () => {
    if (!canvas) return;
    sounds.playPop();
    fireConfetti();
    const result = await shareViaNativeOrX(canvas, builder, template.name);
    if (result === 'native_shared') {
      onShowToast('🚀 Shared via device share menu!', 'success');
    } else {
      setIsShareToXOpen(true);
    }
  };

  return (
    <>
      <div className="actions-toolbar">
        {/* Primary Action Buttons */}
        <div className="actions-primary-row">
          <button
            type="button"
            className="btn-action-primary"
            onClick={handleOpenFullHD}
            title="Open crisp Full HD badge viewer & download"
          >
            <Eye size={18} />
            <span>Open in Full HD</span>
          </button>

          <button
            type="button"
            className="btn-action-x"
            onClick={handleShareToXClick}
            title="Post to X / Twitter with pre-filled caption & attached badge"
          >
            <span style={{ fontSize: '1.1rem', fontWeight: 900 }}>𝕏</span>
            <span>Share on X</span>
          </button>
        </div>

        {/* Secondary Actions */}
        <div className="actions-secondary-row">
          <button
            type="button"
            className="btn-action-secondary"
            onClick={handleCopyClipboard}
            title="Copy image directly to clipboard to paste into tweets"
          >
            {copied ? <Check size={14} color="#00e5a3" /> : <Copy size={14} />}
            <span>{copied ? 'Copied!' : 'Copy Image'}</span>
          </button>

          <button
            type="button"
            className="btn-action-secondary"
            onClick={handleNativeShare}
            title="Share image via Mobile Share Menu"
          >
            <Share2 size={14} />
            <span>Mobile Share</span>
          </button>
        </div>
      </div>

      {/* HD Preview & Export Modal */}
      <HDPreviewModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        canvas={canvas}
        builder={builder}
        template={template}
        onShowToast={onShowToast}
      />

      {/* Share on X Interactive Guide Modal */}
      <ShareToXModal
        isOpen={isShareToXOpen}
        onClose={() => setIsShareToXOpen(false)}
        canvas={canvas}
        builder={builder}
        template={template}
        onShowToast={onShowToast}
      />
    </>
  );
};
