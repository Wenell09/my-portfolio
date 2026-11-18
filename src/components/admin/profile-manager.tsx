'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FileUpload } from '@/components/admin/file-upload';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Save } from 'lucide-react';

interface ProfileData {
  id?: string;
  name: string;
  title: string;
  description: string;
  profileImageUrl: string;
  imageHint?: string | null;
  email?: string | null;
  linkedin?: string | null;
  github?: string | null;
  instagram?: string | null;
  whatsapp?: string | null;
}

export function ProfileManager({ initialProfile }: { initialProfile: ProfileData | null }) {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState<ProfileData>({
    name: initialProfile?.name || '',
    title: initialProfile?.title || '',
    description: initialProfile?.description || '',
    profileImageUrl: initialProfile?.profileImageUrl || '',
    imageHint: initialProfile?.imageHint || '',
    email: initialProfile?.email || '',
    linkedin: initialProfile?.linkedin || '',
    github: initialProfile?.github || '',
    instagram: initialProfile?.instagram || '',
    whatsapp: initialProfile?.whatsapp || '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch('/api/v1/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Failed to update profile');
      }

      toast({
        title: 'Profile Updated',
        description: 'Your profile changes have been saved successfully.',
      });
      router.refresh();
    } catch (err: any) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: err.message || 'Something went wrong.',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="border-border">
      <CardHeader>
        <CardTitle>Edit Profile Information</CardTitle>
        <CardDescription>
          This information will be displayed on the hero and contact sections of your portfolio.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Avatar Upload */}
          <div className="space-y-2">
            <Label>Profile Picture</Label>
            <FileUpload
              folder="profile"
              currentUrl={form.profileImageUrl}
              onSuccess={(url) => setForm((prev) => ({ ...prev, profileImageUrl: url }))}
              onRemove={() => setForm((prev) => ({ ...prev, profileImageUrl: '' }))}
              label="Upload Avatar"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name *</Label>
              <Input
                id="name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="e.g. Nabil Al Faatir"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="title">Professional Headline *</Label>
              <Input
                id="title"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="e.g. Mobile App Developer & Flutter Enthusiast"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">About Bio / Description *</Label>
            <Textarea
              id="description"
              rows={5}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Tell about your background, expertise, and goals..."
              required
            />
          </div>

          <div className="border-t border-border pt-4">
            <h3 className="text-base font-semibold mb-3">Contact & Direct Socials</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  value={form.email || ''}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="e.g. nabil@example.com"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="whatsapp">WhatsApp Number / Link</Label>
                <Input
                  id="whatsapp"
                  value={form.whatsapp || ''}
                  onChange={(e) => setForm({ ...form, whatsapp: e.target.value })}
                  placeholder="e.g. 6281311419348"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="linkedin">LinkedIn Profile URL</Label>
                <Input
                  id="linkedin"
                  value={form.linkedin || ''}
                  onChange={(e) => setForm({ ...form, linkedin: e.target.value })}
                  placeholder="https://linkedin.com/in/..."
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="github">GitHub Profile URL</Label>
                <Input
                  id="github"
                  value={form.github || ''}
                  onChange={(e) => setForm({ ...form, github: e.target.value })}
                  placeholder="https://github.com/..."
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="instagram">Instagram Profile URL</Label>
                <Input
                  id="instagram"
                  value={form.instagram || ''}
                  onChange={(e) => setForm({ ...form, instagram: e.target.value })}
                  placeholder="https://instagram.com/..."
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <Button type="submit" disabled={loading} className="gap-2">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              {loading ? 'Saving Changes...' : 'Save Profile'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
