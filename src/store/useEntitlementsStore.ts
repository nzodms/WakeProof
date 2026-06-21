import { create } from 'zustand';
import { FREE_ALARM_LIMIT, FREE_CREW_LIMIT } from '@/constants/premium';

/**
 * Entitlements premium. MVP : mock. Brancher RevenueCat = remplacer
 * `refresh()` par la lecture des entitlements RC, sans toucher aux écrans.
 */
interface EntitlementsState {
  isPremium: boolean;
  setPremium: (v: boolean) => void;
  /** Renvoie true si l'action est permise, sinon false (→ ouvrir le paywall). */
  canCreateAlarm: (currentCount: number) => boolean;
  canJoinCrew: (currentCount: number) => boolean;
  refresh: () => Promise<void>;
}

export const useEntitlementsStore = create<EntitlementsState>((set, get) => ({
  isPremium: false,
  setPremium: (v) => set({ isPremium: v }),
  canCreateAlarm: (count) => get().isPremium || count < FREE_ALARM_LIMIT,
  canJoinCrew: (count) => get().isPremium || count < FREE_CREW_LIMIT,
  refresh: async () => {
    // TODO RevenueCat: const info = await Purchases.getCustomerInfo();
    // set({ isPremium: info.entitlements.active['premium'] != null });
  },
}));
