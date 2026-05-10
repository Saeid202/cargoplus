"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import type { HeroSlideData } from "@/types";

interface HeroSliderProps {
  slides: HeroSlideData[];
}

export function HeroSlider({ slides }: HeroSliderProps) {
  const [current, setCurrent] = useState(0);
  const [imgError, setImgError] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    setImgError(false);
  }, [current]);

  const next = useCallback(() => setCurrent((p) => (p + 1) % slides.length), [slides.length]);
  const prev = useCallback(() => setCurrent((p) => (p - 1 + slides.length) % slides.length), [slides.length]);

  useEffect(() => {
    if (slides.length <= 1) return;
    const t = setInterval(next, 5000);
    return () => clearInterval(t);
  }, [next, slides.length]);

  if (!slides.length) return null;
  const slide = slides[current];

  // Prevent hydration mismatch by rendering a stable structure
  return (
    <section data-testid="hero-slider" className="w-full">
      <div className="relative w-full overflow-hidden bg-gray-900 h-[300px] sm:h-[400px] md:h-[500px] lg:h-[calc(100vh-64px)]">
        {!imgError ? (
          <Image
            src={slide.imageUrl}
            alt={slide.title}
            fill
            className="object-cover"
            priority
            unoptimized
            sizes="100vw"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-white/40 text-sm">
            Image unavailable
          </div>
        )}

        {/* Navigation Controls */}
        {slides.length > 1 && mounted && (
          <>
            <button 
              onClick={prev} 
              aria-label="Previous slide" 
              className="absolute left-3 top-1/2 -translate-y-1/2 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-black/40 text-white hover:bg-black/60 transition-colors"
            >
              <ChevronLeft className="h-6 w-6" />
            </button>
            <button 
              onClick={next} 
              aria-label="Next slide" 
              className="absolute right-3 top-1/2 -translate-y-1/2 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-black/40 text-white hover:bg-black/60 transition-colors"
            >
              <ChevronRight className="h-6 w-6" />
            </button>
          </>
        )}

        {/* CTA Overlay */}
        {slide.ctaEnabled && slide.ctaText && slide.ctaLink && (
          <div className="absolute bottom-10 left-6 sm:bottom-12 sm:left-12 z-20">
            <Link href={slide.ctaLink}
              className="inline-flex items-center gap-2 px-6 py-3 sm:px-8 sm:py-4 rounded-xl text-sm sm:text-base font-bold text-white shadow-2xl transition-all hover:scale-105 active:scale-95"
              style={{ background: "linear-gradient(135deg,#4B1D8F,#3a1570)", boxShadow: "0 0 0 2px #D4AF37,0 8px 32px rgba(75,29,143,0.5)" }}>
              {slide.ctaText}
            </Link>
          </div>
        )}

        {/* Indicator Dots */}
        {slides.length > 1 && mounted && (
          <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-2 z-20">
            {slides.map((_, i) => (
              <button 
                key={i} 
                onClick={() => setCurrent(i)} 
                aria-label={`Go to slide ${i + 1}`}
                className={`h-2 rounded-full transition-all ${i === current ? "w-6 bg-white" : "w-2 bg-white/50 hover:bg-white/80"}`} 
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
