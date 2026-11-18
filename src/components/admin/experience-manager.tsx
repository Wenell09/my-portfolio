'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FileUpload } from '@/components/admin/file-upload';
import { useToast } from '@/hooks/use-toast';
import { Plus, Edit2, Trash2, Briefcase, Loader2 } from 'lucide-react';
import Image from 'next/image';

interface Experience {
  id: string;
  company: string;
  category: string;
  role: string;
  period: string;
  description: string;
  logoUrl: string;
  logoHint?: string | null;
  status: string;
  order: number;
}

export function ExperienceManager({ initialExperiences }: { initialExperiences: Experience[] }) {
  const router = useRouter();
  const { toast } = useToast();
  const [experiences, setExperiences] = useState<Experience[]>(initialExperiences);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingExp, setEditingExp] = useState<Experience | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Experience | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Form State
  const [company, setCompany] = useState('');
  const [category, setCategory] = useState('');
  const [role, setRole] = useState('');
  const [period, setPeriod] = useState('');
  const [description, setDescription] = useState('');
  const [logoUrl, setLogoUrl] = useState('');
  const [status, setStatus] = useState('published');
  const [order, setOrder] = useState('0');

  const openCreateDialog = () => {
    setEditingExp(null);
    setCompany('');
    setCategory('Internship');
    setRole('');
    setPeriod('');
    setDescription('');
    setLogoUrl('');
    setStatus('published');
    setOrder(String(experiences.length));
    setDialogOpen(true);
  };

  const openEditDialog = (exp: Experience) => {
    setEditingExp(exp);
    setCompany(exp.company);
    setCategory(exp.category);
    setRole(exp.role);
    setPeriod(exp.period);
    setDescription(exp.description);
    setLogoUrl(exp.logoUrl);
    setStatus(exp.status || 'published');
    setOrder(String(exp.order || 0));
    setDialogOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!company || !role || !period || !description || !logoUrl) {
      toast({
        variant: 'destructive',
        title: 'Validation Error',
        description: 'Please fill in all required fields.',
      });
      return;
    }

    setSubmitting(true);
    const payload = {
      company,
      category,
      role,
      period,
      description,
      logoUrl,
      status,
      order: parseInt(order, 10) || 0,
    };

    try {
      if (editingExp) {
        const res = await fetch(`/api/v1/experiences/${editingExp.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        if (!res.ok) throw new Error('Failed to update experience');
        const updated = await res.json();
        setExperiences(experiences.map((e) => (e.id === updated.id ? updated : e)));
        toast({ title: 'Experience Updated', description: 'Record updated successfully.' });
      } else {
        const res = await fetch('/api/v1/experiences', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        if (!res.ok) throw new Error('Failed to create experience');
        const created = await res.json();
        setExperiences([...experiences, created]);
        toast({ title: 'Experience Created', description: 'New experience record added.' });
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
      const res = await fetch(`/api/v1/experiences/${deleteTarget.id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete experience');

      setExperiences(experiences.filter((e) => e.id !== deleteTarget.id));
      toast({ title: 'Experience Deleted', description: `${deleteTarget.company} removed.` });
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
          <h2 className="text-xl font-bold">Work Experience ({experiences.length})</h2>
          <p className="text-sm text-muted-foreground">Manage your professional career history</p>
        </div>
        <Button onClick={openCreateDialog} className="gap-2">
          <Plus className="w-4 h-4" /> Add Experience
        </Button>
      </div>

      {experiences.length === 0 ? (
        <Card className="p-8 text-center border-dashed">
          <p className="text-muted-foreground mb-4">No experience entries found.</p>
          <Button onClick={openCreateDialog} variant="outline">
            <Plus className="w-4 h-4 mr-2" /> Add First Experience
          </Button>
        </Card>
      ) : (
        <div className="space-y-4">
          {experiences.map((exp) => (
            <Card key={exp.id} className="border-border hover:border-primary/40 transition-colors">
              <CardContent className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className="relative w-12 h-12 rounded-full overflow-hidden border border-border bg-muted shrink-0 mt-0.5">
                    <Image
                      src={exp.logoUrl}
                      alt={exp.company}
                      fill
                      className="object-cover"
                      unoptimized
                    />
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-semibold text-base">{exp.role}</h3>
                      <span className="text-xs text-muted-foreground">at {exp.company}</span>
                      <Badge variant="outline" className="text-[10px]">
                        {exp.category}
                      </Badge>
                      <Badge variant={exp.status === 'published' ? 'secondary' : 'outline'} className="text-[10px]">
                        {exp.status}
                      </Badge>
                    </div>
                    <span className="text-xs font-mono text-muted-foreground block">{exp.period}</span>
                    <p className="text-xs text-muted-foreground line-clamp-2 max-w-2xl mt-1">
                      {exp.description}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end md:self-center shrink-0">
                  <Button variant="ghost" size="sm" onClick={() => openEditDialog(exp)} className="h-8 px-2.5 text-xs">
                    <Edit2 className="w-3.5 h-3.5 mr-1" /> Edit
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setDeleteTarget(exp)}
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

      {/* Experience Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingExp ? 'Edit Experience' : 'Add Experience'}</DialogTitle>
            <DialogDescription>Fill in company, position, timeline and accomplishments</DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSave} className="space-y-4 py-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="exp-company">Company Name *</Label>
                <Input
                  id="exp-company"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  placeholder="e.g. PT Inditama Teknologi Nusantara"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="exp-role">Job Role / Position *</Label>
                <Input
                  id="exp-role"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  placeholder="e.g. Flutter Developer Intern"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="exp-cat">Employment Type</Label>
                <Input
                  id="exp-cat"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  placeholder="Internship / Full-time"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="exp-period">Time Period *</Label>
                <Input
                  id="exp-period"
                  value={period}
                  onChange={(e) => setPeriod(e.target.value)}
                  placeholder="Feb 2024 - Jun 2024"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="exp-status">Status</Label>
                <Select value={status} onValueChange={setStatus}>
                  <SelectTrigger id="exp-status">
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
              <Label htmlFor="exp-desc">Description & Responsibilities *</Label>
              <Textarea
                id="exp-desc"
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Mention key achievements, projects delivered, tools used..."
                required
              />
            </div>

            <div className="space-y-2">
              <Label>Company Logo (Vercel Blob) *</Label>
              <FileUpload
                folder="experiences"
                currentUrl={logoUrl}
                onSuccess={(url) => setLogoUrl(url)}
                onRemove={() => setLogoUrl('')}
                label="Upload Company Logo"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="exp-order">Order Index</Label>
              <Input
                id="exp-order"
                type="number"
                value={order}
                onChange={(e) => setOrder(e.target.value)}
              />
            </div>

            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={submitting || !logoUrl}>
                {submitting ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : null}
                {editingExp ? 'Save Changes' : 'Create Entry'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Alert */}
      <AlertDialog open={Boolean(deleteTarget)} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete experience record?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove &ldquo;{deleteTarget?.role} at {deleteTarget?.company}&rdquo;?
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
