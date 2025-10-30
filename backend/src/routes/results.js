import { Router } from 'express';
import Result from '../models/result.js';
import RankHistory from '../models/rankHistory.js';
import { clearCache } from '../utils/cache.js';

const router = Router();

/**
 * GET /api/results?studentId=&subject=&test=&from=&to=&page=&limit=
 * Filterable, paginated list of results
 */
router.get('/', async (req, res, next) => {
  try {
    const page = Math.max(parseInt(req.query.page || '1', 10), 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit || '25', 10), 1), 200);
    const { studentId, subject, test: testName, from, to } = req.query;

    const q = {};
    if (studentId) q.studentId = studentId;
    if (subject) q.subject = subject;
    if (testName) q.testName = testName;
    if (from || to) {
      q.date = {};
      if (from) q.date.$gte = new Date(from);
      if (to) q.date.$lte = new Date(to);
    }

    const [items, count] = await Promise.all([
      Result.find(q).sort({ date: -1 }).skip((page - 1) * limit).limit(limit).lean(),
      Result.countDocuments(q)
    ]);

    res.json({ page, limit, count, data: items.map((d) => ({ id: d._id, ...d })) });
  } catch (err) {
    next(err);
  }
});

/** GET /api/results/:id */
router.get('/:id', async (req, res, next) => {
  try {
    const doc = await Result.findById(req.params.id).lean();
    if (!doc) return res.status(404).json({ error: 'Result not found' });
    res.json(doc);
  } catch (err) {
    next(err);
  }
});

/** POST /api/results */
router.post('/', async (req, res, next) => {
  try {
    const payload = req.body || {};
    const required = ['studentId', 'name', 'subject', 'marks', 'grade', 'testName', 'date'];
    for (const k of required) {
      if (payload[k] == null || payload[k] === '') {
        return res.status(400).json({ error: `${k} is required` });
      }
    }
    payload.date = new Date(payload.date);
    const created = await Result.create(payload);

    // Invalidate leaderboard cache and rank history for this test/subject
    const subject = created.subject;
    const testName = created.testName;
    clearCache(`leaderboard:${subject}:${testName}`);
    await RankHistory.deleteMany({ subject, testName });

    res.status(201).json(created);
  } catch (err) {
    next(err);
  }
});

/** PUT /api/results/:id */
router.put('/:id', async (req, res, next) => {
  try {
    const update = { ...req.body };
    if (update.date) update.date = new Date(update.date);
    const doc = await Result.findByIdAndUpdate(req.params.id, update, { new: true, runValidators: true });
    if (!doc) return res.status(404).json({ error: 'Result not found' });

    // Invalidate leaderboard cache and rank history (conservative: by subject+testName in updated doc)
    clearCache(`leaderboard:${doc.subject}:${doc.testName}`);
    await RankHistory.deleteMany({ subject: doc.subject, testName: doc.testName });

    res.json(doc);
  } catch (err) {
    next(err);
  }
});

/** DELETE /api/results/:id */
router.delete('/:id', async (req, res, next) => {
  try {
    const doc = await Result.findByIdAndDelete(req.params.id);
    if (!doc) return res.status(404).json({ error: 'Result not found' });

    clearCache(`leaderboard:${doc.subject}:${doc.testName}`);
    await RankHistory.deleteMany({ subject: doc.subject, testName: doc.testName });

    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

export default router;
