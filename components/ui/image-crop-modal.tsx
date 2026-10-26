'use client';

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import {
  X,
  ZoomIn,
  ZoomOut,
  RotateCw,
  RefreshCw,
  Check,
  AlertCircle,
  Eye,
  Crop as CropIcon,
  Sparkles,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

export interface ImageCropModalProps {
  isOpen: boolean;
  imageSrc: string;
  onClose: () => void;
  onApplyCrop: (result: { blob: Blob; dataUrl: string }) => void | Promise<void>;
  aspectRatio?: number; // width / height (e.g. 1 for square, 16/5 for banner, 4/3, etc.)
  cropShape?: 'rect' | 'round';
  targetLabel?: string;
  outputWidth?: number;
  outputHeight?: number;
}

export function ImageCropModal({
  isOpen,
  imageSrc,
  onClose,
  onApplyCrop,
  aspectRatio = 1,
  cropShape = 'rect',
  targetLabel = 'Image',
  outputWidth = 800,
  outputHeight = 800,
}: ImageCropModalProps) {
  const [naturalSize, setNaturalSize] = useState<{ width: number; height: number } | null>(null);
  const [imageError, setImageError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Crop transformations
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0); // 0, 90, 180, 270
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isInteracting, setIsInteracting] = useState(false);

  // References
  const containerRef = useRef<HTMLDivElement>(null);
  const imgElementRef = useRef<HTMLImageElement | null>(null);
  const previewCanvasRef = useRef<HTMLCanvasElement | null>(null);

  // Interaction tracking refs
  const isPointerDownRef = useRef(false);
  const pointerStartRef = useRef({ x: 0, y: 0 });
  const panStartRef = useRef({ x: 0, y: 0 });
  const pinchStartDistRef = useRef<number | null>(null);
  const pinchStartZoomRef = useRef(1);

  // Workspace dimensions
  const [workspaceSize, setWorkspaceSize] = useState({ width: 500, height: 380 });

  // Update container size on resize or mount
  useEffect(() => {
    if (!isOpen) return;

    const updateSize = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setWorkspaceSize({
          width: Math.max(280, rect.width),
          height: Math.max(240, rect.height),
        });
      }
    };

    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, [isOpen]);

  // Calculate crop box geometry centered in the workspace
  const cropBox = useMemo(() => {
    const pad = 24;
    const maxW = Math.max(160, workspaceSize.width - pad * 2);
    const maxH = Math.max(140, workspaceSize.height - pad * 2);

    let boxW = maxW;
    let boxH = boxW / aspectRatio;

    if (boxH > maxH) {
      boxH = maxH;
      boxW = boxH * aspectRatio;
    }

    return {
      width: Math.round(boxW),
      height: Math.round(boxH),
      x: Math.round((workspaceSize.width - boxW) / 2),
      y: Math.round((workspaceSize.height - boxH) / 2),
    };
  }, [workspaceSize, aspectRatio]);

  // Load image object
  useEffect(() => {
    if (!isOpen || !imageSrc) return;

    let isMounted = true;
    const img = new Image();
    img.crossOrigin = 'anonymous';

    img.onload = () => {
      if (!isMounted) return;
      imgElementRef.current = img;
      setNaturalSize({ width: img.naturalWidth, height: img.naturalHeight });
    };

    img.onerror = () => {
      if (!isMounted) return;
      setImageError('Failed to load image. It may be corrupted or blocked by CORS.');
    };

    img.src = imageSrc;

    return () => {
      isMounted = false;
    };
  }, [isOpen, imageSrc]);

  // Calculate base scale to fully cover crop box at zoom = 1
  const effectiveDimensions = useMemo(() => {
    if (!naturalSize) return { width: 1, height: 1 };
    const isRotated = rotation === 90 || rotation === 270;
    return {
      width: isRotated ? naturalSize.height : naturalSize.width,
      height: isRotated ? naturalSize.width : naturalSize.height,
    };
  }, [rotation, naturalSize]);

  const baseScale = useMemo(() => {
    if (!naturalSize) return 1;
    const scaleX = cropBox.width / effectiveDimensions.width;
    const scaleY = cropBox.height / effectiveDimensions.height;
    return Math.max(scaleX, scaleY);
  }, [naturalSize, cropBox, effectiveDimensions]);

  // Calculate maximum pan bounds to prevent empty boundaries
  const maxPan = useMemo(() => {
    const renderedW = effectiveDimensions.width * baseScale * zoom;
    const renderedH = effectiveDimensions.height * baseScale * zoom;
    return {
      x: Math.max(0, (renderedW - cropBox.width) / 2),
      y: Math.max(0, (renderedH - cropBox.height) / 2),
    };
  }, [effectiveDimensions, baseScale, zoom, cropBox]);

  // Derive clamped pan value
  const clampedPan = useMemo(() => {
    return {
      x: Math.min(maxPan.x, Math.max(-maxPan.x, pan.x)),
      y: Math.min(maxPan.y, Math.max(-maxPan.y, pan.y)),
    };
  }, [maxPan, pan]);

  // Helper to clamp candidate pan
  const clampPanCandidate = useCallback(
    (p: { x: number; y: number }) => {
      return {
        x: Math.min(maxPan.x, Math.max(-maxPan.x, p.x)),
        y: Math.min(maxPan.y, Math.max(-maxPan.y, p.y)),
      };
    },
    [maxPan]
  );

  // Live Canvas Preview renderer
  useEffect(() => {
    if (!naturalSize || !imgElementRef.current || !previewCanvasRef.current) return;

    const canvas = previewCanvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const pw = canvas.width;
    const ph = canvas.height;

    ctx.clearRect(0, 0, pw, ph);

    if (cropShape === 'round') {
      ctx.save();
      ctx.beginPath();
      ctx.arc(pw / 2, ph / 2, Math.min(pw, ph) / 2, 0, Math.PI * 2);
      ctx.clip();
    }

    const ratio = pw / cropBox.width;
    ctx.save();
    ctx.translate(pw / 2 + clampedPan.x * ratio, ph / 2 + clampedPan.y * ratio);
    ctx.rotate((rotation * Math.PI) / 180);
    const totalScale = baseScale * zoom * ratio;
    ctx.scale(totalScale, totalScale);
    ctx.drawImage(
      imgElementRef.current,
      -naturalSize.width / 2,
      -naturalSize.height / 2
    );
    ctx.restore();

    if (cropShape === 'round') {
      ctx.restore();
    }
  }, [naturalSize, zoom, rotation, clampedPan, cropBox, baseScale, cropShape]);

  // Reset to default scale and center
  const handleReset = () => {
    setZoom(1);
    setRotation(0);
    setPan({ x: 0, y: 0 });
  };

  // Rotate 90 degrees clockwise
  const handleRotate = () => {
    setRotation((prev) => (prev + 90) % 360);
  };

  // Zoom handlers
  const handleZoomChange = (newZoom: number) => {
    const clamped = Math.min(3.5, Math.max(1, newZoom));
    setZoom(clamped);
  };

  // Wheel zoom handler
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const delta = e.deltaY < 0 ? 0.12 : -0.12;
    handleZoomChange(zoom + delta);
  };

  // Double click to zoom in/out
  const handleDoubleClick = () => {
    if (zoom > 1.2) {
      setZoom(1);
      setPan({ x: 0, y: 0 });
    } else {
      setZoom(1.8);
    }
  };

  // Pointer Drag events
  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.button !== 0) return;
    isPointerDownRef.current = true;
    pointerStartRef.current = { x: e.clientX, y: e.clientY };
    panStartRef.current = { ...clampedPan };
    setIsInteracting(true);
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isPointerDownRef.current) return;
    const dx = e.clientX - pointerStartRef.current.x;
    const dy = e.clientY - pointerStartRef.current.y;
    const newPan = clampPanCandidate({
      x: panStartRef.current.x + dx,
      y: panStartRef.current.y + dy,
    });
    setPan(newPan);
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    isPointerDownRef.current = false;
    setIsInteracting(false);
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {
      // Ignore if pointer capture already lost
    }
  };

  // Touch pinch-to-zoom support for mobile
  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    if (e.touches.length === 2) {
      const touch1 = e.touches[0];
      const touch2 = e.touches[1];
      const dist = Math.hypot(
        touch1.clientX - touch2.clientX,
        touch1.clientY - touch2.clientY
      );
      pinchStartDistRef.current = dist;
      pinchStartZoomRef.current = zoom;
      setIsInteracting(true);
    }
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (e.touches.length === 2 && pinchStartDistRef.current !== null) {
      e.preventDefault();
      const touch1 = e.touches[0];
      const touch2 = e.touches[1];
      const dist = Math.hypot(
        touch1.clientX - touch2.clientX,
        touch1.clientY - touch2.clientY
      );
      const factor = dist / pinchStartDistRef.current;
      handleZoomChange(pinchStartZoomRef.current * factor);
    }
  };

  const handleTouchEnd = () => {
    pinchStartDistRef.current = null;
    setIsInteracting(false);
  };

  // Execute High-Resolution Crop to Canvas & Apply
  const handleSaveCrop = async () => {
    if (!naturalSize || !imgElementRef.current) return;
    setIsProcessing(true);

    try {
      const canvas = document.createElement('canvas');
      canvas.width = outputWidth;
      canvas.height = outputHeight;
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        throw new Error('Canvas 2D context not available.');
      }

      // Background fill (white for clean jpeg consistency)
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, outputWidth, outputHeight);

      // Handle optional circular clipping for avatar
      if (cropShape === 'round') {
        ctx.save();
        ctx.beginPath();
        ctx.arc(
          outputWidth / 2,
          outputHeight / 2,
          Math.min(outputWidth, outputHeight) / 2,
          0,
          Math.PI * 2
        );
        ctx.clip();
      }

      // Map on-screen crop coords to output canvas
      const ratio = outputWidth / cropBox.width;
      ctx.save();
      ctx.translate(outputWidth / 2 + clampedPan.x * ratio, outputHeight / 2 + clampedPan.y * ratio);
      ctx.rotate((rotation * Math.PI) / 180);
      const totalScale = baseScale * zoom * ratio;
      ctx.scale(totalScale, totalScale);

      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';

      ctx.drawImage(
        imgElementRef.current,
        -naturalSize.width / 2,
        -naturalSize.height / 2
      );
      ctx.restore();

      if (cropShape === 'round') {
        ctx.restore();
      }

      // Generate Blob & DataUrl
      const dataUrl = canvas.toDataURL('image/jpeg', 0.92);

      const blob = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob(
          (b) => {
            if (b) resolve(b);
            else reject(new Error('Failed to generate image blob.'));
          },
          'image/jpeg',
          0.92
        );
      });

      await onApplyCrop({ blob, dataUrl });
      onClose();
    } catch (err: any) {
      setImageError(err.message || 'Error processing cropped image.');
    } finally {
      setIsProcessing(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="cropper-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/75 backdrop-blur-xs select-none animate-in fade-in duration-150"
    >
      <div className="bg-white w-full max-w-3xl rounded-[24px] shadow-2xl border border-[#E3E9E4] flex flex-col max-h-[92vh] overflow-hidden">
        {/* HEADER */}
        <div className="px-5 sm:px-6 py-4 border-b border-[#E3E9E4] flex items-center justify-between shrink-0 bg-[#FBFDFB]">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-[10px] bg-[#E8F7EE] text-[#0F7D41] flex items-center justify-center">
              <CropIcon className="w-5 h-5" />
            </div>
            <div>
              <h2
                id="cropper-title"
                className="font-display font-bold text-lg text-[#17211B] flex items-center gap-2"
              >
                <span>Adjust &amp; Position Image</span>
                <span className="text-[12px] font-semibold px-2.5 py-0.5 rounded-full bg-[#E8F7EE] text-[#075E36]">
                  {targetLabel}
                </span>
              </h2>
              <p className="text-[12.5px] text-[#5B6861]">
                Drag to reposition · Scroll or slide to zoom · Double-click to toggle zoom
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={isProcessing}
            aria-label="Close dialog"
            className="w-8 h-8 rounded-full flex items-center justify-center text-[#5B6861] hover:text-[#17211B] hover:bg-[#F3F6F4] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* CROP WORKSPACE */}
        <div className="p-4 sm:p-6 flex-1 flex flex-col lg:flex-row gap-5 items-stretch min-h-0 overflow-y-auto">
          {/* Main Interactive Canvas Area */}
          <div className="flex-1 flex flex-col gap-3 min-h-[300px] sm:min-h-[360px]">
            <div
              ref={containerRef}
              onWheel={handleWheel}
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              onPointerCancel={handlePointerUp}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
              onDoubleClick={handleDoubleClick}
              className="relative flex-1 w-full bg-[#1A1F1C] rounded-[18px] overflow-hidden cursor-grab active:cursor-grabbing border border-black/10 flex items-center justify-center touch-none select-none"
            >
              {/* Rendered Movable Image Underneath */}
              {naturalSize && (
                <div
                  className="absolute pointer-events-none transition-transform duration-75 ease-out will-change-transform"
                  style={{
                    transform: `translate(${clampedPan.x}px, ${clampedPan.y}px) rotate(${rotation}deg) scale(${
                      baseScale * zoom
                    })`,
                    transformOrigin: 'center center',
                    width: `${naturalSize.width}px`,
                    height: `${naturalSize.height}px`,
                  }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={imageSrc}
                    alt="Source preview to crop"
                    className="w-full h-full object-contain pointer-events-none"
                    draggable={false}
                  />
                </div>
              )}

              {/* Mask Overlay: Dimming outside crop box */}
              {naturalSize && (
                <svg
                  className="absolute inset-0 w-full h-full pointer-events-none z-10"
                  width={workspaceSize.width}
                  height={workspaceSize.height}
                >
                  <defs>
                    <mask id="crop-mask">
                      {/* Everything white is visible (dimmed background) */}
                      <rect width="100%" height="100%" fill="white" />
                      {/* Black cutout lets original brightness shine through */}
                      {cropShape === 'round' ? (
                        <circle
                          cx={cropBox.x + cropBox.width / 2}
                          cy={cropBox.y + cropBox.height / 2}
                          r={Math.min(cropBox.width, cropBox.height) / 2}
                          fill="black"
                        />
                      ) : (
                        <rect
                          x={cropBox.x}
                          y={cropBox.y}
                          width={cropBox.width}
                          height={cropBox.height}
                          rx={8}
                          fill="black"
                        />
                      )}
                    </mask>
                  </defs>

                  {/* Darkened outer mask */}
                  <rect
                    width="100%"
                    height="100%"
                    fill="rgba(10, 15, 12, 0.72)"
                    mask="url(#crop-mask)"
                  />
                </svg>
              )}

              {/* Fixed Crop Frame / Viewfinder Box */}
              {naturalSize && (
                <div
                  className={`absolute pointer-events-none z-20 border border-white/80 transition-shadow ${
                    cropShape === 'round' ? 'rounded-full' : 'rounded-[8px]'
                  } ${
                    isInteracting
                      ? 'shadow-[0_0_0_9999px_rgba(0,0,0,0.65)] ring-2 ring-[#0F7D41]'
                      : 'shadow-md'
                  }`}
                  style={{
                    left: `${cropBox.x}px`,
                    top: `${cropBox.y}px`,
                    width: `${cropBox.width}px`,
                    height: `${cropBox.height}px`,
                  }}
                >
                  {/* Rule-of-Thirds Grid (visible and highlighted during interaction) */}
                  <div
                    className={`absolute inset-0 grid grid-cols-3 grid-rows-3 transition-opacity duration-150 ${
                      isInteracting ? 'opacity-70' : 'opacity-30'
                    }`}
                  >
                    <div className="border-r border-b border-white/50" />
                    <div className="border-r border-b border-white/50" />
                    <div className="border-b border-white/50" />
                    <div className="border-r border-b border-white/50" />
                    <div className="border-r border-b border-white/50" />
                    <div className="border-b border-white/50" />
                    <div className="border-r border-white/50" />
                    <div className="border-r border-b border-white/50" />
                    <div />
                  </div>

                  {/* Corner Accent Brackets */}
                  {cropShape === 'rect' && (
                    <>
                      <div className="absolute -top-1 -left-1 w-3.5 h-3.5 border-t-2 border-l-2 border-white" />
                      <div className="absolute -top-1 -right-1 w-3.5 h-3.5 border-t-2 border-r-2 border-white" />
                      <div className="absolute -bottom-1 -left-1 w-3.5 h-3.5 border-b-2 border-l-2 border-white" />
                      <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 border-b-2 border-r-2 border-white" />
                    </>
                  )}
                </div>
              )}

              {/* Loading & Error States */}
              {!naturalSize && !imageError && (
                <div className="flex flex-col items-center gap-2.5 text-white/80">
                  <RefreshCw className="w-7 h-7 text-[#0F7D41] animate-spin" />
                  <span className="text-[13px] font-medium">Loading high-resolution image...</span>
                </div>
              )}

              {imageError && (
                <div className="p-4 max-w-sm bg-black/80 rounded-[12px] border border-[#F5C2C0] text-center text-[#FDEDEC] space-y-2">
                  <AlertCircle className="w-6 h-6 text-[#E53935] mx-auto" />
                  <p className="text-[13px]">{imageError}</p>
                </div>
              )}
            </div>

            {/* Quick action toolbar under canvas */}
            <div className="flex items-center justify-between gap-3 bg-[#F7F9F7] p-2 sm:p-2.5 rounded-[14px] border border-[#E3E9E4]">
              {/* Zoom controls */}
              <div className="flex items-center gap-2 sm:gap-3 flex-1 max-w-md">
                <button
                  type="button"
                  onClick={() => handleZoomChange(zoom - 0.15)}
                  disabled={zoom <= 1}
                  aria-label="Zoom out"
                  className="w-8 h-8 rounded-[8px] bg-white border border-[#E3E9E4] flex items-center justify-center text-[#17211B] hover:bg-[#F3F6F4] disabled:opacity-40 transition-colors cursor-pointer"
                >
                  <ZoomOut className="w-4 h-4" />
                </button>

                <input
                  type="range"
                  min="1"
                  max="3.5"
                  step="0.01"
                  value={zoom}
                  onChange={(e) => handleZoomChange(parseFloat(e.target.value))}
                  aria-label="Zoom level"
                  className="flex-1 accent-[#0F7D41] h-1.5 bg-[#CAD3CD] rounded-lg cursor-pointer"
                />

                <button
                  type="button"
                  onClick={() => handleZoomChange(zoom + 0.15)}
                  disabled={zoom >= 3.5}
                  aria-label="Zoom in"
                  className="w-8 h-8 rounded-[8px] bg-white border border-[#E3E9E4] flex items-center justify-center text-[#17211B] hover:bg-[#F3F6F4] disabled:opacity-40 transition-colors cursor-pointer"
                >
                  <ZoomIn className="w-4 h-4" />
                </button>

                <span className="text-[12px] font-mono text-[#5B6861] min-w-[42px] text-right font-medium">
                  {Math.round(zoom * 100)}%
                </span>
              </div>

              {/* Rotate & Reset Buttons */}
              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  type="button"
                  onClick={handleRotate}
                  title="Rotate 90° clockwise"
                  className="h-8 px-2.5 rounded-[8px] bg-white border border-[#E3E9E4] text-[12.5px] font-medium text-[#17211B] hover:bg-[#F3F6F4] inline-flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <RotateCw className="w-3.5 h-3.5 text-[#0F7D41]" />
                  <span className="hidden sm:inline">Rotate</span>
                </button>

                <button
                  type="button"
                  onClick={handleReset}
                  title="Reset position and zoom"
                  className="h-8 px-2.5 rounded-[8px] bg-white border border-[#E3E9E4] text-[12.5px] font-medium text-[#5B6861] hover:text-[#17211B] hover:bg-[#F3F6F4] inline-flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Reset</span>
                </button>
              </div>
            </div>
          </div>

          {/* RIGHT SIDEBAR: LIVE DESTINATION PREVIEW */}
          <div className="w-full lg:w-60 flex flex-col gap-4 p-4 rounded-[18px] bg-[#F7F9F7] border border-[#E3E9E4] shrink-0">
            <div>
              <div className="flex items-center gap-1.5 text-[12.5px] font-semibold text-[#17211B] uppercase tracking-wider mb-1">
                <Eye className="w-4 h-4 text-[#0F7D41]" />
                <span>Live Preview</span>
              </div>
              <p className="text-[12px] text-[#5B6861] leading-snug">
                Exactly how customers will see your photo.
              </p>
            </div>

            {/* Simulated Target Container */}
            <div className="flex-1 flex flex-col items-center justify-center p-3 bg-white rounded-[14px] border border-[#E3E9E4] shadow-2xs min-h-[140px]">
              {cropShape === 'round' ? (
                /* Round Avatar Preview */
                <div className="flex flex-col items-center gap-2">
                  <div className="relative w-24 h-24 rounded-full border-2 border-[#0F7D41]/30 p-0.5 shadow-sm overflow-hidden">
                    <canvas
                      ref={previewCanvasRef}
                      width={180}
                      height={180}
                      className="w-full h-full rounded-full object-cover"
                    />
                  </div>
                  <div className="text-center">
                    <p className="text-[12.5px] font-bold text-[#17211B]">Maison Ndolo</p>
                    <span className="text-[11px] text-[#075E36] font-medium">Store Profile</span>
                  </div>
                </div>
              ) : aspectRatio > 2 ? (
                /* Wide Banner Preview */
                <div className="w-full space-y-2">
                  <div className="w-full h-18 rounded-[10px] border border-[#0F7D41]/30 shadow-xs overflow-hidden bg-black/5">
                    <canvas
                      ref={previewCanvasRef}
                      width={280}
                      height={Math.round(280 / aspectRatio)}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-[#5B6861]">
                    <span>Store Header Banner</span>
                    <span className="font-mono text-[10px] text-[#075E36] font-semibold">
                      {Math.round(aspectRatio * 10) / 10}:1
                    </span>
                  </div>
                </div>
              ) : (
                /* Product Photo Preview */
                <div className="w-full space-y-2">
                  <div className="w-full aspect-square max-w-[130px] mx-auto rounded-[12px] border border-[#0F7D41]/30 shadow-xs overflow-hidden bg-black/5">
                    <canvas
                      ref={previewCanvasRef}
                      width={180}
                      height={180}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="text-center">
                    <span className="text-[11px] text-[#075E36] font-medium">Catalogue Card</span>
                  </div>
                </div>
              )}
            </div>

            {/* Quick composition tips */}
            <div className="space-y-1.5 text-[11.5px] text-[#5B6861] bg-white p-3 rounded-[12px] border border-[#E3E9E4]">
              <div className="flex items-center gap-1 font-semibold text-[#17211B]">
                <Sparkles className="w-3.5 h-3.5 text-[#0F7D41]" />
                <span>Composition tip:</span>
              </div>
              <p className="leading-relaxed">
                {cropShape === 'round'
                  ? 'Keep faces or brand logos centered inside the circular boundary.'
                  : 'Important logos and texts should remain within the central rule-of-thirds grid.'}
              </p>
            </div>
          </div>
        </div>

        {/* FOOTER ACTIONS */}
        <div className="px-5 sm:px-6 py-3.5 bg-[#FBFDFB] border-t border-[#E3E9E4] flex items-center justify-between shrink-0">
          <Button
            variant="ghost"
            onClick={onClose}
            disabled={isProcessing}
            className="text-[13.5px] font-medium text-[#5B6861] hover:text-[#17211B]"
          >
            Cancel
          </Button>

          <div className="flex items-center gap-2.5">
            <Button
              type="button"
              onClick={handleSaveCrop}
              disabled={!naturalSize || isProcessing}
              className="gap-2 px-5"
            >
              {isProcessing ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Processing &amp; saving...</span>
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  <span>Apply &amp; save crop</span>
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
