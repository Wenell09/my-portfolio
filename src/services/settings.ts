import { prisma } from '@/lib/prisma';
import { z } from 'zod';

export const SiteSettingSchema = z.object({
  siteTitle: z.string().min(1, 'Site title is required'),
  siteDescription: z.string().default(''),
  footerText: z.string().default(''),
});

export const SiteSettingUpdateSchema = SiteSettingSchema.partial();

export class SiteSettingService {
  static async get() {
    let settings = await prisma.siteSetting.findUnique({
      where: { id: 'singleton' },
    });

    if (!settings) {
      settings = await prisma.siteSetting.create({
        data: {
          id: 'singleton',
          siteTitle: 'Nabil Al Faatir | Portfolio',
          siteDescription: 'Portofolio Profesional Nabil Al Faatir',
          footerText: `© ${new Date().getFullYear()} Dibuat oleh Nabil Al Faatir`,
        },
      });
    }

    return settings;
  }

  static async update(raw: unknown) {
    const data = SiteSettingUpdateSchema.parse(raw);
    return await prisma.siteSetting.upsert({
      where: { id: 'singleton' },
      update: data,
      create: {
        id: 'singleton',
        siteTitle: data.siteTitle || 'Nabil Al Faatir | Portfolio',
        siteDescription: data.siteDescription || '',
        footerText: data.footerText || `© ${new Date().getFullYear()} Dibuat oleh Nabil Al Faatir`,
      },
    });
  }
}
