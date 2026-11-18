import { prisma } from '@/lib/prisma';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  FolderKanban, 
  Wrench, 
  Briefcase, 
  Award, 
  Mail, 
  UserCircle, 
  Share2, 
  ExternalLink,
  PlusCircle,
  Clock,
} from 'lucide-react';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function AdminDashboardPage() {
  const [
    projectCount,
    skillCount,
    expCount,
    certCount,
    socialCount,
    unreadMessages,
    totalMessages,
    recentMessages,
    recentProjects,
  ] = await Promise.all([
    prisma.project.count(),
    prisma.skill.count(),
    prisma.experience.count(),
    prisma.certificate.count(),
    prisma.socialLink.count(),
    prisma.contactMessage.count({ where: { read: false } }),
    prisma.contactMessage.count(),
    prisma.contactMessage.findMany({
      orderBy: { createdAt: 'desc' },
      take: 5,
    }),
    prisma.project.findMany({
      orderBy: { updatedAt: 'desc' },
      take: 4,
    }),
  ]);

  const cards = [
    { title: 'Projects', count: projectCount, icon: FolderKanban, href: '/admin/projects', desc: 'Showcase items' },
    { title: 'Skills', count: skillCount, icon: Wrench, href: '/admin/skills', desc: 'Technologies & tools' },
    { title: 'Experience', count: expCount, icon: Briefcase, href: '/admin/experience', desc: 'Work history' },
    { title: 'Certificates', count: certCount, icon: Award, href: '/admin/certificates', desc: 'Professional certs' },
    { title: 'Social Links', count: socialCount, icon: Share2, href: '/admin/social-links', desc: 'Profile connections' },
    { 
      title: 'Messages', 
      count: `${unreadMessages} unread`, 
      total: `${totalMessages} total`,
      icon: Mail, 
      href: '/admin/messages', 
      desc: 'Contact inquiries',
      highlight: unreadMessages > 0,
    },
  ];

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard Overview</h1>
          <p className="text-muted-foreground">Manage and publish your portfolio content</p>
        </div>
        <div className="flex items-center gap-2">
          <Button asChild variant="outline" size="sm">
            <Link href="/" target="_blank" className="flex items-center gap-1.5">
              <ExternalLink className="w-4 h-4" /> Live Site
            </Link>
          </Button>
          <Button asChild size="sm">
            <Link href="/admin/projects" className="flex items-center gap-1.5">
              <PlusCircle className="w-4 h-4" /> Add Project
            </Link>
          </Button>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <Link key={card.title} href={card.href}>
              <Card className="hover:bg-accent/40 transition-colors cursor-pointer border-border h-full">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
                  <Icon className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {card.count}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {card.total ? card.total : card.desc}
                  </p>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>

      {/* Two Column Layout: Recent Messages & Recent Projects */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Recent Messages */}
        <Card className="border-border">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-lg">Recent Messages</CardTitle>
              <CardDescription>Latest contact form submissions</CardDescription>
            </div>
            <Button asChild variant="ghost" size="sm">
              <Link href="/admin/messages">View all</Link>
            </Button>
          </CardHeader>
          <CardContent>
            {recentMessages.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4 text-center">No messages received yet.</p>
            ) : (
              <div className="space-y-3">
                {recentMessages.map((msg) => (
                  <div
                    key={msg.id}
                    className="flex items-start justify-between p-3 rounded-lg border border-border/60 bg-muted/20 hover:bg-muted/40 transition-colors"
                  >
                    <div className="space-y-1 pr-2">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm">{msg.name}</span>
                        {!msg.read && (
                          <Badge variant="default" className="text-[10px] px-1.5 py-0 h-4">
                            New
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">{msg.email}</p>
                      <p className="text-xs text-foreground/80 line-clamp-1">{msg.message}</p>
                    </div>
                    <span className="text-[11px] text-muted-foreground whitespace-nowrap flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {new Date(msg.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Projects */}
        <Card className="border-border">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-lg">Projects</CardTitle>
              <CardDescription>Current showcase items</CardDescription>
            </div>
            <Button asChild variant="ghost" size="sm">
              <Link href="/admin/projects">Manage</Link>
            </Button>
          </CardHeader>
          <CardContent>
            {recentProjects.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4 text-center">No projects added yet.</p>
            ) : (
              <div className="space-y-3">
                {recentProjects.map((p) => (
                  <div
                    key={p.id}
                    className="flex items-center justify-between p-3 rounded-lg border border-border/60 bg-muted/20"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm">{p.title}</span>
                        <Badge
                          variant={p.status === 'published' ? 'secondary' : 'outline'}
                          className="text-[10px] px-1.5 py-0 h-4"
                        >
                          {p.status}
                        </Badge>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {p.tags.slice(0, 3).map((t) => (
                          <span key={t} className="text-[10px] bg-muted px-1.5 py-0.5 rounded text-muted-foreground">
                            {t}
                          </span>
                        ))}
                      </div>
                    </div>
                    <Button asChild variant="outline" size="sm" className="h-8">
                      <Link href="/admin/projects">Edit</Link>
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
