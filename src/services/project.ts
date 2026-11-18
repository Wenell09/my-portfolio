import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { StorageService } from './storage';

export const ProjectSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required'),
  imageUrl: z.string().min(1, 'Image URL is required'),
  imageHint: z.string().optional().nullable(),
  tags: z.array(z.string()).default([]),
  playstoreUrl: z.string().optional().nullable(),
  githubUrl: z.string().optional().nullable(),
  demoUrl: z.string().optional().nullable(),
  status: z.enum(['draft', 'published']).default('published'),
  order: z.number().int().default(0),
});

export const ProjectUpdateSchema = ProjectSchema.partial();

export class ProjectService {
  static async getAll(publishedOnly = false) {
    const where = publishedOnly ? { status: 'published' } : {};
    return await prisma.project.findMany({
      where,
      orderBy: { order: 'asc' },
    });
  }

  static async getById(id: string) {
    return await prisma.project.findUnique({ where: { id } });
  }

  static async getBySlug(slug: string) {
    return await prisma.project.findUnique({ where: { slug } });
  }

  static async create(raw: unknown) {
    const data = ProjectSchema.parse(raw);
    let baseSlug = data.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
    if (!baseSlug) baseSlug = 'project';

    let slug = baseSlug;
    let counter = 1;
    while (await prisma.project.findUnique({ where: { slug } })) {
      slug = `${baseSlug}-${counter++}`;
    }

    return await prisma.project.create({
      data: {
        ...data,
        slug,
      },
    });
  }

  static async update(id: string, raw: unknown) {
    const data = ProjectUpdateSchema.parse(raw);

    // If updating image and replacing old blob
    const existing = await prisma.project.findUnique({ where: { id } });
    if (!existing) {
      throw new Error('Project not found');
    }

    const updated = await prisma.project.update({
      where: { id },
      data,
    });

    // If imageUrl changed and old was blob, safely clean up old blob
    if (data.imageUrl && existing.imageUrl !== data.imageUrl && StorageService.isBlobUrl(existing.imageUrl)) {
      try {
        await StorageService.delete(existing.imageUrl);
      } catch (e) {
        console.warn('Failed to delete old project image from blob:', e);
      }
    }

    return updated;
  }

  static async delete(id: string) {
    const existing = await prisma.project.findUnique({ where: { id } });
    if (!existing) {
      throw new Error('Project not found');
    }

    const deleted = await prisma.project.delete({ where: { id } });

    if (StorageService.isBlobUrl(existing.imageUrl)) {
      try {
        await StorageService.delete(existing.imageUrl);
      } catch (e) {
        console.warn('Failed to delete project image from blob:', e);
      }
    }

    return deleted;
  }
}
