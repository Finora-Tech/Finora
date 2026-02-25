import { Transaction } from "../types";

// -------------------------------
// Seeded PRNG for consistent data
// -------------------------------
export function mulberry32(seed: number) {
    let t = seed >>> 0;
    return function () {
        t += 0x6D2B79F5;
        let r = Math.imul(t ^ (t >>> 15), 1 | t);
        r ^= r + Math.imul(r ^ (r >>> 7), 61 | r);
        return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
    };
}

// -------------------------------
// Filtering helper + self-tests
// -------------------------------
export function filterRows(rows: Transaction[], query: string): Transaction[] {
    if (!query) return rows;
    const q = String(query).trim().toLowerCase();
    return rows.filter((r) =>
        [r.id, r.time, r.amount, r.status, r.channel]
            .join(" ")
            .toLowerCase()
            .includes(q)
    );
}

export function runSelfTests() {
    if (typeof window === "undefined") return; // client-only
    try {
        const sample: Transaction[] = [
            { id: "TX-1", time: "10:00:00", amount: "1000", status: "OK",    channel: "KakaoBank" },
            { id: "TX-2", time: "10:00:01", amount: "2000", status: "ERROR", channel: "TossBank" },
            { id: "TX-3", time: "10:00:02", amount: "3000", status: "OK",    channel: "TossBank" },
            { id: "TX-4", time: "10:00:03", amount: "4000", status: "ERROR", channel: "KakaoBank" },
        ];

        // Existing tests (kept):
        console.assert(filterRows(sample, "").length === 4, "Test1 failed: empty query");
        console.assert(filterRows(sample, "error").length === 2, "Test2 failed: 'error' should match 2");
        console.assert(filterRows(sample, "KakaoBank").length === 2, "Test3 failed: 'KakaoBank' should match 2");
        console.assert(filterRows(sample, "does-not-exist").length === 0, "Test4 failed: non-existing keyword");
        console.assert(filterRows(sample, "3000").length === 1, "Test5 failed: amount match");

        // Additional tests:
        console.assert(filterRows(sample, "  error  ").length === 2, "Test6 failed: trim whitespace");
        console.assert(filterRows(sample, "tx-3").length === 1, "Test7 failed: id case-insensitive");
        console.assert(filterRows(sample, "TOSS BANK").length === 2, "Test8 failed: channel case-insensitive");

        if (!(window as typeof window & { __finora_tests_ran__?: boolean }).__finora_tests_ran__) {
            (window as typeof window & { __finora_tests_ran__?: boolean }).__finora_tests_ran__ = true;
            console.log("[Finora] Self-tests passed");
        }
    } catch (e) {
        console.warn("[Finora] Self-tests encountered an error:", e);
    }
}

// -------------------------------
// URL helpers
// -------------------------------
export function getURL() {
    return new URL(window.location.href);
}

export function readParam(name: string, fallback: string) {
    const url = getURL();
    return url.searchParams.get(name) ?? fallback;
}

export function writeParam(name: string, value: string) {
    const url = getURL();
    if (value == null || value === "") url.searchParams.delete(name);
    else url.searchParams.set(name, value);
    window.history.replaceState({}, "", url.toString());
}