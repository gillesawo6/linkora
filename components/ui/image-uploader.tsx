'use client';

import React, { useState, useRef } from 'react';
import Image from 'next/image';
import {
  Upload,
  Camera,
  RotateCw,
  Image as ImageIcon,
  Link as LinkIcon,
  Crop as CropIcon,
  SlidersHorizontal,
} from 'lucide-react';
import { uploadImage } from '@/lib/image-upload';
import { ImageCropModal } from '@/components/ui/image-crop-modal';

interface ImageUploaderProps {
  currentImageUrl?: string | null;
  onImageChange: (url: string | null) => void;
  folder?: 'avatars' | 'covers' | 'products';
  variant?: 'avatar' | 'cover' | 'product';
  fallbackText?: string;
  shopId?: string;
  className?: string;
  label?: string;
  hint?: string;
}

export function ImageUploader({
  currentImageUrl,
  onImageChange,
  folder = 'avatars',
  variant = 'avatar',
  fallbackText = 'M',
  shopId,
  className = '',
  label,
  hint,
}: ImageUploaderProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [urlInput, setUrlInput] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Interactive Cropper Modal state
  const [cropModalOpen, setCropModalOpen] = useState(false);
  const [pendingCropSrc, setPendingCropSrc] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Determine geometry configuration based on display container
  const cropConfig = {
    aspectRatio: variant === 'cover' ? 16 / 5 : 1, // 3.2:1 for wide storefront banner, 1:1 for profile & product
    cropShape: variant === 'avatar' ? ('round' as const) : ('rect' as const),
    targetLabel:
      variant === 'avatar'
        ? 'Store Profile Picture'
        : variant === 'cover'
        ? 'Store Cover Banner'
        : 'Product Photo',
    outputWidth: variant === 'cover' ? 1600 : variant === 'product' ? 900 : 600,
    outputHeight: variant === 'cover' ? 500 : variant === 'product' ? 900 : 600,
  };

  const handleFileProcess = (file: File) => {
    setErrorMsg(null);
    if (!file.type.startsWith('image/')) {
      setErrorMsg('Please select a valid image file (JPG, PNG, WebP).');
      return;
    }

    if (file.size > 20 * 1024 * 1024) {
      setErrorMsg('Image size is too large. Max 20MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const src = e.target?.result as string;
      if (src) {
        setPendingCropSrc(src);
        setCropModalOpen(true);
      }
    };
    reader.onerror = () => {
      setErrorMsg('Failed to read image file.');
    };
    reader.readAsDataURL(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileProcess(file);
    }
    if (e.target) e.target.value = '';
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFileProcess(file);
    }
  };

  const handleApplyUrl = (e?: React.FormEvent | React.KeyboardEvent | React.MouseEvent) => {
    if (e && 'preventDefault' in e) e.preventDefault();
    if (!urlInput.trim()) return;

    setPendingCropSrc(urlInput.trim());
    setCropModalOpen(true);
    setUrlInput('');
    setShowUrlInput(false);
  };

  const handleOpenExistingCrop = () => {
    if (currentImageUrl) {
      setPendingCropSrc(currentImageUrl);
      setCropModalOpen(true);
    }
  };

  const handleApplyCroppedResult = async ({
    blob,
    dataUrl,
  }: {
    blob: Blob;
    dataUrl: string;
  }) => {
    setIsUploading(true);
    setErrorMsg(null);

    try {
      const file = new File([blob], `linkora-${variant}-${Date.now()}.jpg`, {
        type: 'image/jpeg',
      });

      const res = await uploadImage(file, {
        folder,
        shopId,
        maxWidth: cropConfig.outputWidth,
        maxHeight: cropConfig.outputHeight,
      });

      onImageChange(res.url);
    } catch {
      // Fallback directly to the high quality cropped dataUrl
      onImageChange(dataUrl);
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemove = () => {
    onImageChange(null);
  };

  /* ------------------- VARIANT: AVATAR / PROFILE PICTURE ------------------- */
  if (variant === 'avatar') {
    return (
      <div className={`space-y-2 ${className}`}>
        {label && (
          <label className="block text-[13.5px] font-medium text-[#17211B]">
            {label}
          </label>
        )}

        <div className="flex items-center gap-4">
          {/* Avatar Circle with Dropzone */}
          <div
            onClick={() => fileInputRef.current?.click()}
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragOver(true);
            }}
            onDragLeave={() => setIsDragOver(false)}
            onDrop={handleDrop}
            className={`relative w-16 h-16 sm:w-20 sm:h-20 rounded-full border-2 cursor-pointer group shrink-0 overflow-hidden transition-all flex items-center justify-center ${
              isDragOver
                ? 'border-[#0F7D41] bg-[#E8F7EE] ring-4 ring-[#E8F7EE]'
                : currentImageUrl
                ? 'border-[#E3E9E4] bg-white'
                : 'border-dashed border-[#CAD3CD] bg-[#F7F9F7] hover:border-[#0F7D41]'
            }`}
          >
            {currentImageUrl ? (
              <Image
                src={currentImageUrl}
                alt="Store profile"
                fill
                sizes="80px"
                unoptimized={currentImageUrl.startsWith('data:') || currentImageUrl.startsWith('blob:')}
                referrerPolicy="no-referrer"
                className="object-cover object-center"
              />
            ) : (
              <span className="font-display font-bold text-2xl text-[#075E36]">
                {fallbackText.charAt(0).toUpperCase()}
              </span>
            )}

            {/* Hover overlay with camera icon */}
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
              <Camera className="w-5 h-5 drop-shadow" />
            </div>

            {/* Loading spinner */}
            {isUploading && (
              <div className="absolute inset-0 bg-white/85 backdrop-blur-2xs flex items-center justify-center">
                <RotateCw className="w-5 h-5 text-[#0F7D41] animate-spin" />
              </div>
            )}
          </div>

          {/* Action buttons and info */}
          <div className="space-y-1.5 flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="h-9 px-3.5 rounded-[10px] bg-white border border-[#E3E9E4] hover:bg-[#F3F6F4] text-[13px] font-semibold text-[#17211B] inline-flex items-center gap-1.5 transition-colors disabled:opacity-50"
              >
                <Upload className="w-3.5 h-3.5 text-[#0F7D41]" />
                <span>{currentImageUrl ? 'Change photo' : 'Upload photo'}</span>
              </button>

              {currentImageUrl && (
                <button
                  type="button"
                  onClick={handleOpenExistingCrop}
                  disabled={isUploading}
                  className="h-9 px-3 rounded-[10px] bg-[#E8F7EE] hover:bg-[#D5EFE0] text-[13px] font-semibold text-[#075E36] inline-flex items-center gap-1.5 transition-colors"
                >
                  <CropIcon className="w-3.5 h-3.5 text-[#0F7D41]" />
                  <span>Adjust crop</span>
                </button>
              )}

              {currentImageUrl && (
                <button
                  type="button"
                  onClick={handleRemove}
                  className="text-[13px] font-medium text-[#5B6861] hover:text-[#C62828] px-2 py-1 transition-colors"
                >
                  Remove
                </button>
              )}

              <button
                type="button"
                onClick={() => setShowUrlInput(!showUrlInput)}
                className="text-[12.5px] text-[#5B6861] hover:text-[#17211B] inline-flex items-center gap-1 px-2 py-1"
              >
                <LinkIcon className="w-3 h-3 text-[#8E9B93]" />
                <span>{showUrlInput ? 'Cancel URL' : 'Link URL'}</span>
              </button>
            </div>

            <p className="text-[12px] text-[#8E9B93]">
              {hint || 'Drag & drop or choose JPG, PNG, WebP. Position & crop to perfect circle.'}
            </p>
          </div>
        </div>

        {/* Optional URL input box */}
        {showUrlInput && (
          <div className="flex gap-2 pt-1 max-w-md">
            <input
              type="url"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleApplyUrl(e);
                }
              }}
              placeholder="https://example.com/logo.jpg"
              className="flex-1 h-9 px-3 rounded-[8px] bg-white border border-[#E3E9E4] text-[13px] text-[#17211B] focus:outline-none focus:border-[#0F7D41]"
            />
            <button
              type="button"
              onClick={() => handleApplyUrl()}
              className="h-9 px-3 rounded-[8px] bg-[#0F7D41] hover:bg-[#0B6636] text-white text-[12.5px] font-semibold cursor-pointer"
            >
              Crop &amp; Apply
            </button>
          </div>
        )}

        {errorMsg && (
          <p className="text-[12px] text-[#C62828] font-medium">{errorMsg}</p>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
        />

        {/* CROP MODAL */}
        {pendingCropSrc && (
          <ImageCropModal
            isOpen={cropModalOpen}
            imageSrc={pendingCropSrc}
            onClose={() => {
              setCropModalOpen(false);
              setPendingCropSrc(null);
            }}
            onApplyCrop={handleApplyCroppedResult}
            aspectRatio={cropConfig.aspectRatio}
            cropShape={cropConfig.cropShape}
            targetLabel={cropConfig.targetLabel}
            outputWidth={cropConfig.outputWidth}
            outputHeight={cropConfig.outputHeight}
          />
        )}
      </div>
    );
  }

  /* ------------------- VARIANT: COVER / BANNER ------------------- */
  if (variant === 'cover') {
    return (
      <div className={`space-y-2 ${className}`}>
        {label && (
          <label className="block text-[13.5px] font-medium text-[#17211B]">
            {label}
          </label>
        )}

        <div
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragOver(true);
          }}
          onDragLeave={() => setIsDragOver(false)}
          onDrop={handleDrop}
          className={`relative w-full h-32 sm:h-36 rounded-[16px] border overflow-hidden flex items-center justify-center transition-all ${
            isDragOver
              ? 'border-[#0F7D41] ring-4 ring-[#E8F7EE]'
              : 'border-[#E3E9E4] bg-gradient-to-r from-[#E8F7EE] via-[#F3F6F4] to-[#FAF3EA]'
          }`}
        >
          {currentImageUrl ? (
            <>
              <Image
                src={currentImageUrl}
                alt="Store cover banner"
                fill
                sizes="(max-width: 1024px) 100vw, 800px"
                unoptimized={currentImageUrl.startsWith('data:') || currentImageUrl.startsWith('blob:')}
                referrerPolicy="no-referrer"
                className="object-cover object-center"
              />
              <div className="absolute inset-0 bg-black/30 backdrop-blur-2xs opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center gap-2" />
            </>
          ) : (
            <div className="absolute inset-0 bg-[radial-gradient(#0F7D41_1px,transparent_1px)] [background-size:16px_16px] opacity-10" />
          )}

          {/* Action overlay buttons */}
          <div className="relative z-10 flex items-center gap-2 flex-wrap justify-center p-2">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="px-3.5 py-2 rounded-[10px] bg-white/95 hover:bg-white text-[#17211B] text-[13px] font-semibold flex items-center gap-1.5 shadow-sm transition-all active:scale-95 disabled:opacity-50"
            >
              {isUploading ? (
                <>
                  <RotateCw className="w-4 h-4 text-[#0F7D41] animate-spin" />
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <ImageIcon className="w-4 h-4 text-[#0F7D41]" />
                  <span>{currentImageUrl ? 'Change cover' : 'Upload cover'}</span>
                </>
              )}
            </button>

            {currentImageUrl && (
              <button
                type="button"
                onClick={handleOpenExistingCrop}
                disabled={isUploading}
                className="px-3 py-2 rounded-[10px] bg-white/95 hover:bg-white text-[#075E36] text-[12.5px] font-semibold shadow-sm inline-flex items-center gap-1.5 transition-colors"
              >
                <CropIcon className="w-3.5 h-3.5 text-[#0F7D41]" />
                <span>Adjust position</span>
              </button>
            )}

            {currentImageUrl && (
              <button
                type="button"
                onClick={handleRemove}
                className="px-3 py-2 rounded-[10px] bg-white/90 hover:bg-white text-[#C62828] text-[12.5px] font-semibold shadow-sm transition-colors"
              >
                Remove
              </button>
            )}

            <button
              type="button"
              onClick={() => setShowUrlInput(!showUrlInput)}
              className="px-3 py-2 rounded-[10px] bg-white/90 hover:bg-white text-[#5B6861] text-[12.5px] font-semibold shadow-sm transition-colors"
            >
              {showUrlInput ? 'Close URL' : 'Link URL'}
            </button>
          </div>
        </div>

        {showUrlInput && (
          <div className="flex gap-2 pt-1">
            <input
              type="url"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleApplyUrl(e);
                }
              }}
              placeholder="https://example.com/banner.jpg"
              className="flex-1 h-9 px-3 rounded-[8px] bg-white border border-[#E3E9E4] text-[13px] text-[#17211B] focus:outline-none focus:border-[#0F7D41]"
            />
            <button
              type="button"
              onClick={() => handleApplyUrl()}
              className="h-9 px-3 rounded-[8px] bg-[#0F7D41] hover:bg-[#0B6636] text-white text-[12.5px] font-semibold cursor-pointer"
            >
              Crop &amp; Apply
            </button>
          </div>
        )}

        <p className="text-[12px] text-[#8E9B93]">
          {hint || 'Wide banner, 16:5 ratio. Interactive cropping allows you to position key elements in the centre.'}
        </p>

        {errorMsg && (
          <p className="text-[12px] text-[#C62828] font-medium">{errorMsg}</p>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
        />

        {/* CROP MODAL */}
        {pendingCropSrc && (
          <ImageCropModal
            isOpen={cropModalOpen}
            imageSrc={pendingCropSrc}
            onClose={() => {
              setCropModalOpen(false);
              setPendingCropSrc(null);
            }}
            onApplyCrop={handleApplyCroppedResult}
            aspectRatio={cropConfig.aspectRatio}
            cropShape={cropConfig.cropShape}
            targetLabel={cropConfig.targetLabel}
            outputWidth={cropConfig.outputWidth}
            outputHeight={cropConfig.outputHeight}
          />
        )}
      </div>
    );
  }

  /* ------------------- VARIANT: PRODUCT PHOTO ------------------- */
  return (
    <div className={`space-y-2 ${className}`}>
      {label && (
        <label className="block text-[13.5px] font-medium text-[#17211B]">
          {label}
        </label>
      )}

      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragOver(true);
        }}
        onDragLeave={() => setIsDragOver(false)}
        onDrop={handleDrop}
        className={`relative w-full aspect-square max-w-[220px] rounded-[16px] border-2 overflow-hidden flex flex-col items-center justify-center p-3 text-center transition-all ${
          isDragOver
            ? 'border-[#0F7D41] bg-[#E8F7EE] ring-4 ring-[#E8F7EE]'
            : currentImageUrl
            ? 'border-[#E3E9E4] bg-[#F7F9F7]'
            : 'border-dashed border-[#CAD3CD] bg-[#F7F9F7] hover:border-[#0F7D41]'
        }`}
      >
        {currentImageUrl ? (
          <>
            <Image
              src={currentImageUrl}
              alt="Product item"
              fill
              sizes="220px"
              unoptimized={currentImageUrl.startsWith('data:') || currentImageUrl.startsWith('blob:')}
              referrerPolicy="no-referrer"
              className="object-cover object-center"
            />
            <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1.5 p-2">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="h-8 px-3 rounded-[8px] bg-white text-[#17211B] text-[12px] font-semibold shadow-xs hover:bg-[#F3F6F4] transition-colors"
              >
                Change photo
              </button>
              <button
                type="button"
                onClick={handleOpenExistingCrop}
                className="h-8 px-3 rounded-[8px] bg-[#E8F7EE] text-[#075E36] text-[12px] font-semibold shadow-xs hover:bg-[#D5EFE0] transition-colors flex items-center gap-1"
              >
                <CropIcon className="w-3.5 h-3.5" />
                <span>Adjust crop</span>
              </button>
              <button
                type="button"
                onClick={handleRemove}
                className="h-8 px-3 rounded-[8px] bg-[#C62828] text-white text-[12px] font-semibold shadow-xs hover:bg-[#B71C1C] transition-colors"
              >
                Remove
              </button>
            </div>
          </>
        ) : (
          <div
            onClick={() => fileInputRef.current?.click()}
            className="cursor-pointer space-y-2 w-full h-full flex flex-col items-center justify-center"
          >
            <div className="w-10 h-10 rounded-full bg-white border border-[#E3E9E4] flex items-center justify-center text-[#0F7D41] shadow-2xs">
              <Upload className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[13px] font-semibold text-[#17211B]">
                Upload product photo
              </p>
              <p className="text-[11px] text-[#8E9B93] mt-0.5">
                Drag &amp; drop or click to browse
              </p>
            </div>
          </div>
        )}

        {isUploading && (
          <div className="absolute inset-0 bg-white/85 backdrop-blur-2xs flex flex-col items-center justify-center gap-2 z-20">
            <RotateCw className="w-6 h-6 text-[#0F7D41] animate-spin" />
            <span className="text-xs font-semibold text-[#075E36]">Saving cropped photo...</span>
          </div>
        )}
      </div>

      <div className="flex items-center gap-3 pt-1">
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="text-[12.5px] font-semibold text-[#0F7D41] hover:underline inline-flex items-center gap-1"
        >
          <Upload className="w-3.5 h-3.5" />
          <span>Browse local files</span>
        </button>

        <span className="text-[#CAD3CD]">·</span>

        <button
          type="button"
          onClick={() => setShowUrlInput(!showUrlInput)}
          className="text-[12.5px] text-[#5B6861] hover:text-[#17211B] inline-flex items-center gap-1"
        >
          <LinkIcon className="w-3 h-3 text-[#8E9B93]" />
          <span>{showUrlInput ? 'Cancel' : 'Paste web URL'}</span>
        </button>
      </div>

      {showUrlInput && (
        <div className="flex gap-2 pt-1 max-w-sm">
          <input
            type="url"
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleApplyUrl(e);
              }
            }}
            placeholder="https://images.unsplash.com/..."
            className="flex-1 h-9 px-3 rounded-[8px] bg-white border border-[#E3E9E4] text-[13px] text-[#17211B] focus:outline-none focus:border-[#0F7D41]"
          />
          <button
            type="button"
            onClick={() => handleApplyUrl()}
            className="h-9 px-3 rounded-[8px] bg-[#0F7D41] hover:bg-[#0B6636] text-white text-[12px] font-semibold cursor-pointer"
          >
            Crop &amp; Use
          </button>
        </div>
      )}

      {errorMsg && (
        <p className="text-[12px] text-[#C62828] font-medium">{errorMsg}</p>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />

      {/* CROP MODAL */}
      {pendingCropSrc && (
        <ImageCropModal
          isOpen={cropModalOpen}
          imageSrc={pendingCropSrc}
          onClose={() => {
            setCropModalOpen(false);
            setPendingCropSrc(null);
          }}
          onApplyCrop={handleApplyCroppedResult}
          aspectRatio={cropConfig.aspectRatio}
          cropShape={cropConfig.cropShape}
          targetLabel={cropConfig.targetLabel}
          outputWidth={cropConfig.outputWidth}
          outputHeight={cropConfig.outputHeight}
        />
      )}
    </div>
  );
}
