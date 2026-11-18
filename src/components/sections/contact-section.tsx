'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Mail, Linkedin, Github, Mails, Send, CheckCircle2, Globe, ExternalLink, Phone } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

const WhatsappIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.63A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
    <path d="M14.05 16.95A8.91 8.91 0 0 1 12.03 18c-2.45 0-4.66-.93-6.34-2.5" />
  </svg>
);

const InstagramIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5"></rect>
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"></line>
  </svg>
);

export interface SocialLinkItem {
  id?: string;
  platform: string;
  url: string;
  icon?: string;
}

interface ContactData {
  email?: string | null;
  linkedin?: string | null;
  github?: string | null;
  instagram?: string | null;
  whatsapp?: string | null;
  contact?: {
    email?: string;
    linkedin?: string;
    github?: string;
    instagram?: string;
    whatsapp?: string;
  };
}

export function ContactSection({
  data,
  socialLinks = [],
}: {
  data?: ContactData;
  socialLinks?: SocialLinkItem[];
}) {
  const email = data?.email || data?.contact?.email || null;
  const linkedin = data?.linkedin || data?.contact?.linkedin || null;
  const github = data?.github || data?.contact?.github || null;
  const instagram = data?.instagram || data?.contact?.instagram || null;
  const rawWhatsapp = data?.whatsapp || data?.contact?.whatsapp || null;
  const whatsappNumber = rawWhatsapp ? rawWhatsapp.replace(/\D/g, '') : '';

  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/v1/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        setSent(true);
        setFormData({ name: '', email: '', message: '' });
      } else {
        const result = await res.json();
        setError(result.error || 'Gagal mengirim pesan');
      }
    } catch (err: any) {
      setError(err.message || 'Terjadi kesalahan');
    } finally {
      setLoading(false);
    }
  };

  const getSocialIcon = (platform: string, iconName?: string) => {
    const key = (platform + ' ' + (iconName || '')).toLowerCase();
    if (key.includes('github')) return <Github className="h-6 w-6" />;
    if (key.includes('linkedin')) return <Linkedin className="h-6 w-6" />;
    if (key.includes('instagram')) return <InstagramIcon className="h-6 w-6" />;
    if (key.includes('whatsapp') || key.includes('phone')) return <WhatsappIcon className="h-6 w-6" />;
    if (key.includes('mail') || key.includes('email')) return <Mail className="h-6 w-6" />;
    return <Globe className="h-6 w-6" />;
  };

  const activeLinks = socialLinks && socialLinks.length > 0
    ? socialLinks.map((item) => ({
        icon: getSocialIcon(item.platform, item.icon),
        title: item.platform,
        href: item.url,
      }))
    : [
        email ? {
          icon: <Mail className="h-6 w-6" />,
          title: 'Email',
          href: `mailto:${email}`,
        } : null,
        linkedin ? {
          icon: <Linkedin className="h-6 w-6" />,
          title: 'LinkedIn',
          href: linkedin,
        } : null,
        github ? {
          icon: <Github className="h-6 w-6" />,
          title: 'GitHub',
          href: github,
        } : null,
        instagram ? {
          icon: <InstagramIcon className="h-6 w-6" />,
          title: 'Instagram',
          href: instagram,
        } : null,
        whatsappNumber ? {
          icon: <WhatsappIcon className="h-6 w-6" />,
          title: 'WhatsApp',
          href: `https://wa.me/${whatsappNumber}`,
        } : null,
      ].filter(Boolean) as { icon: React.ReactNode; title: string; href: string }[];

  return (
    <section id="contact" className="scroll-mt-16">
      <div className="max-w-3xl mx-auto text-center space-y-8">
        <div>
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-4 flex items-center justify-center gap-3 leading-tight">
            <Mails className="w-8 h-8 text-primary" />
            Hubungi Saya
          </h2>
          <p className="text-muted-foreground">
            Saya selalu terbuka untuk diskusi, kolaborasi, atau sekadar menyapa.
          </p>
        </div>

        <div className="flex justify-center items-center gap-4 md:gap-8 mb-8">
          <TooltipProvider>
            {activeLinks.map((link) => (
              <Tooltip key={link.title}>
                <TooltipTrigger asChild>
                  <a
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group"
                  >
                    <div className="p-4 rounded-full bg-card/80 border border-border/50 text-foreground transition-all duration-300 group-hover:bg-primary group-hover:text-primary-foreground group-hover:scale-110 group-hover:shadow-lg group-hover:shadow-primary/30">
                      {link.icon}
                    </div>
                  </a>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{link.title}</p>
                </TooltipContent>
              </Tooltip>
            ))}
          </TooltipProvider>
        </div>

        <form onSubmit={handleSubmit} className="text-left space-y-4 bg-card/50 p-6 rounded-xl border border-border">
          <h3 className="font-semibold text-lg text-foreground">Kirim Pesan Langsung</h3>
          {sent && (
            <div className="flex items-center gap-2 p-3 text-sm text-green-500 bg-green-500/10 border border-green-500/20 rounded-md">
              <CheckCircle2 className="w-4 h-4" /> Pesan berhasil terkirim! Terima kasih.
            </div>
          )}
          {error && (
            <div className="p-3 text-sm text-destructive-foreground bg-destructive/10 border border-destructive/20 rounded-md">
              {error}
            </div>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              placeholder="Nama Lengkap"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
            <Input
              type="email"
              placeholder="Alamat Email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
            />
          </div>
          <Textarea
            placeholder="Tulis pesan Anda di sini..."
            rows={4}
            value={formData.message}
            onChange={(e) => setFormData({ ...formData, message: e.target.value })}
            required
          />
          <Button type="submit" disabled={loading} className="w-full flex items-center gap-2">
            <Send className="w-4 h-4" /> {loading ? 'Mengirim...' : 'Kirim Pesan'}
          </Button>
        </form>
      </div>
    </section>
  );
}
