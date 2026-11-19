'use client';

import React, { useState, useEffect, useRef, useCallback, createContext, useContext } from 'react';
import { createPortal } from 'react-dom';
import Image from 'next/image';
import {
  ZoomIn,
  ZoomOut,
  RotateCcw,
  X,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Move,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export interface GalleryImage {
  url: string;
  alt: string;
  title: string;
  isCover?: boolean;
  hint?: string | null;
}

interface ProjectGalleryContextType {
  images: GalleryImage[];
  currentIndex: number;
  isOpen: boolean;
  openLightbox: (index: number) => void;
  closeLightbox: () => void;
  setCurrentIndex: (index: number) => void;
}

const ProjectGalleryContext = createContext<ProjectGalleryContextType | null>(null);

export function useProjectGallery() {
  const context = useContext(ProjectGalleryContext);
  if (!context) {
    throw new Error('useProjectGallery must be used within a ProjectGalleryProvider');
  }
  return context;
}

interface ProjectGalleryProviderProps {
  title: string;
  coverImage: string;
  coverHint?: string | null;
  screenshots?: string[];
  children: React.ReactNode;
}

export function ProjectGalleryProvider({
  title,
  coverImage,
  coverHint,
  screenshots = [],
  children,
}: ProjectGalleryProviderProps) {
  const images: GalleryImage[] = [
    {
      url: coverImage,
      alt: `${title} - Cover`,
      title: `${title} (Gambar Utama)`,
      isCover: true,
      hint: coverHint,
    },
    ...screenshots.map((url, i) => ({
      url,
      alt: `${title} - Screenshot ${i + 1}`,
      title: `${title} (Screenshot ${i + 1})`,
      isCover: false,
    })),
  ];

  const [isOpen, setIsOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  const openLightbox = useCallback((index: number) => {
    setCurrentIndex(Math.max(0, Math.min(index, images.length - 1)));
    setIsOpen(true);
  }, [images.length]);

  const closeLightbox = useCallback(() => {
    setIsOpen(false);
  }, []);

  return (
    <ProjectGalleryContext.Provider
      value={{
        images,
        currentIndex,
        isOpen,
        openLightbox,
        closeLightbox,
        setCurrentIndex,
      }}
    >
      {children}
      {isOpen && (
        <ProjectLightboxModal
          images={images}
          currentIndex={currentIndex}
          setCurrentIndex={setCurrentIndex}
          onClose={closeLightbox}
        />
      )}
    </ProjectGalleryContext.Provider>
  );
}

export function ProjectCoverImage({
  src,
  alt,
  hint,
  priority = true,
}: {
  src: string;
  alt: string;
  hint?: string | null;
  priority?: boolean;
}) {
  const { openLightbox } = useProjectGallery();

  return (
    <div
      role="button"
      tabIndex={0}
      aria-label="Perbesar gambar sampul proyek"
      onClick={() => openLightbox(0)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          openLightbox(0);
        }
      }}
      className="relative w-full aspect-video rounded-xl overflow-hidden shadow-2xl shadow-primary/10 border border-border/50 group cursor-zoom-in focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background"
    >
      <Image
        src={src}
        alt={alt}
        fill
        priority={priority}
        style={{ objectFit: 'cover' }}
        sizes="(max-width: 1024px) 100vw, 60vw"
        data-ai-hint={hint ?? undefined}
        className="transition-transform duration-500 ease-out group-hover:scale-105"
      />

      {/* Hover Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-between p-4">
        <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-black/80 backdrop-blur-md text-white text-xs font-medium border border-white/15 shadow-xl transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
          <ZoomIn className="w-3.5 h-3.5 text-primary" />
          Klik untuk memperbesar & zoom
        </span>
      </div>

      {/* Subtle corner badge visible on mobile or idle */}
      <div className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md text-white/90 border border-white/10 text-xs flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
        <ZoomIn className="w-3.5 h-3.5 text-primary" />
        <span className="hidden sm:inline">Zoom</span>
      </div>
    </div>
  );
}

export function ProjectScreenshotsGallery({
  title,
  screenshots,
}: {
  title: string;
  screenshots: string[];
}) {
  const { openLightbox } = useProjectGallery();

  if (!screenshots || screenshots.length === 0) return null;

  return (
    <div className="mb-12">
      <div className="flex flex-wrap items-center justify-between gap-2 mb-6">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          Screenshots
          <span className="text-sm font-normal text-muted-foreground">
            ({screenshots.length})
          </span>
        </h2>
        <span className="text-xs text-muted-foreground hidden sm:inline">
          Klik gambar untuk melihat & memperbesar
        </span>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {screenshots.map((url, i) => (
          <div
            key={i}
            role="button"
            tabIndex={0}
            aria-label={`Perbesar screenshot ${i + 1}`}
            onClick={() => openLightbox(i + 1)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                openLightbox(i + 1);
              }
            }}
            className="relative aspect-video rounded-lg overflow-hidden border border-border/50 shadow-md hover:shadow-xl hover:shadow-primary/10 transition-all duration-300 group cursor-zoom-in focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <Image
              src={url}
              alt={`${title} screenshot ${i + 1}`}
              fill
              style={{ objectFit: 'cover' }}
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              className="group-hover:scale-105 transition-transform duration-300"
            />
            {/* Number badge */}
            <div className="absolute top-2 left-2 px-2 py-0.5 rounded bg-black/70 backdrop-blur-md text-[11px] font-semibold text-white border border-white/10 z-10">
              #{i + 1}
            </div>
            {/* Hover overlay */}
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/80 backdrop-blur-md text-white text-xs font-medium border border-white/15 shadow-xl transform scale-90 group-hover:scale-100 transition-transform duration-300">
                <ZoomIn className="w-3.5 h-3.5 text-primary" />
                Perbesar
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

interface ProjectLightboxModalProps {
  images: GalleryImage[];
  currentIndex: number;
  setCurrentIndex: (index: number) => void;
  onClose: () => void;
}

function ProjectLightboxModal({
  images,
  currentIndex,
  setCurrentIndex,
  onClose,
}: ProjectLightboxModalProps) {
  const [mounted, setMounted] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);

  const dragStartRef = useRef<{ mouseX: number; mouseY: number; posX: number; posY: number }>({
    mouseX: 0,
    mouseY: 0,
    posX: 0,
    posY: 0,
  });

  const touchStateRef = useRef<{
    startDistance: number;
    startZoom: number;
    startX: number;
    startY: number;
    posX: number;
    posY: number;
    isPinching: boolean;
    isPanning: boolean;
  }>({
    startDistance: 0,
    startZoom: 1,
    startX: 0,
    startY: 0,
    posX: 0,
    posY: 0,
    isPinching: false,
    isPanning: false,
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  // Reset zoom & pan when image changes
  useEffect(() => {
    setZoom(1);
    setPosition({ x: 0, y: 0 });
  }, [currentIndex]);

  // Lock body scroll while open
  useEffect(() => {
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, []);

  const handleNext = useCallback(() => {
    if (images.length <= 1) return;
    setCurrentIndex((currentIndex + 1) % images.length);
  }, [currentIndex, images.length, setCurrentIndex]);

  const handlePrev = useCallback(() => {
    if (images.length <= 1) return;
    setCurrentIndex((currentIndex - 1 + images.length) % images.length);
  }, [currentIndex, images.length, setCurrentIndex]);

  const handleZoomIn = useCallback(() => {
    setZoom((prev) => Math.min(4, +(prev + 0.5).toFixed(2)));
  }, []);

  const handleZoomOut = useCallback(() => {
    setZoom((prev) => {
      const next = Math.max(1, +(prev - 0.5).toFixed(2));
      if (next === 1) setPosition({ x: 0, y: 0 });
      return next;
    });
  }, []);

  const handleResetZoom = useCallback(() => {
    setZoom(1);
    setPosition({ x: 0, y: 0 });
  }, []);

  // Keyboard navigation & zoom shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowRight') {
        handleNext();
      } else if (e.key === 'ArrowLeft') {
        handlePrev();
      } else if (e.key === '+' || e.key === '=') {
        handleZoomIn();
      } else if (e.key === '-' || e.key === '_') {
        handleZoomOut();
      } else if (e.key === '0' || e.key === 'r' || e.key === 'R') {
        handleResetZoom();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleNext, handlePrev, handleZoomIn, handleZoomOut, handleResetZoom, onClose]);

  // Mouse wheel zoom
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY < 0 ? 0.25 : -0.25;
    setZoom((prev) => {
      const next = Math.min(4, Math.max(1, +(prev + delta).toFixed(2)));
      if (next === 1) {
        setPosition({ x: 0, y: 0 });
      }
      return next;
    });
  };

  // Double click toggles zoom (1x <-> 2.5x)
  const handleDoubleClick = () => {
    if (zoom > 1) {
      handleResetZoom();
    } else {
      setZoom(2.5);
      setPosition({ x: 0, y: 0 });
    }
  };

  // Mouse drag handling
  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return;
    if (zoom <= 1) return;
    e.preventDefault();
    setIsDragging(true);
    dragStartRef.current = {
      mouseX: e.clientX,
      mouseY: e.clientY,
      posX: position.x,
      posY: position.y,
    };
  };

  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      const dx = e.clientX - dragStartRef.current.mouseX;
      const dy = e.clientY - dragStartRef.current.mouseY;
      setPosition({
        x: dragStartRef.current.posX + dx,
        y: dragStartRef.current.posY + dy,
      });
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging]);

  // Touch handling (pinch to zoom, pan, swipe to navigate)
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      const t1 = e.touches[0];
      const t2 = e.touches[1];
      const dist = Math.hypot(t1.clientX - t2.clientX, t1.clientY - t2.clientY);
      touchStateRef.current.startDistance = dist;
      touchStateRef.current.startZoom = zoom;
      touchStateRef.current.isPinching = true;
      touchStateRef.current.isPanning = false;
    } else if (e.touches.length === 1) {
      const t = e.touches[0];
      touchStateRef.current.startX = t.clientX;
      touchStateRef.current.startY = t.clientY;
      touchStateRef.current.posX = position.x;
      touchStateRef.current.posY = position.y;
      touchStateRef.current.isPanning = true;
      touchStateRef.current.isPinching = false;
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (touchStateRef.current.isPinching && e.touches.length === 2) {
      e.preventDefault();
      const t1 = e.touches[0];
      const t2 = e.touches[1];
      const dist = Math.hypot(t1.clientX - t2.clientX, t1.clientY - t2.clientY);
      const ratio = dist / (touchStateRef.current.startDistance || 1);
      const newZoom = Math.min(4, Math.max(1, +(touchStateRef.current.startZoom * ratio).toFixed(2)));
      setZoom(newZoom);
      if (newZoom === 1) setPosition({ x: 0, y: 0 });
    } else if (touchStateRef.current.isPanning && e.touches.length === 1) {
      if (zoom > 1) {
        e.preventDefault();
        const t = e.touches[0];
        const dx = t.clientX - touchStateRef.current.startX;
        const dy = t.clientY - touchStateRef.current.startY;
        setPosition({
          x: touchStateRef.current.posX + dx,
          y: touchStateRef.current.posY + dy,
        });
      }
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStateRef.current.isPanning && zoom === 1 && e.changedTouches.length === 1) {
      const t = e.changedTouches[0];
      const dx = t.clientX - touchStateRef.current.startX;
      if (Math.abs(dx) > 50) {
        if (dx < 0 && images.length > 1) {
          handleNext();
        } else if (dx > 0 && images.length > 1) {
          handlePrev();
        }
      }
    }
    touchStateRef.current.isPinching = false;
    touchStateRef.current.isPanning = false;
  };

  const currentImage = images[currentIndex];
  if (!currentImage || !mounted) return null;

  const content = (
    <div
      className="fixed inset-0 z-50 flex flex-col bg-black/95 backdrop-blur-md select-none animate-in fade-in-0 duration-200"
      onWheel={handleWheel}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Top Header Bar */}
      <header className="relative z-30 flex items-center justify-between px-4 py-3 border-b border-white/10 bg-black/40 backdrop-blur-md">
        {/* Left: Info */}
        <div className="flex items-center gap-3 min-w-0 pr-2">
          <div className="flex flex-col min-w-0">
            <span className="text-sm font-semibold text-white truncate max-w-[200px] sm:max-w-md">
              {currentImage.title}
            </span>
            {images.length > 1 && (
              <span className="text-xs text-white/60">
                {currentIndex + 1} dari {images.length}
              </span>
            )}
          </div>
        </div>

        {/* Center / Right: Zoom & Control Toolbar */}
        <div className="flex items-center gap-1 sm:gap-2">
          {/* Zoom Out */}
          <Button
            variant="ghost"
            size="icon"
            onClick={handleZoomOut}
            disabled={zoom <= 1}
            className="h-8 w-8 sm:h-9 sm:w-9 text-white/90 hover:text-white hover:bg-white/10 disabled:opacity-30"
            title="Perkecil (-)"
            aria-label="Perkecil"
          >
            <ZoomOut className="w-4 h-4 sm:w-5 sm:h-5" />
          </Button>

          {/* Zoom Percentage Badge */}
          <button
            onClick={handleResetZoom}
            className="px-2 py-1 text-xs font-mono font-medium rounded-md bg-white/10 hover:bg-white/20 text-white/90 transition-colors"
            title="Klik untuk reset zoom (100%)"
          >
            {Math.round(zoom * 100)}%
          </button>

          {/* Zoom In */}
          <Button
            variant="ghost"
            size="icon"
            onClick={handleZoomIn}
            disabled={zoom >= 4}
            className="h-8 w-8 sm:h-9 sm:w-9 text-white/90 hover:text-white hover:bg-white/10 disabled:opacity-30"
            title="Perbesar (+)"
            aria-label="Perbesar"
          >
            <ZoomIn className="w-4 h-4 sm:w-5 sm:h-5" />
          </Button>

          {/* Reset Zoom */}
          <Button
            variant="ghost"
            size="icon"
            onClick={handleResetZoom}
            disabled={zoom === 1 && position.x === 0 && position.y === 0}
            className="h-8 w-8 sm:h-9 sm:w-9 text-white/90 hover:text-white hover:bg-white/10 disabled:opacity-30"
            title="Reset Zoom (0)"
            aria-label="Reset zoom"
          >
            <RotateCcw className="w-4 h-4 sm:w-4 sm:h-4" />
          </Button>

          <div className="h-4 w-px bg-white/20 mx-1 hidden sm:block" />

          {/* Open full image in new tab */}
          <Button
            variant="ghost"
            size="icon"
            asChild
            className="h-8 w-8 sm:h-9 sm:w-9 text-white/90 hover:text-white hover:bg-white/10 hidden sm:inline-flex"
            title="Buka gambar asli di tab baru"
          >
            <a href={currentImage.url} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="w-4 h-4" />
            </a>
          </Button>

          {/* Close Button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="h-8 w-8 sm:h-9 sm:w-9 text-white hover:bg-red-500/20 hover:text-red-300 ml-1"
            title="Tutup (Esc)"
            aria-label="Tutup modal"
          >
            <X className="w-5 h-5 sm:w-6 sm:h-6" />
          </Button>
        </div>
      </header>

      {/* Main Image Viewport */}
      <div
        className="relative flex-1 overflow-hidden flex items-center justify-center p-2 sm:p-6"
        onClick={(e) => {
          // If clicking directly on the backdrop (not dragging and not zooming), close lightbox
          if (e.target === e.currentTarget && !isDragging) {
            onClose();
          }
        }}
      >
        {/* Navigation Arrows */}
        {images.length > 1 && (
          <>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handlePrev();
              }}
              className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 z-20 p-2 sm:p-3 rounded-full bg-black/60 hover:bg-black/85 text-white/90 hover:text-white border border-white/15 backdrop-blur-md shadow-xl transition-all hover:scale-110 active:scale-95 focus:outline-none focus:ring-2 focus:ring-primary"
              aria-label="Gambar sebelumnya"
              title="Sebelumnya (Panah Kiri)"
            >
              <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation();
                handleNext();
              }}
              className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 z-20 p-2 sm:p-3 rounded-full bg-black/60 hover:bg-black/85 text-white/90 hover:text-white border border-white/15 backdrop-blur-md shadow-xl transition-all hover:scale-110 active:scale-95 focus:outline-none focus:ring-2 focus:ring-primary"
              aria-label="Gambar berikutnya"
              title="Berikutnya (Panah Kanan)"
            >
              <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>
          </>
        )}

        {/* Zoomable Image Container */}
        <div
          className="relative max-w-full max-h-full flex items-center justify-center select-none"
          style={{
            transform: `translate3d(${position.x}px, ${position.y}px, 0px) scale(${zoom})`,
            transformOrigin: 'center center',
            transition: isDragging ? 'none' : 'transform 0.2s cubic-bezier(0.2, 0, 0, 1)',
            cursor: zoom > 1 ? (isDragging ? 'grabbing' : 'grab') : 'zoom-in',
          }}
          onMouseDown={handleMouseDown}
          onDoubleClick={handleDoubleClick}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={currentImage.url}
            alt={currentImage.alt}
            draggable={false}
            className="max-h-[68vh] md:max-h-[74vh] max-w-[90vw] object-contain rounded-lg shadow-2xl pointer-events-none select-none border border-white/10"
          />
        </div>
      </div>

      {/* Bottom Control & Thumbnail Bar */}
      <footer className="relative z-30 flex flex-col items-center gap-2 px-4 py-3 border-t border-white/10 bg-black/50 backdrop-blur-md">
        {/* Helper guide */}
        <div className="flex items-center gap-2 text-[11px] sm:text-xs text-white/60">
          <span className="hidden sm:inline-flex items-center gap-1">
            <Move className="w-3 h-3 text-primary" /> Drag gambar untuk menggeser saat di-zoom
          </span>
          <span className="hidden sm:inline">•</span>
          <span>Scroll mouse atau klik ganda untuk zoom</span>
          {images.length > 1 && (
            <>
              <span className="hidden md:inline">•</span>
              <span className="hidden md:inline">Gunakan tombol panah keyboard untuk berpindah</span>
            </>
          )}
        </div>

        {/* Thumbnails row (if multiple images) */}
        {images.length > 1 && (
          <div className="flex items-center gap-2 overflow-x-auto max-w-full pb-1 px-2 pt-1 scrollbar-thin">
            {images.map((img, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setCurrentIndex(idx);
                  setZoom(1);
                  setPosition({ x: 0, y: 0 });
                }}
                className={cn(
                  'relative flex-shrink-0 w-14 h-9 sm:w-16 sm:h-10 rounded-md overflow-hidden border-2 transition-all',
                  idx === currentIndex
                    ? 'border-primary ring-2 ring-primary/40 scale-105'
                    : 'border-white/20 opacity-60 hover:opacity-100 hover:border-white/50'
                )}
                title={img.title}
                aria-label={`Lihat ${img.title}`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={img.url}
                  alt={img.alt}
                  className="w-full h-full object-cover"
                />
                {img.isCover && (
                  <span className="absolute bottom-0 inset-x-0 bg-primary/90 text-[8px] text-white font-bold text-center leading-tight">
                    Cover
                  </span>
                )}
              </button>
            ))}
          </div>
        )}
      </footer>
    </div>
  );

  return createPortal(content, document.body);
}
