'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FileUpload } from '@/components/admin/file-upload';
import { useToast } from '@/hooks/use-toast';
import { Plus, Edit3, Trash2, ExternalLink, Github, Play, Loader2 } from 'lucide-react';
import Image from 'next/image';

interface Project {
  id: string;
  slug: string;
  title: string;
  description: string;
  imageUrl: string;
  imageHint?: string | null;
  tags: string[];
  playstoreUrl?: string | null;
  githubUrl?: string | null;
  demoUrl?: string | null;
  status: string;
  order: number;
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
  const [imageUrl, setImageUrl] = useState('');
  const [tags, setTags] = useState('');
  const [githubUrl, setGithubUrl] = useState('');
  const [playstoreUrl, setPlaystoreUrl] = useState('');
  const [demoUrl, setDemoUrl] = useState('');
  const [status, setStatus] = useState('published');
  const [order, setOrder] = useState('0');

  const openCreateDialog = () => {
    setEditingProject(null);
    setTitle('');
    setDescription('');
    setImageUrl('');
    setTags('');
    setGithubUrl('');
    setPlaystoreUrl('');
    setDemoUrl('');
    setStatus('published');
    setOrder(String(projects.length));
    setDialogOpen(true);
  };

  const openEditDialog = (proj: Project) => {
    setEditingProject(proj);
    setTitle(proj.title);
    setDescription(proj.description);
    setImageUrl(proj.imageUrl);
    setTags(proj.tags.join(', '));
    setGithubUrl(proj.githubUrl || '');
    setPlaystoreUrl(proj.playstoreUrl || '');
    setDemoUrl(proj.demoUrl || '');
    setStatus(proj.status || 'published');
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
    const payload = {
      title,
      description,
      imageUrl,
      tags: tagList,
      githubUrl: githubUrl || null,
      playstoreUrl: playstoreUrl || null,
      demoUrl: demoUrl || null,
      status,
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
          {projects.map((proj) => (
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
                  <div className="absolute top-2 right-2">
                    <Badge variant={proj.status === 'published' ? 'default' : 'secondary'}>
                      {proj.status}
                    </Badge>
                  </div>
                </div>
                <CardHeader className="p-4 pb-2">
                  <CardTitle className="text-lg leading-tight line-clamp-1">{proj.title}</CardTitle>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                  <p className="text-xs text-muted-foreground line-clamp-2 mb-3">
                    {proj.description}
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {proj.tags.map((t) => (
                      <span key={t} className="text-[10px] bg-muted px-2 py-0.5 rounded text-muted-foreground">
                        {t}
                      </span>
                    ))}
                  </div>
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
          ))}
        </div>
      )}

      {/* Create / Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingProject ? 'Edit Project' : 'Create New Project'}</DialogTitle>
            <DialogDescription>
              Fill in project details. Upload covers directly to Vercel Blob.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSave} className="space-y-4 py-2">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2 space-y-2">
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
                <Label htmlFor="proj-status">Status</Label>
                <Select value={status} onValueChange={setStatus}>
                  <SelectTrigger id="proj-status">
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
              <Label htmlFor="proj-desc">Description *</Label>
              <Textarea
                id="proj-desc"
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Detailed description of features, tech stack..."
                required
              />
            </div>

            <div className="space-y-2">
              <Label>Cover Image (Vercel Blob) *</Label>
              <FileUpload
                folder="projects"
                currentUrl={imageUrl}
                onSuccess={(url) => setImageUrl(url)}
                onRemove={() => setImageUrl('')}
                label="Upload Cover Image"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="proj-tags">Tags (comma separated)</Label>
                <Input
                  id="proj-tags"
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                  placeholder="Flutter, Bloc, REST API"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="proj-order">Display Order Index</Label>
                <Input
                  id="proj-order"
                  type="number"
                  value={order}
                  onChange={(e) => setOrder(e.target.value)}
                />
              </div>
            </div>

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
              This will permanently delete &ldquo;{deleteTarget?.title}&rdquo; and its associated image from Vercel Blob storage.
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
