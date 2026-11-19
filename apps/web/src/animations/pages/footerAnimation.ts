import { AnimationFn } from '../Animations';
import { getGSAP } from '../gsap';

export const footerAnimation: AnimationFn = () => {
    const { gsap, SplitText } = getGSAP();
    const footer = document.getElementById('main-footer-id');
    if (!footer) return;

    const desc = footer.querySelector<HTMLElement>('.footer-desc');

    const items = gsap.utils.toArray<HTMLElement>(
        [
            '#main-footer-id h3',
            '#main-footer-id li',
            '#main-footer-id .social-item',
            '#main-footer-id .border-t p',
            '#main-footer-id .border-t a',
        ].join(','),
    );

    const tl = gsap.timeline({
        scrollTrigger: {
            trigger: footer,
            start: 'top 80%',
            toggleActions: 'play none none none',
        },
    });

    // Pass the element itself (and skip it when absent) so GSAP never warns "target not found" for a footer
    // variant or a mid-navigation render that has no logo.
    const logo = footer.querySelector<HTMLElement>('.logo');
    if (logo) {
        tl.from(logo, {
            autoAlpha: 0,
            duration: 0.7,
            ease: 'power3.out',
        });
    }

    // `.footer-desc` doesn't exist on every footer variant — guard it rather than
    // let SplitText.create throw on a null target.
    if (desc) {
        const splitLines = SplitText.create(desc, { type: 'lines' });
        tl.from(
            splitLines.lines,
            {
                autoAlpha: 0,
                yPercent: 100,
                stagger: {
                    each: 0.08,
                    ease: 'power1.inOut',
                },
                duration: 1,
                ease: 'power4.out',
            },
            '<',
        );
    }

    if (items.length > 0) {
        tl.from(
            items,
            {
                autoAlpha: 0,
                stagger: 0.1,
                ease: 'power3.out',
                duration: 0.7,
            },
            '-=0.4',
        );
    }
};
