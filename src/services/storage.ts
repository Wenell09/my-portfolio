import { put, del } from '@vercel/blob';

export class StorageService {
  private static ALLOWED_TYPES = [
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/svg+xml',
    'application/pdf',
  ];
  private static MAX_SIZE = 10 * 1024 * 1024; // 10MB

  static validate(file: File) {
    if (!file) {
      throw new Error('File tidak ditemukan');
    }
    if (!this.ALLOWED_TYPES.includes(file.type)) {
      throw new Error(`Tipe file ${file.type} tidak didukung. Tipe yang didukung: JPEG, PNG, WEBP, SVG, PDF.`);
    }
    if (file.size > this.MAX_SIZE) {
      throw new Error('Ukuran file melebihi batas maksimal 10MB');
    }
  }

  static isBlobUrl(url: string): boolean {
    return typeof url === 'string' && url.includes('.blob.vercel-storage.com');
  }

  static async upload(file: File, folder: string = 'uploads') {
    this.validate(file);

    const ext = file.name.split('.').pop() || 'bin';
    const cleanName = file.name
      .replace(/\.[^/.]+$/, '')
      .toLowerCase()
      .replace(/[^a-z0-9_-]/g, '-');
    const pathname = `${folder}/${cleanName}-${Date.now()}.${ext}`;

    const blob = await put(pathname, file, {
      access: 'public',
      addRandomSuffix: true,
      token: process.env.BLOB_READ_WRITE_TOKEN,
    });

    return {
      url: blob.url,
      pathname: blob.pathname,
      contentType: blob.contentType,
    };
  }

  static async delete(url: string) {
    if (!this.isBlobUrl(url)) {
      throw new Error('Hanya URL Vercel Blob yang dapat dihapus');
    }
    await del(url, {
      token: process.env.BLOB_READ_WRITE_TOKEN,
    });
  }

  /**
   * Replaces an existing blob file with a new file.
   * Ensures the new file is uploaded successfully first.
   * If oldUrl is a valid blob url, it deletes it safely without throwing if deletion fails.
   */
  static async replace(oldUrl: string | null | undefined, newFile: File, folder: string = 'uploads') {
    // 1. Upload new file
    const uploadResult = await this.upload(newFile, folder);

    // 2. Safely delete old file if applicable
    if (oldUrl && this.isBlobUrl(oldUrl)) {
      try {
        await this.delete(oldUrl);
      } catch (err) {
        console.warn('Failed to delete previous blob after replacement:', err);
      }
    }

    return uploadResult;
  }
}
