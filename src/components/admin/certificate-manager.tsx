'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FileUpload } from '@/components/admin/file-upload';
import { useToast } from '@/hooks/use-toast';
import { Plus, Edit2, Trash2, ExternalLink, Award, Loader2 } from 'lucide-react';
import Image from 'next/image';

interface Certificate {
  id: string;
  slug: string;
  title: string;
  fileUrl: string;
  imageUrl: string;
  tags: string[];
  status: string;
  order: number;
}

export function CertificateManager({ initialCertificates }: { initialCertificates: Certificate[] }) {
  const router = useRouter();
  const { toast } = useToast();
  const [certificates, setCertificates] = useState<Certificate[]>(initialCertificates);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCert, setEditingCert] = useState<Certificate | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Certificate | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Form State
  const [title, setTitle] = useState('');
  const [fileUrl, setFileUrl] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [tags, setTags] = useState('');
  const [status, setStatus] = useState('published');
  const [order, setOrder] = useState('0');

  const openCreateDialog = () => {
    setEditingCert(null);
    setTitle('');
    setFileUrl('');
    setImageUrl('');
    setTags('');
    setStatus('published');
    setOrder(String(certificates.length));
    setDialogOpen(true);
  };

  const openEditDialog = (cert: Certificate) => {
    setEditingCert(cert);
    setTitle(cert.title);
    setFileUrl(cert.fileUrl);
    setImageUrl(cert.imageUrl);
    setTags(cert.tags.join(', '));
    setStatus(cert.status || 'published');
    setOrder(String(cert.order || 0));
    setDialogOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !imageUrl || !fileUrl) {
      toast({
        variant: 'destructive',
        title: 'Validation Error',
        description: 'Title, certificate preview image, and document URL are required.',
      });
      return;
    }

    setSubmitting(true);
    const tagList = tags.split(',').map((t) => t.trim()).filter(Boolean);
    const payload = {
      title,
      fileUrl,
      imageUrl,
      tags: tagList,
      status,
      order: parseInt(order, 10) || 0,
    };

    try {
      if (editingCert) {
        const res = await fetch(`/api/v1/certificates/${editingCert.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        if (!res.ok) throw new Error('Failed to update certificate');
        const updated = await res.json();
        setCertificates(certificates.map((c) => (c.id === updated.id ? updated : c)));
        toast({ title: 'Certificate Updated', description: 'Certificate updated successfully.' });
      } else {
        const res = await fetch('/api/v1/certificates', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        if (!res.ok) throw new Error('Failed to create certificate');
        const created = await res.json();
        setCertificates([...certificates, created]);
        toast({ title: 'Certificate Added', description: 'New certificate added successfully.' });
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
      const res = await fetch(`/api/v1/certificates/${deleteTarget.id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete certificate');

      setCertificates(certificates.filter((c) => c.id !== deleteTarget.id));
      toast({ title: 'Certificate Deleted', description: `${deleteTarget.title} removed.` });
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
          <h2 className="text-xl font-bold">Certificates ({certificates.length})</h2>
          <p className="text-sm text-muted-foreground">Manage credentials, badges, and verification files</p>
        </div>
        <Button onClick={openCreateDialog} className="gap-2">
          <Plus className="w-4 h-4" /> Add Certificate
        </Button>
      </div>

      {certificates.length === 0 ? (
        <Card className="p-8 text-center border-dashed">
          <p className="text-muted-foreground mb-4">No certificates uploaded yet.</p>
          <Button onClick={openCreateDialog} variant="outline">
            <Plus className="w-4 h-4 mr-2" /> Add Certificate
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {certificates.map((cert) => (
            <Card key={cert.id} className="overflow-hidden border-border flex flex-col justify-between hover:border-primary/40 transition-colors">
              <div>
                <div className="relative h-44 w-full bg-muted">
                  <Image
                    src={cert.imageUrl}
                    alt={cert.title}
                    fill
                    className="object-cover"
                    unoptimized
                  />
                  <div className="absolute top-2 right-2">
                    <Badge variant={cert.status === 'published' ? 'default' : 'secondary'}>
                      {cert.status}
                    </Badge>
                  </div>
                </div>
                <CardHeader className="p-4 pb-2">
                  <CardTitle className="text-base leading-snug line-clamp-2">{cert.title}</CardTitle>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                  <div className="flex flex-wrap gap-1">
                    {cert.tags.map((t) => (
                      <span key={t} className="text-[10px] bg-muted px-2 py-0.5 rounded text-muted-foreground">
                        {t}
                      </span>
                    ))}
                  </div>
                </CardContent>
              </div>

              <CardFooter className="p-4 pt-0 border-t border-border/40 flex items-center justify-between mt-auto">
                <a
                  href={cert.fileUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs text-primary hover:underline flex items-center gap-1"
                >
                  <ExternalLink className="w-3.5 h-3.5" /> View Doc
                </a>
                <div className="flex items-center gap-1">
                  <Button variant="ghost" size="sm" onClick={() => openEditDialog(cert)} className="h-8 px-2 text-xs">
                    <Edit2 className="w-3.5 h-3.5 mr-1" /> Edit
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setDeleteTarget(cert)}
                    className="h-8 px-2 text-xs text-destructive hover:bg-destructive/10"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      {/* Certificate Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingCert ? 'Edit Certificate' : 'Add Certificate'}</DialogTitle>
            <DialogDescription>Upload certificate preview image and PDF credential document</DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSave} className="space-y-4 py-2">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2 space-y-2">
                <Label htmlFor="cert-title">Certificate Title *</Label>
                <Input
                  id="cert-title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Belajar Dasar AI - Dicoding"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cert-status">Status</Label>
                <Select value={status} onValueChange={setStatus}>
                  <SelectTrigger id="cert-status">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="published">Published</SelectItem>
                    <SelectItem value="draft">Draft</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Certificate Preview Image (PNG/JPG) *</Label>
              <FileUpload
                folder="certificates"
                accept="image/*"
                currentUrl={imageUrl}
                onSuccess={(url) => setImageUrl(url)}
                onRemove={() => setImageUrl('')}
                label="Upload Certificate Image"
              />
            </div>

            <div className="space-y-2">
              <Label>Certificate Document / PDF *</Label>
              <FileUpload
                folder="certificates"
                accept="application/pdf,image/*"
                currentUrl={fileUrl}
                onSuccess={(url) => setFileUrl(url)}
                onRemove={() => setFileUrl('')}
                label="Upload PDF Certificate"
              />
              <Input
                value={fileUrl}
                onChange={(e) => setFileUrl(e.target.value)}
                placeholder="Or paste external credential / verification URL"
                className="mt-2 text-xs"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="cert-tags">Tags (comma separated)</Label>
                <Input
                  id="cert-tags"
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                  placeholder="e.g. AI, Dicoding, Machine Learning"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cert-order">Display Order Index</Label>
                <Input
                  id="cert-order"
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
              <Button type="submit" disabled={submitting || !imageUrl || !fileUrl}>
                {submitting ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : null}
                {editingCert ? 'Save Changes' : 'Create Certificate'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Alert */}
      <AlertDialog open={Boolean(deleteTarget)} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete certificate?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete &ldquo;{deleteTarget?.title}&rdquo; and its uploaded files.
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
