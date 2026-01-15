'use client';

export function GridBackground() {
  return (
    <div className="absolute inset-0 z-0 h-full w-full overflow-hidden">
      <div className="absolute inset-[-100%] z-10 size-[200%] animate-move-bg bg-[length:64px_64px] bg-repeat [background-image:linear-gradient(to_right,hsl(var(--border)_/_0.5)_1px,transparent_1px),linear-gradient(to_bottom,hsl(var(--border)_/_0.5)_1px,transparent_1px)]"></div>
      <div className="absolute inset-0 z-20 animate-wave bg-[radial-gradient(circle_at_center,hsl(var(--primary)/0.05),transparent_40%)]"></div>
      <div
        className="absolute inset-0 z-30"
        style={{
          backgroundImage:
            'radial-gradient(circle at center, transparent, hsl(var(--background)))',
        }}
      ></div>
    </div>
  );
}
