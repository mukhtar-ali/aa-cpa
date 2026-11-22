'use client';

import { useEffect, useState } from 'react';

interface WindowSize {
    width?: number;
    height?: number;
}

/**
 * Debounced window size — used by <Animations> to disable smooth-scroll below
 * the `lg` breakpoint. Deliberately minimal (no `dpr`, no external dependency)
 * since that's the only thing consuming it.
 */
export function useWindowSize(debounceDelay = 200): WindowSize {
    const [size, setSize] = useState<WindowSize>({});

    useEffect(() => {
        if (typeof window === 'undefined') return;

        let timeout: ReturnType<typeof setTimeout>;

        const update = () => {
            setSize({ width: window.innerWidth, height: window.innerHeight });
        };

        const onResize = () => {
            clearTimeout(timeout);
            timeout = setTimeout(update, debounceDelay);
        };

        update();
        window.addEventListener('resize', onResize);

        return () => {
            clearTimeout(timeout);
            window.removeEventListener('resize', onResize);
        };
    }, [debounceDelay]);

    return size;
}
