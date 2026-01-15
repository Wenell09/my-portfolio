import type { Metadata } from 'next';
import './globals.css';
import { cn } from '@/lib/utils';

export const metadata: Metadata = {
  title: 'Nabil Al Faatir | Portfolio',
  description: 'Portofolio Profesional Nabil Al Faatir - Pengembang Full-Stack & Penggemar Desain',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className="dark scroll-smooth">
      <head>
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon.jpeg" />
        <link rel="icon" type="image/png" sizes="48x48" href="/favicon.jpeg" />
        <link rel="apple-touch-icon" href="/favicon.jpeg" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className={cn('font-body antialiased bg-background text-foreground')}>
        {children}
      </body>
    </html>
  );
}
