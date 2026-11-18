'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { FileUpload } from '@/components/admin/file-upload';
import { useToast } from '@/hooks/use-toast';
import { Plus, Trash2, Edit2, Loader2, Code } from 'lucide-react';
import Image from 'next/image';

interface Skill {
  id: string;
  name: string;
  iconUrl: string;
  categoryId: string;
  order: number;
}

interface SkillCategory {
  id: string;
  title: string;
  icon: string;
  order: number;
  skills: Skill[];
}

export function SkillManager({ initialCategories }: { initialCategories: SkillCategory[] }) {
  const router = useRouter();
  const { toast } = useToast();
  const [categories, setCategories] = useState<SkillCategory[]>(initialCategories);

  // Category Modal State
  const [catDialogOpen, setCatDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<SkillCategory | null>(null);
  const [catTitle, setCatTitle] = useState('');
  const [catIcon, setCatIcon] = useState('');
  const [catOrder, setCatOrder] = useState('0');

  // Skill Modal State
  const [skillDialogOpen, setSkillDialogOpen] = useState(false);
  const [targetCategoryId, setTargetCategoryId] = useState<string>('');
  const [editingSkill, setEditingSkill] = useState<Skill | null>(null);
  const [skillName, setSkillName] = useState('');
  const [skillIconUrl, setSkillIconUrl] = useState('');
  const [skillOrder, setSkillOrder] = useState('0');

  // Delete State
  const [deleteCatTarget, setDeleteCatTarget] = useState<SkillCategory | null>(null);
  const [deleteSkillTarget, setDeleteSkillTarget] = useState<Skill | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Category Handlers
  const openCreateCategory = () => {
    setEditingCategory(null);
    setCatTitle('');
    setCatIcon('Code');
    setCatOrder(String(categories.length));
    setCatDialogOpen(true);
  };

  const openEditCategory = (cat: SkillCategory) => {
    setEditingCategory(cat);
    setCatTitle(cat.title);
    setCatIcon(cat.icon);
    setCatOrder(String(cat.order));
    setCatDialogOpen(true);
  };

  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!catTitle) return;
    setSubmitting(true);

    try {
      const payload = {
        title: catTitle,
        icon: catIcon || 'Code',
        order: parseInt(catOrder, 10) || 0,
      };

      if (editingCategory) {
        const res = await fetch(`/api/v1/skill-categories/${editingCategory.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        if (!res.ok) throw new Error('Failed to update category');
        const updated = await res.json();
        setCategories(categories.map((c) => (c.id === updated.id ? { ...updated, skills: c.skills } : c)));
        toast({ title: 'Category Updated', description: 'Skill category updated successfully.' });
      } else {
        const res = await fetch('/api/v1/skill-categories', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        if (!res.ok) throw new Error('Failed to create category');
        const created = await res.json();
        setCategories([...categories, { ...created, skills: [] }]);
        toast({ title: 'Category Created', description: 'New skill category added.' });
      }

      setCatDialogOpen(false);
      router.refresh();
    } catch (err: any) {
      toast({ variant: 'destructive', title: 'Error', description: err.message });
    } finally {
      setSubmitting(false);
    }
  };

  const confirmDeleteCategory = async () => {
    if (!deleteCatTarget) return;
    try {
      const res = await fetch(`/api/v1/skill-categories/${deleteCatTarget.id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete category');
      setCategories(categories.filter((c) => c.id !== deleteCatTarget.id));
      toast({ title: 'Category Deleted', description: `${deleteCatTarget.title} has been deleted.` });
      router.refresh();
    } catch (err: any) {
      toast({ variant: 'destructive', title: 'Error', description: err.message });
    } finally {
      setDeleteCatTarget(null);
    }
  };

  // Skill Handlers
  const openCreateSkill = (categoryId: string) => {
    setEditingSkill(null);
    setTargetCategoryId(categoryId);
    setSkillName('');
    setSkillIconUrl('');
    setSkillOrder('0');
    setSkillDialogOpen(true);
  };

  const openEditSkill = (skill: Skill) => {
    setEditingSkill(skill);
    setTargetCategoryId(skill.categoryId);
    setSkillName(skill.name);
    setSkillIconUrl(skill.iconUrl);
    setSkillOrder(String(skill.order));
    setSkillDialogOpen(true);
  };

  const handleSaveSkill = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!skillName || !skillIconUrl || !targetCategoryId) return;
    setSubmitting(true);

    try {
      const payload = {
        name: skillName,
        iconUrl: skillIconUrl,
        categoryId: targetCategoryId,
        order: parseInt(skillOrder, 10) || 0,
      };

      if (editingSkill) {
        const res = await fetch(`/api/v1/skills/${editingSkill.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        if (!res.ok) throw new Error('Failed to update skill');
        const updated = await res.json();
        setCategories(
          categories.map((c) =>
            c.id === targetCategoryId
              ? { ...c, skills: c.skills.map((s) => (s.id === updated.id ? updated : s)) }
              : c
          )
        );
        toast({ title: 'Skill Updated', description: 'Skill updated successfully.' });
      } else {
        const res = await fetch('/api/v1/skills', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        if (!res.ok) throw new Error('Failed to create skill');
        const created = await res.json();
        setCategories(
          categories.map((c) =>
            c.id === targetCategoryId ? { ...c, skills: [...c.skills, created] } : c
          )
        );
        toast({ title: 'Skill Created', description: 'New skill added.' });
      }

      setSkillDialogOpen(false);
      router.refresh();
    } catch (err: any) {
      toast({ variant: 'destructive', title: 'Error', description: err.message });
    } finally {
      setSubmitting(false);
    }
  };

  const confirmDeleteSkill = async () => {
    if (!deleteSkillTarget) return;
    try {
      const res = await fetch(`/api/v1/skills/${deleteSkillTarget.id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete skill');

      setCategories(
        categories.map((c) => ({
          ...c,
          skills: c.skills.filter((s) => s.id !== deleteSkillTarget.id),
        }))
      );
      toast({ title: 'Skill Deleted', description: `${deleteSkillTarget.name} has been deleted.` });
      router.refresh();
    } catch (err: any) {
      toast({ variant: 'destructive', title: 'Error', description: err.message });
    } finally {
      setDeleteSkillTarget(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold">Skill Categories & Items</h2>
          <p className="text-sm text-muted-foreground">Manage technical categories and individual skills</p>
        </div>
        <Button onClick={openCreateCategory} className="gap-2">
          <Plus className="w-4 h-4" /> Add Category
        </Button>
      </div>

      {categories.length === 0 ? (
        <Card className="p-8 text-center border-dashed">
          <p className="text-muted-foreground mb-4">No skill categories found.</p>
          <Button onClick={openCreateCategory} variant="outline">
            <Plus className="w-4 h-4 mr-2" /> Create First Category
          </Button>
        </Card>
      ) : (
        <Accordion type="multiple" defaultValue={categories.map((c) => c.id)} className="space-y-4">
          {categories.map((cat) => (
            <AccordionItem key={cat.id} value={cat.id} className="border border-border rounded-lg bg-card overflow-hidden">
              <div className="flex items-center justify-between px-4 py-2 hover:bg-muted/30">
                <AccordionTrigger className="flex-1 hover:no-underline py-2">
                  <div className="flex items-center gap-3">
                    <Code className="w-5 h-5 text-primary" />
                    <span className="font-semibold text-base">{cat.title}</span>
                    <span className="text-xs text-muted-foreground">({cat.skills.length} skills)</span>
                  </div>
                </AccordionTrigger>
                <div className="flex items-center gap-2 pl-4">
                  <Button variant="ghost" size="sm" onClick={() => openEditCategory(cat)} className="h-8 px-2 text-xs">
                    <Edit2 className="w-3.5 h-3.5 mr-1" /> Edit
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setDeleteCatTarget(cat)}
                    className="h-8 px-2 text-xs text-destructive hover:bg-destructive/10"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>

              <AccordionContent className="p-4 pt-2 border-t border-border/40">
                <div className="flex justify-end mb-4">
                  <Button size="sm" variant="outline" onClick={() => openCreateSkill(cat.id)} className="text-xs gap-1.5 h-8">
                    <Plus className="w-3.5 h-3.5" /> Add Skill to {cat.title}
                  </Button>
                </div>

                {cat.skills.length === 0 ? (
                  <p className="text-xs text-muted-foreground italic text-center py-4">No skills in this category yet.</p>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                    {cat.skills.map((skill) => (
                      <div
                        key={skill.id}
                        className="relative group flex flex-col items-center justify-center p-3 rounded-lg border border-border/60 bg-muted/20 hover:bg-muted/40 transition-colors"
                      >
                        <div className="relative w-10 h-10 mb-2">
                          <Image
                            src={skill.iconUrl}
                            alt={skill.name}
                            fill
                            className="object-contain"
                            unoptimized
                          />
                        </div>
                        <span className="text-xs font-medium text-center truncate max-w-full">{skill.name}</span>

                        <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity flex gap-0.5 bg-background/90 rounded p-0.5 border border-border shadow-sm">
                          <button
                            onClick={() => openEditSkill(skill)}
                            className="p-1 hover:text-primary rounded text-muted-foreground"
                          >
                            <Edit2 className="w-3 h-3" />
                          </button>
                          <button
                            onClick={() => setDeleteSkillTarget(skill)}
                            className="p-1 hover:text-destructive rounded text-muted-foreground"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      )}

      {/* Category Dialog */}
      <Dialog open={catDialogOpen} onOpenChange={setCatDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingCategory ? 'Edit Skill Category' : 'New Skill Category'}</DialogTitle>
            <DialogDescription>Group skills logically (e.g. Mobile Development, Backend, Tools)</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSaveCategory} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="cat-title">Category Title *</Label>
              <Input
                id="cat-title"
                value={catTitle}
                onChange={(e) => setCatTitle(e.target.value)}
                placeholder="e.g. Mobile Development"
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="cat-icon">Icon Identifier</Label>
                <Input
                  id="cat-icon"
                  value={catIcon}
                  onChange={(e) => setCatIcon(e.target.value)}
                  placeholder="Code, Server, Wrench"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cat-order">Sort Order</Label>
                <Input
                  id="cat-order"
                  type="number"
                  value={catOrder}
                  onChange={(e) => setCatOrder(e.target.value)}
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setCatDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : null}
                Save Category
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Skill Dialog */}
      <Dialog open={skillDialogOpen} onOpenChange={setSkillDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingSkill ? 'Edit Skill' : 'Add New Skill'}</DialogTitle>
            <DialogDescription>Add a technology icon and name</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSaveSkill} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="skill-name">Skill Name *</Label>
              <Input
                id="skill-name"
                value={skillName}
                onChange={(e) => setSkillName(e.target.value)}
                placeholder="e.g. Flutter, Golang, PostgreSQL"
                required
              />
            </div>

            <div className="space-y-2">
              <Label>Skill Icon (Upload or URL) *</Label>
              <FileUpload
                folder="skills"
                currentUrl={skillIconUrl}
                onSuccess={(url) => setSkillIconUrl(url)}
                onRemove={() => setSkillIconUrl('')}
                label="Upload Icon Image / SVG"
              />
              <Input
                value={skillIconUrl}
                onChange={(e) => setSkillIconUrl(e.target.value)}
                placeholder="Or paste direct icon URL (e.g. https://.../icon.svg)"
                className="mt-2 text-xs"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="skill-order">Display Order Index</Label>
              <Input
                id="skill-order"
                type="number"
                value={skillOrder}
                onChange={(e) => setSkillOrder(e.target.value)}
              />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setSkillDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={submitting || !skillIconUrl}>
                {submitting ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : null}
                Save Skill
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Category Alert */}
      <AlertDialog open={Boolean(deleteCatTarget)} onOpenChange={(open) => !open && setDeleteCatTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this category?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the category &ldquo;{deleteCatTarget?.title}&rdquo; and all its nested skills.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteCategory} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete All
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Skill Alert */}
      <AlertDialog open={Boolean(deleteSkillTarget)} onOpenChange={(open) => !open && setDeleteSkillTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this skill?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove &ldquo;{deleteSkillTarget?.name}&rdquo;?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteSkill} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
