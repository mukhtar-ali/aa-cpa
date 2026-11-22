'use client';

import { useEffect, useState } from 'react';

export function useAppReady() {
    const [isAppReady, setIsAppReady] = useState(false);

    useEffect(() => {
        let isMounted = true;

        const checkFont = async () => {
            try {
                await document.fonts.ready;

                if (isMounted) setIsAppReady(true);
            } catch (err) {
                console.error('Error loading font:', err);
                if (isMounted) setIsAppReady(true);
            }
        };

        checkFont();
        return () => {
            isMounted = false;
        };
    }, []);

    return { isAppReady };
}
