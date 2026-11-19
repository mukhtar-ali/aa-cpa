import { AnimationFn } from '../Animations';
import { getGSAP } from '../gsap';

const { gsap } = getGSAP();

export const counterAnimation: AnimationFn = () => {
    const elements = gsap.utils.toArray<HTMLElement>('[data-counter]');

    elements.forEach((el) => {
        const rawValue = el.dataset.counter;
        const endValue = Number(rawValue);
        const startValue = Number(el.dataset.counterStart ?? 0);
        const duration = Number(el.dataset.counterDuration ?? 2);
        const decimals = Number(el.dataset.counterDecimals ?? 0);
        const prefix = el.dataset.counterPrefix ?? '';
        const suffix = el.dataset.counterSuffix ?? '';

        if (!rawValue || Number.isNaN(endValue)) return;

        const formatter = new Intl.NumberFormat(undefined, {
            minimumFractionDigits: decimals,
            maximumFractionDigits: decimals,
        });

        const state = { value: startValue };

        const render = () => {
            const currentValue = decimals > 0 ? Number(state.value.toFixed(decimals)) : Math.floor(state.value);

            el.textContent = `${prefix}${formatter.format(currentValue)}${suffix}`;
        };

        render();

        gsap.to(state, {
            value: endValue,
            duration,
            ease: 'power1.out',
            snap: decimals === 0 ? { value: 1 } : undefined,
            onUpdate: render,
            scrollTrigger: {
                trigger: el,
                start: 'top 90%',
                once: true,
            },
        });
    });
};
