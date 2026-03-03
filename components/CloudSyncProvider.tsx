'use client';

import { useEffect, useRef, useState } from 'react';
import { getProfileId } from '@/lib/store/auth-store';
import { settingsStore } from '@/lib/store/settings-store';
import { premiumModeSettingsStore } from '@/lib/store/premium-mode-settings';
import { useHistoryStore, usePremiumHistoryStore } from '@/lib/store/history-store';
import { useFavoritesStore, usePremiumFavoritesStore } from '@/lib/store/favorites-store';
import { useSearchHistoryStore, usePremiumSearchHistoryStore } from '@/lib/store/search-history-store';
import { useIPTVStore } from '@/lib/store/iptv-store';

const DEBOUNCE_MS = 5000;

export function CloudSyncProvider({ children }: { children: React.ReactNode }) {
    const [hasPulled, setHasPulled] = useState(false);
    const syncTimer = useRef<NodeJS.Timeout>(null);
    const isPushing = useRef(false);
    // Track session
    const [profileId, setProfileId] = useState<string | null>(null);

    // Initial check for profile ID
    useEffect(() => {
        setProfileId(getProfileId() || null);
    }, []);

    // 1. Pull from Cloud
    useEffect(() => {
        let isMounted = true;

        async function pullData() {
            if (!profileId) {
                if (isMounted) setHasPulled(true);
                return;
            }

            try {
                const res = await fetch('/api/kv/sync', {
                    headers: { 'x-profile-id': profileId }
                });
                
                if (!res.ok) return;

                const json = await res.json();
                
                if (json?.data && isMounted) {
                    const cloudData = json.data;
                    
                    if (cloudData.settings) settingsStore.saveSettings(cloudData.settings);
                    if (cloudData.premiumSettings) premiumModeSettingsStore.saveSettings(cloudData.premiumSettings);
                    if (cloudData.history) useHistoryStore.setState(cloudData.history);
                    if (cloudData.premiumHistory) usePremiumHistoryStore.setState(cloudData.premiumHistory);
                    if (cloudData.favorites) useFavoritesStore.setState(cloudData.favorites);
                    if (cloudData.premiumFavorites) usePremiumFavoritesStore.setState(cloudData.premiumFavorites);
                    if (cloudData.searchHistory) useSearchHistoryStore.setState(cloudData.searchHistory);
                    if (cloudData.premiumSearchHistory) usePremiumSearchHistoryStore.setState(cloudData.premiumSearchHistory);
                    if (cloudData.iptv) useIPTVStore.setState(cloudData.iptv);
                }
            } catch (error) {
                console.error('Failed to pull from Cloudflare KV', error);
            } finally {
                if (isMounted) setHasPulled(true);
            }
        }

        setHasPulled(false);
        pullData();

        return () => { isMounted = false; };
    }, [profileId]);

    // 2. Push to Cloud when state changes, debounced
    useEffect(() => {
        if (!hasPulled || !profileId) return;

        const serializeState = () => ({
            settings: settingsStore.getSettings(),
            premiumSettings: premiumModeSettingsStore.getSettings(),
            history: useHistoryStore.getState(),
            premiumHistory: usePremiumHistoryStore.getState(),
            favorites: useFavoritesStore.getState(),
            premiumFavorites: usePremiumFavoritesStore.getState(),
            searchHistory: useSearchHistoryStore.getState(),
            premiumSearchHistory: usePremiumSearchHistoryStore.getState(),
            iptv: useIPTVStore.getState(),
        });

        const triggerSync = () => {
            if (syncTimer.current) clearTimeout(syncTimer.current);

            syncTimer.current = setTimeout(async () => {
                if (isPushing.current) return;
                isPushing.current = true;

                try {
                    const payload = serializeState();
                    await fetch('/api/kv/sync', {
                        method: 'POST',
                        headers: {
                            'x-profile-id': profileId,
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify(payload)
                    });
                } catch (error) {
                    console.error('KV Sync Push Failed:', error);
                } finally {
                    isPushing.current = false;
                }
            }, DEBOUNCE_MS);
        };

        const u1 = settingsStore.subscribe(triggerSync);
        const u2 = premiumModeSettingsStore.subscribe(triggerSync);
        const u3 = useHistoryStore.subscribe(triggerSync);
        const u4 = usePremiumHistoryStore.subscribe(triggerSync);
        const u5 = useFavoritesStore.subscribe(triggerSync);
        const u6 = usePremiumFavoritesStore.subscribe(triggerSync);
        const u7 = useSearchHistoryStore.subscribe(triggerSync);
        const u8 = usePremiumSearchHistoryStore.subscribe(triggerSync);
        const u9 = useIPTVStore.subscribe(triggerSync);

        return () => {
            if (syncTimer.current) clearTimeout(syncTimer.current);
            u1(); u2(); u3(); u4(); u5(); u6(); u7(); u8(); u9();
        };
    }, [hasPulled, profileId]);

    return <>{children}</>;
}
