import React, { useEffect, useState } from 'react';
import { DataGrid } from '@mui/x-data-grid';
import { fetchStudents, fetchResults, deleteResult } from '../api/client.js';
import ResultForm from './ResultForm.jsx';

export default function ResultsList() {
  // Students list
  const [students, setStudents] = useState([]);
  const [studentsLoading, setStudentsLoading] = useState(false);
  const [studentSearch, setStudentSearch] = useState('');
  const [selectedStudent, setSelectedStudent] = useState(null);

  // Results for selected student
  const [rows, setRows] = useState([]);
  const [rowCount, setRowCount] = useState(0);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(25);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [editResult, setEditResult] = useState(null);
  const [showForm, setShowForm] = useState(false);

  // Load students
  useEffect(() => {
    const loadStudents = async () => {
      setStudentsLoading(true);
      try {
        const data = await fetchStudents({ search: studentSearch, page: 1, limit: 100 });
        setStudents(data.data);
      } catch (err) {
        console.error('Failed to load students:', err);
      } finally {
        setStudentsLoading(false);
      }
    };
    loadStudents();
  }, [studentSearch]);

  // Load results for selected student
  const loadResults = async () => {
    if (!selectedStudent) {
      setRows([]);
      setRowCount(0);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const data = await fetchResults({ studentId: selectedStudent.studentId, page: page + 1, limit: pageSize });
      const mappedRows = data.data.map((r) => ({ ...r, id: r._id }));
      console.log('Sample result row:', mappedRows[0]); // Debug log
      setRows(mappedRows);
      setRowCount(data.count);
    } catch (err) {
      console.error('Failed to load results:', err);
      setError(err.response?.data?.error || err.message || 'Failed to load results');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadResults();
  }, [selectedStudent, page, pageSize]);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this result? This will refresh the leaderboard automatically.')) return;
    try {
      await deleteResult(id);
      loadResults();
      // Note: Backend automatically clears leaderboard cache on delete
    } catch (err) {
      alert('Failed to delete: ' + (err.response?.data?.error || err.message));
    }
  };

  const handleEdit = (result) => {
    setEditResult(result);
    setShowForm(true);
  };

  const handleAdd = () => {
    setEditResult(selectedStudent ? { studentId: selectedStudent.studentId, name: selectedStudent.name } : null);
    setShowForm(true);
  };

  const handleFormClose = (reload) => {
    setShowForm(false);
    setEditResult(null);
    if (reload) loadResults();
  };

  const handleStudentClick = (student) => {
    setSelectedStudent(student);
    setPage(0);
  };

  const columns = [
    { field: 'subject', headerName: 'Subject', width: 120 },
    { field: 'testName', headerName: 'Test', width: 140 },
    { field: 'marks', headerName: 'Marks', width: 90 },
    { field: 'grade', headerName: 'Grade', width: 80 },
    {
      field: 'date',
      headerName: 'Date',
      width: 120,
      renderCell: (params) => {
        if (!params.row.date) return <span style={{ color: '#9CA3AF' }}>N/A</span>;
        try {
          const d = new Date(params.row.date);
          if (isNaN(d.getTime())) return <span style={{ color: '#EF4444' }}>Invalid</span>;
          return d.toLocaleDateString();
        } catch (e) {
          return <span style={{ color: '#EF4444' }}>Error</span>;
        }
      }
    },
    {
      field: 'actions',
      headerName: 'Actions',
      flex: 1,
      minWidth: 180,
      sortable: false,
      renderCell: (params) => (
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            onClick={() => handleEdit(params.row)}
            style={{
              padding: '6px 12px',
              cursor: 'pointer',
              background: '#F3F4F6',
              border: '1px solid #D1D5DB',
              borderRadius: 6,
              fontSize: 13,
              fontWeight: 500,
              color: '#374151'
            }}
          >
            ✏️ Edit
          </button>
          <button
            onClick={() => handleDelete(params.row.id)}
            style={{
              padding: '6px 12px',
              cursor: 'pointer',
              background: '#FEE2E2',
              color: '#DC2626',
              border: '1px solid #FCA5A5',
              borderRadius: 6,
              fontSize: 13,
              fontWeight: 500
            }}
          >
            🗑️ Delete
          </button>
        </div>
      )
    }
  ];

  return (
    <div style={{ display: 'flex', gap: 16, height: 'calc(100vh - 200px)' }}>
      {/* Left panel: Students list */}
      <div style={{ width: 320, display: 'flex', flexDirection: 'column', borderRight: '1px solid #E5E7EB' }}>
        <div style={{ padding: '12px 16px', borderBottom: '1px solid #E5E7EB', background: '#F9FAFB' }}>
          <h3 style={{ margin: '0 0 8px 0', fontSize: 16, fontWeight: 600 }}>Students</h3>
          <input
            placeholder="Search students..."
            value={studentSearch}
            onChange={(e) => setStudentSearch(e.target.value)}
            style={{ width: '100%', padding: '8px 12px', boxSizing: 'border-box', borderRadius: 6, border: '1px solid #D1D5DB' }}
          />
        </div>
        <div style={{ flex: 1, overflowY: 'auto' }}>
          {studentsLoading ? (
            <div style={{ padding: 16, textAlign: 'center', color: '#6B7280' }}>Loading...</div>
          ) : students.length === 0 ? (
            <div style={{ padding: 16, textAlign: 'center', color: '#6B7280' }}>No students found</div>
          ) : (
            students.map((student) => (
              <div
                key={student._id}
                onClick={() => handleStudentClick(student)}
                style={{
                  padding: '12px 16px',
                  cursor: 'pointer',
                  borderBottom: '1px solid #F3F4F6',
                  background: selectedStudent?.studentId === student.studentId ? '#EFF6FF' : 'white',
                  borderLeft: selectedStudent?.studentId === student.studentId ? '3px solid #2563EB' : '3px solid transparent',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => {
                  if (selectedStudent?.studentId !== student.studentId) {
                    e.currentTarget.style.background = '#F9FAFB';
                  }
                }}
                onMouseLeave={(e) => {
                  if (selectedStudent?.studentId !== student.studentId) {
                    e.currentTarget.style.background = 'white';
                  }
                }}
              >
                <div style={{ fontWeight: 600, fontSize: 14, color: '#111827', marginBottom: 2 }}>
                  {student.name}
                </div>
                <div style={{ fontSize: 12, color: '#6B7280' }}>
                  {student.studentId} • {student.class || 'No class'}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Right panel: Results */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {!selectedStudent ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#6B7280' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 48, marginBottom: 8 }}>📊</div>
              <div style={{ fontSize: 16, fontWeight: 500 }}>Select a student to view their results</div>
            </div>
          </div>
        ) : (
          <>
            <div style={{ padding: '12px 16px', borderBottom: '1px solid #E5E7EB', background: '#F9FAFB', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: 16, fontWeight: 600 }}>{selectedStudent.name}</h3>
                <div style={{ fontSize: 12, color: '#6B7280', marginTop: 2 }}>
                  {selectedStudent.studentId} • {rowCount} test result{rowCount !== 1 ? 's' : ''}
                </div>
              </div>
              <button onClick={handleAdd} style={{ padding: '8px 16px', background: '#2563EB', color: 'white', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 14, fontWeight: 500 }}>
                + Add Result
              </button>
            </div>

            {error && (
              <div style={{ padding: 12, margin: 16, background: '#FEE2E2', color: '#DC2626', borderRadius: 6 }}>
                Error: {error}
              </div>
            )}

            <div style={{ flex: 1, padding: 16 }}>
              <DataGrid
                columns={columns}
                rows={rows}
                pagination
                paginationMode="server"
                rowCount={rowCount}
                page={page}
                onPageChange={setPage}
                pageSize={pageSize}
                onPageSizeChange={setPageSize}
                pageSizeOptions={[10, 25, 50, 100]}
                loading={loading}
                disableColumnMenu
              />
            </div>
          </>
        )}
      </div>

      {showForm && <ResultForm result={editResult} onClose={handleFormClose} />}
    </div>
  );
}
