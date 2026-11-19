import { AnimateType } from '../animation';
import { AnimationFn } from '../Animations';
import { getGSAP } from '../gsap';

const { gsap } = getGSAP();

export const imageAnimation: AnimationFn = () => {
    const elements = gsap.utils.toArray<HTMLElement>(`.${AnimateType.Image}`);

    elements.forEach((el) => {
        const img = el.querySelector('img') as HTMLImageElement | null;
        if (!img) return;

        gsap.set(el, { autoAlpha: 1, willChange: 'transform' });
        gsap.set(img, { willChange: 'transform' });

        const tl = gsap.timeline({
            scrollTrigger: {
                trigger: el,
                start: 'top 85%',
            },
            defaults: { ease: 'power3.out', duration: 1.3 },
        });
        tl.from(el, { xPercent: -100 })
            .from(img, { xPercent: 100, scale: 1.25 }, 0)
            .to(img, { duration: 0.6 }, 0.3);
    });
};
