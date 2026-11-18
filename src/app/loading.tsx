export default function Loading() {
  return (
    <div
      className="fixed inset-0 z-[99999] flex flex-col items-center justify-center bg-black select-none"
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
          <p className="text-[11px] sm:text-xs font-mono text-muted-foreground tracking-widest uppercase">
            Initializing Portfolio
          </p>
        </div>

        {/* Progress Line Indicator Container */}
        <div className="w-64 sm:w-80 md:w-96 flex flex-col space-y-2">
          {/* Progress Line Track */}
          <div className="relative h-1.5 sm:h-2 w-full bg-neutral-900/90 rounded-full overflow-hidden border border-neutral-800/80 shadow-inner">
            {/* Indeterminate Animated Progress Bar for server suspense */}
            <div className="h-full rounded-full bg-gradient-to-r from-primary/70 via-primary to-accent shadow-[0_0_12px_hsl(var(--primary))] animate-pulse w-full" />
          </div>

          {/* Status Label */}
          <div className="flex justify-between items-center text-[10px] sm:text-xs font-mono text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-primary animate-ping" />
              FETCHING_DATA
            </span>
            <span className="text-primary font-semibold tracking-wider">
              ...
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
