'use client';

import { useRef } from 'react';
import { getGSAP } from './gsap';

interface Props {
    onComplete: () => void;
}

const { useGSAP, gsap } = getGSAP();

export const Preloader: React.FC<Props> = ({ onComplete }) => {
    const preloaderRef = useRef<HTMLDivElement>(null);
    const innerRef = useRef<HTMLDivElement>(null);

    useGSAP(
        () => {
            const prevOverflow = document.body.style.overflow;
            document.body.style.overflow = 'hidden';

            const runExit = () => {
                document.body.style.overflow = prevOverflow;

                gsap
                    .timeline({ defaults: { ease: 'power4.inOut' } })
                    .to(innerRef.current, {
                        y: -20,
                        autoAlpha: 0,
                        duration: 0.35,
                        ease: 'power2.in',
                    })
                    .to('.preloader__panel--left', { xPercent: -100, duration: 0.9 }, '<')
                    .to('.preloader__panel--right', { xPercent: 100, duration: 0.9 }, '<')
                    .set(preloaderRef.current, { autoAlpha: 0, pointerEvents: 'none' })
                    .call(onComplete);
            };

            const t = window.setTimeout(runExit, 600);

            return () => {
                window.clearTimeout(t);
                document.body.style.overflow = prevOverflow;
            };
        },
        { scope: preloaderRef },
    );

    return (
        <div ref={preloaderRef} className="preloader">
            <div className="preloader__panel preloader__panel--left" />
            <div className="preloader__panel preloader__panel--right" />

            <div ref={innerRef} className="preloader__inner">
                <span className="text-lg font-bold tracking-tight">Starter</span>
            </div>
        </div>
    );
};
