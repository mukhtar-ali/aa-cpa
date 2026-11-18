import { AnimationFn } from '../Animations';

// Smooth-scroll (Lenis) is intentionally a no-op for now — same as upstream ramy, which
// ships this hook point but has the actual Lenis wiring commented out. Wire a smooth-scroll
// library here later if the design calls for it; AnimationType.SmoothScroll is already
// threaded through <Animations> and disabled below `lg` width.
export const smoothScrollAnimation: AnimationFn = () => {
    if (typeof window === 'undefined') return;
};
