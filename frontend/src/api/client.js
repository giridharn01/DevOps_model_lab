import axios from 'axios';

export const api = axios.create({
  baseURL: '/api'
});

export async function fetchLeaderboard({ subject, test, page = 1, limit = 50 }) {
  const res = await api.get('/leaderboard', { params: { subject, test, page, limit } });
  return res.data;
}

export async function fetchPerformance(studentId, subject) {
  const res = await api.get(`/performance/${studentId}`, { params: { subject } });
  return res.data;
}

export async function fetchCompare(studentA, studentB, subject) {
  const res = await api.get('/performance/compare', { params: { studentA, studentB, subject } });
  return res.data;
}
