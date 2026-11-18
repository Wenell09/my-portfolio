import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { StorageService } from './storage';
import { ProjectCategory, ProjectStatus } from '@prisma/client';

export const ProjectSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required'),
  features: z.array(z.string()).default([]),
  category: z.nativeEnum(ProjectCategory).default(ProjectCategory.MOBILE),
  imageUrl: z.string().min(1, 'Image URL is required'),
  imageHint: z.string().optional().nullable(),
  screenshots: z.array(z.string()).default([]),
  tags: z.array(z.string()).default([]),
  playstoreUrl: z.string().optional().nullable(),
  githubUrl: z.string().optional().nullable(),
  demoUrl: z.string().optional().nullable(),
  status: z.nativeEnum(ProjectStatus).default(ProjectStatus.COMPLETED),
  isPublished: z.boolean().default(true),
  order: z.number().int().default(0),
});

export const ProjectUpdateSchema = ProjectSchema.partial();

export class ProjectService {
  static async getAll(publishedOnly = false) {
    const where = publishedOnly ? { isPublished: true } : {};
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

    // Clean up removed screenshot blobs
    if (data.screenshots && existing.screenshots) {
      const removedScreenshots = existing.screenshots.filter(
        (url) => !data.screenshots!.includes(url) && StorageService.isBlobUrl(url)
      );
      for (const url of removedScreenshots) {
        try {
          await StorageService.delete(url);
        } catch (e) {
          console.warn('Failed to delete old screenshot from blob:', e);
        }
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

    // Delete main image
    if (StorageService.isBlobUrl(existing.imageUrl)) {
      try {
        await StorageService.delete(existing.imageUrl);
      } catch (e) {
        console.warn('Failed to delete project image from blob:', e);
      }
    }

    // Delete screenshots
    for (const url of existing.screenshots) {
      if (StorageService.isBlobUrl(url)) {
        try {
          await StorageService.delete(url);
        } catch (e) {
          console.warn('Failed to delete screenshot from blob:', e);
        }
      }
    }

    return deleted;
  }
}
