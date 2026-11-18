import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { StorageService } from './storage';

export const CertificateSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  fileUrl: z.string().min(1, 'File URL is required'),
  imageUrl: z.string().min(1, 'Image URL is required'),
  tags: z.array(z.string()).default([]),
  status: z.enum(['draft', 'published']).default('published'),
  order: z.number().int().default(0),
});

export const CertificateUpdateSchema = CertificateSchema.partial();

export class CertificateService {
  static async getAll(publishedOnly = false) {
    const where = publishedOnly ? { status: 'published' } : {};
    return await prisma.certificate.findMany({
      where,
      orderBy: { order: 'asc' },
    });
  }

  static async getById(id: string) {
    return await prisma.certificate.findUnique({ where: { id } });
  }

  static async getBySlug(slug: string) {
    return await prisma.certificate.findUnique({ where: { slug } });
  }

  static async create(raw: unknown) {
    const data = CertificateSchema.parse(raw);
    let baseSlug = data.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
    if (!baseSlug) baseSlug = 'cert';

    let slug = `${baseSlug}-${Date.now()}`;

    return await prisma.certificate.create({
      data: {
        ...data,
        slug,
      },
    });
  }

  static async update(id: string, raw: unknown) {
    const data = CertificateUpdateSchema.parse(raw);
    const existing = await prisma.certificate.findUnique({ where: { id } });
    if (!existing) throw new Error('Certificate not found');

    const updated = await prisma.certificate.update({
      where: { id },
      data,
    });

    if (data.imageUrl && existing.imageUrl !== data.imageUrl && StorageService.isBlobUrl(existing.imageUrl)) {
      try {
        await StorageService.delete(existing.imageUrl);
      } catch (e) {
        console.warn('Failed to delete old certificate image blob:', e);
      }
    }

    if (data.fileUrl && existing.fileUrl !== data.fileUrl && StorageService.isBlobUrl(existing.fileUrl)) {
      try {
        await StorageService.delete(existing.fileUrl);
      } catch (e) {
        console.warn('Failed to delete old certificate file blob:', e);
      }
    }

    return updated;
  }

  static async delete(id: string) {
    const existing = await prisma.certificate.findUnique({ where: { id } });
    if (!existing) throw new Error('Certificate not found');

    const deleted = await prisma.certificate.delete({ where: { id } });

    if (StorageService.isBlobUrl(existing.imageUrl)) {
      try {
        await StorageService.delete(existing.imageUrl);
      } catch (e) {
        console.warn('Failed to delete certificate image blob:', e);
      }
    }

    if (StorageService.isBlobUrl(existing.fileUrl)) {
      try {
        await StorageService.delete(existing.fileUrl);
      } catch (e) {
        console.warn('Failed to delete certificate file blob:', e);
      }
    }

    return deleted;
  }
}
