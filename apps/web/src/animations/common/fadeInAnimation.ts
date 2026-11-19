import { AnimateType } from '../animation';
import { AnimationFn } from '../Animations';
import { getGSAP } from '../gsap';

const { gsap } = getGSAP();
export const fadeInAnimation: AnimationFn = () => {
    const elements = gsap.utils.toArray<HTMLElement>(`.${AnimateType.FadeIn}`);

    elements.forEach((el) => {
        gsap.from(el, {
            autoAlpha: 0,
            duration: 1,
            ease: 'power2.out',
            scrollTrigger: {
                trigger: el,
                start: 'top 90%',
                toggleActions: 'restart none none reset',
            },
        });
    });
};
