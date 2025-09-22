'use client';

import { useState } from 'react';
import { motion } from "framer-motion";
import { Card } from "./ui/Card";

export function Alerts() {
    const [filter, setFilter] = useState('all'); // 'all', 'unread', 'critical'

    const alerts = [
        {
            id: 1,
            type: 'critical',
            title: '오류율 임계치 초과',
            description: 'core-api 서비스에서 0.3% 오류율 감지',
            time: '10분 전',
            service: 'core-api',
            status: 'unread',
            severity: 'high',
            action: 'investigate'
        },
        {
            id: 2,
            type: 'warning',
            title: '평균 지연 상승',
            description: 'KakaoBank 채널 응답시간 280ms로 증가',
            time: '18분 전',
            service: 'payment-gateway',
            status: 'unread',
            severity: 'medium',
            action: 'monitor'
        },
        {
            id: 3,
            type: 'info',
            title: '신규 배포 완료',
            description: 'core-api v0.2.1 배포가 성공적으로 완료됨',
            time: '30분 전',
            service: 'core-api',
            status: 'read',
            severity: 'low',
            action: 'verify'
        },
        {
            id: 4,
            type: 'warning',
            title: '처리량 급락',
            description: '최근 3분 대비 35% 감소 감지',
            time: '45분 전',
            service: 'transaction-processor',
            status: 'read',
            severity: 'medium',
            action: 'analyze'
        },
        {
            id: 5,
            type: 'critical',
            title: '연결 실패',
            description: '외부 API 연결이 5회 연속 실패',
            time: '1시간 전',
            service: 'external-gateway',
            status: 'acknowledged',
            severity: 'high',
            action: 'retry'
        }
    ];

    const filteredAlerts = alerts.filter(alert => {
        if (filter === 'unread') return alert.status === 'unread';
        if (filter === 'critical') return alert.severity === 'high';
        return true;
    });

    const getSeverityColor = (severity: string) => {
        if (severity === 'high') return 'from-red-50/80 to-red-100/80 dark:from-red-950/50 dark:to-red-900/50 border-red-200/60 dark:border-red-800/60';
        if (severity === 'medium') return 'from-amber-50/80 to-amber-100/80 dark:from-amber-950/50 dark:to-amber-900/50 border-amber-200/60 dark:border-amber-800/60';
        return 'from-cyan-50/80 to-cyan-100/80 dark:from-cyan-950/50 dark:to-cyan-900/50 border-cyan-200/60 dark:border-cyan-800/60';
    };

    return (
        <div className="space-y-8">
            {/* Header with Filters - Slack/GitHub style */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-neutral-900 dark:text-white mb-2">알림 센터</h1>
                    <p className="text-neutral-600 dark:text-neutral-400">시스템 이벤트와 알림을 관리하세요</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 bg-white dark:bg-neutral-800 rounded-xl p-1 border border-neutral-200 dark:border-neutral-700">
                        <button
                            onClick={() => setFilter('all')}
                            className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${
                                filter === 'all'
                                    ? 'bg-neutral-900 dark:bg-white text-white dark:text-neutral-900'
                                    : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100'
                            }`}
                        >
                            전체 ({alerts.length})
                        </button>
                        <button
                            onClick={() => setFilter('unread')}
                            className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${
                                filter === 'unread'
                                    ? 'bg-neutral-900 dark:bg-white text-white dark:text-neutral-900'
                                    : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100'
                            }`}
                        >
                            읽지 않음 ({alerts.filter(a => a.status === 'unread').length})
                        </button>
                        <button
                            onClick={() => setFilter('critical')}
                            className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${
                                filter === 'critical'
                                    ? 'bg-neutral-900 dark:bg-white text-white dark:text-neutral-900'
                                    : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100'
                            }`}
                        >
                            긴급 ({alerts.filter(a => a.severity === 'high').length})
                        </button>
                    </div>
                    <button className="px-4 py-2 text-sm font-semibold text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 border border-neutral-200 dark:border-neutral-700 rounded-xl hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-all">
                        모두 읽음으로 표시
                    </button>
                </div>
            </div>

            {/* Alert List - GitHub notification style */}
            <Card className="p-0 overflow-hidden">
                <div className="divide-y divide-neutral-100 dark:divide-neutral-800">
                    {filteredAlerts.map((alert, index) => (
                        <motion.div
                            key={alert.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className={`p-6 hover:bg-gradient-to-r ${getSeverityColor(alert.severity)} transition-all duration-300 group ${
                                alert.status === 'unread' ? 'bg-gradient-to-r from-blue-50/30 to-indigo-50/30 dark:from-blue-950/20 dark:to-indigo-950/20' : ''
                            }`}
                        >
                            <div className="flex items-start gap-6">
                                {/* Minimal severity indicator */}
                                <div className="flex-shrink-0 mt-2">
                                    <div className={`w-1 h-12 rounded-full ${
                                        alert.severity === 'high' ? 'bg-gradient-to-b from-red-400 to-red-600' :
                                        alert.severity === 'medium' ? 'bg-gradient-to-b from-amber-400 to-amber-600' :
                                        'bg-gradient-to-b from-cyan-400 to-cyan-600'
                                    }`}></div>
                                </div>

                                {/* Content */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-start justify-between gap-4 mb-4">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3 mb-2">
                                                <h3 className="text-lg font-bold text-neutral-900 dark:text-white">
                                                    {alert.title}
                                                </h3>
                                                {alert.status === 'unread' && (
                                                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                                                )}
                                                {alert.status === 'acknowledged' && (
                                                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                                )}
                                            </div>
                                            <p className="text-base text-neutral-600 dark:text-neutral-400 mb-3 leading-relaxed">
                                                {alert.description}
                                            </p>
                                        </div>
                                        <div className="text-sm font-medium text-neutral-500 dark:text-neutral-400 whitespace-nowrap">
                                            {alert.time}
                                        </div>
                                    </div>

                                    {/* Tags and Actions */}
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            <div className="flex items-center gap-2">
                                                <span className="text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wide">
                                                    서비스
                                                </span>
                                                <span className="text-sm font-semibold text-neutral-700 dark:text-neutral-300">
                                                    {alert.service}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className="text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wide">
                                                    우선순위
                                                </span>
                                                <span className={`text-sm font-semibold ${
                                                    alert.severity === 'high' ? 'text-red-600 dark:text-red-400' :
                                                    alert.severity === 'medium' ? 'text-amber-600 dark:text-amber-400' :
                                                    'text-cyan-600 dark:text-cyan-400'
                                                }`}>
                                                    {alert.severity === 'high' ? '긴급' : alert.severity === 'medium' ? '경고' : '정보'}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Action Buttons */}
                                        <div className="flex items-center gap-3">
                                            <button className="px-4 py-2 text-sm font-semibold bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700 hover:text-neutral-900 dark:hover:text-neutral-100 rounded-lg transition-all duration-200">
                                                {alert.action === 'investigate' ? '조사하기' :
                                                 alert.action === 'monitor' ? '모니터링' :
                                                 alert.action === 'verify' ? '확인하기' :
                                                 alert.action === 'analyze' ? '분석하기' : '재시도'}
                                            </button>
                                            <button className="px-3 py-2 text-sm font-medium text-neutral-500 dark:text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800 rounded-lg transition-all duration-200">
                                                무시
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </Card>

            {/* Alert Rules - Simplified */}
            <Card>
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold text-neutral-900 dark:text-white">알림 규칙</h2>
                    <button className="px-4 py-2 text-sm font-semibold text-white bg-gradient-to-r from-emerald-500 via-cyan-500 to-blue-500 hover:from-emerald-600 hover:via-cyan-600 hover:to-blue-600 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl">
                        규칙 추가
                    </button>
                </div>
                <div className="space-y-3">
                    <div className="flex items-center justify-between p-5 bg-gradient-to-r from-neutral-50 to-neutral-100/50 dark:from-neutral-800/50 dark:to-neutral-700/30 rounded-2xl border border-neutral-200/40 dark:border-neutral-700/40">
                        <div className="flex items-center gap-4">
                            <div className="w-1 h-6 bg-gradient-to-b from-red-400 to-red-600 rounded-full"></div>
                            <div>
                                <span className="font-bold text-neutral-900 dark:text-white">오류율 임계치</span>
                                <div className="text-sm text-neutral-600 dark:text-neutral-400 mt-1">
                                    0.2% 초과 시 · 5분 평균 기준
                                </div>
                            </div>
                        </div>
                        <div className="text-xs font-semibold text-green-700 dark:text-green-400">활성</div>
                    </div>
                    <div className="flex items-center justify-between p-5 bg-gradient-to-r from-neutral-50 to-neutral-100/50 dark:from-neutral-800/50 dark:to-neutral-700/30 rounded-2xl border border-neutral-200/40 dark:border-neutral-700/40">
                        <div className="flex items-center gap-4">
                            <div className="w-1 h-6 bg-gradient-to-b from-amber-400 to-amber-600 rounded-full"></div>
                            <div>
                                <span className="font-bold text-neutral-900 dark:text-white">지연시간 임계치</span>
                                <div className="text-sm text-neutral-600 dark:text-neutral-400 mt-1">
                                    250ms 초과 시 · 5분 평균 기준
                                </div>
                            </div>
                        </div>
                        <div className="text-xs font-semibold text-green-700 dark:text-green-400">활성</div>
                    </div>
                    <div className="flex items-center justify-between p-5 bg-gradient-to-r from-neutral-50 to-neutral-100/50 dark:from-neutral-800/50 dark:to-neutral-700/30 rounded-2xl border border-neutral-200/40 dark:border-neutral-700/40">
                        <div className="flex items-center gap-4">
                            <div className="w-1 h-6 bg-gradient-to-b from-orange-400 to-orange-600 rounded-full"></div>
                            <div>
                                <span className="font-bold text-neutral-900 dark:text-white">처리량 급락 감지</span>
                                <div className="text-sm text-neutral-600 dark:text-neutral-400 mt-1">
                                    30% 이상 감소 시 · 3분 대비
                                </div>
                            </div>
                        </div>
                        <div className="text-xs font-semibold text-green-700 dark:text-green-400">활성</div>
                    </div>
                </div>
            </Card>
        </div>
    );
}