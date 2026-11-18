/** Summary statistics of a set of metric values (one batch, or an accumulated rollup row). */
export interface RollupStats {
    count: number;
    p50: number;
    p75: number;
    p90: number;
    min: number;
    max: number;
}

/** Computes the summary of one batch of raw values. `values` must not be empty. */
export function summarizeValues(values: number[]): RollupStats {
    const sorted = [...values].sort((a, b) => a - b);
    const count = sorted.length;
    const at = (pct: number) => sorted[Math.floor(count * pct)] ?? sorted[count - 1];
    return { count, p50: at(0.5), p75: at(0.75), p90: at(0.9), min: sorted[0], max: sorted[count - 1] };
}

/**
 * Folds a new batch into an existing rollup row.
 *
 * - `count` is the exact total, and `min` / `max` are exact (the smaller minimum / larger maximum).
 * - Percentiles cannot be recovered exactly from summaries (that would need the raw values), so
 *   they are the count-weighted average of the stored percentile and the batch's percentile. This
 *   is an approximation, but a stable one: a later small batch no longer overwrites everything
 *   that came before it (the bug this replaces set p50/p75/p90/min/max to the latest batch's values).
 */
export function mergeRollupStats(existing: RollupStats, batch: RollupStats): RollupStats {
    if (existing.count <= 0) return batch;
    if (batch.count <= 0) return existing;
    const count = existing.count + batch.count;
    const blend = (stored: number, incoming: number) => (stored * existing.count + incoming * batch.count) / count;
    return {
        count,
        p50: blend(existing.p50, batch.p50),
        p75: blend(existing.p75, batch.p75),
        p90: blend(existing.p90, batch.p90),
        min: Math.min(existing.min, batch.min),
        max: Math.max(existing.max, batch.max),
    };
}
