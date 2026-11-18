import { prisma } from '@/lib/prisma';
import { ProjectManager } from '@/components/admin/project-manager';

export const dynamic = 'force-dynamic';

export default async function AdminProjectsPage() {
  const projects = await prisma.project.findMany({
    orderBy: { order: 'asc' },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Project Management</h1>
        <p className="text-muted-foreground">Manage your showcase projects and upload covers directly to Vercel Blob</p>
      </div>
      <ProjectManager initialProjects={projects} />
    </div>
  );
}
