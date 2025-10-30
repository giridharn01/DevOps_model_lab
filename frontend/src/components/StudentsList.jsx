import React, { useEffect, useState } from 'react';
import { DataGrid } from '@mui/x-data-grid';
import { fetchStudents, deleteStudent } from '../api/client.js';
import StudentForm from './StudentForm.jsx';

export default function StudentsList() {
  const [rows, setRows] = useState([]);
  const [rowCount, setRowCount] = useState(0);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(25);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [editStudent, setEditStudent] = useState(null);
  const [showForm, setShowForm] = useState(false);

  const loadStudents = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchStudents({ search, page: page + 1, limit: pageSize });
      setRows(data.data.map((s) => ({ id: s._id, ...s })));
      setRowCount(data.count);
    } catch (err) {
      console.error('Failed to load students:', err);
      setError(err.response?.data?.error || err.message || 'Failed to load students');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStudents();
  }, [search, page, pageSize]);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this student? This will NOT delete their test results.')) return;
    try {
      await deleteStudent(id);
      loadStudents();
    } catch (err) {
      alert('Failed to delete: ' + (err.response?.data?.error || err.message));
    }
  };

  const handleEdit = (student) => {
    setEditStudent(student);
    setShowForm(true);
  };

  const handleAdd = () => {
    setEditStudent(null);
    setShowForm(true);
  };

  const handleFormClose = (reload) => {
    setShowForm(false);
    setEditStudent(null);
    if (reload) loadStudents();
  };

  const columns = [
    { field: 'studentId', headerName: 'Student ID', width: 130 },
    { field: 'name', headerName: 'Name', flex: 1 },
    { field: 'email', headerName: 'Email', flex: 1 },
    { field: 'class', headerName: 'Class', width: 100 },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 180,
      sortable: false,
      renderCell: (params) => (
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={() => handleEdit(params.row)} style={{ padding: '4px 8px', cursor: 'pointer' }}>
            Edit
          </button>
          <button onClick={() => handleDelete(params.row.id)} style={{ padding: '4px 8px', cursor: 'pointer', background: '#DC2626', color: 'white', border: 'none', borderRadius: 4 }}>
            Delete
          </button>
        </div>
      )
    }
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
        <input
          placeholder="Search by name or ID..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ padding: '8px 12px', width: 300 }}
        />
        <button onClick={handleAdd} style={{ padding: '8px 16px', background: '#2563EB', color: 'white', border: 'none', borderRadius: 6, cursor: 'pointer' }}>
          + Add Student
        </button>
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
          pageSize={pageSize}
          onPageSizeChange={setPageSize}
          pageSizeOptions={[10, 25, 50, 100]}
          loading={loading}
          disableColumnMenu
        />
      </div>

      {showForm && <StudentForm student={editStudent} onClose={handleFormClose} />}
    </div>
  );
}
