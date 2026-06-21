import { create } from 'zustand';

interface OnboardingState {
  completed: boolean;
  goal: string | null;
  permissions: {
    notifications: boolean;
    camera: boolean;
    motion: boolean;
  };
  setGoal: (goal: string) => void;
  setPermission: (key: keyof OnboardingState['permissions'], value: boolean) => void;
  complete: () => void;
  reset: () => void;
}

export const useOnboardingStore = create<OnboardingState>((set) => ({
  completed: false,
  goal: null,
  permissions: { notifications: false, camera: false, motion: false },
  setGoal: (goal) => set({ goal }),
  setPermission: (key, value) =>
    set((s) => ({ permissions: { ...s.permissions, [key]: value } })),
  complete: () => set({ completed: true }),
  reset: () => set({ completed: false, goal: null }),
}));
