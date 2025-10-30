import dotenv from 'dotenv';
import mongoose from 'mongoose';
import Student from './models/student.js';
import Result from './models/result.js';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/model_lab';

const students = [
  { studentId: 'S001', name: 'Alice Johnson', email: 'alice@example.com', class: '10A' },
  { studentId: 'S002', name: 'Bob Smith', email: 'bob@example.com', class: '10A' },
  { studentId: 'S003', name: 'Charlie Davis', email: 'charlie@example.com', class: '10B' },
  { studentId: 'S004', name: 'Diana Evans', email: 'diana@example.com', class: '10B' },
  { studentId: 'S005', name: 'Ethan Brown', email: 'ethan@example.com', class: '10A' },
  { studentId: 'S006', name: 'Fiona Wilson', email: 'fiona@example.com', class: '10C' },
  { studentId: 'S007', name: 'George Taylor', email: 'george@example.com', class: '10C' },
  { studentId: 'S008', name: 'Hannah Martinez', email: 'hannah@example.com', class: '10A' },
  { studentId: 'S009', name: 'Ian Anderson', email: 'ian@example.com', class: '10B' },
  { studentId: 'S010', name: 'Julia Thomas', email: 'julia@example.com', class: '10C' },
  { studentId: 'S011', name: 'Kevin Lee', email: 'kevin@example.com', class: '10A' },
  { studentId: 'S012', name: 'Laura Garcia', email: 'laura@example.com', class: '10B' },
  { studentId: 'S013', name: 'Michael Clark', email: 'michael@example.com', class: '10C' },
  { studentId: 'S014', name: 'Nina Rodriguez', email: 'nina@example.com', class: '10A' },
  { studentId: 'S015', name: 'Oscar White', email: 'oscar@example.com', class: '10B' }
];

// Generate results across 3 subjects and 3 tests each
const subjects = ['Math', 'Science', 'English'];
const tests = [
  { name: 'Quiz-1', date: new Date('2025-09-05') },
  { name: 'Midterm-1', date: new Date('2025-09-20') },
  { name: 'Final-1', date: new Date('2025-10-15') }
];

function getGrade(marks) {
  if (marks >= 90) return 'A+';
  if (marks >= 80) return 'A';
  if (marks >= 70) return 'B';
  if (marks >= 60) return 'C';
  if (marks >= 50) return 'D';
  return 'F';
}

function randomMarks(base, variance) {
  return Math.max(0, Math.min(100, Math.floor(base + (Math.random() - 0.5) * variance)));
}

async function seed() {
  try {
    await mongoose.connect(MONGODB_URI, { autoIndex: true });
    console.log('Connected to MongoDB');

    // Clear existing data
    await Student.deleteMany({});
    await Result.deleteMany({});
    console.log('Cleared existing students and results');

    // Insert students
    const insertedStudents = await Student.insertMany(students);
    console.log(`Inserted ${insertedStudents.length} students`);

    // Generate results
    const results = [];
    for (const student of students) {
      for (const subject of subjects) {
        // Each student starts with a base skill level per subject (50-90)
        const baseSkill = 50 + Math.floor(Math.random() * 40);
        let trend = (Math.random() - 0.5) * 20; // trend: -10 to +10 per test

        for (let i = 0; i < tests.length; i++) {
          const test = tests[i];
          const marks = randomMarks(baseSkill + trend * i, 10);
          results.push({
            studentId: student.studentId,
            name: student.name,
            subject,
            marks,
            grade: getGrade(marks),
            testName: test.name,
            date: test.date
          });
        }
      }
    }

    const insertedResults = await Result.insertMany(results);
    console.log(`Inserted ${insertedResults.length} test results`);

    console.log('\n✅ Database seeded successfully!');
    console.log(`Students: ${insertedStudents.length}`);
    console.log(`Results: ${insertedResults.length}`);
    console.log('\nSample queries:');
    console.log('GET /api/students');
    console.log('GET /api/results?subject=Math&test=Midterm-1');
    console.log('GET /api/leaderboard?subject=Math&test=Midterm-1');
    console.log('GET /api/performance/S001?subject=Math');

    await mongoose.connection.close();
    process.exit(0);
  } catch (err) {
    console.error('Seed failed:', err);
    process.exit(1);
  }
}

seed();
