'use client';

import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

export function PagePreloader() {
  const [progress, setProgress] = useState(0);
  const [fading, setFading] = useState(false);
  const [isMounted, setIsMounted] = useState(true);

  useEffect(() => {
    // Lock scroll during preloading
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    // Simulate progress animation smoothly
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }

        // Variable increments to feel natural and dynamic
        let step = 1;
        if (prev < 30) {
          step = Math.random() * 4 + 2; // Fast start
        } else if (prev < 75) {
          step = Math.random() * 3 + 1; // Steady progress
        } else if (prev < 95) {
          step = Math.random() * 2 + 0.5; // Smooth deceleration towards completion
        } else {
          step = 1; // Final approach
        }

        const nextVal = prev + step;
        return nextVal >= 100 ? 100 : nextVal;
      });
    }, 30);

    return () => {
      clearInterval(interval);
      document.body.style.overflow = originalOverflow;
    };
  }, []);

  // When progress hits 100%, trigger smooth fade out
  useEffect(() => {
    if (progress >= 100) {
      const fadeTimer = setTimeout(() => {
        setFading(true);
      }, 250);

      const removeTimer = setTimeout(() => {
        setIsMounted(false);
        document.body.style.overflow = '';
      }, 750);

      return () => {
        clearTimeout(fadeTimer);
        clearTimeout(removeTimer);
      };
    }
  }, [progress]);

  if (!isMounted) return null;

  return (
    <div
      className={cn(
        'fixed inset-0 z-[99999] flex flex-col items-center justify-center bg-black transition-all duration-500 ease-out select-none',
        fading ? 'opacity-0 scale-[0.99] pointer-events-none' : 'opacity-100 scale-100'
      )}
      aria-label="Loading Page"
      role="status"
    >
      {/* Subtle ambient glow behind using the portfolio primary palette */}
      <div
        className="absolute w-[360px] h-[360px] sm:w-[500px] sm:h-[500px] rounded-full pointer-events-none blur-3xl opacity-20"
        style={{
          background: 'radial-gradient(circle, hsl(var(--primary)) 0%, transparent 70%)',
        }}
      />

      <div className="relative z-10 flex flex-col items-center justify-center space-y-6 px-6">
        {/* Title */}
        <div className="flex flex-col items-center space-y-2">
          <h1 className="text-xl sm:text-2xl md:text-3xl font-mono font-bold tracking-[0.25em] text-foreground drop-shadow-[0_0_15px_hsl(var(--primary)/0.4)]">
            LOADING<span className="text-primary animate-pulse">....</span>
          </h1>
        </div>

        {/* Progress Line Indicator Container */}
        <div className="w-64 sm:w-80 md:w-96 flex flex-col space-y-2">
          {/* Progress Line Track */}
          <div className="relative h-1.5 sm:h-2 w-full bg-neutral-900/90 rounded-full overflow-hidden border border-neutral-800/80 shadow-inner">
            {/* Active Indicator Bar */}
            <div
              className="h-full rounded-full bg-gradient-to-r from-primary/70 via-primary to-accent transition-all duration-100 ease-out shadow-[0_0_12px_hsl(var(--primary))] relative"
              style={{ width: `${progress}%` }}
            >
              {/* Glowing leading head */}
              <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-white shadow-[0_0_8px_#ffffff,0_0_16px_hsl(var(--primary))] animate-pulse" />
            </div>
          </div>

          {/* Progress Percentage Display */}
          <div className="flex justify-between items-center text-[10px] sm:text-xs font-mono text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-primary animate-ping" />
              SYSTEM_READY
            </span>
            <span className="text-primary font-semibold tracking-wider">
              {Math.round(progress)}%
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
