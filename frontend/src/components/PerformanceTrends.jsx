import React, { useEffect, useState } from 'react';
import { fetchPerformance, fetchCompare, fetchStudents, fetchResults } from '../api/client.js';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import TrendBadge from './TrendBadge.jsx';
import StudentTrendModal from './StudentTrendModal.jsx';

export default function PerformanceTrends({ initialStudent = null, initialSubject = '' }) {
  const [studentId, setStudentId] = useState(initialStudent?.studentId || '');
  const [studentName, setStudentName] = useState(initialStudent?.name || '');
  const [subject, setSubject] = useState(initialSubject || '');
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  // Dropdown data
  const [students, setStudents] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loadingDropdowns, setLoadingDropdowns] = useState(true);

  // Compare
  const [studentIdB, setStudentIdB] = useState('');
  const [compareData, setCompareData] = useState(null);

  const [openModal, setOpenModal] = useState(false);

  // Load students and subjects for dropdowns
  useEffect(() => {
    async function loadDropdownData() {
      setLoadingDropdowns(true);
      try {
        // Load all students
        const studentsData = await fetchStudents({ search: '', page: 1, limit: 1000 });
        setStudents(studentsData.data);
        
        // Load unique subjects from results
        const resultsData = await fetchResults({ page: 1, limit: 1000 });
        const uniqueSubjects = [...new Set(resultsData.data.map(r => r.subject))].sort();
        setSubjects(uniqueSubjects);

        // Set defaults if not provided
        if (!studentId && studentsData.data.length > 0) {
          setStudentId(studentsData.data[0].studentId);
          setStudentName(studentsData.data[0].name);
        }
        if (!subject && uniqueSubjects.length > 0) {
          setSubject(uniqueSubjects[0]);
        }
      } catch (err) {
        console.error('Failed to load dropdown data:', err);
      } finally {
        setLoadingDropdowns(false);
      }
    }
    loadDropdownData();
  }, []);

  useEffect(() => {
    async function load() {
      if (studentId) {
        try {
          setError(null);
          const resp = await fetchPerformance(studentId, subject);
          setData(resp);
        } catch (err) {
          console.error('Failed to load performance:', err);
          setError(err.response?.data?.error || err.message || 'Failed to load data');
          setData(null);
        }
      }
    }
    load();
  }, [studentId, subject]);

  useEffect(() => {
    async function loadCompare() {
      if (studentId && studentIdB) {
        try {
          const resp = await fetchCompare(studentId, studentIdB, subject);
          setCompareData(resp);
        } catch (err) {
          console.error('Failed to load comparison:', err);
          setCompareData(null);
        }
      } else {
        setCompareData(null);
      }
    }
    loadCompare();
  }, [studentId, studentIdB, subject]);

  return (
    <div>
      <div style={{ display: 'flex', gap: 8, marginBottom: 12, alignItems: 'center' }}>
        <label style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
          Student:
          <select 
            value={studentId} 
            onChange={(e) => {
              const selected = students.find(s => s.studentId === e.target.value);
              setStudentId(e.target.value);
              setStudentName(selected ? selected.name : '');
            }} 
            disabled={loadingDropdowns}
            style={{ padding: '6px 10px', minWidth: '200px' }}
          >
            <option value="">Select Student</option>
            {students.map(s => (
              <option key={s.studentId} value={s.studentId}>
                {s.studentId} - {s.name}
              </option>
            ))}
          </select>
        </label>
        
        <label style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
          Subject:
          <select 
            value={subject} 
            onChange={(e) => setSubject(e.target.value)} 
            disabled={loadingDropdowns}
            style={{ padding: '6px 10px', minWidth: '150px' }}
          >
            <option value="">Select Subject</option>
            {subjects.map(subj => (
              <option key={subj} value={subj}>{subj}</option>
            ))}
          </select>
        </label>
        
        <button onClick={() => setOpenModal(true)} disabled={!studentId} style={{ padding: '6px 10px' }}>Open Modal</button>
      </div>

      {error && (
        <div style={{ padding: 12, marginBottom: 12, background: '#FEE2E2', color: '#DC2626', borderRadius: 6 }}>
          Error: {error}
        </div>
      )}

      {data && (
        <div>
          <div style={{ marginBottom: 8 }}>
            {studentName || studentId} — Trend: <TrendBadge value={data.trendStatus} />
          </div>
          <div style={{ height: 320 }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data.series.map(s => ({ ...s, dateLabel: new Date(s.date).toLocaleDateString() }))}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="dateLabel" />
                <YAxis domain={[0, 100]} />
                <Tooltip />
                <Line type="monotone" dataKey="marks" stroke="#10B981" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      <div style={{ marginTop: 24 }}>
        <h4 style={{ margin: '8px 0' }}>Compare Trends</h4>
        <div style={{ display: 'flex', gap: 8, marginBottom: 12, alignItems: 'center' }}>
          <label style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
            Compare With:
            <select 
              value={studentIdB} 
              onChange={(e) => setStudentIdB(e.target.value)} 
              disabled={loadingDropdowns}
              style={{ padding: '6px 10px', minWidth: '200px' }}
            >
              <option value="">Select Student to Compare</option>
              {students
                .filter(s => s.studentId !== studentId) // Exclude current student
                .map(s => (
                  <option key={s.studentId} value={s.studentId}>
                    {s.studentId} - {s.name}
                  </option>
                ))
              }
            </select>
          </label>
        </div>
        {compareData && (
          <div style={{ height: 320 }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="dateLabel" />
                <YAxis domain={[0, 100]} />
                <Tooltip />
                <Legend />
                {compareData.students.map((s, idx) => (
                  <Line key={s.studentId}
                    data={s.series.map(p => ({ ...p, dateLabel: new Date(p.date).toLocaleDateString() }))}
                    type="monotone"
                    dataKey="marks"
                    name={s.studentId}
                    stroke={idx === 0 ? '#2563EB' : '#F59E0B'}
                    strokeWidth={2}
                    dot={false}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      <StudentTrendModal open={openModal} onClose={() => setOpenModal(false)} student={{ studentId, name: studentName }} subject={subject} />
    </div>
  );
}
