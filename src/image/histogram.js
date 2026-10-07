/**
 * Histogram utilities.
 */

/**
 * Percentage of a histogram that falls in one interval.
 *
 * @typedef {object} HistogramIntervalPercentage
 * @property {string} name Interval name.
 * @property {number} percentage Percentage of total counts in [0, 100].
 */

/**
 * Per-volume histogram (e.g. from {@link MaskImage#getHistogramBySegment}).
 *
 * @typedef {object} VolumeHistogram
 * @property {number} volume Volume index.
 * @property {number[]} histogram Sparse/dense counts indexed by intensity.
 */

/**
 * Per-volume interval percentages.
 *
 * @typedef {object} VolumeHistogramIntervalPercentages
 * @property {number} volume Volume index.
 * @property {HistogramIntervalPercentage[]} intervals Percentages in
 *   input order.
 */

/**
 * Sum counts for intensities in the semi-open range [min, max).
 *
 * @param {number[]} histogram Intensity-indexed counts.
 * @param {number} min Inclusive lower bound.
 * @param {number} max Exclusive upper bound.
 * @returns {number} Sum of counts in the range.
 */
function sumCountsInRange(histogram, min, max) {
  let sum = 0;
  for (let v = min; v < max; ++v) {
    sum += histogram[v] || 0;
  }
  return sum;
}

/**
 * Sum all counts in a histogram.
 *
 * @param {number[]} histogram Intensity-indexed counts.
 * @returns {number} Total count.
 */
function sumHistogramCounts(histogram) {
  let total = 0;
  for (let i = 0; i < histogram.length; ++i) {
    total += histogram[i] || 0;
  }
  return total;
}

/**
 * Get the inclusive min intensity and exclusive max intensity present in a
 * histogram (indices that are defined, including explicit zeros).
 *
 * @param {number[]} histogram Intensity-indexed counts.
 * @returns {{min: number, maxExclusive: number}|undefined} Range, or
 *   undefined if the histogram has no defined bins.
 */
function getHistogramIntensityRange(histogram) {
  let min;
  let max;
  for (let i = 0; i < histogram.length; ++i) {
    if (typeof histogram[i] !== 'undefined') {
      if (typeof min === 'undefined') {
        min = i;
      }
      max = i;
    }
  }
  if (typeof min === 'undefined') {
    return undefined;
  }
  return {min, maxExclusive: max + 1};
}

/**
 * Build semi-open intervals [min, t0), [t0, t1), ..., [tLast, max) from
 * interior thresholds and the histogram intensity range.
 *
 * @param {number} min Inclusive histogram minimum intensity.
 * @param {number} maxExclusive Exclusive histogram maximum intensity.
 * @param {number[]} thresholds Interior cut points (ascending).
 * @param {string[]} names One name per resulting interval
 *   (`thresholds.length + 1`).
 * @returns {{name: string, min: number, max: number}[]} Named ranges.
 */
function buildIntervalsFromThresholds(min, maxExclusive, thresholds, names) {
  const bounds = [min, ...thresholds, maxExclusive];
  const intervals = [];
  for (let i = 0; i < names.length; ++i) {
    intervals.push({
      name: names[i],
      min: bounds[i],
      max: bounds[i + 1]
    });
  }
  return intervals;
}

/**
 * Compute, per volume, the percentage of histogram counts that fall in each
 * intensity interval.
 *
 * The caller only passes interior cut points (e.g. `[1, 5]`). For each volume
 * the code builds semi-open intervals covering the histogram range:
 * `[min, 1)`, `[1, 5)`, `[5, max)` where `min` / `max` come from that
 * volume's histogram. Interval names are provided separately and must have
 * length `thresholds.length + 1`.
 *
 * @param {VolumeHistogram[]} volumeHistograms Per-volume histograms (e.g.
 *   output of {@link MaskImage#getHistogramBySegment}).
 * @param {number[]} thresholds Interior intensity cut points in ascending
 *   order (e.g. `[1, 5]`).
 * @param {string[]} names Names for the resulting intervals
 *   (`thresholds.length + 1` entries).
 * @returns {VolumeHistogramIntervalPercentages[]} One entry per volume, with
 *   interval percentages in the same order as `names`.
 */
export function getHistogramIntervalPercentages(
  volumeHistograms, thresholds, names) {
  if (names.length !== thresholds.length + 1) {
    throw new Error(
      'getHistogramIntervalPercentages: names length must be ' +
      'thresholds.length + 1.');
  }

  return volumeHistograms.map((volumeHistogram) => {
    const {volume, histogram} = volumeHistogram;
    const total = sumHistogramCounts(histogram);

    if (total === 0) {
      return {
        volume,
        intervals: names.map((name) => ({name, percentage: 0}))
      };
    }

    const range = getHistogramIntensityRange(histogram);
    const built = buildIntervalsFromThresholds(
      range.min, range.maxExclusive, thresholds, names);

    const intervalResults = built.map((interval) => {
      const count = sumCountsInRange(histogram, interval.min, interval.max);
      return {
        name: interval.name,
        percentage: (count * 100) / total
      };
    });

    return {
      volume,
      intervals: intervalResults
    };
  });
}
