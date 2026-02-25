import React from 'react';

export function Input({ label, ...props }: { label?: string; } & React.InputHTMLAttributes<HTMLInputElement>) {
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

export function Select({ label, children }: { label?: string; children: React.ReactNode }) {
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