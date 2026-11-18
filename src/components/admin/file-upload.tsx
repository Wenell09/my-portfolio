'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { UploadCloud, CheckCircle2, AlertCircle, X, Image as ImageIcon, Loader2 } from 'lucide-react';
import Image from 'next/image';

interface FileUploadProps {
  onSuccess: (url: string) => void;
  onRemove?: () => void;
  currentUrl?: string | null;
  folder?: string;
  accept?: string;
  label?: string;
}

export function FileUpload({
  onSuccess,
  onRemove,
  currentUrl,
  folder = 'uploads',
  accept = 'image/*',
  label = 'Upload File',
}: FileUploadProps) {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentUrl || null);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      const formData = new FormData();
      formData.append('file', file);
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
      setError(err.message || 'Gagal mengupload file');
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setPreviewUrl(null);
    setSuccess(false);
    if (onRemove) onRemove();
  };

  const isImage = previewUrl && (
    previewUrl.startsWith('data:image') ||
    previewUrl.startsWith('/') ||
    previewUrl.includes('.png') ||
    previewUrl.includes('.jpg') ||
    previewUrl.includes('.jpeg') ||
    previewUrl.includes('.webp') ||
    previewUrl.includes('.svg') ||
    previewUrl.includes('blob.vercel-storage.com')
  );

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
              {loading ? 'Uploading...' : label}
            </span>
          </Button>
        </label>

        {previewUrl && onRemove && (
          <Button type="button" variant="ghost" size="sm" onClick={handleClear} className="text-muted-foreground hover:text-destructive h-8 px-2">
            <X className="w-4 h-4 mr-1" /> Hapus
          </Button>
        )}

        {success && <CheckCircle2 className="w-4 h-4 text-green-500" />}
        {error && <AlertCircle className="w-4 h-4 text-destructive" />}
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
