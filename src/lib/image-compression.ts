import imageCompression from 'browser-image-compression';

export interface ImageCompressionOptions {
  /** Maximum file size in MB. Default: 1 */
  maxSizeMB?: number;
  /** Maximum width or height in pixels. Default: 2048 (Crisp on 2K / Retina displays) */
  maxWidthOrHeight?: number;
  /** Initial compression quality (0 to 1). Default: 0.88 for visually lossless sharpness */
  initialQuality?: number;
  /** Whether to keep image resolution. Default: false (downscales only if exceeds maxWidthOrHeight) */
  alwaysKeepResolution?: boolean;
  /** Use Web Worker for background processing. Default: true */
  useWebWorker?: boolean;
  /** Callback for compression progress (0 - 100) */
  onProgress?: (progress: number) => void;
}

/**
 * Checks whether a given file is a raster image suitable for compression.
 * Vector files (SVG) and non-images (PDF, docs) are excluded.
 */
export function shouldCompressImage(file: File): boolean {
  if (!file || !file.type) return false;

  // Don't rasterize vector SVGs
  if (file.type === 'image/svg+xml' || file.name.toLowerCase().endsWith('.svg')) {
    return false;
  }

  // Only compress raster images
  return file.type.startsWith('image/');
}

/**
 * Format bytes into human-readable file size string (KB, MB).
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

/**
 * Compresses an image file and converts it to WebP format,
 * preserving sharpness, color fidelity, and high detail.
 */
export async function compressImageToWebP(
  file: File,
  options?: ImageCompressionOptions
): Promise<{
  file: File;
  originalSize: number;
  compressedSize: number;
  compressionRatio: number;
}> {
  const originalSize = file.size;

  // If not a compressible image, return as-is
  if (!shouldCompressImage(file)) {
    return {
      file,
      originalSize,
      compressedSize: originalSize,
      compressionRatio: 0,
    };
  }

  const maxSizeMB = options?.maxSizeMB ?? 1;
  const maxWidthOrHeight = options?.maxWidthOrHeight ?? 2048;
  const initialQuality = options?.initialQuality ?? 0.88;
  const alwaysKeepResolution = options?.alwaysKeepResolution ?? false;

  // If already WebP and already under the target maxSizeMB, avoid re-encoding
  if (file.type === 'image/webp' && originalSize <= maxSizeMB * 1024 * 1024) {
    return {
      file,
      originalSize,
      compressedSize: originalSize,
      compressionRatio: 0,
    };
  }

  const compressionConfig = {
    maxSizeMB,
    maxWidthOrHeight,
    initialQuality,
    alwaysKeepResolution,
    useWebWorker: options?.useWebWorker ?? true,
    fileType: 'image/webp',
    onProgress: options?.onProgress,
  };

  let compressedBlob: File;

  try {
    // Attempt compression with Web Worker
    compressedBlob = await imageCompression(file, compressionConfig);
  } catch (workerError) {
    console.warn('Web Worker compression failed or blocked, falling back to main thread:', workerError);
    // Fallback to main thread without Web Worker if worker is blocked or CDN script unavailable
    compressedBlob = await imageCompression(file, {
      ...compressionConfig,
      useWebWorker: false,
    });
  }

  // Create a clean new file name ending in .webp
  const cleanBaseName = file.name
    .replace(/\.[^/.]+$/, '')
    .toLowerCase()
    .replace(/[^a-z0-9_-]/g, '-');
  const webpFileName = `${cleanBaseName || 'image'}.webp`;

  // Construct standard File object with image/webp mime type
  const webpFile = new File([compressedBlob], webpFileName, {
    type: 'image/webp',
    lastModified: Date.now(),
  });

  const compressedSize = webpFile.size;
  const compressionRatio =
    originalSize > 0
      ? Math.max(0, Math.round(((originalSize - compressedSize) / originalSize) * 100))
      : 0;

  return {
    file: webpFile,
    originalSize,
    compressedSize,
    compressionRatio,
  };
}
