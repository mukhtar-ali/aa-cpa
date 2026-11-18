'use client';

import { useEffect, useRef, useState } from 'react';
import { useTransitionStore } from '../store/useTransitionStore';
import { Preloader } from './Preloader';
import { getGSAP } from './gsap';

const { useGSAP, gsap } = getGSAP();

interface Props {
    children: React.ReactNode;
}

export const PreloaderWrapper: React.FC<Props> = ({ children }) => {
    const [loading, setLoading] = useState(true);
    const setPageLoaderDone = useTransitionStore((s) => s.setPageLoaderDone);

    const wrapperRef = useRef<HTMLDivElement>(null);
    const contentRef = useRef<HTMLDivElement>(null);

    const handleComplete = () => {
        setLoading(false);
        setPageLoaderDone(true);
    };

    useGSAP(
        () => {
            if (loading) return;

            gsap.set(contentRef.current, {
                autoAlpha: 1,
                clearProps: 'opacity,visibility',
            });
        },
        { scope: wrapperRef, dependencies: [loading], revertOnUpdate: true },
    );

    useEffect(() => {
        setPageLoaderDone(false);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <div ref={wrapperRef}>
            <div ref={contentRef} style={{ pointerEvents: loading ? 'none' : 'auto' }}>
                {children}
            </div>

            {loading && <Preloader onComplete={handleComplete} />}
        </div>
    );
};
