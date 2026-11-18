'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Save } from 'lucide-react';

interface SiteSetting {
  id: string;
  siteTitle: string;
  siteDescription: string;
  footerText: string;
}

export function SettingsManager({ initialSettings }: { initialSettings: SiteSetting | null }) {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const [siteTitle, setSiteTitle] = useState(initialSettings?.siteTitle || 'Nabil Al Faatir | Portfolio');
  const [siteDescription, setSiteDescription] = useState(initialSettings?.siteDescription || '');
  const [footerText, setFooterText] = useState(initialSettings?.footerText || `© ${new Date().getFullYear()} Dibuat oleh Nabil Al Faatir`);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch('/api/v1/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          siteTitle,
          siteDescription,
          footerText,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to update settings');
      }

      toast({
        title: 'Settings Saved',
        description: 'Site configuration updated successfully.',
      });
      router.refresh();
    } catch (err: any) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: err.message,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="border-border">
      <CardHeader>
        <CardTitle>Global Website Settings</CardTitle>
        <CardDescription>
          Configure the public browser title, SEO meta description, and footer credits.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="site-title">Website Title (SEO / Browser Tab) *</Label>
            <Input
              id="site-title"
              value={siteTitle}
              onChange={(e) => setSiteTitle(e.target.value)}
              placeholder="Nabil Al Faatir | Portfolio"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="site-desc">Meta Description (SEO)</Label>
            <Textarea
              id="site-desc"
              rows={3}
              value={siteDescription}
              onChange={(e) => setSiteDescription(e.target.value)}
              placeholder="Brief description of your skills, tech stack, and portfolio..."
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="footer-text">Footer Text</Label>
            <Input
              id="footer-text"
              value={footerText}
              onChange={(e) => setFooterText(e.target.value)}
              placeholder={`© ${new Date().getFullYear()} Dibuat oleh Nabil Al Faatir`}
            />
          </div>

          <div className="flex justify-end pt-2">
            <Button type="submit" disabled={loading} className="gap-2">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              {loading ? 'Saving...' : 'Save Settings'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
