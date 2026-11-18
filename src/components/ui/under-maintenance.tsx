'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { GridBackground } from '@/components/ui/grid-background';
import { Wrench, Shield, ArrowRight, Sparkles, RefreshCw } from 'lucide-react';

export function UnderMaintenance() {
  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center px-4 overflow-hidden">
      <GridBackground />
      <div className="relative z-10 max-w-lg w-full text-center space-y-8 bg-card/60 backdrop-blur-xl p-8 sm:p-10 rounded-2xl border border-border/60 shadow-2xl shadow-primary/5">
        {/* Status Badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-primary/10 border border-primary/20 text-primary">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Status: Sedang Dalam Pemeliharaan</span>
        </div>
        {/* Headings */}
        <div className="space-y-3">
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
            Website Under Maintenance
          </h1>
          <p className="text-muted-foreground text-sm sm:text-base leading-relaxed">
            Data portofolio sedang dalam proses sinkronisasi dan pembaruan melalui Backend CMS. 
            Silakan kembali lagi nanti untuk melihat portofolio terbaru.
          </p>
        </div>
        {/* Action Buttons */}
        <div className="pt-2 flex flex-col sm:flex-row gap-3 justify-center items-center">
          <Button
            variant="outline"
            onClick={() => window.location.reload()}
            className="w-full sm:w-auto flex items-center justify-center gap-2"
          >
            <RefreshCw className="w-4 h-4" /> Muat Ulang
          </Button>
        </div>
        <div className="pt-4 border-t border-border/40 text-xs text-muted-foreground">
          &copy; {new Date().getFullYear()} Nabil Al Faatir 
        </div>
      </div>
    </div>
  );
}
