import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { StorageService } from './storage';

export const SkillCategorySchema = z.object({
  title: z.string().min(1, 'Category title is required'),
  icon: z.string().min(1, 'Icon name or URL is required'),
  order: z.number().int().default(0),
});

export const SkillCategoryUpdateSchema = SkillCategorySchema.partial();

export const SkillSchema = z.object({
  name: z.string().min(1, 'Skill name is required'),
  iconUrl: z.string().min(1, 'Icon URL is required'),
  categoryId: z.string().min(1, 'Category ID is required'),
  order: z.number().int().default(0),
});

export const SkillUpdateSchema = SkillSchema.partial();

export class SkillCategoryService {
  static async getAll() {
    return await prisma.skillCategory.findMany({
      include: {
        skills: {
          orderBy: { order: 'asc' },
        },
      },
      orderBy: { order: 'asc' },
    });
  }

  static async getById(id: string) {
    return await prisma.skillCategory.findUnique({
      where: { id },
      include: { skills: true },
    });
  }

  static async create(raw: unknown) {
    const data = SkillCategorySchema.parse(raw);
    return await prisma.skillCategory.create({ data });
  }

  static async update(id: string, raw: unknown) {
    const data = SkillCategoryUpdateSchema.parse(raw);
    return await prisma.skillCategory.update({
      where: { id },
      data,
    });
  }

  static async delete(id: string) {
    return await prisma.skillCategory.delete({ where: { id } });
  }
}

export class SkillService {
  static async getAll() {
    return await prisma.skill.findMany({
      include: { category: true },
      orderBy: { order: 'asc' },
    });
  }

  static async getById(id: string) {
    return await prisma.skill.findUnique({
      where: { id },
      include: { category: true },
    });
  }

  static async create(raw: unknown) {
    const data = SkillSchema.parse(raw);
    return await prisma.skill.create({ data });
  }

  static async update(id: string, raw: unknown) {
    const data = SkillUpdateSchema.parse(raw);
    return await prisma.skill.update({
      where: { id },
      data,
    });
  }

  static async delete(id: string) {
    const existing = await prisma.skill.findUnique({ where: { id } });
    const deleted = await prisma.skill.delete({ where: { id } });
    if (existing && StorageService.isBlobUrl(existing.iconUrl)) {
      try {
        await StorageService.delete(existing.iconUrl);
      } catch (e) {
        console.warn('Failed to delete skill icon blob:', e);
      }
    }
    return deleted;
  }
}
