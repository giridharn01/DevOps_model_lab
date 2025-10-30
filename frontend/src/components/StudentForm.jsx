import React, { useState, useEffect } from 'react';
import { createStudent, updateStudent, fetchStudents } from '../api/client.js';

export default function StudentForm({ student, onClose }) {
  const [formData, setFormData] = useState({
    studentId: '',
    name: '',
    email: '',
    class: '',
    roles: ['Student']
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [autoGenerating, setAutoGenerating] = useState(false);

  // Auto-generate next Student ID when adding new student
  useEffect(() => {
    if (!student) {
      generateNextStudentId();
    }
  }, []);

  useEffect(() => {
    if (student) {
      setFormData({
        studentId: student.studentId || '',
        name: student.name || '',
        email: student.email || '',
        class: student.class || '',
        roles: student.roles || ['Student']
      });
    }
  }, [student]);

  const generateNextStudentId = async () => {
    setAutoGenerating(true);
    try {
      // Fetch all students to find highest ID
      const data = await fetchStudents({ search: '', page: 1, limit: 1000 });
      const existingIds = data.data
        .map((s) => s.studentId)
        .filter((id) => /^S\d+$/.test(id)) // Only S### format
        .map((id) => parseInt(id.substring(1), 10))
        .filter((n) => !isNaN(n));

      const maxId = existingIds.length > 0 ? Math.max(...existingIds) : 0;
      const nextId = `S${String(maxId + 1).padStart(3, '0')}`;
      
      setFormData((prev) => ({ ...prev, studentId: nextId }));
    } catch (err) {
      console.error('Failed to generate ID:', err);
      setFormData((prev) => ({ ...prev, studentId: 'S001' })); // fallback
    } finally {
      setAutoGenerating(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      if (student) {
        await updateStudent(student.id || student._id, formData);
      } else {
        await createStudent(formData);
      }
      onClose(true); // reload
    } catch (err) {
      console.error('Failed to save student:', err);
      setError(err.response?.data?.error || err.message || 'Failed to save');
      setSaving(false);
    }
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
      <div style={{ background: 'white', borderRadius: 8, padding: 24, width: '90%', maxWidth: 500 }}>
        <h3 style={{ marginTop: 0 }}>{student ? 'Edit Student' : 'Add Student'}</h3>
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 12 }}>
            <label style={{ display: 'block', marginBottom: 4, fontWeight: 600 }}>
              Student ID * {autoGenerating && <span style={{ fontSize: 12, color: '#6B7280' }}>(generating...)</span>}
            </label>
            <div style={{ display: 'flex', gap: 8 }}>
              <input
                name="studentId"
                value={formData.studentId}
                onChange={handleChange}
                required
                disabled={!!student || autoGenerating}
                style={{ flex: 1, padding: '8px 12px', boxSizing: 'border-box' }}
                placeholder="e.g., S016"
              />
              {!student && (
                <button
                  type="button"
                  onClick={generateNextStudentId}
                  disabled={autoGenerating}
                  style={{
                    padding: '8px 12px',
                    background: '#F3F4F6',
                    border: '1px solid #D1D5DB',
                    borderRadius: 6,
                    cursor: 'pointer',
                    fontSize: 13,
                    fontWeight: 500
                  }}
                >
                  🔄 Auto
                </button>
              )}
            </div>
            {!student && (
              <div style={{ fontSize: 11, color: '#6B7280', marginTop: 4 }}>
                Auto-generated on form open. Click Auto to regenerate.
              </div>
            )}
          </div>
          <div style={{ marginBottom: 12 }}>
            <label style={{ display: 'block', marginBottom: 4, fontWeight: 600 }}>Name *</label>
            <input
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              style={{ width: '100%', padding: '8px 12px', boxSizing: 'border-box' }}
            />
          </div>
          <div style={{ marginBottom: 12 }}>
            <label style={{ display: 'block', marginBottom: 4, fontWeight: 600 }}>Email</label>
            <input
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              style={{ width: '100%', padding: '8px 12px', boxSizing: 'border-box' }}
            />
          </div>
          <div style={{ marginBottom: 12 }}>
            <label style={{ display: 'block', marginBottom: 4, fontWeight: 600 }}>Class</label>
            <input
              name="class"
              value={formData.class}
              onChange={handleChange}
              style={{ width: '100%', padding: '8px 12px', boxSizing: 'border-box' }}
            />
          </div>

          {error && (
            <div style={{ padding: 12, marginBottom: 12, background: '#FEE2E2', color: '#DC2626', borderRadius: 6 }}>
              {error}
            </div>
          )}

          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
            <button type="button" onClick={() => onClose(false)} disabled={saving} style={{ padding: '8px 16px', cursor: 'pointer' }}>
              Cancel
            </button>
            <button type="submit" disabled={saving} style={{ padding: '8px 16px', background: '#2563EB', color: 'white', border: 'none', borderRadius: 6, cursor: 'pointer' }}>
              {saving ? 'Saving...' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
