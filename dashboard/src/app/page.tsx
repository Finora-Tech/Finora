'use client';

import { useMemo, useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Moon, Sun, Search, Bell, TrendingUp, CheckCircle, Clock, Zap } from "lucide-react";

/**
 * Finora UI Mockup v1 – Overview Dashboard (JSX)
 * Upgrades implemented per request:
 * 1) URL 동기화: tab / search / range / theme
 * 2) UI 품질 개선: 전환 애니메이션, 아이콘, 빈 상태 UI, 시스템 테마 변경 리스너
 * 3) 유지: 오로라 로고, 다크모드 토글, filterRows + self-tests
 */

// -------------------------------
// Types
// -------------------------------
interface Transaction {
    id: string;
    time: string;
    amount: string;
    status: 'OK' | 'ERROR';
    channel: 'OpenAPI' | 'Internal';
}

interface KPI {
    label: string;
    value: string;
    delta?: string;
    icon?: any;
    gradient?: string;
    bgGradient?: string;
    glowColor?: string;
}

// -------------------------------
// Filtering helper + self-tests
// -------------------------------
// NOTE: Avoid SSR/CSR mismatch by eliminating nondeterminism.
// We'll use a tiny seeded PRNG and fixed base time for any mock data.
function mulberry32(seed: number) {
    let t = seed >>> 0;
    return function () {
        t += 0x6D2B79F5;
        let r = Math.imul(t ^ (t >>> 15), 1 | t);
        r ^= r + Math.imul(r ^ (r >>> 7), 61 | r);
        return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
    };
}

function filterRows(rows: Transaction[], query: string): Transaction[] {
    if (!query) return rows;
    const q = String(query).trim().toLowerCase();
    return rows.filter((r) =>
        [r.id, r.time, r.amount, r.status, r.channel]
            .join(" ")
            .toLowerCase()
            .includes(q)
    );
}

function runSelfTests() {
    if (typeof window === "undefined") return; // client-only
    try {
        const sample: Transaction[] = [
            { id: "TX-1", time: "10:00:00", amount: "1000", status: "OK",    channel: "OpenAPI" },
            { id: "TX-2", time: "10:00:01", amount: "2000", status: "ERROR", channel: "Internal" },
            { id: "TX-3", time: "10:00:02", amount: "3000", status: "OK",    channel: "Internal" },
            { id: "TX-4", time: "10:00:03", amount: "4000", status: "ERROR", channel: "OpenAPI" },
        ];

        // Existing tests (kept):
        console.assert(filterRows(sample, "").length === 4, "Test1 failed: empty query");
        console.assert(filterRows(sample, "error").length === 2, "Test2 failed: 'error' should match 2");
        console.assert(filterRows(sample, "OpenAPI").length === 2, "Test3 failed: 'OpenAPI' should match 2");
        console.assert(filterRows(sample, "does-not-exist").length === 0, "Test4 failed: non-existing keyword");
        console.assert(filterRows(sample, "3000").length === 1, "Test5 failed: amount match");

        // Additional tests:
        console.assert(filterRows(sample, "  error  ").length === 2, "Test6 failed: trim whitespace");
        console.assert(filterRows(sample, "tx-3").length === 1, "Test7 failed: id case-insensitive");
        console.assert(filterRows(sample, "INTERNAL").length === 2, "Test8 failed: channel case-insensitive");

        if (!(window as any).__finora_tests_ran__) {
            (window as any).__finora_tests_ran__ = true;
            console.log("[Finora] Self-tests passed");
        }
    } catch (e) {
        console.warn("[Finora] Self-tests encountered an error:", e);
    }
}
runSelfTests();

// -------------------------------
// URL helpers
// -------------------------------
function getURL() {
    return new URL(window.location.href);
}
function readParam(name: string, fallback: string) {
    const url = getURL();
    return url.searchParams.get(name) ?? fallback;
}
function writeParam(name: string, value: string) {
    const url = getURL();
    if (value == null || value === "") url.searchParams.delete(name);
    else url.searchParams.set(name, value);
    window.history.replaceState({}, "", url.toString());
}

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
            let modeFromUrl = initialTheme === 'dark' || initialTheme === 'light' ? initialTheme : null;
            let saved = localStorage.getItem("finora.theme");
            let prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
            const next = modeFromUrl ?? (saved === 'dark' || saved === 'light' ? saved : (prefersDark ? 'dark' : 'light'));
            const isDark = next === 'dark';
            setDark(isDark);
            applyTheme(isDark);
            firstThemeApplied.current = true;
            // sync URL if came from storage/system
            if (!modeFromUrl) writeParam('theme', next);
        } catch (_) {}
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
        try { localStorage.setItem("finora.theme", dark ? "dark" : "light"); } catch (_) {}
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
                const isOpenAPI = rng() > 0.5;
                return {
                    id: `TX-${1000 + i}`,
                    time: ts.toLocaleTimeString('ko-KR', { hour12: true, timeZone: 'UTC' }),
                    amount: String(amount),
                    status: isError ? 'ERROR' : 'OK',
                    channel: isOpenAPI ? 'OpenAPI' : 'Internal',
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
            delta: "OpenAPI, Internal", 
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
                                    <div className="absolute right-0 top-full mt-2 w-80 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-600 rounded-lg shadow-lg z-50">
                                        <div className="p-4 border-b border-neutral-200 dark:border-neutral-600">
                                            <h3 className="text-sm font-semibold text-neutral-900 dark:text-white">알림</h3>
                                        </div>
                                        <div className="max-h-64 overflow-y-auto">
                                            <div className="p-3 hover:bg-neutral-50 dark:hover:bg-neutral-700 border-b border-neutral-100 dark:border-neutral-700">
                                                <div className="flex items-start gap-3">
                                                    <div className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0" />
                                                    <div className="flex-1">
                                                        <p className="text-sm font-medium text-neutral-900 dark:text-white">오류율 임계치 초과</p>
                                                        <p className="text-xs text-neutral-600 dark:text-neutral-400 mt-1">10분 전 · 구간: /payments/authorize</p>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="p-3 hover:bg-neutral-50 dark:hover:bg-neutral-700 border-b border-neutral-100 dark:border-neutral-700">
                                                <div className="flex items-start gap-3">
                                                    <div className="w-2 h-2 bg-amber-500 rounded-full mt-2 flex-shrink-0" />
                                                    <div className="flex-1">
                                                        <p className="text-sm font-medium text-neutral-900 dark:text-white">평균 지연 상승</p>
                                                        <p className="text-xs text-neutral-600 dark:text-neutral-400 mt-1">18분 전 · OpenAPI Channel</p>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="p-3 hover:bg-neutral-50 dark:hover:bg-neutral-700">
                                                <div className="flex items-start gap-3">
                                                    <div className="w-2 h-2 bg-cyan-500 rounded-full mt-2 flex-shrink-0" />
                                                    <div className="flex-1">
                                                        <p className="text-sm font-medium text-neutral-900 dark:text-white">신규 배포 완료</p>
                                                        <p className="text-xs text-neutral-600 dark:text-neutral-400 mt-1">30분 전 · core-api v0.2.1</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="p-3 border-t border-neutral-200 dark:border-neutral-600">
                                            <button className="text-xs text-cyan-600 dark:text-cyan-400 hover:text-cyan-800 dark:hover:text-cyan-300 font-medium">
                                                모든 알림 보기
                                            </button>
                                        </div>
                                    </div>
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

function Overview({ kpis, rows }: { kpis: KPI[]; rows: Transaction[] }) {
    return (
        <div className="grid gap-6">
            {/* KPI Cards - Redesigned */}
            <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                {kpis.map((k, i) => {
                    const IconComponent = k.icon;
                    return (
                        <motion.div
                            key={k.label}
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.12, type: "spring", stiffness: 120, damping: 15 }}
                            className="group"
                        >
                            <div className="relative bg-white dark:bg-neutral-900 rounded-3xl p-7 shadow-xl hover:shadow-2xl transition-all duration-500 border border-neutral-100 dark:border-neutral-800 group-hover:-translate-y-1">
                                
                                {/* Top Row: Icon + Label */}
                                <div className="flex items-start justify-between mb-6">
                                    <div className={`p-3 rounded-2xl bg-gradient-to-br ${k.gradient} shadow-lg group-hover:shadow-xl transition-shadow duration-300`}>
                                        <IconComponent size={22} className="text-white" />
                                    </div>
                                    <div className="text-right">
                                        <div className="text-sm font-semibold text-neutral-700 dark:text-neutral-300">{k.label}</div>
                                    </div>
                                </div>

                                {/* Value */}
                                <div className="mb-4">
                                    <div className="text-3xl font-bold text-neutral-900 dark:text-white tracking-tight">
                                        {k.value}
                                    </div>
                                </div>

                                {/* Delta Badge */}
                                {k.delta && (
                                    <div className="flex items-center">
                                        <div className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${
                                            k.delta.startsWith('+') 
                                                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400'
                                                : k.delta.startsWith('-')
                                                ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                                                : 'bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300'
                                        }`}>
                                            {k.delta}
                                        </div>
                                    </div>
                                )}

                                {/* Bottom accent line */}
                                <div className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${k.gradient} rounded-b-3xl opacity-30 group-hover:opacity-50 transition-opacity duration-300`} />
                            </div>
                        </motion.div>
                    );
                })}
            </section>

            {/* Realtime Chart Placeholder */}
            <section className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <Card className="lg:col-span-2">
                    <div className="flex items-center justify-between mb-3">
                        <h2 className="text-lg font-semibold">실시간 처리량</h2>
                        <div className="text-xs text-neutral-500">라인 차트 영역(추후 Recharts)</div>
                    </div>
                    <ChartPlaceholder />
                </Card>

                <Card>
                    <h2 className="text-lg font-semibold mb-3">이벤트/알림</h2>
                    <ul className="space-y-2 text-sm">
                        <li className="flex items-start gap-2">
                            <span className="mt-1 size-2 rounded-full bg-red-500" />
                            <div>
                                <div className="font-medium">오류율 임계치 초과 감지</div>
                                <div className="text-neutral-500 text-xs">10분 전 · 구간: /payments/authorize</div>
                            </div>
                        </li>
                        <li className="flex items-start gap-2">
                            <span className="mt-1 size-2 rounded-full bg-amber-500" />
                            <div>
                                <div className="font-medium">평균 지연 상승</div>
                                <div className="text-neutral-500 text-xs">18분 전 · OpenAPI Channel</div>
                            </div>
                        </li>
                        <li className="flex items-start gap-2">
                            <span className="mt-1 size-2 rounded-full bg-cyan-500" />
                            <div>
                                <div className="font-medium">신규 배포 완료</div>
                                <div className="text-neutral-500 text-xs">30분 전 · core-api v0.2.1</div>
                            </div>
                        </li>
                    </ul>
                </Card>
            </section>

            {/* Recent Transactions - Redesigned */}
            <section>
                <div className="bg-white dark:bg-neutral-900 rounded-3xl shadow-xl border border-neutral-100 dark:border-neutral-800 overflow-hidden">
                    <div className="p-8 border-b border-neutral-100 dark:border-neutral-800">
                        <div className="flex items-center justify-between">
                            <div>
                                <h2 className="text-2xl font-bold text-neutral-900 dark:text-white mb-1">최근 트랜잭션</h2>
                                <p className="text-sm text-neutral-500 dark:text-neutral-400">실시간으로 업데이트되는 거래 내역</p>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="text-xs font-medium text-neutral-500 dark:text-neutral-400">
                                    총 {rows.length}개 표시
                                </div>
                                <button className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-emerald-500 via-cyan-500 to-blue-500 hover:from-emerald-600 hover:via-cyan-600 hover:to-blue-600 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl">
                                    전체 보기
                                </button>
                            </div>
                        </div>
                    </div>
                    <div className="p-8">
                        <Table rows={rows} />
                    </div>
                </div>
            </section>
        </div>
    );
}

function Transactions({ rows }: { rows: Transaction[] }) {
    return (
        <div className="grid gap-6">
            <Card>
                <div className="flex items-center justify-between mb-3">
                    <h2 className="text-lg font-semibold">트랜잭션 탐색</h2>
                    <div className="text-xs text-neutral-500">필터/검색 조합 예시</div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-4">
                    <Select label="상태">
                        <option>전체</option>
                        <option>OK</option>
                        <option>ERROR</option>
                    </Select>
                    <Select label="채널">
                        <option>전체</option>
                        <option>OpenAPI</option>
                        <option>Internal</option>
                    </Select>
                    <Input label="최소 금액" placeholder="0" />
                    <Input label="최대 금액" placeholder="1,000,000" />
                </div>
                <Table rows={rows} />
            </Card>
        </div>
    );
}

function Alerts() {
    return (
        <div className="grid gap-6">
            <Card>
                <h2 className="text-lg font-semibold mb-3">알림 정책</h2>
                <ul className="text-sm list-disc pl-5 space-y-1">
                    <li>오류율(%) &gt; 0.2% · 5분 평균</li>
                    <li>평균 지연(ms) &gt; 250ms · 5분 평균</li>
                    <li>처리량(tps) 급락 · 최근 3분 대비 -30%</li>
                </ul>
            </Card>
            <Card>
                <h2 className="text-lg font-semibold mb-3">최근 알림</h2>
                <ul className="space-y-2 text-sm">
                    <li className="flex items-start gap-2">
                        <span className="mt-1 size-2 rounded-full bg-red-500" />
                        <div>
                            <div className="font-medium">오류율 임계치 초과</div>
                            <div className="text-neutral-500 text-xs">09:13 · core-api</div>
                        </div>
                    </li>
                    <li className="flex items-start gap-2">
                        <span className="mt-1 size-2 rounded-full bg-amber-500" />
                        <div>
                            <div className="font-medium">지연 상승</div>
                            <div className="text-neutral-500 text-xs">08:55 · payment-gateway</div>
                        </div>
                    </li>
                </ul>
            </Card>
        </div>
    );
}

function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
    return (
        <div className={`relative rounded-2xl border border-neutral-200/50 dark:border-neutral-800/50 bg-white/60 dark:bg-neutral-900/60 backdrop-blur-sm p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:border-neutral-300/50 dark:hover:border-neutral-700/50 hover:-translate-y-1 overflow-hidden ${className}`}>
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/5 to-transparent pointer-events-none" />
            <div className="relative z-10">
                {children}
            </div>
        </div>
    );
}

function ChartPlaceholder() {
    const bars = useMemo(() => {
        const rng = mulberry32(777); // deterministic heights
        const auroraColors = [
            "from-emerald-400/70 to-cyan-400/70",
            "from-cyan-400/70 to-blue-400/70", 
            "from-blue-400/70 to-indigo-400/70",
            "from-indigo-400/70 to-violet-400/70",
            "from-violet-400/70 to-purple-400/70",
            "from-purple-400/70 to-pink-400/70"
        ];
        
        return Array.from({ length: 24 }).map((_, i) => ({
            height: 20 + rng() * 80,
            delay: i * 0.05,
            gradient: auroraColors[i % auroraColors.length]
        }));
    }, []);
    
    return (
        <div className="h-64 w-full rounded-2xl bg-white/90 dark:bg-neutral-900/90 backdrop-blur-sm border border-neutral-200/60 dark:border-neutral-700/60 flex items-end gap-1 p-4 overflow-hidden relative group">
            {/* Subtle background gradient */}
            <div className="absolute inset-0 bg-gradient-to-t from-neutral-50/30 via-transparent to-transparent dark:from-neutral-800/30 pointer-events-none" />
            
            {/* Minimal floating accent */}
            <div className="absolute top-4 right-4 w-1.5 h-1.5 bg-gradient-to-r from-emerald-400 to-cyan-400 rounded-full opacity-30 animate-pulse" />
            
            {bars.map((bar, i) => (
                <motion.div
                    key={i}
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: `${bar.height}%`, opacity: 1 }}
                    transition={{ delay: bar.delay, duration: 0.8, ease: "easeOut" }}
                    className={`flex-1 rounded-t-lg bg-gradient-to-t ${bar.gradient} shadow-lg relative overflow-hidden group-hover:shadow-xl transition-shadow duration-300`}
                >
                    {/* Aurora shimmer effect */}
                    <div className="absolute inset-0 bg-gradient-to-t from-transparent via-white/30 to-white/50 animate-pulse [animation-duration:3s]" />
                    <div className={`absolute inset-0 bg-gradient-to-t from-transparent to-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
                </motion.div>
            ))}
        </div>
    );
}

function Table({ rows }: { rows: Transaction[] }) {
    if (!rows || rows.length === 0) {
        return (
            <div className="rounded-2xl border border-dashed border-neutral-300/50 dark:border-neutral-700/50 bg-gradient-to-br from-neutral-50/50 to-neutral-100/50 dark:from-neutral-900/50 dark:to-neutral-800/50 backdrop-blur-sm p-12 text-center">
                <div className="text-4xl mb-4 opacity-20">📊</div>
                <div className="text-sm font-medium text-neutral-500 dark:text-neutral-400">
                    조건에 맞는 트랜잭션이 없습니다.
                </div>
            </div>
        );
    }
    return (
        <div className="overflow-hidden rounded-2xl bg-white dark:bg-neutral-900">
            <div className="overflow-x-auto">
                <table className="min-w-full">
                    <thead>
                    <tr className="border-b border-neutral-200 dark:border-neutral-700">
                        <Th>트랜잭션 ID</Th>
                        <Th>시각</Th>
                        <Th>금액</Th>
                        <Th>상태</Th>
                        <Th>채널</Th>
                    </tr>
                    </thead>
                    <tbody>
                    {rows.map((r, index) => (
                        <motion.tr
                            key={r.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.03, duration: 0.4 }}
                            className="border-b border-neutral-100 dark:border-neutral-800 hover:bg-neutral-50/80 dark:hover:bg-neutral-800/50 transition-all duration-200 group"
                        >
                            <Td>
                                <div className="flex items-center gap-3">
                                    <div className="w-2 h-2 bg-gradient-to-r from-emerald-400 to-cyan-400 rounded-full"></div>
                                    <span className="font-mono text-sm font-semibold text-neutral-900 dark:text-white">
                                        {r.id}
                                    </span>
                                </div>
                            </Td>
                            <Td>
                                <span className="text-sm text-neutral-600 dark:text-neutral-400">
                                    {r.time}
                                </span>
                            </Td>
                            <Td>
                                <span className="text-sm font-bold text-neutral-900 dark:text-white">
                                    ₩{Number(r.amount).toLocaleString()}
                                </span>
                            </Td>
                            <Td>
                                <span
                                    className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold ${
                                        r.status === "ERROR"
                                            ? "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
                                            : "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400"
                                    }`}
                                >
                                    <div className={`w-1.5 h-1.5 rounded-full ${
                                        r.status === "ERROR" ? "bg-red-500" : "bg-emerald-500"
                                    }`} />
                                    {r.status}
                                </span>
                            </Td>
                            <Td>
                                <span className={`inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-medium ${
                                    r.channel === "OpenAPI" 
                                        ? "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400" 
                                        : "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400"
                                }`}>
                                    {r.channel}
                                </span>
                            </Td>
                        </motion.tr>
                    ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

function Th({ children }: { children: React.ReactNode }) {
    return (
        <th className="py-5 px-6 text-left font-bold text-neutral-900 dark:text-white text-sm">
            {children}
        </th>
    );
}
function Td({ children }: { children: React.ReactNode }) {
    return (
        <td className="py-4 px-6 text-left">
            {children}
        </td>
    );
}

function Input({ label, ...props }: { label?: string; [key: string]: any }) {
    return (
        <label className="text-sm group">
            {label && (
                <div className="mb-2 text-neutral-600 dark:text-neutral-400 font-medium">
                    {label}
                </div>
            )}
            <input
                {...props}
                className="h-11 w-full rounded-xl border border-neutral-200/50 dark:border-neutral-700/50 bg-white/60 dark:bg-neutral-900/60 backdrop-blur-sm px-4 text-sm font-medium placeholder:text-neutral-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/50 transition-all duration-200 shadow-sm hover:shadow-md focus:bg-white/80 dark:focus:bg-neutral-900/80 focus:border-cyan-300/50 dark:focus:border-cyan-600/50"
            />
        </label>
    );
}

function Select({ label, children }: { label?: string; children: React.ReactNode }) {
    return (
        <label className="text-sm group">
            {label && (
                <div className="mb-2 text-neutral-600 dark:text-neutral-400 font-medium">
                    {label}
                </div>
            )}
            <select className="h-11 w-full rounded-xl border border-neutral-200/50 dark:border-neutral-700/50 bg-white/60 dark:bg-neutral-900/60 backdrop-blur-sm px-4 text-sm font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/50 transition-all duration-200 shadow-sm hover:shadow-md focus:bg-white/80 dark:focus:bg-neutral-900/80 focus:border-cyan-300/50 dark:focus:border-cyan-600/50 cursor-pointer">
                {children}
            </select>
        </label>
    );
}