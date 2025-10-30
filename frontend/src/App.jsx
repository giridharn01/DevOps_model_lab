import React from 'react';
import { Routes, Route, NavLink } from 'react-router-dom';
import Dashboard from './pages/Dashboard.jsx';

const navStyle = {
  padding: '10px 16px',
  textDecoration: 'none'
};

export default function App() {
  return (
    <div style={{ fontFamily: 'Inter, system-ui, Avenir, Helvetica, Arial, sans-serif', padding: 16 }}>
      <header style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
        <h2 style={{ margin: 0 }}>Model Lab</h2>
        <nav style={{ display: 'flex', gap: 8 }}>
          <NavLink to="/" style={navStyle}>Dashboard</NavLink>
        </nav>
      </header>
      <Routes>
        <Route path="/" element={<Dashboard />} />
      </Routes>
    </div>
  );
}
