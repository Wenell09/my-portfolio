import { HeroSection } from '@/components/sections/hero-section';
import { SkillsSection } from '@/components/sections/skills-section';
import { ProjectsSection } from '@/components/sections/projects-section';
import { CertificatesSection } from '@/components/sections/certificates-section';
import { ExperienceSection } from '@/components/sections/experience-section';
import { ContactSection } from '@/components/sections/contact-section';
import { Navbar } from '@/components/layout/navbar';
import { GridBackground } from '@/components/ui/grid-background';

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen relative">
      <GridBackground />
      <div className="relative z-10 flex flex-col flex-1">
        <Navbar />
        <main className="flex-1">
          <HeroSection />
          <div className="space-y-12 md:space-y-24 px-4 md:px-8 py-12 md:py-24">
            <SkillsSection />
            <ProjectsSection />
            <CertificatesSection />
            <ExperienceSection />
            <ContactSection />
          </div>
        </main>
        <footer className="px-4 py-6 text-center text-xs text-muted-foreground">
          © {new Date().getFullYear()} Dibuat oleh{' '}
          <a
            href="https://github.com/Wenell09"
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold text-foreground hover:underline"
          >
            Nabil Al Faatir
          </a>
        </footer>
      </div>
    </div>
  );
}
