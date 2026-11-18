import { NextResponse } from 'next/server';
import { ProfileService } from '@/services/profile';
import { ProjectService } from '@/services/project';
import { SkillCategoryService } from '@/services/skill';
import { ExperienceService } from '@/services/experience';
import { CertificateService } from '@/services/certificate';
import { EducationService } from '@/services/education';
import { SocialLinkService } from '@/services/social-link';
import { SiteSettingService } from '@/services/settings';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
    const [
      dbProfile,
      dbProjects,
      dbSkills,
      dbExperiences,
      dbCertificates,
      dbEducation,
      dbSocialLinks,
      dbSettings,
    ] = await Promise.all([
      ProfileService.get().catch(() => null),
      ProjectService.getAll(true).catch(() => []),
      SkillCategoryService.getAll().catch(() => []),
      ExperienceService.getAll(true).catch(() => []),
      CertificateService.getAll(true).catch(() => []),
      EducationService.getAll().catch(() => []),
      SocialLinkService.getAll().catch(() => []),
      SiteSettingService.get().catch(() => null),
    ]);

    const isMaintenance =
      !dbProfile &&
      (!dbProjects || dbProjects.length === 0) &&
      (!dbSkills || dbSkills.length === 0) &&
      (!dbExperiences || dbExperiences.length === 0);

    return NextResponse.json({
      success: true,
      maintenance: isMaintenance,
      data: {
        profile: dbProfile || null,
        projects: dbProjects || [],
        skills: dbSkills || [],
        experiences: dbExperiences || [],
        certificates: dbCertificates || [],
        education: dbEducation || [],
        socialLinks: dbSocialLinks || [],
        settings: dbSettings || null,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch portfolio data' },
      { status: 500 }
    );
  }
}
