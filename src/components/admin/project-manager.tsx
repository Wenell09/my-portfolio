'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { FileUpload } from '@/components/admin/file-upload';
import { useToast } from '@/hooks/use-toast';
import { Plus, Edit3, Trash2, ExternalLink, Github, Play, Loader2, Images, CheckCircle2, Clock, Archive } from 'lucide-react';
import Image from 'next/image';

interface Project {
  id: string;
  slug: string;
  title: string;
  description: string;
  features: string[];
  category: string;
  imageUrl: string;
  imageHint?: string | null;
  screenshots: string[];
  tags: string[];
  playstoreUrl?: string | null;
  githubUrl?: string | null;
  demoUrl?: string | null;
  status: string;
  isPublished: boolean;
  order: number;
}

const CATEGORY_OPTIONS = [
  { value: 'MOBILE', label: 'Mobile App' },
  { value: 'WEB', label: 'Web App' },
  { value: 'BACKEND', label: 'Backend / API' },
  { value: 'FULLSTACK', label: 'Full Stack' },
  { value: 'OTHER', label: 'Other' },
];

const STATUS_OPTIONS = [
  { value: 'COMPLETED', label: 'Completed', icon: CheckCircle2, color: 'text-green-500' },
  { value: 'IN_PROGRESS', label: 'In Progress', icon: Clock, color: 'text-yellow-500' },
  { value: 'ARCHIVED', label: 'Archived', icon: Archive, color: 'text-muted-foreground' },
];

function StatusBadge({ status }: { status: string }) {
  const opt = STATUS_OPTIONS.find((s) => s.value === status);
  if (!opt) return <Badge variant="secondary">{status}</Badge>;
  return (
    <Badge
      variant={status === 'COMPLETED' ? 'default' : status === 'IN_PROGRESS' ? 'secondary' : 'outline'}
      className="gap-1"
    >
      <opt.icon className={`w-3 h-3 ${opt.color}`} />
      {opt.label}
    </Badge>
  );
}

export function ProjectManager({ initialProjects }: { initialProjects: Project[] }) {
  const router = useRouter();
  const { toast } = useToast();
  const [projects, setProjects] = useState<Project[]>(initialProjects);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Project | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [features, setFeatures] = useState(''); // newline-separated
  const [category, setCategory] = useState('MOBILE');
  const [imageUrl, setImageUrl] = useState('');
  const [imageHint, setImageHint] = useState('');
  const [screenshots, setScreenshots] = useState<string[]>([]);
  const [tags, setTags] = useState('');
  const [githubUrl, setGithubUrl] = useState('');
  const [playstoreUrl, setPlaystoreUrl] = useState('');
  const [demoUrl, setDemoUrl] = useState('');
  const [status, setStatus] = useState('COMPLETED');
  const [isPublished, setIsPublished] = useState(true);
  const [order, setOrder] = useState('0');

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setFeatures('');
    setCategory('MOBILE');
    setImageUrl('');
    setImageHint('');
    setScreenshots([]);
    setTags('');
    setGithubUrl('');
    setPlaystoreUrl('');
    setDemoUrl('');
    setStatus('COMPLETED');
    setIsPublished(true);
    setOrder(String(projects.length));
  };

  const openCreateDialog = () => {
    setEditingProject(null);
    resetForm();
    setDialogOpen(true);
  };

  const openEditDialog = (proj: Project) => {
    setEditingProject(proj);
    setTitle(proj.title);
    setDescription(proj.description);
    setFeatures(proj.features.join('\n'));
    setCategory(proj.category || 'MOBILE');
    setImageUrl(proj.imageUrl);
    setImageHint(proj.imageHint || '');
    setScreenshots(proj.screenshots || []);
    setTags(proj.tags.join(', '));
    setGithubUrl(proj.githubUrl || '');
    setPlaystoreUrl(proj.playstoreUrl || '');
    setDemoUrl(proj.demoUrl || '');
    setStatus(proj.status || 'COMPLETED');
    setIsPublished(proj.isPublished ?? true);
    setOrder(String(proj.order || 0));
    setDialogOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !description || !imageUrl) {
      toast({
        variant: 'destructive',
        title: 'Validation Error',
        description: 'Title, description, and cover image are required.',
      });
      return;
    }

    setSubmitting(true);
    const tagList = tags.split(',').map((t) => t.trim()).filter(Boolean);
    const featureList = features.split('\n').map((f) => f.trim()).filter(Boolean);

    const payload = {
      title,
      description,
      features: featureList,
      category,
      imageUrl,
      imageHint: imageHint || null,
      screenshots,
      tags: tagList,
      githubUrl: githubUrl || null,
      playstoreUrl: playstoreUrl || null,
      demoUrl: demoUrl || null,
      status,
      isPublished,
      order: parseInt(order, 10) || 0,
    };

    try {
      if (editingProject) {
        const res = await fetch(`/api/v1/projects/${editingProject.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.error || 'Failed to update project');
        }
        const updated = await res.json();
        setProjects(projects.map((p) => (p.id === updated.id ? updated : p)));
        toast({ title: 'Project Updated', description: 'Project has been updated successfully.' });
      } else {
        const res = await fetch('/api/v1/projects', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.error || 'Failed to create project');
        }
        const created = await res.json();
        setProjects([...projects, created]);
        toast({ title: 'Project Created', description: 'New project added successfully.' });
      }

      setDialogOpen(false);
      router.refresh();
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.message || 'Operation failed',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;

    try {
      const res = await fetch(`/api/v1/projects/${deleteTarget.id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete project');

      setProjects(projects.filter((p) => p.id !== deleteTarget.id));
      toast({ title: 'Project Deleted', description: `${deleteTarget.title} has been removed.` });
      router.refresh();
    } catch (err: any) {
      toast({ variant: 'destructive', title: 'Error', description: err.message });
    } finally {
      setDeleteTarget(null);
    }
  };

  const handleAddScreenshot = (url: string) => {
    setScreenshots((prev) => [...prev, url]);
  };

  const handleRemoveScreenshot = (index: number) => {
    setScreenshots((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold">Projects ({projects.length})</h2>
          <p className="text-sm text-muted-foreground">Manage showcase items and portfolio cards</p>
        </div>
        <Button onClick={openCreateDialog} className="gap-2">
          <Plus className="w-4 h-4" /> Add Project
        </Button>
      </div>

      {/* Projects Grid */}
      {projects.length === 0 ? (
        <Card className="p-8 text-center border-dashed">
          <p className="text-muted-foreground mb-4">No projects found. Create your first project.</p>
          <Button onClick={openCreateDialog} variant="outline">
            <Plus className="w-4 h-4 mr-2" /> Add Project
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((proj) => {
            const catLabel = CATEGORY_OPTIONS.find((c) => c.value === proj.category)?.label || proj.category;
            return (
              <Card key={proj.id} className="overflow-hidden border-border flex flex-col justify-between hover:border-primary/50 transition-colors">
                <div>
                  <div className="relative h-44 w-full bg-muted">
                    <Image
                      src={proj.imageUrl}
                      alt={proj.title}
                      fill
                      className="object-cover"
                      unoptimized
                    />
                    <div className="absolute top-2 right-2 flex flex-col gap-1 items-end">
                      <StatusBadge status={proj.status} />
                      {!proj.isPublished && (
                        <Badge variant="outline" className="bg-background/80 text-xs">Hidden</Badge>
                      )}
                    </div>
                    <div className="absolute bottom-2 left-2">
                      <Badge variant="secondary" className="text-[10px]">{catLabel}</Badge>
                    </div>
                  </div>
                  <CardHeader className="p-4 pb-2">
                    <CardTitle className="text-lg leading-tight line-clamp-1">{proj.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 pt-0">
                    <p className="text-xs text-muted-foreground line-clamp-2 mb-3">
                      {proj.description}
                    </p>
                    {proj.features.length > 0 && (
                      <ul className="text-xs text-muted-foreground mb-2 space-y-0.5 list-disc list-inside">
                        {proj.features.slice(0, 2).map((f, i) => (
                          <li key={i} className="line-clamp-1">{f}</li>
                        ))}
                        {proj.features.length > 2 && (
                          <li className="text-muted-foreground/60">+{proj.features.length - 2} more features</li>
                        )}
                      </ul>
                    )}
                    <div className="flex flex-wrap gap-1">
                      {proj.tags.map((t) => (
                        <span key={t} className="text-[10px] bg-muted px-2 py-0.5 rounded text-muted-foreground">
                          {t}
                        </span>
                      ))}
                    </div>
                    {proj.screenshots.length > 0 && (
                      <p className="text-[10px] text-muted-foreground mt-1 flex items-center gap-1">
                        <Images className="w-3 h-3" /> {proj.screenshots.length} screenshot(s)
                      </p>
                    )}
                  </CardContent>
                </div>

                <CardFooter className="p-4 pt-0 border-t border-border/40 flex items-center justify-between mt-auto">
                  <div className="flex gap-2">
                    {proj.githubUrl && (
                      <a href={proj.githubUrl} target="_blank" rel="noreferrer" className="text-muted-foreground hover:text-foreground">
                        <Github className="w-4 h-4" />
                      </a>
                    )}
                    {proj.playstoreUrl && (
                      <a href={proj.playstoreUrl} target="_blank" rel="noreferrer" className="text-muted-foreground hover:text-foreground">
                        <Play className="w-4 h-4" />
                      </a>
                    )}
                    {proj.demoUrl && (
                      <a href={proj.demoUrl} target="_blank" rel="noreferrer" className="text-muted-foreground hover:text-foreground">
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    )}
                  </div>
                  <div className="flex items-center gap-1">
                    <Button variant="ghost" size="sm" onClick={() => openEditDialog(proj)} className="h-8 px-2 text-xs">
                      <Edit3 className="w-3.5 h-3.5 mr-1" /> Edit
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setDeleteTarget(proj)}
                      className="h-8 px-2 text-xs text-destructive hover:bg-destructive/10"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      )}

      {/* Create / Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingProject ? 'Edit Project' : 'Create New Project'}</DialogTitle>
            <DialogDescription>
              Fill in project details. Upload covers directly to Vercel Blob.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSave} className="space-y-5 py-2">
            {/* Title + Status + Published */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-1 space-y-2">
                <Label htmlFor="proj-title">Project Title *</Label>
                <Input
                  id="proj-title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Marina Bung"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="proj-category">Category</Label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger id="proj-category">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORY_OPTIONS.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="proj-status">Project Status</Label>
                <Select value={status} onValueChange={setStatus}>
                  <SelectTrigger id="proj-status">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {STATUS_OPTIONS.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Published toggle + Order */}
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-3 border rounded-md px-3 py-2">
                <Switch
                  id="proj-published"
                  checked={isPublished}
                  onCheckedChange={setIsPublished}
                />
                <div>
                  <Label htmlFor="proj-published" className="cursor-pointer">
                    {isPublished ? 'Published (Visible)' : 'Draft (Hidden)'}
                  </Label>
                  <p className="text-xs text-muted-foreground">Controls visibility on portfolio</p>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="proj-order">Display Order</Label>
                <Input
                  id="proj-order"
                  type="number"
                  value={order}
                  onChange={(e) => setOrder(e.target.value)}
                />
              </div>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="proj-desc">Short Description *</Label>
              <Textarea
                id="proj-desc"
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Brief description shown on the project card..."
                required
              />
            </div>

            {/* Features */}
            <div className="space-y-2">
              <Label htmlFor="proj-features">Key Features (one per line)</Label>
              <Textarea
                id="proj-features"
                rows={4}
                value={features}
                onChange={(e) => setFeatures(e.target.value)}
                placeholder={"Real-time location tracking\nOffline mode support\nPush notifications\nPayment gateway integration"}
              />
              <p className="text-xs text-muted-foreground">Each line becomes a bullet point on the detail page.</p>
            </div>

            {/* Cover Image */}
            <div className="space-y-2">
              <Label>Cover Image (Thumbnail) *</Label>
              <FileUpload
                folder="projects"
                currentUrl={imageUrl}
                onSuccess={(url) => setImageUrl(url)}
                onRemove={() => setImageUrl('')}
                label="Upload Cover Image"
              />
            </div>

            {/* Image Hint */}
            <div className="space-y-2">
              <Label htmlFor="proj-hint">Image AI Hint</Label>
              <Input
                id="proj-hint"
                value={imageHint}
                onChange={(e) => setImageHint(e.target.value)}
                placeholder="e.g. mobile app screenshot"
              />
            </div>

            {/* Screenshots */}
            <div className="space-y-3">
              <Label>Screenshots / Mockups (for detail page)</Label>
              {screenshots.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {screenshots.map((url, i) => (
                    <div key={i} className="relative group">
                      <Image
                        src={url}
                        alt={`Screenshot ${i + 1}`}
                        width={96}
                        height={64}
                        className="rounded object-cover w-24 h-16 border border-border"
                        unoptimized
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveScreenshot(i)}
                        className="absolute -top-1.5 -right-1.5 bg-destructive text-white rounded-full w-4 h-4 text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
              <FileUpload
                folder="projects/screenshots"
                currentUrl=""
                onSuccess={handleAddScreenshot}
                onRemove={() => {}}
                label="Add Screenshot"
              />
            </div>

            {/* Tags */}
            <div className="space-y-2">
              <Label htmlFor="proj-tags">Tech Stack / Tags (comma separated)</Label>
              <Input
                id="proj-tags"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                placeholder="Flutter, Bloc, REST API, Firebase"
              />
            </div>

            {/* Links */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="proj-github">GitHub Repository</Label>
                <Input
                  id="proj-github"
                  value={githubUrl}
                  onChange={(e) => setGithubUrl(e.target.value)}
                  placeholder="https://github.com/..."
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="proj-play">Play Store URL</Label>
                <Input
                  id="proj-play"
                  value={playstoreUrl}
                  onChange={(e) => setPlaystoreUrl(e.target.value)}
                  placeholder="https://play.google.com/..."
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="proj-demo">Live Demo URL</Label>
                <Input
                  id="proj-demo"
                  value={demoUrl}
                  onChange={(e) => setDemoUrl(e.target.value)}
                  placeholder="https://..."
                />
              </div>
            </div>

            <DialogFooter className="pt-4">
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={submitting || !imageUrl}>
                {submitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                {editingProject ? 'Save Changes' : 'Create Project'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Alert */}
      <AlertDialog open={Boolean(deleteTarget)} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure you want to delete this project?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete &ldquo;{deleteTarget?.title}&rdquo; and all its associated images (cover + screenshots) from Vercel Blob storage.
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
