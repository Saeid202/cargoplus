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

  useEffect(() => {
    setImgError(false);
  }, [current]);

  const next = useCallback(() => {
    setCurrent((prev) => (prev + 1) % slides.length);
  }, [slides.length]);

  const prev = useCallback(() => {
    setCurrent((prev) => (prev - 1 + slides.length) % slides.length);
  }, [slides.length]);

  useEffect(() => {
    if (slides.length <= 1) return;
    const timer = setInterval(next, 5000);
    return () => clearInterval(timer);
  }, [next, slides.length]);

  if (!slides.length) return null;

  const slide = slides[current];

  return (
    <section data-testid="hero-slider" className="w-full">
      <div
        className="relative w-full overflow-hidden bg-gray-900"
        style={{ height: "calc(100vh - 64px)" }}
      >
        {/* Slide image */}
        {!imgError ? (
          <Image
            src={slide.imageUrl}
            alt={slide.title}
            fill
            className="object-cover"
            priority
            unoptimized
            sizes="(max-width: 768px) 100vw, 1200px"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-white/40 text-sm">
            Image unavailable
          </div>
        )}

        {/* Prev / Next */}
        {slides.length > 1 && (
          <>
            <button
              onClick={prev}
              aria-label="Previous slide"
              className="absolute left-3 top-1/2 -translate-y-1/2 flex h-9 w-9 items-center justify-center rounded-full bg-black/40 text-white hover:bg-black/60 transition-colors"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              onClick={next}
              aria-label="Next slide"
              className="absolute right-3 top-1/2 -translate-y-1/2 flex h-9 w-9 items-center justify-center rounded-full bg-black/40 text-white hover:bg-black/60 transition-colors"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </>
        )}

        {/* CTA button overlay */}
        {slide.ctaEnabled && slide.ctaText && slide.ctaLink && (
          <div className="absolute bottom-12 left-1/2 -translate-x-1/2 sm:left-12 sm:translate-x-0">
            <Link
              href={slide.ctaLink}
              className="inline-flex items-center gap-2 px-8 py-4 rounded-xl text-base font-bold text-white shadow-2xl transition-all hover:scale-105 active:scale-95"
              style={{
                background: "linear-gradient(135deg, #4B1D8F 0%, #3a1570 100%)",
                boxShadow: "0 0 0 2px #D4AF37, 0 8px 32px rgba(75,29,143,0.5)",
              }}
            >
              {slide.ctaText}
            </Link>
          </div>
        )}

        {/* Dot indicators */}
        {slides.length > 1 && (
          <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-2">
            {slides.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrent(i)}
                aria-label={`Go to slide ${i + 1}`}
                className={`h-2 rounded-full transition-all ${
                  i === current ? "w-5 bg-white" : "w-2 bg-white/50"
                }`}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
