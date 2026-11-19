import { AnimateType } from '../animation';
import { AnimationFn } from '../Animations';
import { getGSAP } from '../gsap';

const { gsap, SplitText } = getGSAP();
export const wordAnimation: AnimationFn = () => {
    const elements = gsap.utils.toArray<HTMLElement>(`.${AnimateType.Word}`);

    elements.forEach((el) => {
        const split = SplitText.create(el, {
            type: 'words',
        });

        gsap.from(split.words, {
            autoAlpha: 0,
            yPercent: 100,
            stagger: {
                each: 0.05,
                from: 'random',
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

export const word2Animation: AnimationFn = () => {
    const elements = gsap.utils.toArray<HTMLElement>(`.${AnimateType.Word2}`);

    elements.forEach((el) => {
        const split = SplitText.create(el, {
            type: 'words',
        });

        gsap.from(split.words, {
            y: 20,
            autoAlpha: 0,
            stagger: 0.05,
            duration: 1,
            scrollTrigger: {
                trigger: el,
                start: 'top 90%',
                toggleActions: 'restart none none reset',
            },
        });
    });
};

export const word3Animation: AnimationFn = () => {
    const elements = gsap.utils.toArray<HTMLElement>(`.${AnimateType.Word3}`);
    elements.forEach((el) => {
        const split = SplitText.create(el, {
            type: 'words',
        });

        gsap.from(split.words, {
            autoAlpha: 0,
            x: 10,
            stagger: 0.1,
            duration: 1,
            ease: 'power2.out',
            scrollTrigger: {
                trigger: el,
                start: 'top 85%',
                toggleActions: 'play none none reset',
            },
        });
    });
};

export const wordRandomAnimation: AnimationFn = () => {
    const elements = gsap.utils.toArray<HTMLElement>(`.${AnimateType.WordRandom}`);
    elements.forEach((el) => {
        const split = SplitText.create(el, {
            type: 'words',
        });

        gsap.from(split.words, {
            autoAlpha: 1,
            y: 0,
            x: 0,
            rotation: 0,
            scale: 1,
            filter: 'blur(0px)',
            duration: 0.7,
            stagger: {
                each: 0.03,
                from: 'random',
            },
            ease: 'back.out(1.4)',
            scrollTrigger: {
                trigger: el,
                start: 'top 85%',
                toggleActions: 'restart none none reset',
            },
        });
    });
};
