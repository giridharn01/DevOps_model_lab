import React, { useState, useEffect } from 'react';
import { createResult, updateResult } from '../api/client.js';

export default function ResultForm({ result, onClose }) {
  const [formData, setFormData] = useState({
    studentId: '',
    name: '',
    subject: '',
    marks: '',
    grade: '',
    testName: '',
    date: new Date().toISOString().split('T')[0]
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (result) {
      // Parse date safely - handle both ISO strings and Date objects
      let dateValue = new Date().toISOString().split('T')[0];
      if (result.date) {
        try {
          const d = new Date(result.date);
          if (!isNaN(d.getTime())) {
            // Use UTC to avoid timezone issues
            const year = d.getUTCFullYear();
            const month = String(d.getUTCMonth() + 1).padStart(2, '0');
            const day = String(d.getUTCDate()).padStart(2, '0');
            dateValue = `${year}-${month}-${day}`;
          }
        } catch (e) {
          console.error('Invalid date:', result.date);
        }
      }

      setFormData({
        studentId: result.studentId || '',
        name: result.name || '',
        subject: result.subject || '',
        marks: result.marks || '',
        grade: result.grade || '',
        testName: result.testName || '',
        date: dateValue
      });
    }
  }, [result]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      const updated = { ...prev, [name]: value };
      // Auto-calculate grade when marks change
      if (name === 'marks') {
        const marks = parseInt(value, 10);
        if (!isNaN(marks)) {
          if (marks >= 90) updated.grade = 'A+';
          else if (marks >= 80) updated.grade = 'A';
          else if (marks >= 70) updated.grade = 'B';
          else if (marks >= 60) updated.grade = 'C';
          else if (marks >= 50) updated.grade = 'D';
          else updated.grade = 'F';
        }
      }
      return updated;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      if (result && (result._id || result.id)) {
        const resultId = result._id || result.id;
        await updateResult(resultId, formData);
      } else {
        await createResult(formData);
      }
      onClose(true); // reload
    } catch (err) {
      console.error('Failed to save result:', err);
      setError(err.response?.data?.error || err.message || 'Failed to save');
      setSaving(false);
    }
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
      <div style={{ background: 'white', borderRadius: 8, padding: 24, width: '90%', maxWidth: 500 }}>
        <h3 style={{ marginTop: 0 }}>{result ? 'Edit Result' : 'Add Result'}</h3>
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 12 }}>
            <label style={{ display: 'block', marginBottom: 4, fontWeight: 600 }}>Student ID *</label>
            <input
              name="studentId"
              value={formData.studentId}
              onChange={handleChange}
              required
              style={{ width: '100%', padding: '8px 12px', boxSizing: 'border-box' }}
            />
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
            <label style={{ display: 'block', marginBottom: 4, fontWeight: 600 }}>Subject *</label>
            <input
              name="subject"
              value={formData.subject}
              onChange={handleChange}
              required
              placeholder="e.g., Math, Science, English"
              style={{ width: '100%', padding: '8px 12px', boxSizing: 'border-box' }}
            />
          </div>
          <div style={{ marginBottom: 12 }}>
            <label style={{ display: 'block', marginBottom: 4, fontWeight: 600 }}>Test Name *</label>
            <input
              name="testName"
              value={formData.testName}
              onChange={handleChange}
              required
              placeholder="e.g., Midterm-1, Quiz-2"
              style={{ width: '100%', padding: '8px 12px', boxSizing: 'border-box' }}
            />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
            <div>
              <label style={{ display: 'block', marginBottom: 4, fontWeight: 600 }}>Marks *</label>
              <input
                name="marks"
                type="number"
                min="0"
                max="100"
                value={formData.marks}
                onChange={handleChange}
                required
                style={{ width: '100%', padding: '8px 12px', boxSizing: 'border-box' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: 4, fontWeight: 600 }}>Grade *</label>
              <input
                name="grade"
                value={formData.grade}
                onChange={handleChange}
                required
                style={{ width: '100%', padding: '8px 12px', boxSizing: 'border-box' }}
              />
            </div>
          </div>
          <div style={{ marginBottom: 12 }}>
            <label style={{ display: 'block', marginBottom: 4, fontWeight: 600 }}>Date *</label>
            <input
              name="date"
              type="date"
              value={formData.date}
              onChange={handleChange}
              required
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
