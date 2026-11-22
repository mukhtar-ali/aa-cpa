import { breakpoints } from '@repo/ui';
import { AnimationFn } from '../Animations';
import { getGSAP } from '../gsap';

const { gsap, SplitText } = getGSAP();

// Targets #home-about-section-id / #home-about-left-id / #home-about-right-id — the
// structured "About" section from ramy's HomeAbout.tsx, which hasn't been ported yet (see
// REMAINING_ISSUES.md). Safely no-ops until that markup exists.
export const homePageAnimation: AnimationFn = () => {
    const aboutSection = document.getElementById('home-about-section-id');
    const mm = gsap.matchMedia();

    if (aboutSection) {
        const q = gsap.utils.selector(aboutSection);

        const aboutLeft = q('#home-about-left-id');
        const aboutRight = q('#home-about-right-id');
        const titleEl = q('#home-about-left-id h2');
        const descEl = q('#home-about-left-id p');
        const link = q('#home-about-left-id .download-link-wrapper');

        const titleSplit = SplitText.create(titleEl, { type: 'words' });
        const descSplit = SplitText.create(descEl, { type: 'words' });

        mm.add(
            {
                desktop: breakpoints.min.lg,
                mobile: breakpoints.max.lg,
            },
            (ctx: gsap.Context) => {
                const { desktop } = ctx.conditions as { desktop: boolean };
                if (desktop) {
                    gsap.timeline({
                        scrollTrigger: {
                            trigger: aboutLeft,
                            start: 'center center',
                            endTrigger: aboutRight,
                            end: 'bottom bottom',
                            scrub: true,
                        },
                    })
                        .from(titleSplit.words, {
                            opacity: 0,
                            stagger: 0.05,
                            duration: 0.5,
                        })
                        .from(descSplit.words, { opacity: 0, stagger: 0.03, duration: 0.5 }, '-=0.2')
                        .from(link, { y: 50, opacity: 0, duration: 1 }, '-=0.5');
                }
            },
        );
    }
};
