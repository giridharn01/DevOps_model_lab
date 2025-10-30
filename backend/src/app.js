import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';

import leaderboardRouter from './routes/leaderboard.js';
import performanceRouter from './routes/performance.js';
import studentsRouter from './routes/students.js';
import resultsRouter from './routes/results.js';

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(compression());
app.use(morgan('dev'));

// Root welcome route to avoid 404 on /
app.get('/', (req, res) => {
  res.json({
    name: 'Model Lab API',
    version: '1.0.0',
    status: 'ok',
    endpoints: {
      health: '/api/health',
      students: '/api/students',
      results: '/api/results',
      leaderboard: '/api/leaderboard?subject={subject}&test={testName}',
      performance: '/api/performance/{studentId}?subject={subject}',
      compare: '/api/performance/compare?studentA={id}&studentB={id}&subject={subject}'
    },
    documentation: 'See README.md for full API documentation'
  });
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

app.use('/api/leaderboard', leaderboardRouter);
app.use('/api/performance', performanceRouter);
app.use('/api/students', studentsRouter);
app.use('/api/results', resultsRouter);

// Not found
app.use((req, res) => {
  res.status(404).json({ error: 'Not Found' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({ error: err.message || 'Internal Server Error' });
});

export default app;
