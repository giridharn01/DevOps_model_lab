import React, { useEffect, useMemo, useState } from 'react';
import { DataGrid } from '@mui/x-data-grid';
import { fetchLeaderboard } from '../api/client.js';
import ExportButtons from './ExportButtons.jsx';

export default function Leaderboard({ onSelectStudent, onFiltersChange }) {
  const [subject, setSubject] = useState('Math');
  const [test, setTest] = useState('Midterm-1');
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(25);
  const [rows, setRows] = useState([]);
  const [rowCount, setRowCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const canQuery = subject && test;

  useEffect(() => {
    onFiltersChange?.({ subject, test });
  }, [subject, test]);

  useEffect(() => {
    loadLeaderboard();
  }, [subject, test, page, pageSize]);

  const columns = useMemo(() => [
    { field: 'rank', headerName: 'Rank', width: 90, renderCell: (params) => (
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <span>{params.row.rank}</span>
        {params.row.medal && <span>{params.row.medal}</span>}
      </div>
    )},
    { field: 'name', headerName: 'Student', flex: 1, renderCell: (params) => (
      <button style={{ background: 'transparent', border: 'none', color: '#2563EB', cursor: 'pointer' }}
        onClick={() => onSelectStudent?.({ studentId: params.row.studentId, name: params.row.name })}>
        {params.row.name}
      </button>
    ) },
    { field: 'marks', headerName: 'Marks', width: 120 },
    { field: 'grade', headerName: 'Grade', width: 120 },
    { field: 'rankChange', headerName: 'Change', width: 120, renderCell: (p) => {
      const v = p.row.rankChange;
      if (v == null) return <span style={{ color: '#6B7280' }}>—</span>;
      const color = v > 0 ? '#22C55E' : v < 0 ? '#EF4444' : '#6B7280';
      const arrow = v > 0 ? '▲' : v < 0 ? '▼' : '•';
      return <span style={{ color }}>{arrow} {Math.abs(v)}</span>;
    }},
  ], []);

  const handleRefresh = () => {
    setPage(0);
    // Force reload by resetting page, which triggers useEffect
    loadLeaderboard();
  };

  const loadLeaderboard = async () => {
    if (!canQuery) return;
    setLoading(true);
    setError(null);
    try {
      const data = await fetchLeaderboard({ subject, test, page: page + 1, limit: pageSize });
      setRowCount(data.count || 0);
      setRows(
        (data.data || []).map((d, idx) => ({ id: d.studentId, ...d }))
      );
    } catch (err) {
      console.error('Failed to load leaderboard:', err);
      setError(err.response?.data?.error || err.message || 'Failed to load data');
      setRows([]);
      setRowCount(0);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', gap: 8, marginBottom: 12, alignItems: 'center' }}>
        <input placeholder="Subject (e.g., Math)" value={subject} onChange={(e) => setSubject(e.target.value)} style={{ padding: '6px 10px' }} />
        <input placeholder="Test (e.g., Midterm-1)" value={test} onChange={(e) => setTest(e.target.value)} style={{ padding: '6px 10px' }} />
        <button onClick={handleRefresh} disabled={!canQuery || loading} style={{ padding: '6px 12px', background: '#F3F4F6', border: '1px solid #D1D5DB', borderRadius: 6, cursor: 'pointer', fontSize: 13, fontWeight: 500 }}>
          🔄 Refresh
        </button>
        <ExportButtons data={rows} />
      </div>
      {error && (
        <div style={{ padding: 12, marginBottom: 12, background: '#FEE2E2', color: '#DC2626', borderRadius: 6 }}>
          Error: {error}
        </div>
      )}
      <div style={{ height: 600, width: '100%' }}>
        <DataGrid
          columns={columns}
          rows={rows}
          pagination
          paginationMode="server"
          rowCount={rowCount}
          page={page}
          onPageChange={setPage}
          pageSizeOptions={[10, 25, 50, 100]}
          pageSize={pageSize}
          onPageSizeChange={setPageSize}
          loading={loading}
          disableColumnMenu
        />
      </div>
    </div>
  );
}
