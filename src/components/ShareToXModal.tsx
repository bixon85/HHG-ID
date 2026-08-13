import React, { useState, useEffect } from 'react';
import { X, Copy, Check, ExternalLink, Download, Image as ImageIcon } from 'lucide-react';
import confetti from 'canvas-confetti';
import { BuilderData, TemplateConfig } from '../types';
import { copyCanvasToClipboard, generateTweetUrl, saveCanvasToFile } from '../utils/shareHelper';
import { sounds } from '../utils/soundEffects';

interface ShareToXModalProps {
  isOpen: boolean;
  onClose: () => void;
  canvas: HTMLCanvasElement | null;
  builder: BuilderData;
  template: TemplateConfig;
  onShowToast: (message: string, type?: 'success' | 'info' | 'error') => void;
}

export const ShareToXModal: React.FC<ShareToXModalProps> = ({
  isOpen,
  onClose,
  canvas,
  builder,
  template,
  onShowToast
}) => {
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string>('');
  const [copied, setCopied] = useState(false);

  const cleanName = (builder.name.trim() || 'Builder').replace(/[^a-zA-Z0-9_-]/g, '_');
  const pngFileName = `HH_Goa_2026_${cleanName}_ID.png`;
  const jpgFileName = `HH_Goa_2026_${cleanName}_ID.jpg`;

  useEffect(() => {
    if (isOpen && canvas) {
      try {
        setImagePreviewUrl(canvas.toDataURL('image/png', 1.0));
      } catch (e) {
        console.error(e);
      }
    }
  }, [isOpen, canvas, builder, template]);

  if (!isOpen) return null;

  const handleCopy = async () => {
    if (!canvas) return;
    sounds.playPop();
    const success = await copyCanvasToClipboard(canvas);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
      onShowToast('📋 Badge copied to clipboard! Paste with Ctrl+V on X.', 'success');
    }
  };

  const handleDownload = (format: 'png' | 'jpg') => {
    if (!canvas) return;
    sounds.playShutter();
    const targetFileName = format === 'jpg' ? jpgFileName : pngFileName;
    saveCanvasToFile(canvas, targetFileName, format);
    onShowToast(`🎉 ${format.toUpperCase()} Badge downloaded!`, 'success');
  };

  const handleOpenX = async () => {
    sounds.playPop();
    try {
      confetti({
        particleCount: 60,
        spread: 60,
        origin: { y: 0.6 }
      });
    } catch {
      // Ignore
    }

    if (canvas) {
      await copyCanvasToClipboard(canvas);
    }

    const tweetUrl = generateTweetUrl(builder, template.name);
    window.open(tweetUrl, '_blank', 'noopener,noreferrer');
    onShowToast('🐦 X opened! Press Ctrl+V to paste your badge image.', 'success');
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(2, 10, 6, 0.88)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        zIndex: 99999,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1.25rem',
        boxSizing: 'border-box',
        animation: 'fadeIn 0.2s ease-out'
      }}
      onClick={onClose}
    >
      <div
        style={{
          position: 'relative',
          maxWidth: '520px',
          width: '100%',
          backgroundColor: '#072417',
          border: '2px solid rgba(0, 229, 163, 0.4)',
          boxShadow: '0 25px 60px rgba(0,0,0,0.85), 0 0 35px rgba(0, 229, 163, 0.2)',
          borderRadius: '20px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          padding: '1.5rem',
          boxSizing: 'border-box',
          overflowY: 'auto',
          maxHeight: '94vh'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '1rem',
            paddingBottom: '0.75rem',
            borderBottom: '1px solid rgba(0, 229, 163, 0.2)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '1.3rem' }}>𝕏</span>
            <div>
              <h2
                style={{
                  margin: 0,
                  fontSize: '1.15rem',
                  fontFamily: 'var(--font-cyber)',
                  color: '#f3db47',
                  letterSpacing: '0.05em'
                }}
              >
                SHARE BADGE ON X
              </h2>
              <p style={{ margin: 0, fontSize: '0.75rem', color: '#00e5a3' }}>
                Hacker House Goa 2026
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            style={{
              background: 'rgba(255, 42, 133, 0.15)',
              border: '1px solid rgba(255, 42, 133, 0.4)',
              color: '#ff2a85',
              borderRadius: '50%',
              width: '34px',
              height: '34px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
            title="Close"
          >
            <X size={18} />
          </button>
        </div>

        {/* Badge Preview Thumbnail */}
        <div
          style={{
            width: '100%',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            marginBottom: '1rem',
            background: 'rgba(0, 0, 0, 0.35)',
            borderRadius: '12px',
            padding: '10px',
            boxSizing: 'border-box'
          }}
        >
          {imagePreviewUrl ? (
            <img
              src={imagePreviewUrl}
              alt="Badge Preview"
              style={{
                maxHeight: '170px',
                borderRadius: '8px',
                boxShadow: '0 8px 24px rgba(0,0,0,0.6)',
                border: '1px solid rgba(0, 229, 163, 0.3)'
              }}
            />
          ) : null}
        </div>

        {/* Single Informative Instruction Box */}
        <div
          style={{
            width: '100%',
            background: 'rgba(0, 229, 163, 0.08)',
            border: '1px solid rgba(0, 229, 163, 0.25)',
            borderRadius: '10px',
            padding: '0.75rem 1rem',
            marginBottom: '1.25rem',
            boxSizing: 'border-box'
          }}
        >
          <p style={{ margin: 0, color: '#e0f8ee', fontSize: '0.85rem', lineHeight: '1.45', textAlign: 'center' }}>
            📋 <strong>Badge image copied to clipboard!</strong> Click below to open X composer, then press <strong style={{ color: '#f3db47' }}>Ctrl + V</strong> (or Paste) to attach your badge.
          </p>
        </div>

        {/* Action Buttons */}
        <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {/* Main Hero Share Button */}
          <button
            type="button"
            onClick={handleOpenX}
            style={{
              width: '100%',
              background: '#000000',
              border: '2px solid rgba(255, 255, 255, 0.4)',
              color: '#ffffff',
              fontWeight: 800,
              fontSize: '1rem',
              fontFamily: 'var(--font-cyber)',
              padding: '0.85rem 1rem',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              cursor: 'pointer',
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.6)',
              transition: 'all 0.15s ease'
            }}
          >
            <span style={{ fontSize: '1.2rem', fontWeight: 900 }}>𝕏</span>
            <span>Share on X</span>
            <ExternalLink size={16} />
          </button>

          {/* Quick Actions: Download PNG, Download JPG, Copy Image */}
          <div style={{ width: '100%', display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px' }}>
            <button
              type="button"
              onClick={() => handleDownload('png')}
              style={{
                background: 'linear-gradient(135deg, rgba(243, 219, 71, 0.2), rgba(243, 219, 71, 0.1))',
                border: '1px solid #f3db47',
                color: '#f3db47',
                fontWeight: 700,
                fontSize: '0.8rem',
                padding: '0.65rem 0.5rem',
                borderRadius: '10px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '5px',
                cursor: 'pointer'
              }}
            >
              <Download size={14} />
              <span>PNG</span>
            </button>

            <button
              type="button"
              onClick={() => handleDownload('jpg')}
              style={{
                background: 'rgba(0, 229, 163, 0.15)',
                border: '1px solid #00e5a3',
                color: '#00e5a3',
                fontWeight: 700,
                fontSize: '0.8rem',
                padding: '0.65rem 0.5rem',
                borderRadius: '10px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '5px',
                cursor: 'pointer'
              }}
            >
              <ImageIcon size={14} />
              <span>JPG</span>
            </button>

            <button
              type="button"
              onClick={handleCopy}
              style={{
                background: 'rgba(255, 255, 255, 0.08)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                color: '#ffffff',
                fontWeight: 700,
                fontSize: '0.8rem',
                padding: '0.65rem 0.5rem',
                borderRadius: '10px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '5px',
                cursor: 'pointer'
              }}
            >
              {copied ? <Check size={14} color="#00e5a3" /> : <Copy size={14} />}
              <span>{copied ? 'Copied!' : 'Copy'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
