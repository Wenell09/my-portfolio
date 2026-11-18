import { prisma } from '@/lib/prisma';
import { SocialLinkManager } from '@/components/admin/social-link-manager';

export const dynamic = 'force-dynamic';

export default async function AdminSocialLinksPage() {
  const links = await prisma.socialLink.findMany({
    orderBy: { order: 'asc' },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Social Links</h1>
        <p className="text-muted-foreground">Manage profile social channels and external links</p>
      </div>
      <SocialLinkManager initialLinks={links} />
    </div>
  );
}
