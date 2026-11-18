import { prisma } from '@/lib/prisma';
import { EducationManager } from '@/components/admin/education-manager';

export const dynamic = 'force-dynamic';

export default async function AdminEducationPage() {
  const education = await prisma.education.findMany({
    orderBy: { order: 'asc' },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Education Background</h1>
        <p className="text-muted-foreground">Manage your degrees, university, and academic history</p>
      </div>
      <EducationManager initialEducation={education} />
    </div>
  );
}
