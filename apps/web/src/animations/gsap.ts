'use client';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import { SplitText } from 'gsap/SplitText';

let registered = false;

export function getGSAP() {
    if (!registered && typeof window !== 'undefined') {
        gsap.registerPlugin(ScrollTrigger, useGSAP, SplitText);
        registered = true;
    }
    return { gsap, ScrollTrigger, useGSAP, SplitText };
}
