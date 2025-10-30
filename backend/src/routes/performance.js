import { Router } from 'express';
import Result from '../models/result.js';
import RankHistory from '../models/rankHistory.js';
import PerformanceCache from '../models/performanceCache.js';
import { computeTrendStatus } from '../utils/trend.js';

const router = Router();

/**
 * GET /api/performance/compare?studentA=&studentB=&subject=
 * Returns aligned series for two students for quick overlay comparison.
 * Example response:
 * {
 *   "subject":"Math",
 *   "students":[
 *     {"studentId":"S1","trendStatus":"Improving","series":[{"testName":"T1","marks":70,"date":"2025-01-10"}]},
 *     {"studentId":"S2","trendStatus":"Consistent","series":[{"testName":"T1","marks":75,"date":"2025-01-10"}]}
 *   ]
 * }
 */
router.get('/compare', async (req, res, next) => {
  try {
    const { studentA, studentB, subject } = req.query;
    if (!studentA || !studentB) {
      return res.status(400).json({ error: 'studentA and studentB query params are required' });
    }

    async function fetchSeries(studentId) {
      const q = { studentId };
      if (subject) q.subject = subject;
      const docs = await Result.find(q).select('testName marks date -_id').sort({ date: 1 }).lean();
      const series = docs.map((d) => ({ testName: d.testName, marks: d.marks, date: d.date }));
      const trendStatus = computeTrendStatus(series.map((s) => ({ date: s.date, marks: s.marks })));
      return { studentId, trendStatus, series };
    }

    const [a, b] = await Promise.all([fetchSeries(studentA), fetchSeries(studentB)]);
    return res.json({ subject: subject || null, students: [a, b] });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/performance/:studentId?subject=
 * Returns time series of marks for a student, optional by subject.
 * Example response:
 * {
 *   "studentId":"S1",
 *   "subject": "Math",
 *   "trendStatus":"Improving",
 *   "series":[{"testName":"T1","marks":70,"date":"2025-01-10"}],
 *   "rankHistory":[{"testName":"T1","rank":12,"date":"2025-01-10"}]
 * }
 */
router.get('/:studentId', async (req, res, next) => {
  try {
    const { studentId } = req.params;
    const subject = req.query.subject; // optional

    const query = { studentId };
    if (subject) query.subject = subject;

    const results = await Result.find(query)
      .select('testName marks date subject -_id')
      .sort({ date: 1 })
      .lean();

    const series = results.map((r) => ({ testName: r.testName, marks: r.marks, date: r.date }));
    const trendStatus = computeTrendStatus(series.map((s) => ({ date: s.date, marks: s.marks })));

    // Rank history is optional; return if exists
    const rankQuery = { studentId };
    if (subject) rankQuery.subject = subject;
    const rankHistoryDocs = await RankHistory.find(rankQuery)
      .select('testName rank date -_id')
      .sort({ date: 1 })
      .lean();
    const rankHistory = rankHistoryDocs.map((d) => ({ testName: d.testName, rank: d.rank, date: d.date }));

    // Update cache entry for aggregates (fire-and-forget)
    Promise.resolve()
      .then(async () => {
        if (!subject) return; // cache per subject
        const avg = series.length ? series.reduce((a, b) => a + b.marks, 0) / series.length : 0;
        await PerformanceCache.findOneAndUpdate(
          { studentId, subject },
          { $set: { testsCount: series.length, average: avg, lastTrendStatus: trendStatus, lastComputedAt: new Date() } },
          { upsert: true }
        );
      })
      .catch(() => {});

    return res.json({ studentId, subject: subject || null, trendStatus, series, rankHistory });
  } catch (err) {
    next(err);
  }
});

export default router;
