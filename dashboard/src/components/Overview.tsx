'use client';

import { useMemo } from "react";
import { motion } from "framer-motion";
import { Transaction, KPI } from "../types";
import { Card } from "./ui/Card";
import { ChartPlaceholder } from "./ui/ChartPlaceholder";
import { Table } from "./ui/Table";

export function Overview({ kpis, rows }: { kpis: KPI[]; rows: Transaction[] }) {
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
                                        {IconComponent && <IconComponent size={22} className="text-white" />}
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
                <Card className="lg:col-span-2 flex flex-col">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-lg font-semibold">실시간 처리량</h2>
                        <div className="text-xs text-neutral-500">라인 차트 영역(추후 Recharts)</div>
                    </div>
                    <div className="flex-1">
                        <ChartPlaceholder />
                    </div>
                </Card>

                <Card>
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-lg font-bold text-neutral-900 dark:text-white">이벤트/알림</h2>
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-gradient-to-r from-red-400 to-red-500 rounded-full animate-pulse"></div>
                            <span className="text-xs font-medium text-neutral-500 dark:text-neutral-400">실시간</span>
                        </div>
                    </div>
                    <div className="space-y-3">
                        <div className="group p-4 rounded-2xl bg-gradient-to-r from-neutral-50 to-neutral-100/50 dark:from-neutral-800/50 dark:to-neutral-700/30 border border-neutral-200/40 dark:border-neutral-700/40 hover:bg-gradient-to-r hover:from-red-50/70 hover:to-red-100/70 dark:hover:from-red-950/40 dark:hover:to-red-900/40 transition-all duration-300">
                            <div className="flex items-start gap-4">
                                <div className="w-1 h-8 bg-gradient-to-b from-red-400 to-red-600 rounded-full mt-1 flex-shrink-0"></div>
                                <div className="flex-1">
                                    <div className="flex items-start justify-between gap-3 mb-2">
                                        <div>
                                            <div className="text-sm font-bold text-neutral-900 dark:text-white mb-1">오류율 임계치 초과</div>
                                            <div className="text-xs text-neutral-600 dark:text-neutral-400">core-api 서비스에서 0.3% 오류율 감지</div>
                                        </div>
                                        <div className="text-xs font-medium text-neutral-500 dark:text-neutral-400 whitespace-nowrap">
                                            10분 전
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <span className="text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wide">서비스</span>
                                        <span className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">core-api</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="group p-4 rounded-2xl bg-gradient-to-r from-neutral-50 to-neutral-100/50 dark:from-neutral-800/50 dark:to-neutral-700/30 border border-neutral-200/40 dark:border-neutral-700/40 hover:bg-gradient-to-r hover:from-amber-50/70 hover:to-amber-100/70 dark:hover:from-amber-950/40 dark:hover:to-amber-900/40 transition-all duration-300">
                            <div className="flex items-start gap-4">
                                <div className="w-1 h-8 bg-gradient-to-b from-amber-400 to-amber-600 rounded-full mt-1 flex-shrink-0"></div>
                                <div className="flex-1">
                                    <div className="flex items-start justify-between gap-3 mb-2">
                                        <div>
                                            <div className="text-sm font-bold text-neutral-900 dark:text-white mb-1">평균 지연 상승</div>
                                            <div className="text-xs text-neutral-600 dark:text-neutral-400">KakaoBank 채널 응답시간 280ms로 증가</div>
                                        </div>
                                        <div className="text-xs font-medium text-neutral-500 dark:text-neutral-400 whitespace-nowrap">
                                            18분 전
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <span className="text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wide">서비스</span>
                                        <span className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">payment-gateway</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="group p-4 rounded-2xl bg-gradient-to-r from-neutral-50 to-neutral-100/50 dark:from-neutral-800/50 dark:to-neutral-700/30 border border-neutral-200/40 dark:border-neutral-700/40 hover:bg-gradient-to-r hover:from-cyan-50/70 hover:to-cyan-100/70 dark:hover:from-cyan-950/40 dark:hover:to-cyan-900/40 transition-all duration-300">
                            <div className="flex items-start gap-4">
                                <div className="w-1 h-8 bg-gradient-to-b from-cyan-400 to-cyan-600 rounded-full mt-1 flex-shrink-0"></div>
                                <div className="flex-1">
                                    <div className="flex items-start justify-between gap-3 mb-2">
                                        <div>
                                            <div className="text-sm font-bold text-neutral-900 dark:text-white mb-1">신규 배포 완료</div>
                                            <div className="text-xs text-neutral-600 dark:text-neutral-400">core-api v0.2.1 배포가 성공적으로 완료됨</div>
                                        </div>
                                        <div className="text-xs font-medium text-neutral-500 dark:text-neutral-400 whitespace-nowrap">
                                            30분 전
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <span className="text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wide">서비스</span>
                                        <span className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">core-api</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
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