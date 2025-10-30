import { Router } from 'express';
import Student from '../models/student.js';
import { clearCache } from '../utils/cache.js';

const router = Router();

/**
 * GET /api/students?search=&page=&limit=
 * Search by name or studentId (case-insensitive), with pagination
 */
router.get('/', async (req, res, next) => {
  try {
    const page = Math.max(parseInt(req.query.page || '1', 10), 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit || '25', 10), 1), 200);
    const search = (req.query.search || '').trim();

    const q = {};
    if (search) {
      const re = new RegExp(search, 'i');
      q.$or = [{ name: re }, { studentId: re }];
    }

    const [items, count] = await Promise.all([
      Student.find(q).sort({ name: 1 }).skip((page - 1) * limit).limit(limit).lean(),
      Student.countDocuments(q)
    ]);

    res.json({ page, limit, count, data: items.map((s) => ({ id: s._id, ...s })) });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/students/:id
 * Accepts Mongo _id or studentId
 */
router.get('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    let student = null;
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      student = await Student.findById(id).lean();
    }
    if (!student) {
      student = await Student.findOne({ studentId: id }).lean();
    }
    if (!student) return res.status(404).json({ error: 'Student not found' });
    res.json(student);
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/students
 * Body: { studentId, name, email?, class?, roles? }
 */
router.post('/', async (req, res, next) => {
  try {
    const { studentId, name, email, class: klass, roles } = req.body || {};
    if (!studentId || !name) return res.status(400).json({ error: 'studentId and name are required' });
    const exists = await Student.findOne({ studentId });
    if (exists) return res.status(409).json({ error: 'studentId already exists' });
    const created = await Student.create({ studentId, name, email, class: klass, roles });
    res.status(201).json(created);
  } catch (err) {
    next(err);
  }
});

/**
 * PUT /api/students/:id
 */
router.put('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const update = req.body || {};
    const opts = { new: true, runValidators: true };
    let doc = null;
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      doc = await Student.findByIdAndUpdate(id, update, opts);
    }
    if (!doc) {
      doc = await Student.findOneAndUpdate({ studentId: id }, update, opts);
    }
    if (!doc) return res.status(404).json({ error: 'Student not found' });
    
    // Clear leaderboard cache if student name changed (affects leaderboard display)
    if (update.name) {
      clearCache('leaderboard:');
    }
    
    res.json(doc);
  } catch (err) {
    next(err);
  }
});

/**
 * DELETE /api/students/:id
 * Note: This only deletes the student record, NOT their results.
 * Results remain in the database and will still show in leaderboards.
 * To fully remove a student, delete their results first.
 */
router.delete('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    let result = { deletedCount: 0 };
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      const doc = await Student.findByIdAndDelete(id);
      result.deletedCount = doc ? 1 : 0;
    }
    if (result.deletedCount === 0) {
      const r = await Student.deleteOne({ studentId: id });
      result = r;
    }
    if (result.deletedCount === 0) return res.status(404).json({ error: 'Student not found' });
    
    // Clear leaderboard cache since student data changed
    clearCache('leaderboard:');
    
    // Note: Results for this student still exist
    // Leaderboard will show the student's name from Result records
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

export default router;
