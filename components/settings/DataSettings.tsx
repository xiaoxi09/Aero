import { useSyncStore } from '@/lib/store/sync-store';
import { Cloud, CloudOff, AlertCircle, HardDrive, Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';

interface DataSettingsProps {
    onExport: () => void;
    onImport: () => void;
    onReset: () => void;
}

export function DataSettings({ onExport, onImport, onReset }: DataSettingsProps) {
    const { status, lastSyncTime, message } = useSyncStore();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const renderStatus = () => {
        if (!mounted) return null;

        switch (status) {
            case 'syncing':
                return (
                    <div className="flex items-center gap-2 text-blue-500">
                        <Loader2 size={16} className="animate-spin" />
                        <span className="text-sm">正在同步...</span>
                    </div>
                );
            case 'success':
                return (
                    <div className="flex flex-col items-end">
                        <div className="flex items-center gap-2 text-green-500">
                            <Cloud size={16} />
                            <span className="text-sm font-medium">Cloudflare KV</span>
                        </div>
                        {lastSyncTime && (
                           <span className="text-[10px] text-[var(--text-color-secondary)] mt-1">
                               {new Date(lastSyncTime).toLocaleTimeString()}
                           </span>
                        )}
                        {message && <span className="text-[10px] text-green-500/80 mt-0.5">{message}</span>}
                    </div>
                );
            case 'error':
                return (
                    <div className="flex flex-col items-end">
                        <div className="flex items-center gap-2 text-red-500">
                            <AlertCircle size={16} />
                            <span className="text-sm font-medium">同步失败</span>
                        </div>
                        {message && <span className="text-[10px] text-red-500/80 mt-1">{message}</span>}
                    </div>
                );
            case 'local_only':
                return (
                    <div className="flex flex-col items-end">
                        <div className="flex items-center gap-2 text-[var(--text-color-secondary)]">
                            <HardDrive size={16} />
                            <span className="text-sm font-medium">仅本地存储</span>
                        </div>
                        {message && <span className="text-[10px] text-[var(--text-color-secondary)] opacity-80 mt-1">{message}</span>}
                    </div>
                );
            default:
                return (
                    <div className="flex items-center gap-2 text-[var(--text-color-secondary)]">
                        <CloudOff size={16} />
                        <span className="text-sm">准备中...</span>
                    </div>
                );
        }
    };

    return (
        <div className="bg-[var(--glass-bg)] border border-[var(--glass-border)] rounded-[var(--radius-2xl)] shadow-[var(--shadow-sm)] p-6">
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-[var(--text-color)]">数据管理</h2>
                <div className="bg-black/5 dark:bg-white/5 px-3 py-1.5 rounded-[var(--radius-2xl)] border border-[var(--glass-border)]">
                    {renderStatus()}
                </div>
            </div>
            <div className="space-y-3">
                <button
                    onClick={onExport}
                    className="w-full px-6 py-4 rounded-[var(--radius-2xl)] bg-[var(--glass-bg)] border border-[var(--glass-border)] text-[var(--text-color)] font-medium hover:bg-[color-mix(in_srgb,var(--accent-color)_10%,transparent)] transition-all duration-200 flex items-center justify-between cursor-pointer"
                >
                    <span>导出设置</span>
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3" />
                    </svg>
                </button>

                <button
                    onClick={onImport}
                    className="w-full px-6 py-4 rounded-[var(--radius-2xl)] bg-[var(--glass-bg)] border border-[var(--glass-border)] text-[var(--text-color)] font-medium hover:bg-[color-mix(in_srgb,var(--accent-color)_10%,transparent)] transition-all duration-200 flex items-center justify-between cursor-pointer"
                >
                    <span>导入设置</span>
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12" />
                    </svg>
                </button>

                <button
                    onClick={onReset}
                    className="w-full px-6 py-4 rounded-[var(--radius-2xl)] bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 font-medium hover:bg-red-100 dark:hover:bg-red-900/30 transition-all duration-200 flex items-center justify-between cursor-pointer"
                >
                    <span>清除所有数据</span>
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                    </svg>
                </button>
            </div>
        </div>
    );
}
