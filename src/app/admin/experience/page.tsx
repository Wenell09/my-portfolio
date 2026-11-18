import { prisma } from '@/lib/prisma';
import { ExperienceManager } from '@/components/admin/experience-manager';

export const dynamic = 'force-dynamic';

export default async function AdminExperiencePage() {
  const experiences = await prisma.experience.findMany({
    orderBy: { order: 'asc' },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Work Experience</h1>
        <p className="text-muted-foreground">Manage your work history, internships, and roles</p>
      </div>
      <ExperienceManager initialExperiences={experiences} />
    </div>
  );
}
