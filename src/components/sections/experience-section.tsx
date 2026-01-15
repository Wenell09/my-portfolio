import Image from 'next/image';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import experienceData from '@/lib/experience-data.json';
import { Briefcase } from 'lucide-react';

export function ExperienceSection() {
  const { experiences } = experienceData;

  return (
    <section id="experience" className="scroll-mt-16">
      <div className="max-w-5xl mx-auto">
        <div className="space-y-8">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Briefcase /> Pengalaman Kerja
          </h3>
          <div className="relative pl-6 after:absolute after:inset-y-0 after:left-6 after:w-px after:bg-border">
            {experiences.map((exp) => (
              <div key={exp.id} className="relative mb-8 pl-8">
                <div className="absolute -left-2 -top-1.5 flex h-12 w-12 items-center justify-center rounded-full bg-card ring-8 ring-background">
                  <div className="relative h-8 w-8">
                    <Image
                      src={exp.logoUrl}
                      alt={`${exp.company} logo`}
                      fill
                      className="object-contain rounded-full"
                      data-ai-hint={exp.logoHint}
                    />
                  </div>
                </div>

                <Card className="transition-all duration-300 hover:shadow-xl hover:shadow-primary/20">
                  <CardHeader>
                    <CardTitle>{exp.role}</CardTitle>
                    <CardDescription className="flex justify-between items-baseline">
                      <span>{exp.company}</span>
                      <span className="text-xs font-mono">{exp.period}</span>
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">{exp.description}</p>
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
