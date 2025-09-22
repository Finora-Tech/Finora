import { ComponentType } from 'react';

export interface Transaction {
    id: string;
    time: string;
    amount: string;
    status: 'OK' | 'ERROR';
    channel: 'KakaoBank' | 'TossBank';
}

export interface KPI {
    label: string;
    value: string;
    delta?: string;
    icon?: ComponentType<{ size?: number; className?: string }>;
    gradient?: string;
    bgGradient?: string;
    glowColor?: string;
}