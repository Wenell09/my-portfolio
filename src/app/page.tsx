import { HeroSection } from '@/components/sections/hero-section';
import { SkillsSection } from '@/components/sections/skills-section';
import { ProjectsSection } from '@/components/sections/projects-section';
import { CertificatesSection } from '@/components/sections/certificates-section';
import { ExperienceSection } from '@/components/sections/experience-section';
import { ContactSection } from '@/components/sections/contact-section';
import { Navbar } from '@/components/layout/navbar';
import { GridBackground } from '@/components/ui/grid-background';
import { UnderMaintenance } from '@/components/ui/under-maintenance';
import { PagePreloader } from '@/components/ui/page-preloader';
import { ProfileService } from '@/services/profile';
import { ProjectService } from '@/services/project';
import { SkillCategoryService } from '@/services/skill';
import { ExperienceService } from '@/services/experience';
import { CertificateService } from '@/services/certificate';
import { EducationService } from '@/services/education';
import { SocialLinkService } from '@/services/social-link';
import { SiteSettingService } from '@/services/settings';
import type { Metadata } from 'next';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function generateMetadata(): Promise<Metadata> {
  try {
    const [settings, profile] = await Promise.all([
      SiteSettingService.get().catch(() => null),
      ProfileService.get().catch(() => null),
    ]);

    if (!profile && !settings?.siteTitle) {
      return {
        title: 'Portfolio | Under Maintenance',
        description: 'Sistem portofolio sedang dalam proses sinkronisasi dan pemeliharaan.',
      };
    }

    return {
      title: settings?.siteTitle || (profile?.name ? `${profile?.name} | Portfolio` : 'Portfolio'),
      description: settings?.siteDescription || profile?.description || 'Portofolio Profesional',
    };
  } catch (e) {
    return {
      title: 'Portfolio | Under Maintenance',
      description: 'Sistem portofolio sedang dalam proses sinkronisasi dan pemeliharaan.',
    };
  }
}

export default async function Home() {
  let profile = null as any;
  let projects = [] as any[];
  let skillCategories = [] as any[];
  let experiences = [] as any[];
  let certificates = [] as any[];
  let education = [] as any[];
  let socialLinks = [] as any[];
  let settings: any = null;
  let footerText = `© ${new Date().getFullYear()} Portfolio`;

  try {
    const [
      dbProfile,
      dbProjects,
      dbSkillCats,
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

    profile = dbProfile;
    projects = dbProjects || [];
    skillCategories = dbSkillCats || [];
    experiences = dbExperiences || [];
    certificates = dbCertificates || [];
    education = dbEducation || [];
    socialLinks = dbSocialLinks || [];
    if (dbSettings) {
      settings = dbSettings;
      if (dbSettings.footerText) footerText = dbSettings.footerText;
    }
  } catch (error) {
    console.error('Error fetching portfolio data from backend:', error);
  }

  // Tampilkan Halaman Under Maintenance jika seluruh data dari backend CMS / API kosong
  const isAllDataEmpty =
    !profile &&
    projects.length === 0 &&
    skillCategories.length === 0 &&
    experiences.length === 0 &&
    certificates.length === 0 &&
    education.length === 0;

  if (isAllDataEmpty) {
    return <UnderMaintenance />;
  }

  return (
    <div className="flex flex-col min-h-screen relative">
      <PagePreloader />
      <GridBackground />
      <div className="relative z-10 flex flex-col flex-1">
        <Navbar siteTitle={settings?.siteTitle || profile?.name} />
        <main className="flex-1">
          {profile && <HeroSection data={profile} />}
          <div className="space-y-12 md:space-y-24 px-4 md:px-8 py-12 md:py-24">
            {skillCategories.length > 0 && <SkillsSection data={skillCategories} />}
            {projects.length > 0 && <ProjectsSection data={projects} />}
            {certificates.length > 0 && <CertificatesSection data={certificates} />}
            {(experiences.length > 0 || education.length > 0) && (
              <ExperienceSection data={experiences} education={education} />
            )}
            <ContactSection data={profile} socialLinks={socialLinks} />
          </div>
        </main>
        <footer className="px-4 py-6 text-center text-xs text-muted-foreground border-t border-border/10">
          {footerText}
        </footer>
      </div>
    </div>
  );
}
