import { prisma } from '@/lib/prisma';
import { ProfileManager } from '@/components/admin/profile-manager';

export const dynamic = 'force-dynamic';

export default async function AdminProfilePage() {
  const profile = await prisma.profile.findFirst();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Profile Management</h1>
        <p className="text-muted-foreground">Manage your personal information, headline, and bio.</p>
      </div>
      <ProfileManager initialProfile={profile} />
    </div>
  );
}
