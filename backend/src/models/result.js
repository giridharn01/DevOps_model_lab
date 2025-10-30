import mongoose from 'mongoose';

// Raw results as provided by grading core
const ResultSchema = new mongoose.Schema(
  {
    studentId: { type: String, required: true, index: true },
    name: { type: String, required: true },
    subject: { type: String, required: true, index: true },
    marks: { type: Number, required: true },
    grade: { type: String, required: true },
    testName: { type: String, required: true, index: true },
    date: { type: Date, required: true, index: true }
  },
  { timestamps: true }
);

ResultSchema.index({ subject: 1, testName: 1, marks: -1 });
ResultSchema.index({ studentId: 1, date: 1 });

export default mongoose.model('Result', ResultSchema);
