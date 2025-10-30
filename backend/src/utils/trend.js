// Trend analysis utilities
// Determine trend status using linear regression slope and recent average deltas

export function computeTrendStatus(points) {
  // points: [{ date: Date, marks: number }], sorted by date asc preferred
  if (!points || points.length < 2) return 'Consistent';

  const n = points.length;
  const xs = points.map((p, i) => i + 1); // pseudo time index to avoid date math
  const ys = points.map((p) => p.marks);

  const sumX = xs.reduce((a, b) => a + b, 0);
  const sumY = ys.reduce((a, b) => a + b, 0);
  const sumXY = xs.reduce((acc, x, i) => acc + x * ys[i], 0);
  const sumXX = xs.reduce((acc, x) => acc + x * x, 0);

  const numerator = n * sumXY - sumX * sumY;
  const denominator = n * sumXX - sumX * sumX;
  const slope = denominator === 0 ? 0 : numerator / denominator;

  // Heuristics: slope threshold relative to score range (0-100 assumed)
  if (slope > 1.0) return 'Improving';
  if (slope < -1.0) return 'Needs Support';
  return 'Consistent';
}
