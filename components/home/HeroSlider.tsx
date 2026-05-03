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
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    function check() { setIsMobile(window.innerWidth < 640); }
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  useEffect(() => { setImgError(false); }, [current]);

  const next = useCallback(() => setCurrent((p) => (p + 1) % slides.length), [slides.length]);
  const prev = useCallback(() => setCurrent((p) => (p - 1 + slides.length) % slides.length), [slides.length]);

  useEffect(() => {
    if (slides.length <= 1) return;
    const t = setInterval(next, 5000);
    return () => clearInterval(t);
  }, [next, slides.length]);

  if (!slides.length) return null;
  const slide = slides[current];

  return (
    <section data-testid="hero-slider" className="w-full">
      {isMobile ? (
        /* ── Mobile: natural image height, full width ── */
        <div className="relative w-full bg-gray-900">
          {!imgError ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={slide.imageUrl}
              alt={slide.title}
              className="w-full h-auto block"
              onError={() => setImgError(true)}
            />
          ) : (
            <div className="flex items-center justify-center h-48 text-white/40 text-sm">
              Image unavailable
            </div>
          )}

          {/* Overlays */}
          <div className="absolute inset-0 pointer-events-none">
            {/* Prev / Next */}
            {slides.length > 1 && (
              <>
                <button onClick={prev} aria-label="Previous slide" className="pointer-events-auto absolute left-3 top-1/2 -translate-y-1/2 flex h-9 w-9 items-center justify-center rounded-full bg-black/40 text-white">
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <button onClick={next} aria-label="Next slide" className="pointer-events-auto absolute right-3 top-1/2 -translate-y-1/2 flex h-9 w-9 items-center justify-center rounded-full bg-black/40 text-white">
                  <ChevronRight className="h-5 w-5" />
                </button>
              </>
            )}

            {/* CTA */}
            {slide.ctaEnabled && slide.ctaText && slide.ctaLink && (
              <div className="pointer-events-auto absolute bottom-8 left-1/2 -translate-x-1/2">
                <Link href={slide.ctaLink}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold text-white"
                  style={{ background: "linear-gradient(135deg,#4B1D8F,#3a1570)", boxShadow: "0 0 0 2px #D4AF37,0 8px 24px rgba(75,29,143,0.5)" }}>
                  {slide.ctaText}
                </Link>
              </div>
            )}

            {/* Dots */}
            {slides.length > 1 && (
              <div className="pointer-events-auto absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-2">
                {slides.map((_, i) => (
                  <button key={i} onClick={() => setCurrent(i)} aria-label={`Slide ${i + 1}`}
                    className={`h-2 rounded-full transition-all ${i === current ? "w-5 bg-white" : "w-2 bg-white/50"}`} />
                ))}
              </div>
            )}
          </div>
        </div>
      ) : (
        /* ── Desktop: full viewport height, object-cover ── */
        <div className="relative w-full overflow-hidden bg-gray-900" style={{ height: "calc(100vh - 64px)" }}>
          {!imgError ? (
            <Image src={slide.imageUrl} alt={slide.title} fill className="object-cover" priority unoptimized
              sizes="100vw" onError={() => setImgError(true)} />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center text-white/40 text-sm">
              Image unavailable
            </div>
          )}

          {slides.length > 1 && (
            <>
              <button onClick={prev} aria-label="Previous slide" className="absolute left-3 top-1/2 -translate-y-1/2 flex h-9 w-9 items-center justify-center rounded-full bg-black/40 text-white hover:bg-black/60 transition-colors">
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button onClick={next} aria-label="Next slide" className="absolute right-3 top-1/2 -translate-y-1/2 flex h-9 w-9 items-center justify-center rounded-full bg-black/40 text-white hover:bg-black/60 transition-colors">
                <ChevronRight className="h-5 w-5" />
              </button>
            </>
          )}

          {slide.ctaEnabled && slide.ctaText && slide.ctaLink && (
            <div className="absolute bottom-12 left-12">
              <Link href={slide.ctaLink}
                className="inline-flex items-center gap-2 px-8 py-4 rounded-xl text-base font-bold text-white shadow-2xl transition-all hover:scale-105 active:scale-95"
                style={{ background: "linear-gradient(135deg,#4B1D8F,#3a1570)", boxShadow: "0 0 0 2px #D4AF37,0 8px 32px rgba(75,29,143,0.5)" }}>
                {slide.ctaText}
              </Link>
            </div>
          )}

          {slides.length > 1 && (
            <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-2">
              {slides.map((_, i) => (
                <button key={i} onClick={() => setCurrent(i)} aria-label={`Slide ${i + 1}`}
                  className={`h-2 rounded-full transition-all ${i === current ? "w-5 bg-white" : "w-2 bg-white/50"}`} />
              ))}
            </div>
          )}
        </div>
      )}
    </section>
  );
}
