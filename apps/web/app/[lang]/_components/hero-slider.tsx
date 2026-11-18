'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { type HomeHeroSlideModelWeb } from '@repo/shared';

interface HeroSliderProps {
    slides: HomeHeroSlideModelWeb[];
    lang: string;
}

export function HeroSlider({ slides, lang }: HeroSliderProps) {
    const activeSlides = slides.filter((s) => s.isActive);
    const [index, setIndex] = useState(0);

    if (activeSlides.length === 0) return null;

    const slide = activeSlides[Math.min(index, activeSlides.length - 1)]!;

    return (
        <div className="relative overflow-hidden rounded-lg" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
            <div className="relative aspect-[16/9] w-full sm:aspect-[21/9]">
                {slide.mediaType === 'video' && slide.youtubeVideoId ? (
                    <iframe
                        className="absolute inset-0 h-full w-full"
                        src={`https://www.youtube.com/embed/${slide.youtubeVideoId}`}
                        title={slide.title || 'Hero video'}
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                    />
                ) : slide.image?.desktop ? (
                    <Image
                        src={slide.image.desktop}
                        alt={slide.title || ''}
                        fill
                        className="object-cover"
                        priority
                    />
                ) : null}

                <div className="absolute inset-0 flex flex-col items-start justify-end gap-3 bg-gradient-to-t from-black/60 via-black/10 to-transparent p-6 sm:p-10">
                    {slide.title && <h1 className="text-2xl font-bold text-white sm:text-4xl">{slide.title}</h1>}
                    {slide.subtitle && <p className="max-w-xl text-white/80">{slide.subtitle}</p>}
                    {slide.ctaText && slide.ctaLink && (
                        <Link
                            href={slide.ctaLink}
                            className="rounded-md bg-white px-4 py-2 text-sm font-medium text-black transition-opacity hover:opacity-90"
                        >
                            {slide.ctaText}
                        </Link>
                    )}
                </div>
            </div>

            {activeSlides.length > 1 && (
                <>
                    <button
                        type="button"
                        aria-label="Previous slide"
                        onClick={() => setIndex((i) => (i - 1 + activeSlides.length) % activeSlides.length)}
                        className="absolute top-1/2 start-3 -translate-y-1/2 rounded-full border border-white/40 bg-black/30 p-2 text-white backdrop-blur transition-colors hover:bg-black/50"
                    >
                        {lang === 'ar' ? '→' : '←'}
                    </button>
                    <button
                        type="button"
                        aria-label="Next slide"
                        onClick={() => setIndex((i) => (i + 1) % activeSlides.length)}
                        className="absolute top-1/2 end-3 -translate-y-1/2 rounded-full border border-white/40 bg-black/30 p-2 text-white backdrop-blur transition-colors hover:bg-black/50"
                    >
                        {lang === 'ar' ? '←' : '→'}
                    </button>
                    <div className="absolute bottom-3 start-1/2 flex -translate-x-1/2 gap-2">
                        {activeSlides.map((s, i) => (
                            <button
                                key={s.id}
                                type="button"
                                aria-label={`Go to slide ${i + 1}`}
                                onClick={() => setIndex(i)}
                                className={`h-2 w-2 rounded-full transition-colors ${i === index ? 'bg-white' : 'bg-white/40'}`}
                            />
                        ))}
                    </div>
                </>
            )}
        </div>
    );
}
