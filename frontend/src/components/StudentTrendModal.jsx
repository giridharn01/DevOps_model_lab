import React, { useEffect, useState } from 'react';
import { fetchPerformance } from '../api/client.js';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import TrendBadge from './TrendBadge.jsx';

export default function StudentTrendModal({ open, onClose, student, subject }) {
  const [data, setData] = useState(null);

  useEffect(() => {
    async function load() {
      if (open && student?.studentId) {
        const resp = await fetchPerformance(student.studentId, subject);
        setData(resp);
      }
    }
    load();
  }, [open, student?.studentId, subject]);

  if (!open) return null;

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ background: 'white', borderRadius: 8, width: '90%', maxWidth: 800, padding: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ margin: 0 }}>{student?.name || 'Student'} — {subject || 'All Subjects'}</h3>
          <button onClick={onClose}>Close</button>
        </div>
        {data ? (
          <>
            <div style={{ marginBottom: 8 }}>
              Trend: <TrendBadge value={data.trendStatus} />
            </div>
            <div style={{ height: 320 }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data.series.map(s => ({ ...s, dateLabel: new Date(s.date).toLocaleDateString() }))}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="dateLabel" />
                  <YAxis domain={[0, 100]} />
                  <Tooltip />
                  <Line type="monotone" dataKey="marks" stroke="#2563EB" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
            {data.rankHistory && data.rankHistory.length > 0 && (
              <div style={{ height: 200, marginTop: 16 }}>
                <h4 style={{ margin: '8px 0' }}>Rank History</h4>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={data.rankHistory.map(s => ({ ...s, dateLabel: new Date(s.date).toLocaleDateString() }))}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="dateLabel" />
                    <YAxis reversed />
                    <Tooltip />
                    <Line type="monotone" dataKey="rank" stroke="#F59E0B" strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}
          </>
        ) : (
          <div>Loading…</div>
        )}
      </div>
    </div>
  );
}
