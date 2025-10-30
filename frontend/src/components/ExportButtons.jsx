import React from 'react';

export function exportToCSV(filename, rows) {
  if (!rows || !rows.length) return;
  const headers = Object.keys(rows[0]);
  const csv = [headers.join(','), ...rows.map(r => headers.map(h => JSON.stringify(r[h] ?? '')).join(','))].join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export default function ExportButtons({ data }) {
  return (
    <div style={{ display: 'flex', gap: 8 }}>
      <button onClick={() => exportToCSV('leaderboard.csv', data)} style={{ padding: '6px 10px' }}>Export CSV</button>
      {/* Placeholder for PDF export (e.g., jsPDF or server-side) */}
      {/* <button disabled>Export PDF</button> */}
    </div>
  );
}
