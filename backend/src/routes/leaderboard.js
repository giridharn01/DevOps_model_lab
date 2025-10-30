import { Router } from 'express';
import Result from '../models/result.js';
import RankHistory from '../models/rankHistory.js';
import { computeRanks, rankChange, medalForRank } from '../utils/ranking.js';
import { getCache, setCache } from '../utils/cache.js';

const router = Router();

/**
 * GET /api/leaderboard?subject=&test=&page=&limit=
 * Returns ranked results with rank change vs previous test for same subject.
 * Example response:
 * {
 *   "subject": "Math",
 *   "testName": "Midterm-2",
 *   "count": 2,
 *   "page": 1,
 *   "limit": 50,
 *   "data": [
 *     {"rank":1,"studentId":"S1","name":"Alice","marks":95,"grade":"A","rankChange":+1,"medal":"🥇"},
 *     {"rank":2,"studentId":"S2","name":"Bob","marks":90,"grade":"A","rankChange":-1,"medal":"🥈"}
 *   ]
 * }
 */
router.get('/', async (req, res, next) => {
  try {
    const subject = req.query.subject;
    const testName = req.query.test;
    const page = Math.max(parseInt(req.query.page || '1', 10), 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit || '50', 10), 1), 200);

    if (!subject || !testName) {
      return res.status(400).json({ error: 'subject and test query params are required' });
    }

    const cacheKey = `leaderboard:${subject}:${testName}:p${page}:l${limit}`;
    const cached = getCache(cacheKey);
    if (cached) return res.json(cached);

    // Get results for specific test
    const currentResults = await Result.find({ subject, testName })
      .select('studentId name subject marks grade testName date -_id')
      .lean();

    // Compute ranks for current
    const ranked = computeRanks(currentResults);

    // Determine previous test for same subject (by date)
    const testInfo = await Result.findOne({ subject, testName }).select('date').lean();
    let previousRanksByStudent = new Map();

    if (testInfo) {
      const prevTest = await Result.aggregate([
        { $match: { subject, date: { $lt: testInfo.date } } },
        { $group: { _id: '$testName', date: { $first: '$date' } } },
        { $sort: { date: -1 } },
        { $limit: 1 }
      ]);

      const prevTestName = prevTest?.[0]?._id;

      if (prevTestName) {
        // Try RankHistory first
        const prevHistory = await RankHistory.find({ subject, testName: prevTestName })
          .select('studentId rank')
          .lean();
        if (prevHistory.length > 0) {
          previousRanksByStudent = new Map(prevHistory.map((h) => [h.studentId, h.rank]));
        } else {
          const prevResults = await Result.find({ subject, testName: prevTestName })
            .select('studentId name subject marks grade testName date -_id')
            .lean();
          const prevRanked = computeRanks(prevResults);
          previousRanksByStudent = new Map(prevRanked.map((r) => [r.studentId, r.rank]));
        }
      }
    }

    // Attach rankChange and medals
    const enriched = ranked.map((r) => {
      const prevRank = previousRanksByStudent.get(r.studentId);
      const delta = rankChange(r.rank, prevRank);
      return { ...r, rankChange: delta, medal: medalForRank(r.rank) };
    });

    // Persist current ranks to RankHistory (fire-and-forget)
    Promise.resolve()
      .then(async () => {
        const docs = enriched.map((e) => ({
          studentId: e.studentId,
          subject,
          testName,
          date: e.date,
          rank: e.rank,
          marks: e.marks
        }));
        // Avoid duplicates by deleting existing then inserting
        await RankHistory.deleteMany({ subject, testName });
        if (docs.length) await RankHistory.insertMany(docs);
      })
      .catch(() => {});

    // Pagination on enriched data
    const total = enriched.length;
    const start = (page - 1) * limit;
    const paged = enriched.slice(start, start + limit);

    const payload = { subject, testName, count: total, page, limit, data: paged };
    const ttl = parseInt(process.env.CACHE_TTL_SECONDS || '60', 10);
    setCache(cacheKey, payload, ttl);

    return res.json(payload);
  } catch (err) {
    next(err);
  }
});

export default router;
