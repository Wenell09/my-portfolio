import { prisma } from '@/lib/prisma';
import { z } from 'zod';

export const SocialLinkSchema = z.object({
  platform: z.string().min(1, 'Platform is required'),
  url: z.string().min(1, 'URL is required'),
  icon: z.string().default('Link'),
  order: z.number().int().default(0),
});

export const SocialLinkUpdateSchema = SocialLinkSchema.partial();

export class SocialLinkService {
  static async getAll() {
    return await prisma.socialLink.findMany({
      orderBy: { order: 'asc' },
    });
  }

  static async getById(id: string) {
    return await prisma.socialLink.findUnique({ where: { id } });
  }

  static async create(raw: unknown) {
    const data = SocialLinkSchema.parse(raw);
    return await prisma.socialLink.create({ data });
  }

  static async update(id: string, raw: unknown) {
    const data = SocialLinkUpdateSchema.parse(raw);
    return await prisma.socialLink.update({
      where: { id },
      data,
    });
  }

  static async delete(id: string) {
    return await prisma.socialLink.delete({ where: { id } });
  }
}
