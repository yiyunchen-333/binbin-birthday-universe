import { create } from 'zustand'

export const useAppStore = create((set) => ({
  currentPage: 0,
  starGone: false,
  musicOn: true,
  beginBurst: () => set({ currentPage: 2, starGone: true }),
  setCurrentPage: (currentPage) =>
    set({
      currentPage,
      starGone: currentPage >= 2,
    }),
  toggleMusic: () => set((state) => ({ musicOn: !state.musicOn })),
}))
