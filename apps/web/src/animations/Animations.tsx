'use client';

import { usePathname } from 'next/navigation';
import React, { FC, useEffect, useMemo, useRef, useState } from 'react';
import { AnimationType } from './animation';
import { getGSAP } from './gsap';
import { useTransitionStore } from '../store/useTransitionStore';
import { useAppReady } from './hooks/useAppReady';
import { useWindowSize } from '../hooks/useWindowSize';

export type AnimationFn = () => void | (() => void);

interface Props {
    children: React.ReactNode;
    animations: AnimationType[];
}

const resolveAnimation = async (type: AnimationType): Promise<AnimationFn | null> => {
    switch (type) {
        case AnimationType.SmoothScroll: {
            const mod = await import('./common/smoothScrollAnimation');
            return mod.smoothScrollAnimation;
        }
        case AnimationType.Header: {
            const mod = await import('./pages/headerAnimation');
            return mod.headerAnimation;
        }
        case AnimationType.Footer: {
            const mod = await import('./pages/footerAnimation');
            return mod.footerAnimation;
        }
        case AnimationType.FadeUp: {
            const mod = await import('./common/fadeUpAnimation');
            return mod.fadeUpAnimation;
        }
        case AnimationType.FadeIn: {
            const mod = await import('./common/fadeInAnimation');
            return mod.fadeInAnimation;
        }
        case AnimationType.Line: {
            const mod = await import('./common/lineAnimation');
            return mod.lineAnimation;
        }
        case AnimationType.Counter: {
            const mod = await import('./common/counterAnimation');
            return mod.counterAnimation;
        }
        case AnimationType.Word: {
            const mod = await import('./common/wordAnimation');
            return mod.wordAnimation;
        }
        case AnimationType.Word2: {
            const mod = await import('./common/wordAnimation');
            return mod.word2Animation;
        }
        case AnimationType.Word3: {
            const mod = await import('./common/wordAnimation');
            return mod.word3Animation;
        }
        case AnimationType.WordRandom: {
            const mod = await import('./common/wordAnimation');
            return mod.wordRandomAnimation;
        }
        case AnimationType.Image: {
            const mod = await import('./common/imageAnimation');
            return mod.imageAnimation;
        }
        case AnimationType.HomePage: {
            const mod = await import('./pages/homePageAnimation');
            return mod.homePageAnimation;
        }
        default:
            return null;
    }
};

export const Animations: FC<Props> = ({ children, animations = [] }) => {
    const { useGSAP, ScrollTrigger } = getGSAP();
    const animationContainerRef = useRef<HTMLDivElement>(null);
    const pathname = usePathname();
    const windowSize = useWindowSize();
    const width = windowSize.width ?? 0;
    const { isAppReady } = useAppReady();
    const pageLoaderDone = useTransitionStore((s) => s.pageLoaderDone);
    const filteredAnimations = useMemo(() => {
        if (width > 0 && width < 1024) {
            return animations.filter((animation) => animation !== AnimationType.SmoothScroll);
        }

        return animations;
    }, [animations, width]);

    const filteredAnimationsKey = filteredAnimations.join('|');
    const [animationFns, setAnimationFns] = useState<AnimationFn[]>([]);

    useEffect(() => {
        let cancelled = false;

        const loadAnimations = async () => {
            const resolved = await Promise.all(filteredAnimations.map((type) => resolveAnimation(type)));

            if (cancelled) return;

            setAnimationFns(resolved.filter((fn): fn is AnimationFn => Boolean(fn)));
        };

        void loadAnimations();

        return () => {
            cancelled = true;
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [filteredAnimationsKey]);

    useGSAP(
        () => {
            if (!isAppReady) return;
            let refreshTimer: number | null = null;

            const cleanups: Array<() => void> = [];

            const scheduleRefresh = () => {
                if (refreshTimer) {
                    window.clearTimeout(refreshTimer);
                }

                refreshTimer = window.setTimeout(() => {
                    requestAnimationFrame(() => {
                        requestAnimationFrame(() => {
                            ScrollTrigger.refresh();
                        });
                    });
                }, 200);
            };

            const handleLoad = () => scheduleRefresh();
            window.addEventListener('load', handleLoad);

            const resizeObserver = new ResizeObserver(() => {
                scheduleRefresh();
            });

            resizeObserver.observe(document.body);

            for (const runAnimation of animationFns) {
                const cleanup = runAnimation();

                if (typeof cleanup === 'function') {
                    cleanups.push(cleanup);
                }
            }

            scheduleRefresh();

            return () => {
                if (refreshTimer) {
                    window.clearTimeout(refreshTimer);
                }

                window.removeEventListener('load', handleLoad);
                resizeObserver.disconnect();

                for (const cleanup of [...cleanups].reverse()) {
                    cleanup();
                }
            };
        },
        {
            scope: animationContainerRef,
            dependencies: [pathname, width, filteredAnimationsKey, animationFns, isAppReady, pageLoaderDone],
            revertOnUpdate: true,
        },
    );

    return (
        <div ref={animationContainerRef} className="animations-container">
            {children}
        </div>
    );
};
