'use client';

import { useMemo } from "react";
import { motion } from "framer-motion";

// -------------------------------
// Seeded PRNG for consistent data
// -------------------------------
function mulberry32(seed: number) {
    let t = seed >>> 0;
    return function () {
        t += 0x6D2B79F5;
        let r = Math.imul(t ^ (t >>> 15), 1 | t);
        r ^= r + Math.imul(r ^ (r >>> 7), 61 | r);
        return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
    };
}

export function ChartPlaceholder() {
    const chartData = useMemo(() => {
        const rng = mulberry32(777); // deterministic heights
        const auroraColors = [
            "from-emerald-400/70 to-cyan-400/70",
            "from-cyan-400/70 to-blue-400/70",
            "from-blue-400/70 to-indigo-400/70",
            "from-indigo-400/70 to-violet-400/70",
            "from-violet-400/70 to-purple-400/70",
            "from-purple-400/70 to-pink-400/70"
        ];

        const now = new Date();
        return Array.from({ length: 24 }).map((_, i) => {
            const timeOffset = (23 - i) * 5; // 5분 간격
            const time = new Date(now.getTime() - timeOffset * 60000);
            const value = Math.floor(300 + rng() * 600); // 300-900 TPS 범위
            return {
                height: 20 + rng() * 80,
                delay: i * 0.05,
                gradient: auroraColors[i % auroraColors.length],
                time: time.toLocaleTimeString('ko-KR', {
                    hour: '2-digit',
                    minute: '2-digit',
                    hour12: false
                }),
                value: value,
                isLatest: i === 23
            };
        });
    }, []);

    const currentValue = chartData[chartData.length - 1]?.value || 847;

    return (
        <div className="h-auto w-full rounded-2xl bg-white/90 dark:bg-neutral-900/90 backdrop-blur-sm border border-neutral-200/60 dark:border-neutral-700/60 relative group">
            {/* Subtle background gradient */}
            <div className="absolute inset-0 bg-gradient-to-t from-neutral-50/30 via-transparent to-transparent dark:from-neutral-800/30 pointer-events-none rounded-2xl" />

            {/* Minimal floating accent */}
            <div className="absolute top-4 right-4 w-1.5 h-1.5 bg-gradient-to-r from-emerald-400 to-cyan-400 rounded-full opacity-30 animate-pulse" />

            {/* Current value indicator - positioned over latest bar */}
            <div className="absolute top-4 right-8">
                <div className="bg-white/90 dark:bg-neutral-800/90 backdrop-blur-sm border border-neutral-200/60 dark:border-neutral-700/60 rounded-lg px-3 py-1.5 shadow-lg">
                    <div className="text-xs font-medium text-neutral-500 dark:text-neutral-400 mb-0.5">현재 처리량</div>
                    <div className="text-base font-bold text-emerald-600 dark:text-emerald-400">{currentValue} TPS</div>
                </div>
            </div>

            {/* Chart container - matched to event card height */}
            <div className="pt-20 pb-4 px-4">
                <div className="h-40 flex items-end gap-1">
                    {chartData.map((bar, i) => (
                        <div key={i} className="flex-1 h-full flex flex-col justify-end">
                            <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: `${bar.height}%`, opacity: 1 }}
                                transition={{ delay: bar.delay, duration: 0.8, ease: "easeOut" }}
                                className={`w-full rounded-t-lg bg-gradient-to-t ${bar.gradient} shadow-lg relative overflow-hidden group-hover:shadow-xl transition-shadow duration-300`}
                            >
                                {/* Aurora shimmer effect */}
                                <div className="absolute inset-0 bg-gradient-to-t from-transparent via-white/30 to-white/50 animate-pulse [animation-duration:3s]" />
                                <div className={`absolute inset-0 bg-gradient-to-t from-transparent to-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
                            </motion.div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}