import 'dotenv/config';
import express, { type Express } from 'express';
import cors from 'cors';
import { chatRouter } from './routes/chat.js';
import { conversationRouter } from './routes/conversation.js';
import { errorHandler } from './middleware/errorHandler.js';

const app: Express = express();
const PORT = parseInt(process.env['PORT'] ?? '3001', 10);

// ─── Middleware ──────────────────────────────────────────────────────────────
// app.use(cors({
//   origin: [
//     'http://localhost:5173', 
//     'https://builder-ai-frontend.vercel.app'
//   ],
//   credentials: true
// }));

const cors = require('cors');

// 1. Setup CORS
app.use(cors({
  origin: [
    'http://localhost:5173', 
    'https://builder-ai-frontend.vercel.app'
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// 2. EXPLICITLY handle the preflight requests
app.options('*', cors());

app.use(express.json({ limit: '10mb' }));

// ─── Health Check ────────────────────────────────────────────────────────────
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: Date.now() });
});

// ─── Routes ──────────────────────────────────────────────────────────────────
app.use('/api/chat/conversation', conversationRouter);
app.use('/api/chat', chatRouter);

// ─── Error Handling ──────────────────────────────────────────────────────────
app.use(errorHandler);

// ─── Start Server ────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`🚀 Builder API running on http://localhost:${PORT}`);
  console.log(`   Health: http://localhost:${PORT}/api/health`);
});

export default app;
