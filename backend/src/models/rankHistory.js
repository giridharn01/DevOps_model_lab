import mongoose from 'mongoose';

// Stores computed ranks per test to allow rank change and rank history.
const RankHistorySchema = new mongoose.Schema(
  {
    studentId: { type: String, required: true, index: true },
    subject: { type: String, required: true, index: true },
    testName: { type: String, required: true, index: true },
    date: { type: Date, required: true, index: true },
    rank: { type: Number, required: true },
    marks: { type: Number, required: true }
  },
  { timestamps: true }
);

RankHistorySchema.index({ subject: 1, testName: 1, rank: 1 });
RankHistorySchema.index({ studentId: 1, date: 1 });

export default mongoose.model('RankHistory', RankHistorySchema);
