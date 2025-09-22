'use client';

import React from 'react';
import { motion } from "framer-motion";
import { Transaction } from "../../types";

export function Table({ rows }: { rows: Transaction[] }) {
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
                                    r.channel === "KakaoBank"
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