'use client';

import { useEffect, useState } from 'react';
import { Code2, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export function PagePreloader() {
  const [loading, setLoading] = useState(true);
  const [fading, setFading] = useState(false);

  useEffect(() => {
    // Smooth brief transition after mount
    const fadeTimer = setTimeout(() => {
      setFading(true);
    }, 450);

    const endTimer = setTimeout(() => {
      setLoading(false);
    }, 850);

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(endTimer);
    };
  }, []);

  if (!loading) return null;

  return (
    <div
      className={cn(
        'fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-background transition-opacity duration-400 pointer-events-none',
        fading ? 'opacity-0' : 'opacity-100'
      )}
    >
      <div className="flex flex-col items-center justify-center space-y-4">
        <div className="relative flex items-center justify-center">
          <div className="absolute w-16 h-16 rounded-full bg-primary/20 blur-lg animate-ping" />
          <div className="relative w-14 h-14 rounded-2xl bg-card border border-primary/40 flex items-center justify-center shadow-md">
            <Code2 className="w-7 h-7 text-primary animate-pulse" />
          </div>
        </div>
        <div className="flex items-center gap-2 text-sm font-medium text-foreground">
          <Loader2 className="w-4 h-4 text-primary animate-spin" />
          <span>Sinkronisasi Data...</span>
        </div>
      </div>
    </div>
  );
}
