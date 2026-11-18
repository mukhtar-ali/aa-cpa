'use client';

import { create } from 'zustand';

type TransitionState = {
    pageLoaderDone: boolean;
    setPageLoaderDone: (v: boolean) => void;
};

export const useTransitionStore = create<TransitionState>((set) => ({
    pageLoaderDone: false,
    setPageLoaderDone: (pageLoaderDone) => set({ pageLoaderDone }),
}));
