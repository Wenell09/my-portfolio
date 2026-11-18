import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { StorageService } from './storage';

export const ProfileSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required'),
  profileImageUrl: z.string().min(1, 'Profile image URL is required'),
  imageHint: z.string().optional().nullable(),
  email: z.string().email().optional().nullable().or(z.literal('')),
  linkedin: z.string().optional().nullable(),
  github: z.string().optional().nullable(),
  instagram: z.string().optional().nullable(),
  whatsapp: z.string().optional().nullable(),
});

export const ProfileUpdateSchema = ProfileSchema.partial();

export class ProfileService {
  static async get() {
    return await prisma.profile.findFirst();
  }

  static async update(raw: unknown) {
    const data = ProfileUpdateSchema.parse(raw);
    const existing = await prisma.profile.findFirst();

    if (existing) {
      const updated = await prisma.profile.update({
        where: { id: existing.id },
        data,
      });

      // Cleanup old blob profile picture if changed
      if (
        data.profileImageUrl &&
        existing.profileImageUrl !== data.profileImageUrl &&
        StorageService.isBlobUrl(existing.profileImageUrl)
      ) {
        try {
          await StorageService.delete(existing.profileImageUrl);
        } catch (e) {
          console.warn('Failed to delete old profile image from blob:', e);
        }
      }

      return updated;
    }

    return await prisma.profile.create({
      data: ProfileSchema.parse(raw),
    });
  }
}
