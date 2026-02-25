import React from 'react';

export function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
    return (
        <div className={`relative rounded-2xl border border-neutral-200/50 dark:border-neutral-800/50 bg-white/60 dark:bg-neutral-900/60 backdrop-blur-sm p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:border-neutral-300/50 dark:hover:border-neutral-700/50 hover:-translate-y-1 overflow-hidden ${className}`}>
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/5 to-transparent pointer-events-none" />
            <div className="relative z-10">
                {children}
            </div>
        </div>
    );
}