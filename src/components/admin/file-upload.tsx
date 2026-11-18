'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { UploadCloud, CheckCircle2, AlertCircle, X, Image as ImageIcon, Loader2, Sparkles } from 'lucide-react';
import Image from 'next/image';
import {
  compressImageToWebP,
  shouldCompressImage,
  formatFileSize,
} from '@/lib/image-compression';

interface FileUploadProps {
  onSuccess: (url: string) => void;
  onRemove?: () => void;
  currentUrl?: string | null;
  folder?: string;
  accept?: string;
  label?: string;
  /** Maximum target file size in MB. Default: 1 */
  maxSizeMB?: number;
  /** Maximum dimension (width/height) to preserve crisp detail without excessive resolution. Default: 2048 */
  maxWidthOrHeight?: number;
  /** Compression initial quality (0 to 1). Default: 0.88 */
  initialQuality?: number;
  /** Disable automatic client-side compression to WebP */
  disableCompression?: boolean;
}

export function FileUpload({
  onSuccess,
  onRemove,
  currentUrl,
  folder = 'uploads',
  accept = 'image/*',
  label = 'Upload File',
  maxSizeMB = 1,
  maxWidthOrHeight = 2048,
  initialQuality = 0.88,
  disableCompression = false,
}: FileUploadProps) {
  const [loading, setLoading] = useState(false);
  const [statusText, setStatusText] = useState('');
  const [compressionInfo, setCompressionInfo] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentUrl || null);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    setStatusText('Memproses file...');
    setError('');
    setSuccess(false);
    setCompressionInfo(null);

    try {
      let uploadFile: File = file;

      // Compress and convert to WebP if the file is a raster image
      if (!disableCompression && shouldCompressImage(file)) {
        setStatusText('Mengompres ke WebP...');
        const result = await compressImageToWebP(file, {
          maxSizeMB,
          maxWidthOrHeight,
          initialQuality,
          useWebWorker: true,
        });

        uploadFile = result.file;

        if (result.compressionRatio > 0) {
          setCompressionInfo(
            `${formatFileSize(result.originalSize)} → ${formatFileSize(result.compressedSize)} (-${result.compressionRatio}%)`
          );
        }
      }

      setStatusText('Mengunggah ke storage...');

      const formData = new FormData();
      formData.append('file', uploadFile);
      formData.append('folder', folder);
      if (previewUrl && previewUrl.includes('.blob.vercel-storage.com')) {
        formData.append('replaceUrl', previewUrl);
      }

      const res = await fetch('/api/v1/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Upload failed');
      }

      setPreviewUrl(data.url);
      onSuccess(data.url);
      setSuccess(true);
    } catch (err: any) {
      console.error('Upload error:', err);
      setError(err.message || 'Gagal mengupload file');
    } finally {
      setLoading(false);
      setStatusText('');
      // Reset input value so re-selecting same file triggers onChange
      e.target.value = '';
    }
  };

  const handleClear = () => {
    setPreviewUrl(null);
    setSuccess(false);
    setCompressionInfo(null);
    if (onRemove) onRemove();
  };

  const isPdf =
    previewUrl &&
    (previewUrl.toLowerCase().endsWith('.pdf') || previewUrl.toLowerCase().includes('.pdf?'));

  const isImage =
    previewUrl &&
    !isPdf &&
    (previewUrl.startsWith('data:image') ||
      previewUrl.startsWith('/') ||
      /\.(png|jpe?g|webp|svg|gif|avif)($|\?)/i.test(previewUrl) ||
      previewUrl.includes('blob.vercel-storage.com'));

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-3">
        <label className="cursor-pointer">
          <Input
            type="file"
            accept={accept}
            onChange={handleUpload}
            disabled={loading}
            className="hidden"
          />
          <Button type="button" variant="outline" size="sm" disabled={loading} asChild>
            <span className="flex items-center gap-2">
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin text-primary" />
              ) : (
                <UploadCloud className="w-4 h-4" />
              )}
              {loading ? statusText || 'Mengupload...' : label}
            </span>
          </Button>
        </label>

        {previewUrl && onRemove && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleClear}
            className="text-muted-foreground hover:text-destructive h-8 px-2"
          >
            <X className="w-4 h-4 mr-1" /> Hapus
          </Button>
        )}

        {success && <CheckCircle2 className="w-4 h-4 text-green-500" />}
        {error && <AlertCircle className="w-4 h-4 text-destructive" />}

        {compressionInfo && (
          <span className="inline-flex items-center gap-1 text-xs text-muted-foreground bg-primary/10 text-primary px-2 py-0.5 rounded-full font-medium">
            <Sparkles className="w-3 h-3" />
            WebP {compressionInfo}
          </span>
        )}
      </div>

      {previewUrl && (
        <div className="relative inline-block border border-border rounded-md overflow-hidden bg-muted/40 p-1">
          {isImage ? (
            <div className="relative w-28 h-20 rounded overflow-hidden bg-black/20">
              <Image
                src={previewUrl}
                alt="Upload preview"
                fill
                className="object-cover"
                unoptimized
              />
            </div>
          ) : (
            <div className="flex items-center gap-2 p-2 text-xs text-muted-foreground">
              <ImageIcon className="w-4 h-4" />
              <span className="max-w-xs truncate">{previewUrl}</span>
            </div>
          )}
        </div>
      )}

      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}
