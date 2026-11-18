'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { Plus, Edit2, Trash2, Share2, ExternalLink, Loader2 } from 'lucide-react';

interface SocialLink {
  id: string;
  platform: string;
  url: string;
  icon: string;
  order: number;
}

export function SocialLinkManager({ initialLinks }: { initialLinks: SocialLink[] }) {
  const router = useRouter();
  const { toast } = useToast();
  const [links, setLinks] = useState<SocialLink[]>(initialLinks);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingLink, setEditingLink] = useState<SocialLink | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<SocialLink | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Form State
  const [platform, setPlatform] = useState('');
  const [url, setUrl] = useState('');
  const [icon, setIcon] = useState('Share2');
  const [order, setOrder] = useState('0');

  const openCreateDialog = () => {
    setEditingLink(null);
    setPlatform('');
    setUrl('');
    setIcon('Share2');
    setOrder(String(links.length));
    setDialogOpen(true);
  };

  const openEditDialog = (link: SocialLink) => {
    setEditingLink(link);
    setPlatform(link.platform);
    setUrl(link.url);
    setIcon(link.icon);
    setOrder(String(link.order || 0));
    setDialogOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!platform || !url) {
      toast({
        variant: 'destructive',
        title: 'Validation Error',
        description: 'Platform name and URL are required.',
      });
      return;
    }

    setSubmitting(true);
    const payload = {
      platform,
      url,
      icon: icon || 'Share2',
      order: parseInt(order, 10) || 0,
    };

    try {
      if (editingLink) {
        const res = await fetch(`/api/v1/social-links/${editingLink.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        if (!res.ok) throw new Error('Failed to update social link');
        const updated = await res.json();
        setLinks(links.map((l) => (l.id === updated.id ? updated : l)));
        toast({ title: 'Social Link Updated', description: 'Updated successfully.' });
      } else {
        const res = await fetch('/api/v1/social-links', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        if (!res.ok) throw new Error('Failed to create social link');
        const created = await res.json();
        setLinks([...links, created]);
        toast({ title: 'Social Link Created', description: 'New social link added.' });
      }

      setDialogOpen(false);
      router.refresh();
    } catch (err: any) {
      toast({ variant: 'destructive', title: 'Error', description: err.message });
    } finally {
      setSubmitting(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;

    try {
      const res = await fetch(`/api/v1/social-links/${deleteTarget.id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete social link');

      setLinks(links.filter((l) => l.id !== deleteTarget.id));
      toast({ title: 'Social Link Deleted', description: `${deleteTarget.platform} link removed.` });
      router.refresh();
    } catch (err: any) {
      toast({ variant: 'destructive', title: 'Error', description: err.message });
    } finally {
      setDeleteTarget(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold">Social Links ({links.length})</h2>
          <p className="text-sm text-muted-foreground">Manage profile external links and icons</p>
        </div>
        <Button onClick={openCreateDialog} className="gap-2">
          <Plus className="w-4 h-4" /> Add Social Link
        </Button>
      </div>

      {links.length === 0 ? (
        <Card className="p-8 text-center border-dashed">
          <p className="text-muted-foreground mb-4">No social links configured.</p>
          <Button onClick={openCreateDialog} variant="outline">
            <Plus className="w-4 h-4 mr-2" /> Add Link
          </Button>
        </Card>
      ) : (
        <div className="space-y-3">
          {links.map((link) => (
            <Card key={link.id} className="border-border hover:border-primary/40 transition-colors">
              <CardContent className="p-4 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-muted flex items-center justify-center shrink-0">
                    <Share2 className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm">{link.platform}</h3>
                    <a
                      href={link.url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 truncate max-w-md"
                    >
                      {link.url} <ExternalLink className="w-3 h-3 shrink-0" />
                    </a>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="sm" onClick={() => openEditDialog(link)} className="h-8 px-2 text-xs">
                    <Edit2 className="w-3.5 h-3.5 mr-1" /> Edit
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setDeleteTarget(link)}
                    className="h-8 px-2 text-xs text-destructive hover:bg-destructive/10"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Social Link Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingLink ? 'Edit Social Link' : 'Add Social Link'}</DialogTitle>
            <DialogDescription>Link your social media, profiles, or messaging channels</DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSave} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="link-platform">Platform Name *</Label>
              <Input
                id="link-platform"
                value={platform}
                onChange={(e) => setPlatform(e.target.value)}
                placeholder="e.g. GitHub, LinkedIn, Twitter/X"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="link-url">URL *</Label>
              <Input
                id="link-url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://..."
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="link-icon">Icon Identifier</Label>
                <Input
                  id="link-icon"
                  value={icon}
                  onChange={(e) => setIcon(e.target.value)}
                  placeholder="Github, Linkedin, Mail"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="link-order">Sort Order</Label>
                <Input
                  id="link-order"
                  type="number"
                  value={order}
                  onChange={(e) => setOrder(e.target.value)}
                />
              </div>
            </div>

            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : null}
                Save Link
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Alert */}
      <AlertDialog open={Boolean(deleteTarget)} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this social link?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove &ldquo;{deleteTarget?.platform}&rdquo;?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
