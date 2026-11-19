import { AnimateType } from '../animation';
import { AnimationFn } from '../Animations';
import { getGSAP } from '../gsap';

const { gsap, SplitText } = getGSAP();
export const lineAnimation: AnimationFn = () => {
    const elements = gsap.utils.toArray<HTMLElement>(`.${AnimateType.Line}`);

    elements.forEach((el) => {
        const split = SplitText.create(el, {
            type: 'lines',
            mask: 'lines',
            autoSplit: true,
        });

        gsap.from(split.lines, {
            autoAlpha: 0,
            yPercent: 100,
            stagger: {
                each: 0.08,
                ease: 'power1.inOut',
            },
            duration: 1,
            ease: 'power4.out',

            scrollTrigger: {
                trigger: el,
                start: 'top 90%',
                toggleActions: 'restart none none reset',
            },
        });
    });
};
