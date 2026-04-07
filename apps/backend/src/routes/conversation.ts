import { Router } from 'express';
import type { Request, Response, Router as RouterType } from 'express';
import { getClaudeService } from '../services/claude.js';
import { AppError } from '../middleware/errorHandler.js';

export const conversationRouter: RouterType = Router();

// POST /api/chat/conversation — Streams a conversational Claude response via SSE
conversationRouter.post('/', async (req: Request, res: Response) => {
  try {
    const { messages } = req.body as {
      messages?: Array<{ role: 'user' | 'assistant'; content: string }>;
    };

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      throw new AppError('messages array is required and must not be empty', 400);
    }

    for (const msg of messages) {
      if (!msg.role || !msg.content) {
        throw new AppError('Each message must have a role and content', 400);
      }
      if (msg.role !== 'user' && msg.role !== 'assistant') {
        throw new AppError('Message role must be "user" or "assistant"', 400);
      }
    }

    // Set up SSE headers
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no');
    res.flushHeaders();

    const claude = getClaudeService();

    for await (const chunk of claude.streamConversation(messages)) {
      const data = JSON.stringify({ type: 'text_delta', content: chunk });
      res.write(`data: ${data}\n\n`);
    }

    res.write(`data: ${JSON.stringify({ type: 'done' })}\n\n`);
    res.end();
  } catch (error) {
    if (res.headersSent) {
      const errMsg = error instanceof Error ? error.message : 'Unknown error';
      res.write(`data: ${JSON.stringify({ type: 'error', error: errMsg })}\n\n`);
      res.end();
    } else {
      const statusCode = error instanceof AppError ? error.statusCode : 500;
      const message = error instanceof Error ? error.message : 'Internal server error';
      res.status(statusCode).json({ error: 'ConversationError', message, statusCode });
    }
  }
});
