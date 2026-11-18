import { prisma } from '@/lib/prisma';
import { CertificateManager } from '@/components/admin/certificate-manager';

export const dynamic = 'force-dynamic';

export default async function AdminCertificatesPage() {
  const certificates = await prisma.certificate.findMany({
    orderBy: { order: 'asc' },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Certificates & Awards</h1>
        <p className="text-muted-foreground">Manage your credentials, PDF certificates, and course completions</p>
      </div>
      <CertificateManager initialCertificates={certificates} />
    </div>
  );
}
