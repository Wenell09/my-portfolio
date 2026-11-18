import Image from 'next/image';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Briefcase, GraduationCap } from 'lucide-react';

export interface ExperienceItem {
  id: string;
  company: string;
  category: string;
  role: string;
  period: string;
  description: string;
  logoUrl: string;
  logoHint?: string | null;
}

export interface EducationItem {
  id: string;
  school: string;
  degree: string;
  field: string;
  period: string;
  description: string;
  logoUrl: string;
  logoHint?: string | null;
}

export function ExperienceSection({
  data = [],
  education = [],
}: {
  data?: ExperienceItem[];
  education?: EducationItem[];
}) {
  const experiences = data || [];
  if (experiences.length === 0 && (!education || education.length === 0)) {
    return null;
  }

  return (
    <section id="experience" className="scroll-mt-16">
      <div className="max-w-5xl mx-auto space-y-16">
        {/* Experience Timeline */}
        <div className="space-y-8">
          <h3 className="text-xl font-bold flex items-center gap-2">
            <Briefcase className="w-5 h-5 text-primary" /> Pengalaman Profesional
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
                      <span>{exp.company} · {exp.category}</span>
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

        {/* Education Timeline (Synced from CMS/API) */}
        {education && education.length > 0 && (
          <div className="space-y-8 pt-4">
            <h3 className="text-xl font-bold flex items-center gap-2">
              <GraduationCap className="w-5 h-5 text-primary" /> Pendidikan &amp; Akademik
            </h3>
            <div className="relative pl-6 after:absolute after:inset-y-0 after:left-6 after:w-px after:bg-border">
              {education.map((edu) => (
                <div key={edu.id} className="relative mb-8 pl-8">
                  <div className="absolute -left-2 -top-1.5 flex h-12 w-12 items-center justify-center rounded-full bg-card ring-8 ring-background">
                    <div className="relative h-8 w-8">
                      <Image
                        src={edu.logoUrl || '/favicon.jpeg'}
                        alt={`${edu.school} logo`}
                        fill
                        className="object-contain rounded-full"
                        data-ai-hint={edu.logoHint}
                      />
                    </div>
                  </div>

                  <Card className="transition-all duration-300 hover:shadow-xl hover:shadow-primary/20">
                    <CardHeader>
                      <CardTitle>{edu.degree} &middot; {edu.field}</CardTitle>
                      <CardDescription className="flex justify-between items-baseline">
                        <span>{edu.school}</span>
                        <span className="text-xs font-mono">{edu.period}</span>
                      </CardDescription>
                    </CardHeader>
                    {edu.description && (
                      <CardContent>
                        <p className="text-sm text-muted-foreground">{edu.description}</p>
                      </CardContent>
                    )}
                  </Card>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
