import { AnimateType } from '../animation';
import { AnimationFn } from '../Animations';
import { getGSAP } from '../gsap';

const { gsap } = getGSAP();
export const fadeUpAnimation: AnimationFn = () => {
    const elements = gsap.utils.toArray<HTMLElement>(`.${AnimateType.FadeUp}`);

    elements.forEach((el) => {
        gsap.from(el, {
            y: 50,
            autoAlpha: 0,
            duration: 0.8,
            ease: 'power3.out',
            scrollTrigger: {
                trigger: el,
                start: 'top 90%',
                toggleActions: 'restart none none reset',
            },
        });
    });
};
