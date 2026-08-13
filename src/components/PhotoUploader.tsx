import React, { useRef, useState } from 'react';
import { Upload, Camera, ZoomIn, RotateCw, FlipHorizontal, RefreshCw, Move, Sparkles, Sliders } from 'lucide-react';
import { PhotoTransform, SampleAvatar, PhotoFilter } from '../types';
import { SAMPLE_AVATARS } from '../constants/samplePhotos';
import { convertHeicIfNecessary } from '../utils/heicConverter';
import { sounds } from '../utils/soundEffects';

interface PhotoUploaderProps {
  userImageSrc: string | null;
  onImageChange: (dataUrl: string) => void;
  transform: PhotoTransform;
  onTransformChange: (transform: PhotoTransform) => void;
  onSelectSampleAvatar: (avatar: SampleAvatar) => void;
  filter?: PhotoFilter;
  onFilterChange?: (filter: PhotoFilter) => void;
}

export const PhotoUploader: React.FC<PhotoUploaderProps> = ({
  userImageSrc,
  onImageChange,
  transform,
  onTransformChange,
  onSelectSampleAvatar,
  filter = 'normal',
  onFilterChange
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleFile = async (file: File) => {
    setIsProcessing(true);
    try {
      const url = await convertHeicIfNecessary(file);
      onImageChange(url);
      sounds.playShutter();
      // Reset transform for new photo
      onTransformChange({
        zoom: 1,
        offsetX: 0,
        offsetY: 0,
        rotation: 0,
        flipH: false
      });
    } catch (err) {
      console.error('Error handling file:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const updateZoom = (newZoom: number) => {
    onTransformChange({ ...transform, zoom: newZoom });
  };

  const updateOffset = (dx: number, dy: number) => {
    onTransformChange({
      ...transform,
      offsetX: transform.offsetX + dx,
      offsetY: transform.offsetY + dy
    });
  };

  const handleRotate = () => {
    sounds.playPop();
    onTransformChange({
      ...transform,
      rotation: (transform.rotation + 90) % 360
    });
  };

  const handleFlip = () => {
    sounds.playPop();
    onTransformChange({
      ...transform,
      flipH: !transform.flipH
    });
  };

  const handleReset = () => {
    sounds.playPop();
    onTransformChange({
      zoom: 1,
      offsetX: 0,
      offsetY: 0,
      rotation: 0,
      flipH: false
    });
    if (onFilterChange) onFilterChange('normal');
  };

  const FILTER_LIST: { id: PhotoFilter; label: string }[] = [
    { id: 'normal', label: 'Original' },
    { id: 'tropical', label: '🌴 Tropical' },
    { id: 'cyber', label: '⚡ Cyber' },
    { id: 'vintage', label: '📷 Vintage' },
    { id: 'bw', label: '🏁 B&W' }
  ];

  return (
    <div className="glass-panel" style={{ padding: '1.25rem' }}>
      <div className="section-header">
        <h2 className="section-title">
          <span>📸</span>
          <span>Upload Builder Photo</span>
        </h2>
        {userImageSrc && (
          <button className="btn-icon-sm" onClick={handleReset} title="Reset Photo Adjustments">
            <RefreshCw size={13} />
            <span style={{ fontSize: '0.7rem', marginLeft: '3px' }}>Reset</span>
          </button>
        )}
      </div>

      {/* Hidden File Inputs */}
      <input
        type="file"
        ref={fileInputRef}
        accept="image/*,.heic,.heif"
        style={{ display: 'none' }}
        onChange={(e) => {
          if (e.target.files && e.target.files[0]) {
            handleFile(e.target.files[0]);
          }
        }}
      />
      <input
        type="file"
        ref={cameraInputRef}
        accept="image/*"
        capture="user"
        style={{ display: 'none' }}
        onChange={(e) => {
          if (e.target.files && e.target.files[0]) {
            handleFile(e.target.files[0]);
          }
        }}
      />

      {/* Drag & Drop Box */}
      <div
        className={`dropzone-container ${isDragOver ? 'is-dragover' : ''}`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => fileInputRef.current?.click()}
      >
        <div className="dropzone-inner">
          <div className="dropzone-icon-circle">
            {isProcessing ? (
              <RefreshCw size={24} className="dice-icon rolling" />
            ) : (
              <Upload size={24} />
            )}
          </div>
          <div>
            <p className="dropzone-main-text">
              {isProcessing
                ? 'Converting HEIC & optimizing image...'
                : userImageSrc
                ? 'Click or drop to change photo'
                : 'Click to upload or drag & drop'}
            </p>
            <p className="dropzone-sub-text">Supports portrait, landscape, & iPhone HEIC</p>
          </div>

          <div className="dropzone-badges">
            <span className="format-badge">JPG / PNG</span>
            <span className="format-badge">iPhone HEIC</span>
            <span className="format-badge">WebP</span>
          </div>
        </div>
      </div>

      {/* Camera Capture Button */}
      <div style={{ marginTop: '0.75rem', display: 'flex', gap: '0.5rem' }}>
        <button
          type="button"
          className="btn-action-secondary"
          style={{ flex: 1, padding: '0.6rem' }}
          onClick={() => cameraInputRef.current?.click()}
        >
          <Camera size={16} />
          <span>Take Selfie / Camera</span>
        </button>
      </div>

      {/* Preset Demo Avatars */}
      <div className="preset-avatars-row">
        <span className="preset-label">
          <Sparkles size={12} style={{ display: 'inline', marginRight: '3px' }} />
          Or try sample:
        </span>
        {SAMPLE_AVATARS.map((avatar) => (
          <button
            key={avatar.id}
            type="button"
            className="preset-avatar-btn"
            title={`Use ${avatar.name}'s demo profile`}
            onClick={() => {
              sounds.playPop();
              onSelectSampleAvatar(avatar);
            }}
          >
            <img src={avatar.url} alt={avatar.name} />
          </button>
        ))}
      </div>

      {/* Interactive Photo Adjustment Controls */}
      {userImageSrc && (
        <div className="photo-controls-panel">
          {/* Photo Filters */}
          <div style={{ marginBottom: '0.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '6px', fontSize: '0.78rem', color: '#f3db47', fontWeight: 600 }}>
              <Sliders size={13} />
              <span>Vibe Filter</span>
            </div>
            <div className="role-chips-wrap">
              {FILTER_LIST.map((f) => {
                const isSelected = filter === f.id;
                return (
                  <button
                    key={f.id}
                    type="button"
                    className={`role-chip ${isSelected ? 'active' : ''}`}
                    onClick={() => {
                      sounds.playPop();
                      if (onFilterChange) onFilterChange(f.id);
                    }}
                    style={{ fontSize: '0.72rem', padding: '0.2rem 0.55rem' }}
                  >
                    {f.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Zoom Slider */}
          <div className="control-row">
            <span className="control-label">
              <ZoomIn size={14} />
              <span>Zoom</span>
            </span>
            <input
              type="range"
              min="0.5"
              max="2.5"
              step="0.05"
              value={transform.zoom}
              onChange={(e) => updateZoom(parseFloat(e.target.value))}
              className="range-slider"
            />
            <span style={{ fontSize: '0.75rem', color: '#f3db47', width: '38px', textAlign: 'right', fontFamily: 'monospace' }}>
              {Math.round(transform.zoom * 100)}%
            </span>
          </div>

          {/* Pan & Orientation Buttons */}
          <div className="control-row" style={{ justifyContent: 'space-between' }}>
            <span className="control-label">
              <Move size={14} />
              <span>Position</span>
            </span>

            <div className="btn-icon-group">
              <button
                type="button"
                className="btn-icon-sm"
                onClick={() => updateOffset(-15, 0)}
                title="Pan Left"
              >
                ◀
              </button>
              <button
                type="button"
                className="btn-icon-sm"
                onClick={() => updateOffset(0, -15)}
                title="Pan Up"
              >
                ▲
              </button>
              <button
                type="button"
                className="btn-icon-sm"
                onClick={() => updateOffset(0, 15)}
                title="Pan Down"
              >
                ▼
              </button>
              <button
                type="button"
                className="btn-icon-sm"
                onClick={() => updateOffset(15, 0)}
                title="Pan Right"
              >
                ▶
              </button>
            </div>

            <div className="btn-icon-group">
              <button
                type="button"
                className="btn-icon-sm"
                onClick={handleRotate}
                title="Rotate 90 degrees"
              >
                <RotateCw size={14} />
              </button>
              <button
                type="button"
                className="btn-icon-sm"
                onClick={handleFlip}
                title="Flip Horizontal"
              >
                <FlipHorizontal size={14} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

