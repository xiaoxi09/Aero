'use client';

import { useEffect, useRef, useState } from 'react';
import { getProfileId } from '@/lib/store/auth-store';
import { settingsStore } from '@/lib/store/settings-store';
import { premiumModeSettingsStore } from '@/lib/store/premium-mode-settings';
import { useHistoryStore, usePremiumHistoryStore } from '@/lib/store/history-store';
import { useFavoritesStore, usePremiumFavoritesStore } from '@/lib/store/favorites-store';
import { useSearchHistoryStore, usePremiumSearchHistoryStore } from '@/lib/store/search-history-store';
import { useIPTVStore } from '@/lib/store/iptv-store';
import { useSyncStore } from '@/lib/store/sync-store';

const DEBOUNCE_MS = 5000;

export function CloudSyncProvider({ children }: { children: React.ReactNode }) {
    const [hasPulled, setHasPulled] = useState(false);
    const syncTimer = useRef<NodeJS.Timeout>(null);
    const isPushing = useRef(false);
    // Track session
    const [profileId, setProfileId] = useState<string | null>(null);
    const setStatus = useSyncStore((state) => state.setStatus);

    // Initial check for profile ID
    useEffect(() => {
        const init = async () => {
            try {
                const sessionProfileId = getProfileId();
                if (sessionProfileId) {
                    setProfileId(sessionProfileId);
                    return;
                }
                
                // If not logged in, check if auth is even enabled
                const res = await fetch('/api/auth');
                const data = await res.json();
                
                if (!data.hasAuth) {
                    // Single user mode - always sync to a default profile
                    setProfileId('default_single_user');
                } else {
                    // Auth enabled but not logged in, don't sync
                    setStatus('local_only', '未登录，仅保存在本地');
                    setProfileId(null);
                }
            } catch (error) {
                console.error('Failed to check auth status', error);
                setStatus('local_only', '无法连接服务，仅保存在本地');
            }
        };
        init();
    }, [setStatus]);

    // 1. Pull from Cloud
    useEffect(() => {
        let isMounted = true;

        async function pullData() {
            if (!profileId) {
                if (isMounted) setHasPulled(true);
                return;
            }

            setStatus('syncing', '正在拉取云端数据...');

            try {
                const res = await fetch('/api/kv/sync', {
                    headers: { 'x-profile-id': profileId }
                });
                
                if (!res.ok) {
                    setStatus('error', '服务器响应错误');
                    return;
                }

                const json = await res.json();
                
                if (json.warning) {
                    setStatus('local_only', '未绑定 KV 存储，仅保存在本地');
                } else if (json?.data && isMounted) {
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

                    setStatus('success', '已同步最新数据');
                } else {
                    setStatus('success', '暂无云端数据');
                }
            } catch (error) {
                console.error('Failed to pull from Cloudflare KV', error);
                setStatus('error', '拉取数据失败，请检查网络');
            } finally {
                if (isMounted) setHasPulled(true);
            }
        }

        setHasPulled(false);
        pullData();

        return () => { isMounted = false; };
    }, [profileId, setStatus]);

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
                
                setStatus('syncing', '正在保存到云端...');

                try {
                    const payload = serializeState();
                    const res = await fetch('/api/kv/sync', {
                        method: 'POST',
                        headers: {
                            'x-profile-id': profileId,
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify(payload)
                    });
                    
                    const json = await res.json();
                    
                    if (json.warning) {
                        setStatus('local_only', '未绑定 KV 存储，仅保存在本地');
                    } else if (res.ok) {
                        setStatus('success', '已保存到云端');
                    } else {
                        setStatus('error', json.error || '保存失败');
                    }
                } catch (error) {
                    console.error('KV Sync Push Failed:', error);
                    setStatus('error', '保存数据失败，请检查网络');
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
    }, [hasPulled, profileId, setStatus]);

    return <>{children}</>;
}
