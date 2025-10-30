import mongoose from 'mongoose';

const StudentSchema = new mongoose.Schema(
  {
    studentId: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true, index: true },
    email: { type: String },
    class: { type: String },
    // Optional roles for RBAC
    roles: { type: [String], default: ['Student'] }
  },
  { timestamps: true }
);

export default mongoose.model('Student', StudentSchema);
