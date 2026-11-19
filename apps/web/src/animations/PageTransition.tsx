'use client';

import { usePathname, useRouter } from 'next/navigation';
import React, { useRef, useState } from 'react';
import { getTransitionLinkDecision } from '../utilities/shouldIgnoreTransitionLink';
import { getGSAP } from './gsap';

export default function PageTransition({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const pathname = usePathname();

    const leftPanelRef = useRef<HTMLDivElement | null>(null);
    const rightPanelRef = useRef<HTMLDivElement | null>(null);

    const isTransitioning = useRef(false);
    const isFirstLoad = useRef(true);

    const [showLogo, setShowLogo] = useState(false);

    const { gsap, useGSAP, ScrollTrigger } = getGSAP();

    const setOpen = () => {
        const left = leftPanelRef.current;
        const right = rightPanelRef.current;
        if (!left || !right) return;

        gsap.set(left, { xPercent: -100, willChange: 'transform' });
        gsap.set(right, { xPercent: 100, willChange: 'transform' });
    };
    const scheduleRefresh = () => {
        window.setTimeout(() => {
            requestAnimationFrame(() => {
                requestAnimationFrame(() => {
                    ScrollTrigger.refresh();
                });
            });
        }, 200);
    };
    const playEntry = () => {
        document.body.style.overflow = '';
        const left = leftPanelRef.current;
        const right = rightPanelRef.current;
        if (!left || !right) return;

        if (isFirstLoad.current) {
            setOpen();
            gsap.set('.page-content', { opacity: 1 });
            setShowLogo(false);
            isFirstLoad.current = false;
            isTransitioning.current = false;
            return;
        }

        const tl = gsap.timeline({
            defaults: { ease: 'expo.inOut' },
            onComplete: () => {
                isTransitioning.current = false;
            },
        });

        tl.set(left, { xPercent: 0 });
        tl.set(right, { xPercent: 0 });

        tl.set('.page-content', { opacity: 0 });

        tl.call(() => setShowLogo(false), [], 0);

        tl.to(left, { xPercent: -100, duration: 0.6 }, 0.08);
        tl.to(right, { xPercent: 100, duration: 0.6 }, 0.08);

        tl.to(
            '.page-content',
            {
                opacity: 1,
                duration: 0.25,
                ease: 'power2.out',
                clearProps: 'opacity',
            },
            0.12,
        );

        return tl;
    };

    const playExitAndGo = (nextUrl: string) => {
        document.body.style.overflow = 'hidden';

        const left = leftPanelRef.current;
        const right = rightPanelRef.current;

        if (!left || !right) {
            router.push(nextUrl);
            return;
        }

        const tl = gsap.timeline({
            defaults: { ease: 'power2.inOut' },
            onComplete: () => {
                router.push(nextUrl);
            },
        });

        tl.set(left, { xPercent: -100 });
        tl.set(right, { xPercent: 100 });

        tl.to(left, { xPercent: 0, duration: 0.6 }, 0);
        tl.to(right, { xPercent: 0, duration: 0.6 }, 0);

        tl.to('.page-content', { opacity: 0, duration: 0.15, overwrite: true }, 0.5);

        tl.call(() => setShowLogo(true), [], 0.55);
        ScrollTrigger.refresh();
        return tl;
    };

    useGSAP(
        () => {
            playEntry();

            const onClickCapture = (e: MouseEvent) => {
                const target = e.target as HTMLElement | null;
                const a = target?.closest('a') as HTMLAnchorElement | null;
                if (!a) return;

                if (e.defaultPrevented) return;
                if (e.button !== 0) return;
                if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
                if (isTransitioning.current) return;

                const decision = getTransitionLinkDecision(a);

                if (decision === 'ignore') return;

                if (decision === 'prevent') {
                    e.preventDefault();
                    e.stopPropagation();
                    e.stopImmediatePropagation();
                    return;
                }

                const urlObj = new URL(a.href, window.location.href);
                const nextHref = urlObj.pathname + urlObj.search + urlObj.hash;

                e.preventDefault();
                e.stopPropagation();
                e.stopImmediatePropagation();

                isTransitioning.current = true;
                playExitAndGo(nextHref);
                scheduleRefresh();
            };
            document.addEventListener('click', onClickCapture, true);

            return () => {
                document.removeEventListener('click', onClickCapture, true);
            };
        },
        { dependencies: [pathname], revertOnUpdate: false },
    );

    return (
        <>
            {/* The panels slide in from off-screen. Left in the document flow, the off-screen one made the whole page
                scroll sideways (563px on a 375px phone) and, being absolute, covered only the top of the page. A fixed,
                clipped overlay fixes both. */}
            <div className="pointer-events-none fixed inset-0 z-[9998] overflow-hidden">
                <div ref={leftPanelRef} className="preloader__panel preloader__panel--left pointer-events-none" />
                <div ref={rightPanelRef} className="preloader__panel preloader__panel--right pointer-events-none" />
            </div>

            <div
                className={[
                    'fixed inset-0 z-10000 flex items-center justify-center pointer-events-none',
                    'transition-opacity duration-300 ease-out',
                    showLogo ? 'opacity-100' : 'opacity-0',
                ].join(' ')}
            >
                <div className="preloader__inner">
                    <span className="text-lg font-bold tracking-tight">Starter</span>
                </div>
            </div>

            <div className="page-content">{children}</div>
        </>
    );
}
