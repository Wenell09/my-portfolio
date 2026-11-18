import { prisma } from '@/lib/prisma';
import { MessageManager } from '@/components/admin/message-manager';

export const dynamic = 'force-dynamic';

export default async function AdminMessagesPage() {
  const messages = await prisma.contactMessage.findMany({
    orderBy: { createdAt: 'desc' },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Contact Messages</h1>
        <p className="text-muted-foreground">Review and manage inquiries from visitors</p>
      </div>
      <MessageManager initialMessages={messages} />
    </div>
  );
}
