'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { FileUpload } from '@/components/admin/file-upload';
import { useToast } from '@/hooks/use-toast';
import { Plus, Edit2, Trash2, GraduationCap, Loader2 } from 'lucide-react';
import Image from 'next/image';

interface Education {
  id: string;
  school: string;
  degree: string;
  field: string;
  period: string;
  description: string;
  logoUrl: string;
  order: number;
}

export function EducationManager({ initialEducation }: { initialEducation: Education[] }) {
  const router = useRouter();
  const { toast } = useToast();
  const [educationList, setEducationList] = useState<Education[]>(initialEducation);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingEdu, setEditingEdu] = useState<Education | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Education | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Form State
  const [school, setSchool] = useState('');
  const [degree, setDegree] = useState('');
  const [field, setField] = useState('');
  const [period, setPeriod] = useState('');
  const [description, setDescription] = useState('');
  const [logoUrl, setLogoUrl] = useState('');
  const [order, setOrder] = useState('0');

  const openCreateDialog = () => {
    setEditingEdu(null);
    setSchool('');
    setDegree('Sarjana (S1)');
    setField('');
    setPeriod('');
    setDescription('');
    setLogoUrl('/favicon.jpeg');
    setOrder(String(educationList.length));
    setDialogOpen(true);
  };

  const openEditDialog = (edu: Education) => {
    setEditingEdu(edu);
    setSchool(edu.school);
    setDegree(edu.degree);
    setField(edu.field);
    setPeriod(edu.period);
    setDescription(edu.description);
    setLogoUrl(edu.logoUrl);
    setOrder(String(edu.order || 0));
    setDialogOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!school || !degree || !field || !period) {
      toast({
        variant: 'destructive',
        title: 'Validation Error',
        description: 'Please fill in all required fields.',
      });
      return;
    }

    setSubmitting(true);
    const payload = {
      school,
      degree,
      field,
      period,
      description,
      logoUrl: logoUrl || '/favicon.jpeg',
      order: parseInt(order, 10) || 0,
    };

    try {
      if (editingEdu) {
        const res = await fetch(`/api/v1/education/${editingEdu.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        if (!res.ok) throw new Error('Failed to update education');
        const updated = await res.json();
        setEducationList(educationList.map((e) => (e.id === updated.id ? updated : e)));
        toast({ title: 'Education Updated', description: 'Record updated successfully.' });
      } else {
        const res = await fetch('/api/v1/education', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        if (!res.ok) throw new Error('Failed to create education');
        const created = await res.json();
        setEducationList([...educationList, created]);
        toast({ title: 'Education Added', description: 'New education entry added.' });
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
      const res = await fetch(`/api/v1/education/${deleteTarget.id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete education');

      setEducationList(educationList.filter((e) => e.id !== deleteTarget.id));
      toast({ title: 'Education Deleted', description: `${deleteTarget.school} removed.` });
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
          <h2 className="text-xl font-bold">Education ({educationList.length})</h2>
          <p className="text-sm text-muted-foreground">Manage academic qualifications and degrees</p>
        </div>
        <Button onClick={openCreateDialog} className="gap-2">
          <Plus className="w-4 h-4" /> Add Education
        </Button>
      </div>

      {educationList.length === 0 ? (
        <Card className="p-8 text-center border-dashed">
          <p className="text-muted-foreground mb-4">No education entries found.</p>
          <Button onClick={openCreateDialog} variant="outline">
            <Plus className="w-4 h-4 mr-2" /> Add Education
          </Button>
        </Card>
      ) : (
        <div className="space-y-4">
          {educationList.map((edu) => (
            <Card key={edu.id} className="border-border hover:border-primary/40 transition-colors">
              <CardContent className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className="relative w-12 h-12 rounded-full overflow-hidden border border-border bg-muted shrink-0 mt-0.5">
                    <Image
                      src={edu.logoUrl || '/favicon.jpeg'}
                      alt={edu.school}
                      fill
                      className="object-cover"
                      unoptimized
                    />
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-semibold text-base">{edu.school}</h3>
                      <span className="text-xs text-muted-foreground">· {edu.degree} in {edu.field}</span>
                    </div>
                    <span className="text-xs font-mono text-muted-foreground block">{edu.period}</span>
                    {edu.description && (
                      <p className="text-xs text-muted-foreground max-w-2xl mt-1">
                        {edu.description}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end md:self-center shrink-0">
                  <Button variant="ghost" size="sm" onClick={() => openEditDialog(edu)} className="h-8 px-2.5 text-xs">
                    <Edit2 className="w-3.5 h-3.5 mr-1" /> Edit
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setDeleteTarget(edu)}
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

      {/* Education Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingEdu ? 'Edit Education' : 'Add Education'}</DialogTitle>
            <DialogDescription>Add school or university degree details</DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSave} className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="edu-school">School / University *</Label>
              <Input
                id="edu-school"
                value={school}
                onChange={(e) => setSchool(e.target.value)}
                placeholder="e.g. Universitas Bina Sarana Informatika"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edu-degree">Degree *</Label>
                <Input
                  id="edu-degree"
                  value={degree}
                  onChange={(e) => setDegree(e.target.value)}
                  placeholder="e.g. Sarjana (S1)"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edu-field">Field of Study *</Label>
                <Input
                  id="edu-field"
                  value={field}
                  onChange={(e) => setField(e.target.value)}
                  placeholder="e.g. Teknologi Informasi"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edu-period">Period / Years *</Label>
                <Input
                  id="edu-period"
                  value={period}
                  onChange={(e) => setPeriod(e.target.value)}
                  placeholder="e.g. 2020 - 2024"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edu-order">Sort Order</Label>
                <Input
                  id="edu-order"
                  type="number"
                  value={order}
                  onChange={(e) => setOrder(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edu-desc">Description (optional)</Label>
              <Textarea
                id="edu-desc"
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Specializations, GPA, thesis focus..."
              />
            </div>

            <div className="space-y-2">
              <Label>Campus Logo (optional)</Label>
              <FileUpload
                folder="education"
                currentUrl={logoUrl}
                onSuccess={(url) => setLogoUrl(url)}
                onRemove={() => setLogoUrl('')}
                label="Upload Campus Logo"
              />
            </div>

            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : null}
                {editingEdu ? 'Save Changes' : 'Create Entry'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Alert */}
      <AlertDialog open={Boolean(deleteTarget)} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete education entry?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove &ldquo;{deleteTarget?.school}&rdquo;?
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
