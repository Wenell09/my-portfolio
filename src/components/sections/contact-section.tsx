'use client';
import { Button } from '@/components/ui/button';
import { Mail, Linkedin, Github, Mails } from 'lucide-react';
import profileData from '@/lib/profile-data.json';
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

export function ContactSection() {
  const { contact } = profileData;

  const socialLinks = [
    {
      icon: <Mail className="h-6 w-6" />,
      title: 'Email',
      href: `mailto:${contact.email}`,
    },
    {
      icon: <Linkedin className="h-6 w-6" />,
      title: 'LinkedIn',
      href: contact.linkedin,
    },
    {
      icon: <Github className="h-6 w-6" />,
      title: 'GitHub',
      href: contact.github,
    },
    {
      icon: <InstagramIcon className="h-6 w-6" />,
      title: 'Instagram',
      href: contact.instagram,
    },
    {
      icon: <WhatsappIcon className="h-6 w-6" />,
      title: 'WhatsApp',
      href: `https://wa.me/${contact.whatsapp.replace(/\D/g, '')}`,
    },
  ];

  return (
    <section id="contact" className="scroll-mt-16">
      <div className="max-w-5xl mx-auto text-center">
        <h2 className="text-3xl md:text-4xl font-bold mb-8 flex items-center justify-center gap-3">
          <Mails className="w-8 h-8 text-primary" />
          Hubungi Saya
        </h2>
        <p className="max-w-2xl mx-auto text-lg text-muted-foreground mb-12">
          Saya selalu terbuka untuk diskusi, kolaborasi, atau sekadar menyapa. Jangan ragu untuk menghubungi saya melalui salah satu platform di bawah ini.
        </p>

        <div className="flex justify-center items-center gap-4 md:gap-8">
          <TooltipProvider>
            {socialLinks.map((link) => (
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
      </div>
    </section>
  );
}