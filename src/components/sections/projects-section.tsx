'use client';

import Image from 'next/image';
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
import { Github, Lightbulb, Play } from 'lucide-react';
import projectsData from '@/lib/projects-data.json';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';

export function ProjectsSection() {
  const { projects } = projectsData;

  return (
    <section id="projects" className="scroll-mt-16">
      <div className="max-w-5xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 flex items-center justify-center gap-3">
          <Lightbulb className="w-8 h-8 text-primary" />
          Proyek Unggulan
        </h2>
        <Carousel
          opts={{
            align: 'start',
          }}
          className="w-full"
        >
          <CarouselContent>
            {projects.map((project) => (
              <CarouselItem
                key={project.id}
                className="basis-[90%] md:basis-1/2 lg:basis-1/3"
              >
                <div className="p-1 h-full">
                  <Card className="h-full flex flex-col transition-all duration-300 hover:shadow-xl hover:shadow-primary/20">
                    <CardHeader>
                      <div className="relative w-full aspect-video mb-4 rounded-md overflow-hidden">
                        <Image
                          src={project.imageUrl}
                          alt={project.title}
                          fill
                          style={{ objectFit: 'cover' }}
                          data-ai-hint={project.imageHint}
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        />
                      </div>
                      <CardTitle>{project.title}</CardTitle>
                      <CardDescription>{project.description}</CardDescription>
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
           <CardFooter className="pt-4 mt-auto flex gap-2">
  {project.playstoreUrl && (
    <a
      href={project.playstoreUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="w-full"
    >
      <Button
        variant="outline"
        className="w-full h-10 flex items-center justify-center gap-2"
      >
        <Play className="h-4 w-4" />
        Play Store
      </Button>
    </a>
  )}

  {project.githubUrl && (
    <a
      href={project.githubUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="w-full"
    >
      <Button
        variant="outline"
        className="w-full h-10 flex items-center justify-center gap-2"
      >
        <Github className="h-4 w-4" />
        Repositori
      </Button>
    </a>
  )}
</CardFooter>


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
