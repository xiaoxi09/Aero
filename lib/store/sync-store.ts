import { create } from 'zustand';

type SyncStatus = 'idle' | 'syncing' | 'success' | 'error' | 'local_only';

interface SyncStore {
    status: SyncStatus;
    lastSyncTime: number | null;
    message: string | null;
    setStatus: (status: SyncStatus, message?: string | null) => void;
}

export const useSyncStore = create<SyncStore>((set) => ({
    status: 'idle',
    lastSyncTime: null,
    message: null,
    setStatus: (status, message = null) => set((state) => {
        const updates: Partial<SyncStore> = { status, message };
        if (status === 'success') {
            updates.lastSyncTime = Date.now();
        }
        return updates;
    }),
}));
