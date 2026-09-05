'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Camera, Upload, X, Loader2, Plus, Image as ImageIcon } from 'lucide-react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { readApiResponse } from '@/lib/api-client';

export interface MultiImageUploadProps {
  value?: string[];
  onChange: (urls: string[]) => void;
  maxImages?: number;
  label?: string;
  prefix?: string;
}

export default function MultiImageUpload({
  value = [],
  onChange,
  maxImages = 4,
  label = 'Product Images (Up to 4)',
  prefix = 'product',
}: MultiImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [isCameraReady, setIsCameraReady] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  /** Fast browser-side image resizer */
  async function compressImageBeforeUpload(file: File, maxDimension = 1600, quality = 0.85): Promise<File> {
    if (!file.type.startsWith('image/') || file.size < 300 * 1024) return file;
    return new Promise((resolve) => {
      const img = document.createElement('img');
      const url = URL.createObjectURL(file);
      img.onload = () => {
        URL.revokeObjectURL(url);
        let { width, height } = img;
        if (width <= maxDimension && height <= maxDimension) {
          resolve(file);
          return;
        }
        if (width > height) {
          height = Math.round((height * maxDimension) / width);
          width = maxDimension;
        } else {
          width = Math.round((width * maxDimension) / height);
          height = maxDimension;
        }
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) { resolve(file); return; }
        ctx.drawImage(img, 0, 0, width, height);
        canvas.toBlob(
          (blob) => {
            if (!blob) { resolve(file); return; }
            const compressedFile = new File([blob], file.name.replace(/\.[^/.]+$/, '.webp'), {
              type: 'image/webp',
              lastModified: Date.now(),
            });
            resolve(compressedFile);
          },
          'image/webp',
          quality
        );
      };
      img.onerror = () => { URL.revokeObjectURL(url); resolve(file); };
      img.src = url;
    });
  }

  const uploadFile = async (rawFile: File) => {
    if (value.length >= maxImages) {
      setError(`Maximum of ${maxImages} images reached.`);
      return;
    }

    try {
      setIsUploading(true);
      setError(null);

      const file = await compressImageBeforeUpload(rawFile);

      if (file.size > 10 * 1024 * 1024) {
        setError('Image file size must be less than 10MB.');
        return;
      }

      const formData = new FormData();
      formData.append('file', file);
      formData.append('prefix', prefix);

      const response = await fetch('/api/v1/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await readApiResponse<{ success?: boolean; url?: string; error?: string }>(response);

      if (!response.ok || !data.success || !data.url) {
        throw new Error(data.error || 'Failed to upload image.');
      }

      onChange([...value, data.url]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    e.target.value = '';
    if (files.length === 0) return;

    const remainingSlots = maxImages - value.length;
    const filesToUpload = files.slice(0, remainingSlots);

    for (const f of filesToUpload) {
      await uploadFile(f);
    }
  };

  const handleRemoveImage = (indexToRemove: number) => {
    onChange(value.filter((_, idx) => idx !== indexToRemove));
  };

  const closeCamera = () => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    setIsCameraReady(false);
    setIsCameraOpen(false);
  };

  const openCamera = async () => {
    setError(null);
    if (!navigator.mediaDevices?.getUserMedia) {
      cameraInputRef.current?.click();
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: { ideal: 'environment' } }, audio: false });
      streamRef.current = stream;
      setIsCameraOpen(true);
    } catch {
      setError('Camera access was blocked or is unavailable. Allow camera access or upload photos from device.');
    }
  };

  const takePhoto = async () => {
    const video = videoRef.current;
    if (!video || !video.videoWidth || !video.videoHeight) {
      setError('Camera loading... Please try again in a moment.');
      return;
    }

    const largestSide = Math.max(video.videoWidth, video.videoHeight);
    const scale = Math.min(1, 1600 / largestSide);
    const canvas = document.createElement('canvas');
    canvas.width = Math.round(video.videoWidth * scale);
    canvas.height = Math.round(video.videoHeight * scale);
    canvas.getContext('2d')?.drawImage(video, 0, 0, canvas.width, canvas.height);
    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/jpeg', 0.9));
    if (!blob) {
      setError('Could not capture photo. Please try again.');
      return;
    }
    closeCamera();
    await uploadFile(new File([blob], `camera-${Date.now()}.jpg`, { type: 'image/jpeg' }));
  };

  useEffect(() => () => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
  }, []);

  useEffect(() => {
    if (isCameraOpen && videoRef.current && streamRef.current) {
      videoRef.current.srcObject = streamRef.current;
      videoRef.current.play().catch(() => null);
    }
  }, [isCameraOpen]);

  return (
    <div className="space-y-3">
      {label && (
        <div className="flex items-center justify-between">
          <label className="block text-sm font-semibold text-slate-800">{label}</label>
          <span className="text-xs font-bold text-slate-500">
            {value.length} / {maxImages} uploaded
          </span>
        </div>
      )}

      {/* Grid of uploaded images + upload trigger */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {value.map((url, idx) => (
          <div key={idx} className="relative aspect-square rounded-xl overflow-hidden border-2 border-slate-200 group bg-slate-100 shadow-xs">
            <Image src={url} alt={`Product Image ${idx + 1}`} fill className="object-cover" />
            <div className="absolute top-1 left-1 bg-slate-900/80 text-white text-[10px] font-extrabold px-1.5 py-0.5 rounded-md">
              {idx === 0 ? 'Main' : `#${idx + 1}`}
            </div>
            <button
              type="button"
              onClick={() => handleRemoveImage(idx)}
              className="absolute top-1 right-1 p-1 bg-red-600 hover:bg-red-700 text-white rounded-full opacity-90 transition-opacity shadow-sm"
              title="Remove Image"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}

        {value.length < maxImages && (
          <div className="flex flex-col gap-2 aspect-square rounded-xl border-2 border-dashed border-sky-300 hover:border-sea bg-sky-50/50 hover:bg-sky-50 transition-colors p-3 items-center justify-center text-center">
            {isUploading ? (
              <div className="flex flex-col items-center gap-1 text-sea">
                <Loader2 className="w-6 h-6 animate-spin" />
                <span className="text-xs font-bold">Uploading...</span>
              </div>
            ) : (
              <>
                <p className="text-[11px] font-extrabold text-slate-700">Add Photo {value.length + 1}/{maxImages}</p>
                <div className="flex gap-1.5 w-full">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="flex-1 px-1.5 py-1 text-[11px] h-8 gap-1 bg-white hover:bg-slate-50 border-slate-300"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Upload className="w-3 h-3 text-sea" />
                    <span>File</span>
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="flex-1 px-1.5 py-1 text-[11px] h-8 gap-1 bg-white hover:bg-slate-50 border-slate-300"
                    onClick={openCamera}
                  >
                    <Camera className="w-3 h-3 text-sea" />
                    <span>Camera</span>
                  </Button>
                </div>
              </>
            )}
          </div>
        )}
      </div>

      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/jpeg,image/png,image/webp"
        multiple
        className="hidden"
      />
      <input
        type="file"
        ref={cameraInputRef}
        onChange={handleFileChange}
        accept="image/*"
        capture="environment"
        className="hidden"
      />

      {error && <p className="text-xs font-bold text-red-600">{error}</p>}

      {/* Camera Live Modal Overlay */}
      {isCameraOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex flex-col items-center justify-between p-4 sm:p-6">
          <div className="w-full max-w-md flex justify-between items-center text-white">
            <span className="text-sm font-bold flex items-center gap-2">
              <Camera className="w-4 h-4 text-sky-400" /> Snap Product Photo ({value.length + 1}/{maxImages})
            </span>
            <button
              type="button"
              onClick={closeCamera}
              className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="relative w-full max-w-md aspect-3/4 bg-black rounded-2xl overflow-hidden border border-white/20 my-auto shadow-2xl flex items-center justify-center">
            <video
              ref={videoRef}
              playsInline
              muted
              onCanPlay={() => setIsCameraReady(true)}
              className="w-full h-full object-cover"
            />
            {!isCameraReady && (
              <div className="absolute inset-0 bg-slate-900 flex flex-col items-center justify-center text-white gap-2">
                <Loader2 className="w-8 h-8 animate-spin text-sea" />
                <span className="text-xs">Starting camera...</span>
              </div>
            )}
          </div>

          <div className="w-full max-w-md flex items-center justify-center gap-4 pb-4">
            <Button
              type="button"
              variant="outline"
              onClick={closeCamera}
              className="border-white/30 text-white hover:bg-white/10 rounded-xl"
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={takePhoto}
              disabled={!isCameraReady}
              className="bg-amber-400 hover:bg-amber-300 text-slate-950 font-black px-8 py-3 rounded-xl shadow-lg gap-2 text-sm"
            >
              <Camera className="w-4 h-4" /> Snap Photo
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
