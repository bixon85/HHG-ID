import React, { useState, useEffect } from 'react';
import { X, Download, Copy, Check, Sparkles, ExternalLink, Image as ImageIcon } from 'lucide-react';
import confetti from 'canvas-confetti';
import { BuilderData, TemplateConfig } from '../types';
import { copyCanvasToClipboard, saveCanvasToFile } from '../utils/shareHelper';
import { sounds } from '../utils/soundEffects';
import { ShareToXModal } from './ShareToXModal';

interface HDPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  canvas: HTMLCanvasElement | null;
  builder: BuilderData;
  template: TemplateConfig;
  onShowToast: (message: string, type?: 'success' | 'info' | 'error') => void;
}

export const HDPreviewModal: React.FC<HDPreviewModalProps> = ({
  isOpen,
  onClose,
  canvas,
  builder,
  template,
  onShowToast
}) => {
  const [pngDataUrl, setPngDataUrl] = useState<string>('');
  const [jpgDataUrl, setJpgDataUrl] = useState<string>('');
  const [copied, setCopied] = useState(false);
  const [isShareToXOpen, setIsShareToXOpen] = useState(false);

  const cleanName = (builder.name.trim() || 'Builder').replace(/[^a-zA-Z0-9_-]/g, '_');
  const pngFileName = `HH_Goa_2026_${cleanName}_ID.png`;
  const jpgFileName = `HH_Goa_2026_${cleanName}_ID.jpg`;

  useEffect(() => {
    if (isOpen && canvas) {
      try {
        setPngDataUrl(canvas.toDataURL('image/png', 1.0));
        setJpgDataUrl(canvas.toDataURL('image/jpeg', 0.98));
      } catch (err) {
        console.error('Could not generate HD preview data URL:', err);
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
      onShowToast('📋 Image copied to clipboard! Paste directly into X or Discord.', 'success');
    } else {
      onShowToast('Could not copy image automatically.', 'info');
    }
  };

  const handleDownload = (format: 'png' | 'jpg') => {
    if (!canvas) return;
    sounds.playShutter();
    sounds.playSuccess();
    try {
      confetti({
        particleCount: 70,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#ff2a85', '#f3db47', '#00e5a3', '#00f0ff', '#ffffff']
      });
    } catch {
      // Ignore
    }
    const targetFileName = format === 'jpg' ? jpgFileName : pngFileName;
    saveCanvasToFile(canvas, targetFileName, format);
    onShowToast(`🎉 ${format.toUpperCase()} Badge saved!`, 'success');
  };

  const handleShareToX = async () => {
    sounds.playPop();
    if (canvas) {
      await copyCanvasToClipboard(canvas);
    }
    setIsShareToXOpen(true);
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
          maxWidth: '900px',
          width: '100%',
          maxHeight: '94vh',
          backgroundColor: '#072417',
          border: '2px solid rgba(0, 229, 163, 0.4)',
          boxShadow: '0 25px 60px rgba(0,0,0,0.85), 0 0 35px rgba(0, 229, 163, 0.2)',
          borderRadius: '20px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          padding: '1.25rem',
          boxSizing: 'border-box',
          overflowY: 'auto'
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
            <span style={{ fontSize: '1.4rem' }}>🌴</span>
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
                FULL HD BADGE PREVIEW
              </h2>
              <p style={{ margin: 0, fontSize: '0.75rem', color: '#00e5a3' }}>
                {template.width} × {template.height}px • Lossless 4K Render
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
              width: '36px',
              height: '36px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
            title="Close"
          >
            <X size={20} />
          </button>
        </div>

        {/* Image Preview */}
        <div
          style={{
            width: '100%',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            margin: '0.5rem 0 1rem',
            background: 'rgba(0, 0, 0, 0.4)',
            borderRadius: '12px',
            padding: '12px',
            boxSizing: 'border-box'
          }}
        >
          {pngDataUrl ? (
            <img
              src={pngDataUrl}
              alt="Hacker House Goa 2026 Badge"
              style={{
                maxWidth: '100%',
                maxHeight: '52vh',
                objectFit: 'contain',
                borderRadius: '8px',
                boxShadow: '0 10px 30px rgba(0,0,0,0.6)'
              }}
            />
          ) : (
            <div style={{ padding: '2rem', color: '#00e5a3' }}>Generating Full HD image...</div>
          )}
        </div>

        {/* Tip */}
        <div
          style={{
            width: '100%',
            background: 'rgba(0, 229, 163, 0.08)',
            border: '1px solid rgba(0, 229, 163, 0.25)',
            borderRadius: '8px',
            padding: '0.5rem 0.85rem',
            marginBottom: '1rem',
            fontSize: '0.8rem',
            color: '#c4e8d6',
            textAlign: 'center'
          }}
        >
          💡 <strong>Pro-Tip:</strong> Click the buttons below to save, or <em>right-click / long-press</em> the image above and choose <strong>"Save Image As..."</strong>.
        </div>

        {/* Actions inside Modal */}
        <div
          style={{
            width: '100%',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
            gap: '10px'
          }}
        >
          {/* Download PNG */}
          <button
            type="button"
            onClick={() => handleDownload('png')}
            style={{
              background: 'linear-gradient(135deg, #f3db47, #e2c622)',
              color: '#052014',
              fontWeight: 800,
              fontSize: '0.9rem',
              fontFamily: 'var(--font-cyber)',
              padding: '0.75rem 1rem',
              borderRadius: '10px',
              border: 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              cursor: 'pointer',
              boxShadow: '0 4px 15px rgba(243, 219, 71, 0.35)',
              transition: 'transform 0.15s ease'
            }}
          >
            <Download size={18} />
            <span>Download PNG</span>
          </button>

          {/* Download JPG */}
          <button
            type="button"
            onClick={() => handleDownload('jpg')}
            style={{
              background: 'rgba(0, 229, 163, 0.15)',
              border: '1px solid #00e5a3',
              color: '#00e5a3',
              fontWeight: 700,
              fontSize: '0.85rem',
              fontFamily: 'var(--font-cyber)',
              padding: '0.75rem 1rem',
              borderRadius: '10px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              cursor: 'pointer',
              transition: 'all 0.15s ease'
            }}
          >
            <ImageIcon size={16} />
            <span>Download JPG</span>
          </button>

          {/* Copy Image */}
          <button
            type="button"
            onClick={handleCopy}
            style={{
              background: 'rgba(255, 255, 255, 0.08)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              color: '#ffffff',
              fontWeight: 700,
              fontSize: '0.85rem',
              padding: '0.75rem 1rem',
              borderRadius: '10px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              cursor: 'pointer',
              transition: 'all 0.15s ease'
            }}
          >
            {copied ? <Check size={16} color="#00e5a3" /> : <Copy size={16} />}
            <span>{copied ? 'Copied!' : 'Copy Image'}</span>
          </button>

          {/* Open in Tab */}
          <button
            type="button"
            onClick={() => {
              if (pngDataUrl) {
                const win = window.open();
                if (win) {
                  win.document.write(`<!DOCTYPE html><html><head><title>Hacker House Goa 2026 Badge</title><style>body{margin:0;background:#03140b;display:flex;flex-direction:column;justify-content:center;align-items:center;min-height:100vh;font-family:sans-serif;color:#00e5a3;}img{max-width:90vw;max-height:85vh;border-radius:12px;box-shadow:0 20px 50px rgba(0,0,0,0.8);border:2px solid #00e5a3;}p{margin-top:14px;font-size:15px;}</style></head><body><img src="${pngDataUrl}" alt="HH Goa 2026 Badge" /><p>🌴 Right-click or hold on image to Save Image As...</p></body></html>`);
                  win.document.close();
                }
              }
            }}
            style={{
              background: 'rgba(255, 255, 255, 0.08)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              color: '#ffffff',
              fontWeight: 700,
              fontSize: '0.85rem',
              padding: '0.75rem 1rem',
              borderRadius: '10px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              cursor: 'pointer',
              transition: 'all 0.15s ease'
            }}
          >
            <ExternalLink size={16} />
            <span>Open in Tab</span>
          </button>

          {/* Share on X */}
          <button
            type="button"
            onClick={handleShareToX}
            style={{
              background: '#000000',
              border: '1px solid rgba(255, 255, 255, 0.3)',
              color: '#ffffff',
              fontWeight: 700,
              fontSize: '0.85rem',
              padding: '0.75rem 1rem',
              borderRadius: '10px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              cursor: 'pointer',
              transition: 'all 0.15s ease'
            }}
          >
            <span style={{ fontSize: '1rem', fontWeight: 900 }}>𝕏</span>
            <span>Share on X</span>
          </button>
        </div>
      </div>

      <ShareToXModal
        isOpen={isShareToXOpen}
        onClose={() => setIsShareToXOpen(false)}
        canvas={canvas}
        builder={builder}
        template={template}
        onShowToast={onShowToast}
      />
    </div>
  );
};
