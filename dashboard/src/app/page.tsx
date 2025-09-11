'use client';

import { useMemo, useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Moon, Sun, Search, Bell } from "lucide-react";

/**
 * Finora UI Mockup v1 – Overview Dashboard (JSX)
 * Upgrades implemented per request:
 * 1) URL 동기화: tab / search / range / theme
 * 2) UI 품질 개선: 전환 애니메이션, 아이콘, 빈 상태 UI, 시스템 테마 변경 리스너
 * 3) 유지: 오로라 로고, 다크모드 토글, filterRows + self-tests
 */

// -------------------------------
// Filtering helper + self-tests
// -------------------------------
function filterRows(rows, query) {
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
        const sample = [
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

        if (!window.__finora_tests_ran__) {
            window.__finora_tests_ran__ = true;
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
function readParam(name, fallback) {
    const url = getURL();
    return url.searchParams.get(name) ?? fallback;
}
function writeParam(name, value) {
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

    const firstThemeApplied = useRef(false);

    // Apply theme to <html> and meta theme-color
    const applyTheme = (isDark) => {
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
        const handler = (e) => {
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

    const kpis = useMemo(
        () => [
            { label: "오늘 거래건수", value: "12,840", delta: "+3.2%" },
            { label: "체결 지연(ms)", value: "182", delta: "-5.4%" },
            { label: "오류율(%)", value: "0.08", delta: "-0.01%" },
            { label: "평균 처리량(tps)", value: "1,240", delta: "+1.1%" },
        ],
        []
    );

    const txRows = useMemo(
        () =>
            Array.from({ length: 12 }).map((_, i) => ({
                id: `TX-${1000 + i}`,
                time: new Date(Date.now() - i * 1000 * 41).toLocaleTimeString(),
                amount: (Math.random() * 1000000).toFixed(0),
                status: Math.random() > 0.95 ? "ERROR" : "OK",
                channel: Math.random() > 0.5 ? "OpenAPI" : "Internal",
            })),
        []
    );

    const filteredRows = useMemo(() => filterRows(txRows, search), [txRows, search]);

    return (
        <div className={dark ? "dark" : ""}>
            <div className="min-h-screen bg-neutral-50 text-neutral-900 dark:bg-neutral-950 dark:text-neutral-100 transition-colors duration-300 motion-reduce:transition-none">
                {/* Top App Bar */}
                <header className="sticky top-0 z-20 border-b border-neutral-200/60 dark:border-neutral-800 bg-white/60 dark:bg-neutral-950/60 backdrop-blur supports-[backdrop-filter]:bg-white/60">
                    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-16 flex items-center gap-4">
                        <div className="flex items-center gap-3">
                            {/* Aurora logo */}
                            <div className="size-8 rounded-xl bg-gradient-to-tr from-emerald-400 via-cyan-400 to-violet-500 shadow-sm ring-1 ring-white/50 dark:ring-white/10" />
                            {/* Wordmark */}
                            <div className="font-bold text-lg tracking-tight">Finora</div>
                            <div className="hidden sm:block text-sm text-neutral-500">Finance Meets Aurora</div>
                        </div>

                        <nav className="ml-6 hidden md:flex items-center gap-4">
                            <NavItem active={tab === "overview"} onClick={() => setTab("overview")}>
                                Overview
                            </NavItem>
                            <NavItem active={tab === "transactions"} onClick={() => setTab("transactions")}>
                                Transactions
                            </NavItem>
                            <NavItem active={tab === "alerts"} onClick={() => setTab("alerts")}>
                                Alerts
                            </NavItem>
                        </nav>

                        <div className="ml-auto flex items-center gap-2">
                            <select
                                className="h-9 rounded-lg border border-neutral-300 dark:border-neutral-800 bg-white dark:bg-neutral-900 px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400"
                                value={range}
                                onChange={(e) => setRange(e.target.value)}
                            >
                                <option value="today">오늘</option>
                                <option value="24h">최근 24시간</option>
                                <option value="7d">최근 7일</option>
                                <option value="30d">최근 30일</option>
                            </select>

                            <div className="relative">
                                <Search className="absolute left-2 top-1/2 -translate-y-1/2" size={16} />
                                <input
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    placeholder="검색: TX ID, 상태, 채널 등"
                                    className="h-9 w-56 pl-7 rounded-lg border border-neutral-300 dark:border-neutral-800 bg-white dark:bg-neutral-900 px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400"
                                />
                            </div>

                            <button
                                onClick={() => setDark((d) => !d)}
                                aria-pressed={dark}
                                title={dark ? "라이트 모드로" : "다크 모드로"}
                                className="h-9 px-3 inline-flex items-center gap-1.5 rounded-lg border border-neutral-300 dark:border-neutral-800 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400"
                            >
                                {dark ? <Sun size={16} /> : <Moon size={16} />}
                                <span className="hidden sm:inline">{dark ? "라이트" : "다크"}</span>
                            </button>

                            <button
                                className="h-9 w-9 inline-flex items-center justify-center rounded-lg border border-neutral-300 dark:border-neutral-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400"
                                title="알림"
                            >
                                <Bell size={16} />
                            </button>
                        </div>
                    </div>
                </header>

                <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
                    {tab === "overview" && <Overview kpis={kpis} rows={filteredRows} />}
                    {tab === "transactions" && <Transactions rows={filteredRows} />}
                    {tab === "alerts" && <Alerts />}
                </main>
            </div>
        </div>
    );
}

function NavItem({ active, children, onClick }) {
    return (
        <button
            onClick={onClick}
            className={[
                "h-9 px-3 rounded-lg text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400",
                active
                    ? "bg-neutral-900 text-white dark:bg-white dark:text-neutral-900"
                    : "hover:bg-neutral-100 dark:hover:bg-neutral-900",
            ].join(" ")}
        >
            {children}
        </button>
    );
}

function Overview({ kpis, rows }) {
    return (
        <div className="grid gap-6">
            {/* KPI Cards */}
            <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {kpis.map((k, i) => (
                    <motion.div
                        key={k.label}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.05 }}
                    >
                        <Card>
                            <div className="text-sm text-neutral-500 dark:text-neutral-400">{k.label}</div>
                            <div className="text-3xl font-bold mt-1">{k.value}</div>
                            {k.delta ? (
                                <div className="text-xs mt-1 text-neutral-500 dark:text-neutral-400">{k.delta}</div>
                            ) : null}
                        </Card>
                    </motion.div>
                ))}
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

            {/* Recent Transactions */}
            <section>
                <Card>
                    <div className="flex items-center justify-between mb-3">
                        <h2 className="text-lg font-semibold">최근 트랜잭션</h2>
                        <div className="text-xs text-neutral-500">테이블 영역(추후 TanStack Table)</div>
                    </div>
                    <Table rows={rows} />
                </Card>
            </section>
        </div>
    );
}

function Transactions({ rows }) {
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
                            <div className="text-neutral-500 text-xs">08:57 · search-api</div>
                        </div>
                    </li>
                </ul>
            </Card>
        </div>
    );
}

function Card({ children, className = "" }) {
    return (
        <div className={"rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-4 " + className}>
            {children}
        </div>
    );
}

function ChartPlaceholder() {
    return (
        <div className="h-64 w-full rounded-xl bg-neutral-100 dark:bg-neutral-800 grid grid-cols-12 items-end gap-1 p-3">
            {Array.from({ length: 40 }).map((_, i) => (
                <div
                    key={i}
                    className="rounded-t bg-neutral-300/80 dark:bg-neutral-700"
                    style={{ height: `${20 + Math.random() * 80}%` }}
                />
            ))}
        </div>
    );
}

function Table({ rows }) {
    if (!rows || rows.length === 0) {
        return (
            <div className="rounded-xl border border-dashed border-neutral-300 dark:border-neutral-800 p-10 text-center text-sm text-neutral-500">
                조건에 맞는 트랜잭션이 없습니다.
            </div>
        );
    }
    return (
        <div className="overflow-x-auto rounded-xl border border-neutral-200 dark:border-neutral-800">
            <table className="min-w-full text-sm">
                <thead className="bg-neutral-50 dark:bg-neutral-950/40 text-left">
                <tr className="border-b border-neutral-200 dark:border-neutral-800">
                    <Th>TX ID</Th>
                    <Th>시각</Th>
                    <Th>금액</Th>
                    <Th>상태</Th>
                    <Th>채널</Th>
                </tr>
                </thead>
                <tbody>
                {rows.map((r) => (
                    <tr
                        key={r.id}
                        className="border-b last:border-0 border-neutral-200 dark:border-neutral-800 hover:bg-neutral-50/60 dark:hover:bg-neutral-900/40"
                    >
                        <Td>{r.id}</Td>
                        <Td>{r.time}</Td>
                        <Td>{Number(r.amount).toLocaleString()}</Td>
                        <Td>
                <span
                    className={
                        "inline-flex items-center gap-2 px-2 py-0.5 rounded-lg text-xs " +
                        (r.status === "ERROR"
                            ? "bg-red-500/10 text-red-600 dark:text-red-400"
                            : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400")
                    }
                >
                  <span className="inline-block size-1.5 rounded-full bg-current" /> {r.status}
                </span>
                        </Td>
                        <Td>{r.channel}</Td>
                    </tr>
                ))}
                </tbody>
            </table>
        </div>
    );
}

function Th({ children }) {
    return <th className="py-2.5 px-3 font-medium text-neutral-600 dark:text-neutral-300">{children}</th>;
}
function Td({ children }) {
    return <td className="py-2.5 px-3 text-neutral-800 dark:text-neutral-200">{children}</td>;
}

function Input({ label, ...props }) {
    return (
        <label className="text-sm">
            {label ? <div className="mb-1 text-neutral-500 dark:text-neutral-400">{label}</div> : null}
            <input
                {...props}
                className="h-9 w-full rounded-lg border border-neutral-300 dark:border-neutral-800 bg-white dark:bg-neutral-900 px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400"
            />
        </label>
    );
}

function Select({ label, children }) {
    return (
        <label className="text-sm">
            {label ? <div className="mb-1 text-neutral-500 dark:text-neutral-400">{label}</div> : null}
            <select className="h-9 w-full rounded-lg border border-neutral-300 dark:border-neutral-800 bg-white dark:bg-neutral-900 px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400">
                {children}
            </select>
        </label>
    );
}