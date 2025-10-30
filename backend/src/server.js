import dotenv from 'dotenv';
import mongoose from 'mongoose';
import app from './app.js';

dotenv.config();

const PORT = process.env.PORT || 3000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/model_lab';

async function start() {
  try {
    await mongoose.connect(MONGODB_URI, { autoIndex: true });
    console.log('Connected to MongoDB');

    app.listen(PORT, () => {
      console.log(`API server running on http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error('Failed to start server', err);
    process.exit(1);
  }
}

start();
