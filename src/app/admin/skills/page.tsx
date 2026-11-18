import { prisma } from '@/lib/prisma';
import { SkillManager } from '@/components/admin/skill-manager';

export const dynamic = 'force-dynamic';

export default async function AdminSkillsPage() {
  const categories = await prisma.skillCategory.findMany({
    include: {
      skills: {
        orderBy: { order: 'asc' },
      },
    },
    orderBy: { order: 'asc' },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Skills & Capabilities</h1>
        <p className="text-muted-foreground">Manage technical skill groups and badges</p>
      </div>
      <SkillManager initialCategories={categories} />
    </div>
  );
}
