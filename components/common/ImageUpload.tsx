'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Camera, Upload, X, Loader2 } from 'lucide-react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { readApiResponse } from '@/lib/api-client';

export interface ImageUploadProps {
  value?: string | null;
  onChange: (url: string | null) => void;
  label?: string;
  prefix?: string;
}

export default function ImageUpload({
  value,
  onChange,
  label = 'Upload Image',
  prefix = 'listing',
}: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [isCameraReady, setIsCameraReady] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

/** Fast browser-side image resizer to make uploads instantaneous */
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

      onChange(data.url);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (file) await uploadFile(file);
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
      setError('Camera access was blocked or is unavailable. Allow camera access, then try again or upload a photo from your device.');
    }
  };

  const takePhoto = async () => {
    const video = videoRef.current;
    if (!video || !video.videoWidth || !video.videoHeight) {
      setError('The camera is still loading. Please try again.');
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
      setError('We could not capture that photo. Please try again.');
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
    <div className="space-y-2">
      {label && <label className="block text-sm font-medium text-slate-700">{label}</label>}

      {value ? (
        <div className="relative w-full h-48 rounded-xl overflow-hidden border border-slate-200 group bg-slate-50">
          <Image src={value} alt="Uploaded Image" fill className="object-cover" />
          <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
            <Button
              type="button"
              variant="danger"
              size="sm"
              onClick={() => onChange(null)}
              className="gap-1.5"
            >
              <X className="w-4 h-4" />
              Remove
            </Button>
          </div>
        </div>
      ) : (
        <div className="relative flex flex-col items-center justify-center w-full min-h-40 border-2 border-dashed border-slate-300 rounded-xl bg-slate-50 p-4">
          <div className="flex flex-col items-center justify-center pt-5 pb-6 text-center px-4">
            {isUploading ? (
              <Loader2 className="w-8 h-8 text-sea animate-spin mb-2" />
            ) : (
              <Upload className="w-8 h-8 text-slate-400 mb-2" />
            )}
            <p className="text-sm font-semibold text-slate-700">
              {isUploading ? 'Optimizing & Uploading image...' : 'Add a photo of your business or product'}
            </p>
            <p className="text-xs text-slate-500 mt-1">PNG, JPG or WebP (Auto-Optimized, max 5MB)</p>
          </div>

          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
            {/* Gallery / file picker */}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="gap-1.5"
            >
              <Upload className="w-4 h-4" /> Upload from device
            </Button>

            {/* Camera — uses ref.click() for reliable cross-browser behaviour */}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={openCamera}
              disabled={isUploading}
              className="gap-1.5"
            >
              <Camera className="w-4 h-4" /> Take a photo
            </Button>
          </div>

          {/* Hidden gallery input */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/png, image/jpeg, image/webp"
            style={{ position: 'absolute', top: 0, left: 0, width: '1px', height: '1px', opacity: 0, pointerEvents: 'none' }}
            onChange={handleFileChange}
            disabled={isUploading}
          />

          {/* Hidden camera input — must NOT use display:none for camera to open on mobile */}
          <input
            ref={cameraInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            style={{ position: 'absolute', top: 0, left: 0, width: '1px', height: '1px', opacity: 0, pointerEvents: 'none' }}
            onChange={handleFileChange}
            disabled={isUploading}
          />
        </div>
      )}

      {error && <p className="text-xs text-rose-600 mt-1">{error}</p>}

      {isCameraOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4">
          <div className="w-full max-w-3xl rounded-2xl bg-white p-4 shadow-2xl space-y-3">
            <div className="relative aspect-[3/4] max-h-[72vh] overflow-hidden rounded-xl bg-slate-950 sm:aspect-video">
              <video ref={videoRef} autoPlay playsInline muted onLoadedMetadata={() => setIsCameraReady(true)} className="h-full w-full object-cover" />
              {!isCameraReady && <div className="absolute inset-0 flex items-center justify-center text-sm font-medium text-white"><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Opening camera…</div>}
            </div>
            <div className="flex gap-2 justify-end">
              <Button type="button" variant="outline" onClick={closeCamera}>Cancel</Button>
              <Button type="button" variant="primary" onClick={takePhoto} disabled={!isCameraReady} className="gap-2"><Camera className="w-4 h-4" /> Take photo</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
