import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { StorageService } from './storage';

export const EducationSchema = z.object({
  school: z.string().min(1, 'School is required'),
  degree: z.string().min(1, 'Degree is required'),
  field: z.string().min(1, 'Field of study is required'),
  period: z.string().min(1, 'Period is required'),
  description: z.string().default(''),
  logoUrl: z.string().default('/favicon.jpeg'),
  logoHint: z.string().optional().nullable(),
  order: z.number().int().default(0),
});

export const EducationUpdateSchema = EducationSchema.partial();

export class EducationService {
  static async getAll() {
    return await prisma.education.findMany({
      orderBy: { order: 'asc' },
    });
  }

  static async getById(id: string) {
    return await prisma.education.findUnique({ where: { id } });
  }

  static async create(raw: unknown) {
    const data = EducationSchema.parse(raw);
    return await prisma.education.create({ data });
  }

  static async update(id: string, raw: unknown) {
    const data = EducationUpdateSchema.parse(raw);
    const existing = await prisma.education.findUnique({ where: { id } });
    if (!existing) throw new Error('Education not found');

    const updated = await prisma.education.update({
      where: { id },
      data,
    });

    if (data.logoUrl && existing.logoUrl !== data.logoUrl && StorageService.isBlobUrl(existing.logoUrl)) {
      try {
        await StorageService.delete(existing.logoUrl);
      } catch (e) {
        console.warn('Failed to delete old education logo blob:', e);
      }
    }

    return updated;
  }

  static async delete(id: string) {
    const existing = await prisma.education.findUnique({ where: { id } });
    if (!existing) throw new Error('Education not found');

    const deleted = await prisma.education.delete({ where: { id } });

    if (StorageService.isBlobUrl(existing.logoUrl)) {
      try {
        await StorageService.delete(existing.logoUrl);
      } catch (e) {
        console.warn('Failed to delete education logo blob:', e);
      }
    }

    return deleted;
  }
}
