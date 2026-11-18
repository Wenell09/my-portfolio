import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { ProjectService } from '@/services/project';
import { SiteSettingService } from '@/services/settings';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { GridBackground } from '@/components/ui/grid-background';
import {
  Github,
  Play,
  ExternalLink,
  ArrowLeft,
  CheckCircle2,
  Clock,
  Archive,
  Tag,
  Layers,
  Star,
} from 'lucide-react';
import type { Metadata } from 'next';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

interface PageProps {
  params: { slug: string };
}

const CATEGORY_LABEL: Record<string, string> = {
  MOBILE: 'Mobile App',
  WEB: 'Web App',
  BACKEND: 'Backend / API',
  FULLSTACK: 'Full Stack',
  OTHER: 'Other',
};

const STATUS_CONFIG: Record<string, { label: string; icon: React.ElementType; variant: 'default' | 'secondary' | 'outline' }> = {
  COMPLETED: { label: 'Selesai', icon: CheckCircle2, variant: 'default' },
  IN_PROGRESS: { label: 'Sedang Dikerjakan', icon: Clock, variant: 'secondary' },
  ARCHIVED: { label: 'Diarsipkan', icon: Archive, variant: 'outline' },
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const project = await ProjectService.getBySlug(params.slug).catch(() => null);
  const settings = await SiteSettingService.get().catch(() => null);

  if (!project) {
    return { title: 'Project Not Found' };
  }

  return {
    title: `${project.title} | ${settings?.siteTitle ?? 'Portfolio'}`,
    description: project.description,
    openGraph: {
      title: project.title,
      description: project.description,
      images: [project.imageUrl],
    },
  };
}

export default async function ProjectDetailPage({ params }: PageProps) {
  const [project, settings] = await Promise.all([
    ProjectService.getBySlug(params.slug).catch(() => null),
    SiteSettingService.get().catch(() => null),
  ]);

  if (!project || !project.isPublished) {
    notFound();
  }

  const statusConfig = STATUS_CONFIG[project.status] ?? STATUS_CONFIG['COMPLETED'];
  const StatusIcon = statusConfig.icon;
  const categoryLabel = CATEGORY_LABEL[project.category] ?? project.category;
  const hasLinks = project.playstoreUrl || project.demoUrl || project.githubUrl;

  return (
    <div className="flex flex-col min-h-screen relative">
      <GridBackground />
      <div className="relative z-10 flex flex-col flex-1">

        <main className="flex-1 px-4 md:px-8 py-10 md:py-16 max-w-5xl mx-auto w-full">
          {/* Back Button */}
          <div className="mb-8">
            <Button variant="ghost" className="gap-2 pl-0 hover:pl-2 transition-all" asChild>
              <Link href="/#projects">
                <ArrowLeft className="w-4 h-4" />
                Kembali
              </Link>
            </Button>
          </div>

          {/* Hero Section */}
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 mb-12">
            {/* Cover Image */}
            <div className="lg:col-span-3 order-1">
              <div className="relative w-full aspect-video rounded-xl overflow-hidden shadow-2xl shadow-primary/10 border border-border/50">
                <Image
                  src={project.imageUrl}
                  alt={project.title}
                  fill
                  priority
                  style={{ objectFit: 'cover' }}
                  sizes="(max-width: 1024px) 100vw, 60vw"
                  data-ai-hint={project.imageHint ?? undefined}
                />
              </div>
            </div>

            {/* Project Info */}
            <div className="lg:col-span-2 order-2 flex flex-col justify-center space-y-5">
              {/* Category + Status */}
              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary" className="gap-1.5">
                  <Layers className="w-3 h-3" />
                  {categoryLabel}
                </Badge>
                <Badge variant={statusConfig.variant} className="gap-1.5">
                  <StatusIcon className="w-3 h-3" />
                  {statusConfig.label}
                </Badge>
              </div>

              {/* Title */}
              <h1 className="text-3xl md:text-4xl font-bold leading-tight">{project.title}</h1>

              {/* Description */}
              <p className="text-muted-foreground leading-relaxed">{project.description}</p>

              {/* Action Buttons */}
              {hasLinks && (
                <div className="flex flex-wrap gap-3 pt-2">
                  {project.demoUrl && (
                    <Button className="gap-2" asChild>
                      <a href={project.demoUrl} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="w-4 h-4" />
                        Live Demo
                      </a>
                    </Button>
                  )}
                  {project.playstoreUrl && (
                    <Button variant="outline" className="gap-2" asChild>
                      <a href={project.playstoreUrl} target="_blank" rel="noopener noreferrer">
                        <Play className="w-4 h-4" />
                        Play Store
                      </a>
                    </Button>
                  )}
                  {project.githubUrl && (
                    <Button variant="outline" className="gap-2" asChild>
                      <a href={project.githubUrl} target="_blank" rel="noopener noreferrer">
                        <Github className="w-4 h-4" />
                        Source Code
                      </a>
                    </Button>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Tech Stack */}
          {project.tags.length > 0 && (
            <div className="mb-10">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Tag className="w-5 h-5 text-primary" />
                Tech Stack
              </h2>
              <div className="flex flex-wrap gap-2">
                {project.tags.map((tag) => (
                  <Badge key={tag} variant="outline" className="text-sm px-3 py-1">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          <Separator className="mb-10" />

          {/* Features */}
          {project.features.length > 0 && (
            <div className="mb-12">
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                <Star className="w-6 h-6 text-primary" />
                Fitur Utama
              </h2>
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {project.features.map((feature, i) => (
                  <li
                    key={i}
                    className="flex items-start gap-3 p-4 rounded-lg border border-border/50 bg-card/50 backdrop-blur-sm hover:border-primary/40 transition-colors"
                  >
                    <CheckCircle2 className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                    <span className="text-sm leading-relaxed">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Screenshots Gallery */}
          {project.screenshots.length > 0 && (
            <div className="mb-12">
              <h2 className="text-2xl font-bold mb-6">Screenshots</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {project.screenshots.map((url, i) => (
                  <div
                    key={i}
                    className="relative aspect-video rounded-lg overflow-hidden border border-border/50 shadow-md hover:shadow-lg hover:shadow-primary/10 transition-shadow group"
                  >
                    <Image
                      src={url}
                      alt={`${project.title} screenshot ${i + 1}`}
                      fill
                      style={{ objectFit: 'cover' }}
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      className="group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Bottom CTA */}
          {hasLinks && (
            <>
              <Separator className="mb-10" />
              <div className="text-center space-y-4">
                <h3 className="text-xl font-semibold">Tertarik dengan proyek ini?</h3>
                <p className="text-muted-foreground">Jelajahi kode sumber atau coba langsung aplikasinya.</p>
                <div className="flex flex-wrap justify-center gap-3">
                  {project.githubUrl && (
                    <Button size="lg" variant="outline" className="gap-2" asChild>
                      <a href={project.githubUrl} target="_blank" rel="noopener noreferrer">
                        <Github className="w-5 h-5" />
                        Lihat Source Code
                      </a>
                    </Button>
                  )}
                  {project.demoUrl && (
                    <Button size="lg" className="gap-2" asChild>
                      <a href={project.demoUrl} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="w-5 h-5" />
                        Coba Live Demo
                      </a>
                    </Button>
                  )}
                  {project.playstoreUrl && (
                    <Button size="lg" variant="secondary" className="gap-2" asChild>
                      <a href={project.playstoreUrl} target="_blank" rel="noopener noreferrer">
                        <Play className="w-5 h-5" />
                        Download di Play Store
                      </a>
                    </Button>
                  )}
                </div>
              </div>
            </>
          )}
        </main>

        <footer className="px-4 py-6 text-center text-xs text-muted-foreground border-t border-border/10">
          {settings?.footerText || `© ${new Date().getFullYear()} Portfolio`}
        </footer>
      </div>
    </div>
  );
}
