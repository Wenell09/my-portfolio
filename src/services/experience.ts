import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { StorageService } from './storage';

export const ExperienceSchema = z.object({
  company: z.string().min(1, 'Company is required'),
  category: z.string().min(1, 'Category is required'),
  role: z.string().min(1, 'Role is required'),
  period: z.string().min(1, 'Period is required'),
  description: z.string().min(1, 'Description is required'),
  logoUrl: z.string().min(1, 'Logo URL is required'),
  logoHint: z.string().optional().nullable(),
  status: z.enum(['draft', 'published']).default('published'),
  order: z.number().int().default(0),
});

export const ExperienceUpdateSchema = ExperienceSchema.partial();

export class ExperienceService {
  static async getAll(publishedOnly = false) {
    const where = publishedOnly ? { status: 'published' } : {};
    return await prisma.experience.findMany({
      where,
      orderBy: { order: 'asc' },
    });
  }

  static async getById(id: string) {
    return await prisma.experience.findUnique({ where: { id } });
  }

  static async create(raw: unknown) {
    const data = ExperienceSchema.parse(raw);
    return await prisma.experience.create({ data });
  }

  static async update(id: string, raw: unknown) {
    const data = ExperienceUpdateSchema.parse(raw);
    const existing = await prisma.experience.findUnique({ where: { id } });
    if (!existing) throw new Error('Experience not found');

    const updated = await prisma.experience.update({
      where: { id },
      data,
    });

    if (data.logoUrl && existing.logoUrl !== data.logoUrl && StorageService.isBlobUrl(existing.logoUrl)) {
      try {
        await StorageService.delete(existing.logoUrl);
      } catch (e) {
        console.warn('Failed to delete old experience logo blob:', e);
      }
    }

    return updated;
  }

  static async delete(id: string) {
    const existing = await prisma.experience.findUnique({ where: { id } });
    if (!existing) throw new Error('Experience not found');

    const deleted = await prisma.experience.delete({ where: { id } });

    if (StorageService.isBlobUrl(existing.logoUrl)) {
      try {
        await StorageService.delete(existing.logoUrl);
      } catch (e) {
        console.warn('Failed to delete experience logo blob:', e);
      }
    }

    return deleted;
  }
}
