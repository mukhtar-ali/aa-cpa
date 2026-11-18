import { create } from 'zustand';

type State = {
    bookProjectOpenModal: boolean;
    setBookProjectOpenModal: (bookProjectOpenModal: boolean) => void;
    bookUnitOpenModal: boolean;
    setBookUnitOpenModal: (bookUnitOpenModal: boolean) => void;
};

export const useGlobalStore = create<State>((set) => ({
    bookProjectOpenModal: false,
    setBookProjectOpenModal: (bookProjectOpenModal) => set({ bookProjectOpenModal }),
    bookUnitOpenModal: false,
    setBookUnitOpenModal: (bookUnitOpenModal) => set({ bookUnitOpenModal }),
}));
