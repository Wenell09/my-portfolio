'use client';

import Image from 'next/image';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import certificatesData from '@/lib/certificates-data.json';
import { Button } from '@/components/ui/button';
import { ExternalLink, Award } from 'lucide-react';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';

export function CertificatesSection() {
  return (
    <section id="certificates" className="scroll-mt-16">
      <div className="max-w-5xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 flex items-center justify-center gap-3 leading-tight text-balance">
          <Award className="w-8 h-8 text-primary" />
          Sertifikasi Profesional
        </h2>

        <Carousel
          opts={{
            align: 'start',
          }}
          className="w-full"
        >
          <CarouselContent>
            {certificatesData.certificates.map((cert) => (
              <CarouselItem
                key={cert.id}
                className="basis-[90%] md:basis-1/2 lg:basis-1/3"
              >
                <div className="p-1 h-full">
                  <Card className="h-full flex flex-col transition-all duration-300 hover:shadow-xl hover:shadow-primary/20">
                    {/* HEADER */}
               <CardHeader>
  <div className="relative w-full aspect-video mb-4 rounded-md overflow-hidden">
    <Image
      src={cert.imageUrl}
      alt={cert.title}
      fill
      className="object-cover"
      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
    />
  </div>

  <CardTitle className="text-lg leading-snug min-h-[3.2rem] line-clamp-2">
    {cert.title}
  </CardTitle>
</CardHeader>
                    {/* BADGES */}
                    <CardContent className="pt-0">
                      <div className="min-h-[48px] flex flex-wrap gap-2 items-start">
                        {cert.tags.map((tag) => (
                          <Badge
                            key={tag}
                            variant="secondary"
                            className="h-6 px-2 text-xs whitespace-nowrap"
                          >
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </CardContent>

                    {/* FOOTER */}
                    <CardFooter className="pt-4 mt-auto">
                      <a
                        href={cert.fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full"
                      >
                        <Button
                          variant="outline"
                          className="w-full h-10 flex items-center justify-center gap-2"
                        >
                          <ExternalLink className="h-4 w-4" />
                          Lihat Sertifikat
                        </Button>
                      </a>
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
