import React, { useEffect, useState } from 'react';
import { fetchPerformance, fetchCompare } from '../api/client.js';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import TrendBadge from './TrendBadge.jsx';
import StudentTrendModal from './StudentTrendModal.jsx';

export default function PerformanceTrends({ initialStudent = null, initialSubject = '' }) {
  const [studentId, setStudentId] = useState(initialStudent?.studentId || 'S001');
  const [studentName, setStudentName] = useState(initialStudent?.name || '');
  const [subject, setSubject] = useState(initialSubject || 'Math');
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  // Compare
  const [studentIdB, setStudentIdB] = useState('');
  const [compareData, setCompareData] = useState(null);

  const [openModal, setOpenModal] = useState(false);

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
      <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
        <input placeholder="Student ID (e.g., S001)" value={studentId} onChange={(e) => setStudentId(e.target.value)} style={{ padding: '6px 10px' }} />
        <input placeholder="Student Name (optional)" value={studentName} onChange={(e) => setStudentName(e.target.value)} style={{ padding: '6px 10px' }} />
        <input placeholder="Subject (e.g., Math)" value={subject} onChange={(e) => setSubject(e.target.value)} style={{ padding: '6px 10px' }} />
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
        <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
          <input placeholder="Compare With: Student ID (e.g., S002)" value={studentIdB} onChange={(e) => setStudentIdB(e.target.value)} style={{ padding: '6px 10px' }} />
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
