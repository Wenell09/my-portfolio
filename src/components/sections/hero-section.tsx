'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import profileData from '@/lib/profile-data.json';

export function HeroSection() {
  const { name, title, description, profileImageUrl, imageHint } = profileData;
  const [displayedTitle, setDisplayedTitle] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [loopNum, setLoopNum] = useState(0);
  const typingSpeed = 100;
  const deletingSpeed = 50;
  const delay = 2000;

  useEffect(() => {
    const handleTyping = () => {
      const i = loopNum % 1;
      const fullText = title;

      if (isDeleting) {
        setDisplayedTitle(fullText.substring(0, displayedTitle.length - 1));
      } else {
        setDisplayedTitle(fullText.substring(0, displayedTitle.length + 1));
      }

      if (!isDeleting && displayedTitle === fullText) {
        setTimeout(() => setIsDeleting(true), delay);
      } else if (isDeleting && displayedTitle === '') {
        setIsDeleting(false);
        setLoopNum(loopNum + 1);
      }
    };

    const ticker = setTimeout(() => {
      handleTyping();
    }, isDeleting ? deletingSpeed : typingSpeed);

    return () => clearTimeout(ticker);
  }, [displayedTitle, isDeleting, loopNum, title]);


  return (
    <section
      id="about"
      className="min-h-screen flex items-center justify-center py-24"
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center gap-8 md:gap-12">
          <div className="relative w-48 h-48 md:w-64 md:h-64 rounded-full overflow-hidden border-4 border-primary/50 shadow-lg flex-shrink-0">
            <Image
              src={profileImageUrl}
              alt={`Foto profil ${name}`}
              fill
              style={{ objectFit: 'cover' }}
              data-ai-hint={imageHint}
              priority
            />
          </div>
          <div className="text-center md:text-left">
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-foreground">
              {name}
            </h1>
            <p className="mt-2 text-xl md:text-2xl text-primary font-medium min-h-[1.2em]">
              <span>{displayedTitle}</span>
              <span className="animate-typing-blink typing-cursor">|</span>
            </p>
            <p className="mt-4 max-w-2xl text-lg text-muted-foreground">
              {description}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
