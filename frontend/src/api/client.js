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

// Students CRUD
export async function fetchStudents({ search = '', page = 1, limit = 25 }) {
  const res = await api.get('/students', { params: { search, page, limit } });
  return res.data;
}

export async function fetchStudentById(id) {
  const res = await api.get(`/students/${id}`);
  return res.data;
}

export async function createStudent(data) {
  const res = await api.post('/students', data);
  return res.data;
}

export async function updateStudent(id, data) {
  const res = await api.put(`/students/${id}`, data);
  return res.data;
}

export async function deleteStudent(id) {
  const res = await api.delete(`/students/${id}`);
  return res.data;
}

// Results CRUD
export async function fetchResults({ studentId = '', subject = '', test = '', from = '', to = '', page = 1, limit = 25 }) {
  const res = await api.get('/results', { params: { studentId, subject, test, from, to, page, limit } });
  return res.data;
}

export async function fetchResultById(id) {
  const res = await api.get(`/results/${id}`);
  return res.data;
}

export async function createResult(data) {
  const res = await api.post('/results', data);
  return res.data;
}

export async function updateResult(id, data) {
  const res = await api.put(`/results/${id}`, data);
  return res.data;
}

export async function deleteResult(id) {
  const res = await api.delete(`/results/${id}`);
  return res.data;
}
