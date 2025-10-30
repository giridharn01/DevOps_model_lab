import mongoose from 'mongoose';

// Optional computed aggregates to speed up trend fetches.
const PerformanceCacheSchema = new mongoose.Schema(
  {
    studentId: { type: String, required: true, index: true },
    subject: { type: String, required: true, index: true },
    // Basic aggregates
    testsCount: { type: Number, default: 0 },
    average: { type: Number, default: 0 },
    lastTrendStatus: { type: String, enum: ['Improving', 'Consistent', 'Needs Support'], default: 'Consistent' },
    lastComputedAt: { type: Date, default: Date.now }
  },
  { timestamps: true }
);

PerformanceCacheSchema.index({ studentId: 1, subject: 1 }, { unique: true });

export default mongoose.model('PerformanceCache', PerformanceCacheSchema);
