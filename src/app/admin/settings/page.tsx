import { prisma } from '@/lib/prisma';
import { SettingsManager } from '@/components/admin/settings-manager';

export const dynamic = 'force-dynamic';

export default async function AdminSettingsPage() {
  const settings = await prisma.siteSetting.findUnique({
    where: { id: 'singleton' },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Website Settings</h1>
        <p className="text-muted-foreground">Manage site title, SEO metadata, and footer information</p>
      </div>
      <SettingsManager initialSettings={settings} />
    </div>
  );
}
