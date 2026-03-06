/**
 * UI Store
 * Global state management for UI components like sidebars and modals
 */

import { create } from 'zustand';

interface UIState {
  isHistoryOpen: boolean;
  isFavoritesOpen: boolean;
  isPremiumContext: boolean; // Optional: To keep track if we are in premium mode globally
}

interface UIActions {
  setHistoryOpen: (isOpen: boolean) => void;
  setFavoritesOpen: (isOpen: boolean) => void;
  toggleHistory: () => void;
  toggleFavorites: () => void;
  closeAllSidebars: () => void;
  setPremiumContext: (isPremium: boolean) => void;
}

export const useUIStore = create<UIState & UIActions>((set) => ({
  isHistoryOpen: false,
  isFavoritesOpen: false,
  isPremiumContext: false,

  setHistoryOpen: (isOpen) => set({ isHistoryOpen: isOpen }),
  setFavoritesOpen: (isOpen) => set({ isFavoritesOpen: isOpen }),
  
  toggleHistory: () => set((state) => ({ isHistoryOpen: !state.isHistoryOpen })),
  toggleFavorites: () => set((state) => ({ isFavoritesOpen: !state.isFavoritesOpen })),
  
  closeAllSidebars: () => set({ 
    isHistoryOpen: false, 
    isFavoritesOpen: false 
  }),

  setPremiumContext: (isPremium) => set({ isPremiumContext: isPremium }),
}));
