'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Icons } from '@/components/ui/Icon';
import { useUIStore } from '@/lib/store/ui-store';
import { hasPermission } from '@/lib/store/auth-store';
import { useEffect, useState, useMemo } from 'react';
import { motion } from 'framer-motion';

export function BottomNav() {
  const pathname = usePathname();
  const toggleHistory = useUIStore((state) => state.toggleHistory);
  const toggleFavorites = useUIStore((state) => state.toggleFavorites);
  const isHistoryOpen = useUIStore((state) => state.isHistoryOpen);
  const isFavoritesOpen = useUIStore((state) => state.isFavoritesOpen);
  
  const isSettings = pathname === '/settings' || pathname === '/premium/settings';
  const isHome = pathname === '/' || pathname === '/premium';
  const isIptv = pathname === '/iptv';
  
  const [mounted, setMounted] = useState(false);
  const [showIptv, setShowIptv] = useState(false);
  
  // Track currently hovered item to allow the pill to slide on hover for desktop
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
    setShowIptv(hasPermission('iptv_access'));
  }, []);

  // Determine which tab is technically "active"
  const activeId = useMemo(() => {
    if (isHistoryOpen) return 'history';
    if (isFavoritesOpen) return 'favorites';
    if (isSettings) return 'settings';
    if (isIptv) return 'iptv';
    return 'home';
  }, [isHistoryOpen, isFavoritesOpen, isSettings, isIptv]);

  if (!mounted) return null;

  // If hoveredId is null, use the activeId. This creates the "slide back" effect.
  const currentPillId = hoveredId || activeId;

  const navItems = [
    {
      id: 'home',
      label: '首页',
      isActive: isHome && !isHistoryOpen && !isFavoritesOpen,
      icon: (
        <svg className="w-5 h-5 sm:w-4 sm:h-4 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
            <polyline points="9 22 9 12 15 12 15 22"></polyline>
        </svg>
      ),
      component: 'link',
      href: '/',
    },
    ...(showIptv ? [{
      id: 'iptv',
      label: '直播',
      isActive: isIptv && !isHistoryOpen && !isFavoritesOpen,
      icon: <Icons.TV className="w-5 h-5 sm:w-4 sm:h-4" />,
      component: 'link',
      href: '/iptv',
    }] : []),
    {
      id: 'favorites',
      label: '收藏',
      isActive: isFavoritesOpen,
      icon: <Icons.Heart className={`w-5 h-5 sm:w-4 sm:h-4 ${isFavoritesOpen ? 'fill-current' : ''}`} />,
      component: 'button',
      onClick: toggleFavorites,
    },
    {
      id: 'history',
      label: '历史',
      isActive: isHistoryOpen,
      icon: <Icons.History className="w-5 h-5 sm:w-4 sm:h-4" />,
      component: 'button',
      onClick: toggleHistory,
    },
    {
      id: 'settings',
      label: '设置',
      isActive: isSettings && !isHistoryOpen && !isFavoritesOpen,
      icon: (
        <svg className="w-5 h-5 sm:w-4 sm:h-4" viewBox="0 -960 960 960" fill="currentColor">
            <path d="m370-80-16-128q-13-5-24.5-12T307-235l-119 50L78-375l103-78q-1-7-1-13.5v-27q0-6.5 1-13.5L78-585l110-190 119 50q11-8 23-15t24-12l16-128h220l16 128q13 5 24.5 12t22.5 15l119-50 110 190-103 78q1 7 1 13.5v27q0 6.5-2 13.5l103 78-110 190-118-50q-11 8-23 15t-24 12L590-80H370Zm70-80h79l14-106q31-8 57.5-23.5T639-327l99 41 39-68-86-65q5-14 7-29.5t2-31.5q0-16-2-31.5t-7-29.5l86-65-39-68-99 42q-22-23-48.5-38.5T533-694l-13-106h-79l-14 106q-31 8-57.5 23.5T321-633l-99-41-39 68 86 64q-5 15-7 30t-2 32q0 16 2 31t7 30l-86 65 39 68 99-42q22 23 48.5 38.5T427-266l13 106Zm42-180q58 0 99-41t41-99q0-58-41-99t-99-41q-59 0-99.5 41T342-480q0 58 40.5 99t99.5 41Zm-2-140Z" />
        </svg>
      ),
      component: 'link',
      href: '/settings',
    }
  ];

  return (
    <nav 
      className="fixed bottom-6 sm:bottom-8 left-1/2 -translate-x-1/2 z-[1900] bg-[var(--glass-bg)]/80 backdrop-blur-[var(--glass-blur)] saturate-[var(--glass-saturate)] border border-[var(--glass-border)] shadow-[inset_0_1px_2px_rgba(255,255,255,0.4),inset_0_-1px_2px_rgba(0,0,0,0.05),0_8px_32px_rgba(0,0,0,0.15)] rounded-full px-2 sm:px-3 py-1.5 sm:py-2 will-change-transform"
      onMouseLeave={() => setHoveredId(null)}
    >
      <div className="flex items-center justify-center gap-1 sm:gap-2 relative">
        {navItems.map((item) => {
          
          const sharedClasses = `relative flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 w-14 sm:w-auto sm:px-4 h-12 sm:h-10 rounded-full transition-colors duration-300 z-10 ${item.isActive ? 'text-[var(--accent-color)] font-semibold' : 'text-[var(--text-color-secondary)] hover:text-[var(--text-color)]'}`;

          const content = (
            <>
              {/* The Sliding Pill Background */}
              {currentPillId === item.id && (
                <motion.div
                  layoutId="bottom-nav-pill"
                  className={`absolute inset-0 rounded-full ${item.isActive ? 'bg-[color-mix(in_srgb,var(--accent-color)_15%,transparent)]' : 'bg-[color-mix(in_srgb,var(--text-color)_5%,transparent)]'}`}
                  initial={false}
                  transition={{
                    type: "spring",
                    stiffness: 400,
                    damping: 30,
                    mass: 0.8
                  }}
                  style={{ zIndex: -1 }}
                />
              )}
              {/* Icon & Label */}
              <div className="relative z-10 flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2">
                {item.icon}
                <span className="text-[10px] sm:text-sm">{item.label}</span>
              </div>
            </>
          );

          if (item.component === 'link') {
            return (
              <Link
                key={item.id}
                href={item.href!}
                className={sharedClasses}
                onMouseEnter={() => setHoveredId(item.id)}
                onClick={() => {
                  if (isHistoryOpen) toggleHistory();
                  if (isFavoritesOpen) toggleFavorites();
                }}
              >
                {content}
              </Link>
            );
          }

          return (
            <button
              key={item.id}
              onClick={item.onClick}
              className={sharedClasses}
              onMouseEnter={() => setHoveredId(item.id)}
            >
              {content}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
