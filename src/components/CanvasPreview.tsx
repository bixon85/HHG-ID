import React, { useEffect, useRef, useState } from 'react';
import { Maximize2, Sparkles, CheckCircle2 } from 'lucide-react';
import { BuilderData, PhotoTransform, TemplateId } from '../types';
import { renderBadgeOnCanvas } from '../utils/canvasDrawer';
import { TEMPLATES } from '../constants/templates';

interface CanvasPreviewProps {
  templateId: TemplateId;
  userImageSrc: string | null;
  builder: BuilderData;
  transform: PhotoTransform;
  onCanvasReady: (canvas: HTMLCanvasElement) => void;
}

export const CanvasPreview: React.FC<CanvasPreviewProps> = ({
  templateId,
  userImageSrc,
  builder,
  transform,
  onCanvasReady
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isRendering, setIsRendering] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const activeTemplate = TEMPLATES.find((t) => t.id === templateId) || TEMPLATES[0];

  useEffect(() => {
    let isMounted = true;

    const render = async () => {
      if (!canvasRef.current) return;
      setIsRendering(true);
      try {
        await renderBadgeOnCanvas(canvasRef.current, templateId, userImageSrc, builder, transform);
        if (isMounted) {
          onCanvasReady(canvasRef.current);
        }
      } catch (err) {
        console.error('Render error:', err);
      } finally {
        if (isMounted) {
          setIsRendering(false);
        }
      }
    };

    render();

    return () => {
      isMounted = false;
    };
  }, [templateId, userImageSrc, builder, transform, onCanvasReady]);

  return (
    <div className="preview-card-frame">
      <div
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '0.85rem'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span className="pulsing-dot" style={{ background: '#00e5a3', boxShadow: '0 0 8px #00e5a3' }}></span>
          <span style={{ fontFamily: 'var(--font-cyber)', fontSize: '0.8rem', color: '#00e5a3', fontWeight: 700 }}>
            LIVE 4K RENDER
          </span>
        </div>
        <span style={{ fontSize: '0.75rem', color: 'var(--hh-text-muted)', fontFamily: 'var(--font-mono)' }}>
          {activeTemplate.width} × {activeTemplate.height}px
        </span>
      </div>

      <div className="canvas-wrapper">
        <canvas
          ref={canvasRef}
          className="canvas-preview-element"
          style={{
            aspectRatio:
              activeTemplate.aspectRatio === '1:1'
                ? '1 / 1'
                : activeTemplate.aspectRatio === '16:9'
                ? '16 / 9'
                : '4 / 5'
          }}
        />

        {isRendering && (
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              background: 'rgba(5, 20, 14, 0.4)',
              backdropFilter: 'blur(2px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#f3db47',
              fontFamily: 'var(--font-cyber)',
              fontSize: '0.9rem',
              fontWeight: 700
            }}
          >
            Rendering...
          </div>
        )}
      </div>

      {/* Template Details bar */}
      <div
        style={{
          marginTop: '1rem',
          width: '100%',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          fontSize: '0.75rem',
          color: 'var(--hh-text-secondary)',
          background: 'rgba(0,0,0,0.25)',
          padding: '0.5rem 0.85rem',
          borderRadius: '8px'
        }}
      >
        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <span>{activeTemplate.icon}</span>
          <strong style={{ color: '#fff' }}>{activeTemplate.name}</strong>
        </span>
        <span style={{ color: '#ff2a85', fontFamily: 'var(--font-mono)', fontWeight: 700 }}>
          #FrameInGoa
        </span>
      </div>
    </div>
  );
};
