'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Github, Lightbulb, Play, ExternalLink } from 'lucide-react';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';

interface Project {
  id: string;
  slug: string;
  title: string;
  description: string;
  category: string;
  imageUrl: string;
  imageHint?: string | null;
  tags: string[];
  playstoreUrl?: string | null;
  githubUrl?: string | null;
  demoUrl?: string | null;
}

const CATEGORY_OPTIONS = [
  { value: 'ALL', label: 'Semua' },
  { value: 'MOBILE', label: 'Mobile' },
  { value: 'WEB', label: 'Web' },
  { value: 'BACKEND', label: 'Backend' },
  { value: 'FULLSTACK', label: 'Full Stack' },
  { value: 'OTHER', label: 'Other' },
];

const CATEGORY_LABEL: Record<string, string> = {
  MOBILE: 'Mobile',
  WEB: 'Web',
  BACKEND: 'Backend',
  FULLSTACK: 'Full Stack',
  OTHER: 'Other',
};

export function ProjectsSection({ data = [] }: { data?: Project[] }) {
  const [activeFilter, setActiveFilter] = useState('ALL');

  if (!data || data.length === 0) return null;

  // Hanya tampilkan filter category yang benar-benar ada di data
  const availableCategories = CATEGORY_OPTIONS.filter(
    (opt) => opt.value === 'ALL' || data.some((p) => p.category === opt.value)
  );

  const filtered = activeFilter === 'ALL'
    ? data
    : data.filter((p) => p.category === activeFilter);

  return (
    <section id="projects" className="scroll-mt-16">
      <div className="max-w-5xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-8 flex items-center justify-center gap-3 leading-tight text-balance">
          <Lightbulb className="w-8 h-8 text-primary" />
          Proyek Unggulan
        </h2>

        {/* Filter Buttons */}
        {availableCategories.length > 2 && (
          <div className="flex flex-wrap justify-center gap-2 mb-10">
            {availableCategories.map((opt) => (
              <Button
                key={opt.value}
                variant={activeFilter === opt.value ? 'default' : 'outline'}
                size="sm"
                onClick={() => setActiveFilter(opt.value)}
                className="rounded-full px-5 text-sm transition-all"
              >
                {opt.label}
              </Button>
            ))}
          </div>
        )}

        <Carousel
          opts={{ align: 'start' }}
          className="w-full"
        >
          <CarouselContent>
            {filtered.map((project) => (
              <CarouselItem
                key={project.id}
                className="basis-[90%] md:basis-1/2 lg:basis-1/3"
              >
                <div className="p-1 h-full">
                  <Card className="h-full flex flex-col transition-all duration-300 hover:shadow-xl hover:shadow-primary/20 hover:border-primary/40">
                    {/* Bagian card utama dapat diklik untuk ke halaman detail */}
                    <Link href={`/projects/${project.slug}`} className="group flex-1 flex flex-col">
                      <CardHeader>
                        <div className="relative w-full aspect-video mb-4 rounded-md overflow-hidden">
                          <Image
                            src={project.imageUrl}
                            alt={project.title}
                            fill
                            style={{ objectFit: 'cover' }}
                            data-ai-hint={project.imageHint}
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                            className="group-hover:scale-105 transition-transform duration-300"
                          />
                          {project.category && (
                            <div className="absolute top-2 left-2">
                              <Badge variant="secondary" className="text-[10px] bg-background/80 backdrop-blur-sm">
                                {CATEGORY_LABEL[project.category] ?? project.category}
                              </Badge>
                            </div>
                          )}
                        </div>
                        <CardTitle className="group-hover:text-primary transition-colors">
                          {project.title}
                        </CardTitle>
                        <CardDescription className="line-clamp-2">{project.description}</CardDescription>
                      </CardHeader>

                      <CardContent className="flex flex-wrap gap-2 flex-grow">
                        {project.tags.map((tag) => (
                          <Badge
                            key={tag}
                            className="text-xs px-2 py-1 h-6 flex items-center whitespace-nowrap"
                          >
                            {tag}
                          </Badge>
                        ))}
                      </CardContent>
                    </Link>

                    {/* Footer berada di luar Link utama agar valid secara HTML (tidak ada nested <a>) */}
                    {(project.playstoreUrl || project.demoUrl || project.githubUrl) && (
                      <CardFooter className="pt-4 mt-auto flex flex-wrap gap-2">
                        {project.playstoreUrl && (
                          <Button variant="outline" className="flex-1 min-w-[100px] h-10 gap-2" asChild>
                            <a
                              href={project.playstoreUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              <Play className="h-4 w-4" />
                              Play Store
                            </a>
                          </Button>
                        )}
                        {project.demoUrl && (
                          <Button variant="outline" className="flex-1 min-w-[100px] h-10 gap-2" asChild>
                            <a
                              href={project.demoUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              <ExternalLink className="h-4 w-4" />
                              Live Demo
                            </a>
                          </Button>
                        )}
                        {project.githubUrl && (
                          <Button variant="outline" className="flex-1 min-w-[100px] h-10 gap-2" asChild>
                            <a
                              href={project.githubUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              <Github className="h-4 w-4" />
                              Repositori
                            </a>
                          </Button>
                        )}
                      </CardFooter>
                    )}
                  </Card>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="hidden md:inline-flex" />
          <CarouselNext className="hidden md:inline-flex" />
        </Carousel>
      </div>
    </section>
  );
}
