import React, { useState } from 'react';
import Leaderboard from '../components/Leaderboard.jsx';
import PerformanceTrends from '../components/PerformanceTrends.jsx';
import StudentTrendModal from '../components/StudentTrendModal.jsx';
import StudentsList from '../components/StudentsList.jsx';
import ResultsList from '../components/ResultsList.jsx';

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState('leaderboard');
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [currentFilters, setCurrentFilters] = useState({ subject: '', test: '' });

  const tabs = [
    { key: 'leaderboard', label: 'Leaderboard' },
    { key: 'trends', label: 'Performance Trends' },
    { key: 'students', label: 'Manage Students' },
    { key: 'results', label: 'Manage Results' }
  ];

  return (
    <div>
      <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            style={{
              padding: '8px 16px',
              background: activeTab === tab.key ? '#111827' : '#E5E7EB',
              color: activeTab === tab.key ? '#fff' : '#111827',
              border: 'none',
              borderRadius: 6,
              cursor: 'pointer',
              fontWeight: activeTab === tab.key ? 600 : 400
            }}
          >
            {tab.label}
          </button>
        ))}
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

      {activeTab === 'students' && <StudentsList />}

      {activeTab === 'results' && <ResultsList />}

      <StudentTrendModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        student={selectedStudent}
        subject={currentFilters.subject}
      />
    </div>
  );
}
