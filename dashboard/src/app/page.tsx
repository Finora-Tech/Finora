'use client';

import { useMemo, useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Moon, Sun, Search, Bell, TrendingUp, CheckCircle, Clock, Zap } from "lucide-react";

// Components
import { Overview } from "../components/Overview";
import { Transactions } from "../components/Transactions";
import { Alerts } from "../components/Alerts";

// Types and Utils
import { Transaction, KPI } from "../types";
import { filterRows, runSelfTests, readParam, writeParam, mulberry32 } from "../utils";

/**
 * Finora UI Mockup v1 – Overview Dashboard (JSX)
 * Upgrades implemented per request:
 * 1) URL 동기화: tab / search / range / theme
 * 2) UI 품질 개선: 전환 애니메이션, 아이콘, 빈 상태 UI, 시스템 테마 변경 리스너
 * 3) 유지: 오로라 로고, 다크모드 토글, filterRows + self-tests
 */

// Run self-tests
runSelfTests();

// -------------------------------
// Main Component
// -------------------------------
export default function FinoraDashboardMockup() {
    // init state from URL (fallbacks)
    const initialTab = typeof window !== 'undefined' ? readParam('tab', 'overview') : 'overview';
    const initialRange = typeof window !== 'undefined' ? readParam('range', 'today') : 'today';
    const initialSearch = typeof window !== 'undefined' ? readParam('search', '') : '';
    const initialTheme = typeof window !== 'undefined' ? readParam('theme', '') : '';

    const [range, setRange] = useState(initialRange);
    const [search, setSearch] = useState(initialSearch);
    const [tab, setTab] = useState(initialTab); // 'overview' | 'transactions' | 'alerts'
    const [dark, setDark] = useState(false);
    const [showNotifications, setShowNotifications] = useState(false);

    const firstThemeApplied = useRef(false);
    const notificationRef = useRef<HTMLDivElement>(null);

    // Apply theme to <html> and meta theme-color
    const applyTheme = (isDark: boolean) => {
        const root = document.documentElement;
        if (isDark) root.classList.add("dark");
        else root.classList.remove("dark");
        const meta = document.querySelector('meta[name="theme-color"]');
        if (meta) meta.setAttribute("content", isDark ? "#0a0a0a" : "#ffffff");
    };

    // Initialize theme from URL > localStorage > system preference
    useEffect(() => {
        try {
            const modeFromUrl = initialTheme === 'dark' || initialTheme === 'light' ? initialTheme : null;
            const saved = localStorage.getItem("finora.theme");
            const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
            const next = modeFromUrl ?? (saved === 'dark' || saved === 'light' ? saved : (prefersDark ? 'dark' : 'light'));
            const isDark = next === 'dark';
            setDark(isDark);
            applyTheme(isDark);
            firstThemeApplied.current = true;
            // sync URL if came from storage/system
            if (!modeFromUrl) writeParam('theme', next);
        } catch {}
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Listen to system theme changes if user didn't explicitly set URL param
    useEffect(() => {
        const savedInUrl = readParam('theme', '');
        if (savedInUrl) return; // explicit URL wins
        const mq = window.matchMedia('(prefers-color-scheme: dark)');
        const handler = (e: MediaQueryListEvent) => {
            // only auto-follow if user hasn't manually toggled (no localStorage override)
            const saved = localStorage.getItem('finora.theme');
            if (saved) return;
            setDark(e.matches);
            applyTheme(e.matches);
        };
        mq.addEventListener?.('change', handler);
        return () => mq.removeEventListener?.('change', handler);
    }, []);

    // Persist and apply when toggled; sync URL param
    useEffect(() => {
        if (!firstThemeApplied.current) return; // avoid double-run at mount
        try { localStorage.setItem("finora.theme", dark ? "dark" : "light"); } catch {}
        applyTheme(dark);
        writeParam('theme', dark ? 'dark' : 'light');
    }, [dark]);

    // Sync URL when tab/range/search changes (debounce search)
    useEffect(() => { writeParam('tab', tab); }, [tab]);
    useEffect(() => { writeParam('range', range); }, [range]);
    useEffect(() => {
        const id = setTimeout(() => writeParam('search', search), 200);
        return () => clearTimeout(id);
    }, [search]);

    // Close notifications on outside click or ESC key
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
                setShowNotifications(false);
            }
        }

        function handleKeyDown(event: KeyboardEvent) {
            if (event.key === 'Escape') {
                setShowNotifications(false);
            }
        }

        if (showNotifications) {
            document.addEventListener('mousedown', handleClickOutside);
            document.addEventListener('keydown', handleKeyDown);
            return () => {
                document.removeEventListener('mousedown', handleClickOutside);
                document.removeEventListener('keydown', handleKeyDown);
            };
        }
    }, [showNotifications]);

    const txRows = useMemo(
        (): Transaction[] => {
            const rng = mulberry32(42); // deterministic across server/client
            const base = Date.UTC(2024, 0, 1, 12, 0, 0); // fixed UTC timebase to avoid TZ differences
            return Array.from({ length: 12 }).map((_, i) => {
                const ts = new Date(base - i * 41000); // 41s step
                const amount = Math.floor(rng() * 1_000_000);
                const isError = rng() > 0.95;
                const isKakaoBank = rng() > 0.5;
                return {
                    id: `TX-${1000 + i}`,
                    time: ts.toLocaleTimeString('ko-KR', { hour12: true, timeZone: 'UTC' }),
                    amount: String(amount),
                    status: isError ? 'ERROR' : 'OK',
                    channel: isKakaoBank ? 'KakaoBank' : 'TossBank',
                };
            });
        },
        []
    );

    const filteredRows = useMemo(() => filterRows(txRows, search), [txRows, search]);

    // KPI 데이터 정의 - Aurora 테마 (가독성 개선)
    const kpis = useMemo(() => [
        {
            label: "총 처리량",
            value: "12,847",
            delta: "+2.3% vs 어제",
            icon: TrendingUp,
            gradient: "from-emerald-400 via-cyan-400 to-teal-500",
            bgGradient: "from-emerald-400/5 via-cyan-400/3 to-teal-500/5",
            glowColor: "emerald-400/20"
        },
        {
            label: "성공률",
            value: "99.2%",
            delta: "+0.1% vs 어제",
            icon: CheckCircle,
            gradient: "from-cyan-400 via-blue-400 to-indigo-500",
            bgGradient: "from-cyan-400/5 via-blue-400/3 to-indigo-500/5",
            glowColor: "cyan-400/20"
        },
        {
            label: "평균 지연",
            value: "142ms",
            delta: "-8ms vs 어제",
            icon: Clock,
            gradient: "from-violet-400 via-purple-400 to-fuchsia-500",
            bgGradient: "from-violet-400/5 via-purple-400/3 to-fuchsia-500/5",
            glowColor: "violet-400/20"
        },
        {
            label: "활성 채널",
            value: "2",
            delta: "KakaoBank, TossBank",
            icon: Zap,
            gradient: "from-pink-400 via-rose-400 to-red-400",
            bgGradient: "from-pink-400/5 via-rose-400/3 to-red-400/5",
            glowColor: "pink-400/20"
        }
    ], []);

    return (
        <div className={dark ? "dark" : ""}>
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/30 to-cyan-50/20 dark:from-slate-950 dark:via-indigo-950/50 dark:to-emerald-950/30 text-neutral-900 dark:text-neutral-100 transition-colors duration-500 motion-reduce:transition-none relative overflow-hidden">
                {/* Aurora Background Effects - Reduced for readability */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    {/* Primary Aurora Wave - Much more subtle */}
                    <div className="absolute -top-1/2 -left-1/2 w-[200%] h-[200%] bg-gradient-conic from-emerald-500/3 via-cyan-500/5 to-violet-500/3 dark:from-emerald-400/5 dark:via-cyan-400/7 dark:to-violet-400/5 animate-spin [animation-duration:60s] opacity-20" />

                    {/* Secondary Aurora Glow - Reduced */}
                    <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-radial from-pink-500/5 via-purple-500/3 to-transparent dark:from-pink-400/7 dark:via-purple-400/5 opacity-25 animate-pulse [animation-duration:4s]" />

                    {/* Tertiary Aurora Shimmer - Reduced */}
                    <div className="absolute bottom-0 left-0 w-80 h-80 bg-gradient-radial from-cyan-500/4 via-emerald-500/3 to-transparent dark:from-cyan-400/6 dark:via-emerald-400/5 opacity-30 animate-pulse [animation-duration:6s] [animation-delay:2s]" />

                    {/* Aurora Particles - Much more subtle */}
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_80%,rgba(16,185,129,0.04),transparent_50%)] dark:bg-[radial-gradient(circle_at_20%_80%,rgba(16,185,129,0.06),transparent_50%)]" />
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(139,92,246,0.04),transparent_50%)] dark:bg-[radial-gradient(circle_at_80%_20%,rgba(139,92,246,0.06),transparent_50%)]" />
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_60%_60%,rgba(6,182,212,0.03),transparent_50%)] dark:bg-[radial-gradient(circle_at_60%_60%,rgba(6,182,212,0.05),transparent_50%)]" />
                </div>
                {/* Top App Bar - Cleaned up */}
                <header className="sticky top-0 z-20 border-b border-neutral-200/40 dark:border-neutral-800/40 bg-white/90 dark:bg-neutral-950/90 backdrop-blur-xl shadow-sm">
                    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-16 flex items-center">
                        {/* Logo & Brand */}
                        <div className="flex items-center gap-4">
                            <div className="size-9 rounded-xl bg-gradient-to-tr from-emerald-400 via-cyan-400 to-violet-500 shadow-lg relative overflow-hidden group">
                                {/* Single subtle shimmer */}
                                <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/20 to-transparent animate-pulse [animation-duration:3s]" />
                            </div>
                            <div>
                                <div className="font-bold text-lg text-neutral-900 dark:text-white">
                                    Finora
                                </div>
                                <div className="hidden sm:block text-xs text-neutral-600 dark:text-neutral-400 -mt-0.5">
                                    Finance Meets Aurora
                                </div>
                            </div>
                        </div>

                        {/* Navigation */}
                        <nav className="ml-8 hidden md:flex items-center gap-1">
                            <NavItem active={tab === "overview"} onClick={() => {
                                console.log('Switching to Overview tab');
                                setTab("overview");
                            }}>
                                Overview
                            </NavItem>
                            <NavItem active={tab === "transactions"} onClick={() => {
                                console.log('Switching to Transactions tab');
                                setTab("transactions");
                            }}>
                                Transactions
                            </NavItem>
                            <NavItem active={tab === "alerts"} onClick={() => {
                                console.log('Switching to Alerts tab');
                                setTab("alerts");
                            }}>
                                Alerts
                            </NavItem>
                        </nav>

                        {/* Controls */}
                        <div className="ml-auto flex items-center gap-3">
                            {/* Time Range Selector */}
                            <select
                                className="h-9 rounded-lg border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-800 px-3 text-sm text-neutral-700 dark:text-neutral-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500/50 transition-colors"
                                value={range}
                                onChange={(e) => {
                                    console.log('Range changed to:', e.target.value);
                                    setRange(e.target.value);
                                }}
                            >
                                <option value="today">오늘</option>
                                <option value="24h">최근 24시간</option>
                                <option value="7d">최근 7일</option>
                                <option value="30d">최근 30일</option>
                            </select>

                            {/* Search Input */}
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" size={14} />
                                <input
                                    value={search}
                                    onChange={(e) => {
                                        console.log('Search query changed to:', e.target.value);
                                        setSearch(e.target.value);
                                    }}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                            console.log('Search submitted with query:', search);
                                            e.currentTarget.blur();
                                        }
                                    }}
                                    placeholder="검색..."
                                    aria-label="트랜잭션 검색"
                                    className="h-9 w-48 pl-8 pr-3 rounded-lg border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-800 text-sm text-neutral-700 dark:text-neutral-300 placeholder:text-neutral-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500/50 transition-colors"
                                />
                            </div>

                            {/* Theme Toggle */}
                            <button
                                onClick={() => {
                                    console.log('Theme toggled to:', !dark ? 'dark' : 'light');
                                    setDark((d) => !d);
                                }}
                                aria-pressed={dark}
                                title={dark ? "라이트 모드로" : "다크 모드로"}
                                className="h-9 w-9 inline-flex items-center justify-center rounded-lg border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500/50 transition-colors"
                            >
                                {dark ? <Sun size={16} /> : <Moon size={16} />}
                            </button>

                            {/* Notifications */}
                            <div className="relative" ref={notificationRef}>
                                <button
                                    onClick={() => {
                                        console.log('Notifications toggled:', !showNotifications);
                                        setShowNotifications(!showNotifications);
                                    }}
                                    className="h-9 w-9 inline-flex items-center justify-center rounded-lg border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500/50 transition-colors relative"
                                    title="알림"
                                >
                                    <Bell size={16} />
                                    <div className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full" />
                                </button>

                                {/* Notification Dropdown */}
                                {showNotifications && (
                                    <motion.div
                                        initial={{ opacity: 0, y: -10, scale: 0.95 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        exit={{ opacity: 0, y: -10, scale: 0.95 }}
                                        transition={{ duration: 0.2, ease: "easeOut" }}
                                        className="absolute right-0 top-full mt-3 w-96 bg-white/95 dark:bg-neutral-900/95 backdrop-blur-xl border border-neutral-200/50 dark:border-neutral-700/50 rounded-3xl shadow-2xl z-50 overflow-hidden"
                                    >
                                        <div className="p-6 border-b border-neutral-200/50 dark:border-neutral-700/50 bg-gradient-to-r from-white/50 to-neutral-50/50 dark:from-neutral-900/50 dark:to-neutral-800/50">
                                            <div className="flex items-center justify-between">
                                                <h3 className="text-lg font-bold text-neutral-900 dark:text-white">알림</h3>
                                                <div className="flex items-center gap-2">
                                                    <div className="w-2 h-2 bg-gradient-to-r from-red-400 to-red-500 rounded-full animate-pulse"></div>
                                                    <span className="text-xs font-medium text-neutral-500 dark:text-neutral-400">실시간</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="max-h-80 overflow-y-auto">
                                            <div className="p-5 hover:bg-gradient-to-r hover:from-red-50/70 hover:to-red-100/70 dark:hover:from-red-950/40 dark:hover:to-red-900/40 transition-all duration-300 border-b border-neutral-100/50 dark:border-neutral-800/50">
                                                <div className="flex items-start gap-4">
                                                    <div className="w-3 h-3 bg-gradient-to-r from-red-400 to-red-500 rounded-full mt-2 flex-shrink-0 shadow-lg shadow-red-500/30"></div>
                                                    <div className="flex-1">
                                                        <p className="text-base font-bold text-neutral-900 dark:text-white mb-2">오류율 임계치 초과</p>
                                                        <div className="text-sm font-semibold text-red-700 dark:text-red-300 bg-red-100/80 dark:bg-red-900/50 px-3 py-1.5 rounded-lg inline-block">
                                                            10분 전 · 구간: /payments/authorize
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="p-5 hover:bg-gradient-to-r hover:from-amber-50/70 hover:to-amber-100/70 dark:hover:from-amber-950/40 dark:hover:to-amber-900/40 transition-all duration-300 border-b border-neutral-100/50 dark:border-neutral-800/50">
                                                <div className="flex items-start gap-4">
                                                    <div className="w-3 h-3 bg-gradient-to-r from-amber-400 to-amber-500 rounded-full mt-2 flex-shrink-0 shadow-lg shadow-amber-500/30"></div>
                                                    <div className="flex-1">
                                                        <p className="text-base font-bold text-neutral-900 dark:text-white mb-2">평균 지연 상승</p>
                                                        <div className="text-sm font-semibold text-amber-700 dark:text-amber-300 bg-amber-100/80 dark:bg-amber-900/50 px-3 py-1.5 rounded-lg inline-block">
                                                            18분 전 · KakaoBank Channel
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="p-5 hover:bg-gradient-to-r hover:from-cyan-50/70 hover:to-cyan-100/70 dark:hover:from-cyan-950/40 dark:hover:to-cyan-900/40 transition-all duration-300">
                                                <div className="flex items-start gap-4">
                                                    <div className="w-3 h-3 bg-gradient-to-r from-cyan-400 to-cyan-500 rounded-full mt-2 flex-shrink-0 shadow-lg shadow-cyan-500/30"></div>
                                                    <div className="flex-1">
                                                        <p className="text-base font-bold text-neutral-900 dark:text-white mb-2">신규 배포 완료</p>
                                                        <div className="text-sm font-semibold text-cyan-700 dark:text-cyan-300 bg-cyan-100/80 dark:bg-cyan-900/50 px-3 py-1.5 rounded-lg inline-block">
                                                            30분 전 · core-api v0.2.1
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="p-4 border-t border-neutral-200/50 dark:border-neutral-700/50 bg-gradient-to-r from-white/50 to-neutral-50/50 dark:from-neutral-900/50 dark:to-neutral-800/50">
                                            <button className="w-full py-2 px-4 text-sm font-semibold text-white bg-gradient-to-r from-emerald-500 via-cyan-500 to-blue-500 hover:from-emerald-600 hover:via-cyan-600 hover:to-blue-600 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl">
                                                모든 알림 보기
                                            </button>
                                        </div>
                                    </motion.div>
                                )}
                            </div>
                        </div>
                    </div>
                </header>

                <main className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
                    {tab === "overview" && <Overview kpis={kpis} rows={filteredRows} />}
                    {tab === "transactions" && <Transactions rows={filteredRows} />}
                    {tab === "alerts" && <Alerts />}
                </main>
            </div>
        </div>
    );
}

function NavItem({ active, children, onClick }: { active: boolean; children: React.ReactNode; onClick: () => void }) {
    return (
        <button
            onClick={onClick}
            className={[
                "h-9 px-4 rounded-lg text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500/50",
                active
                    ? "bg-neutral-900 dark:bg-white text-white dark:text-neutral-900"
                    : "text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 hover:bg-neutral-100 dark:hover:bg-neutral-800",
            ].join(" ")}
        >
            {children}
        </button>
    );
}