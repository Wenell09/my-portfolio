import { GridBackground } from '@/components/ui/grid-background';
import { Loader2, Code2 } from 'lucide-react';

export default function Loading() {
  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden">
      <GridBackground />
      <div className="relative z-10 flex flex-col items-center justify-center space-y-6">
        {/* Animated Brand Ring */}
        <div className="relative flex items-center justify-center">
          <div className="absolute w-20 h-20 rounded-full bg-primary/20 blur-xl animate-ping" />
          <div className="relative w-16 h-16 rounded-2xl bg-card border border-primary/40 flex items-center justify-center shadow-lg shadow-primary/20">
            <Code2 className="w-8 h-8 text-primary animate-pulse" />
          </div>
        </div>

        {/* Loading Spinner & Label */}
        <div className="flex flex-col items-center space-y-2">
          <div className="flex items-center gap-2 text-foreground font-semibold text-base sm:text-lg">
            <Loader2 className="w-5 h-5 text-primary animate-spin" />
            <span>Memuat Data Portofolio...</span>
          </div>
          <p className="text-xs text-muted-foreground animate-pulse">
            Sinkronisasi dengan backend CMS &amp; API
          </p>
        </div>
      </div>
    </div>
  );
}
