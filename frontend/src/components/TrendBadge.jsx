import React from 'react';

export default function TrendBadge({ value }) {
  const color = value === 'Improving' ? '#22C55E' : value === 'Needs Support' ? '#EF4444' : '#6B7280';
  return (
    <span style={{ color, fontWeight: 600 }}>{value}</span>
  );
}
