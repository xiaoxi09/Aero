'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Icons } from '@/components/ui/Icon';
import { useUIStore } from '@/lib/store/ui-store';
import { hasPermission } from '@/lib/store/auth-store';
import { useEffect, useState } from 'react';

export function BottomNav() {
  const pathname = usePathname();
  const toggleHistory = useUIStore((state) => state.toggleHistory);
  const toggleFavorites = useUIStore((state) => state.toggleFavorites);
  const isHistoryOpen = useUIStore((state) => state.isHistoryOpen);
  const isFavoritesOpen = useUIStore((state) => state.isFavoritesOpen);
  
  const [mounted, setMounted] = useState(false);
  const [showIptv, setShowIptv] = useState(false);

  useEffect(() => {
    setMounted(true);
    setShowIptv(hasPermission('iptv_access'));
  }, []);

  if (!mounted) return null;

  const isSettings = pathname === '/settings' || pathname === '/premium/settings';
  const isHome = pathname === '/' || pathname === '/premium';
  const isIptv = pathname === '/iptv';

  return (
    <nav className="fixed bottom-6 sm:bottom-8 left-1/2 -translate-x-1/2 z-[1900] bg-[var(--glass-bg)]/90 backdrop-blur-[var(--glass-blur)] saturate-[var(--glass-saturate)] border border-[var(--glass-border)] shadow-[0_8px_32px_rgba(0,0,0,0.15)] rounded-full px-2 sm:px-4 py-1.5 sm:py-2">
      <div className="flex items-center justify-center gap-1 sm:gap-2">
        
        {/* Home */}
        <Link 
          href="/"
          className={`flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 w-14 sm:w-auto sm:px-4 h-12 sm:h-10 rounded-full transition-all duration-300 ${isHome ? 'bg-[color-mix(in_srgb,var(--accent-color)_15%,transparent)] text-[var(--accent-color)]' : 'text-[var(--text-color-secondary)] hover:bg-[color-mix(in_srgb,var(--text-color)_5%,transparent)] hover:text-[var(--text-color)]'}`}
        >
          <svg className="w-5 h-5 sm:w-4 sm:h-4 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>
          <span className="text-[10px] sm:text-sm font-medium">首页</span>
        </Link>

        {/* IPTV (Conditional) */}
        {showIptv && (
          <Link 
            href="/iptv"
            className={`flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 w-14 sm:w-auto sm:px-4 h-12 sm:h-10 rounded-full transition-all duration-300 ${isIptv ? 'bg-[color-mix(in_srgb,var(--accent-color)_15%,transparent)] text-[var(--accent-color)]' : 'text-[var(--text-color-secondary)] hover:bg-[color-mix(in_srgb,var(--text-color)_5%,transparent)] hover:text-[var(--text-color)]'}`}
          >
            <Icons.TV className="w-5 h-5 sm:w-4 sm:h-4" />
            <span className="text-[10px] sm:text-sm font-medium">直播</span>
          </Link>
        )}

        {/* Favorites Toggle */}
        <button 
          onClick={toggleFavorites}
          className={`flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 w-14 sm:w-auto sm:px-4 h-12 sm:h-10 rounded-full transition-all duration-300 ${isFavoritesOpen ? 'bg-[color-mix(in_srgb,var(--accent-color)_15%,transparent)] text-[var(--accent-color)]' : 'text-[var(--text-color-secondary)] hover:bg-[color-mix(in_srgb,var(--text-color)_5%,transparent)] hover:text-[var(--text-color)]'}`}
        >
          <Icons.Heart className={`w-5 h-5 sm:w-4 sm:h-4 ${isFavoritesOpen ? 'fill-current' : ''}`} />
          <span className="text-[10px] sm:text-sm font-medium">收藏</span>
        </button>

        {/* History Toggle */}
        <button 
          onClick={toggleHistory}
          className={`flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 w-14 sm:w-auto sm:px-4 h-12 sm:h-10 rounded-full transition-all duration-300 ${isHistoryOpen ? 'bg-[color-mix(in_srgb,var(--accent-color)_15%,transparent)] text-[var(--accent-color)]' : 'text-[var(--text-color-secondary)] hover:bg-[color-mix(in_srgb,var(--text-color)_5%,transparent)] hover:text-[var(--text-color)]'}`}
        >
          <Icons.History className="w-5 h-5 sm:w-4 sm:h-4" />
          <span className="text-[10px] sm:text-sm font-medium">历史</span>
        </button>

        {/* Settings */}
        <Link 
          href="/settings"
          className={`flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 w-14 sm:w-auto sm:px-4 h-12 sm:h-10 rounded-full transition-all duration-300 ${isSettings ? 'bg-[color-mix(in_srgb,var(--accent-color)_15%,transparent)] text-[var(--accent-color)]' : 'text-[var(--text-color-secondary)] hover:bg-[color-mix(in_srgb,var(--text-color)_5%,transparent)] hover:text-[var(--text-color)]'}`}
        >
          <svg className="w-5 h-5 sm:w-4 sm:h-4" viewBox="0 -960 960 960" fill="currentColor">
              <path d="m370-80-16-128q-13-5-24.5-12T307-235l-119 50L78-375l103-78q-1-7-1-13.5v-27q0-6.5 1-13.5L78-585l110-190 119 50q11-8 23-15t24-12l16-128h220l16 128q13 5 24.5 12t22.5 15l119-50 110 190-103 78q1 7 1 13.5v27q0 6.5-2 13.5l103 78-110 190-118-50q-11 8-23 15t-24 12L590-80H370Zm70-80h79l14-106q31-8 57.5-23.5T639-327l99 41 39-68-86-65q5-14 7-29.5t2-31.5q0-16-2-31.5t-7-29.5l86-65-39-68-99 42q-22-23-48.5-38.5T533-694l-13-106h-79l-14 106q-31 8-57.5 23.5T321-633l-99-41-39 68 86 64q-5 15-7 30t-2 32q0 16 2 31t7 30l-86 65 39 68 99-42q22 23 48.5 38.5T427-266l13 106Zm42-180q58 0 99-41t41-99q0-58-41-99t-99-41q-59 0-99.5 41T342-480q0 58 40.5 99t99.5 41Zm-2-140Z" />
          </svg>
          <span className="text-[10px] sm:text-sm font-medium">设置</span>
        </Link>
      </div>
    </nav>
  );
}
