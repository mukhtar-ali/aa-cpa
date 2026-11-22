import { AnimationFn } from '../Animations';

export const headerAnimation: AnimationFn = () => {
    const header = document.querySelector<HTMLElement>('#main-header');
    if (!header) return;

    const handleScroll = () => {
        if (window.scrollY > 0) {
            header.classList.add('bg-main-blur', 'header-active');
        } else {
            header.classList.remove('bg-main-blur', 'header-active');
        }
    };

    handleScroll();
    window.addEventListener('scroll', handleScroll);

    return () => window.removeEventListener('scroll', handleScroll);
};
