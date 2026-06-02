import { create } from 'zustand';

import { BONUS_LIFE_FROM_AD } from '../constants/monetization';

interface MonetizationState {
  /** Extra lives queued for the next game (from rewarded ads). */
  bonusLives: number;
  addBonusLives: (count?: number) => void;
  clearBonusLives: () => void;
}

export const useMonetizationStore = create<MonetizationState>((set) => ({
  bonusLives: 0,
  addBonusLives: (count = BONUS_LIFE_FROM_AD) =>
    set((s) => ({ bonusLives: s.bonusLives + count })),
  clearBonusLives: () => set({ bonusLives: 0 }),
}));
