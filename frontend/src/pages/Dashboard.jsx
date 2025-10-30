import React, { useState } from 'react';
import Leaderboard from '../components/Leaderboard.jsx';
import PerformanceTrends from '../components/PerformanceTrends.jsx';
import StudentTrendModal from '../components/StudentTrendModal.jsx';

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState('leaderboard');
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [currentFilters, setCurrentFilters] = useState({ subject: '', test: '' });

  return (
    <div>
      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        <button onClick={() => setActiveTab('leaderboard')} style={{ padding: '8px 12px', background: activeTab==='leaderboard'?'#111827':'#E5E7EB', color: activeTab==='leaderboard'?'#fff':'#111827', borderRadius: 6 }}>Leaderboard</button>
        <button onClick={() => setActiveTab('trends')} style={{ padding: '8px 12px', background: activeTab==='trends'?'#111827':'#E5E7EB', color: activeTab==='trends'?'#fff':'#111827', borderRadius: 6 }}>Performance Trends</button>
      </div>

      {activeTab === 'leaderboard' && (
        <Leaderboard
          onSelectStudent={(student) => {
            setSelectedStudent(student);
            setModalOpen(true);
          }}
          onFiltersChange={setCurrentFilters}
        />
      )}
      {activeTab === 'trends' && (
        <PerformanceTrends initialStudent={selectedStudent} initialSubject={currentFilters.subject} />
      )}

      <StudentTrendModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        student={selectedStudent}
        subject={currentFilters.subject}
      />
    </div>
  );
}
