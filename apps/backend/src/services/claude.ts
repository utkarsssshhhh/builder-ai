import Anthropic from '@anthropic-ai/sdk';
import { AppError } from '../middleware/errorHandler.js';

const SYSTEM_PROMPT = `You are an expert web developer AI assistant. When the user asks you to build a web application, you generate complete, working code files.

CRITICAL RULES FOR CODE GENERATION:
1. Return code inside file blocks using this EXACT format:

---FILE: path/to/file.ext---
file content here
---END FILE---

2. Always generate a complete, working application with these files at minimum:
   - index.html (main HTML file)
   - styles.css (all styling) 
   - script.js (all JavaScript logic)

3. Use modern, clean, production-quality code
4. Include beautiful, responsive CSS with dark mode support
5. Use semantic HTML5
6. Add smooth animations and micro-interactions
7. Never use external CDN links except for Google Fonts
8. All JavaScript should be vanilla JS (no frameworks in generated code)
9. Make the generated applications visually stunning with gradients, shadows, and modern design
10. Always include proper error handling in JavaScript

When modifying an existing project, output ONLY the changed files using the same format.
If the user asks a question (not requesting code), respond normally without file blocks.`;

const CONVERSATION_SYSTEM_PROMPT = `You are a helpful, friendly, and knowledgeable AI assistant. You engage in natural conversations on any topic.

RULES:
1. Respond conversationally, clearly, and helpfully
2. Be concise but thorough
3. Use markdown formatting when it helps readability (lists, bold, code blocks for code snippets)
4. Do NOT generate file blocks or use the ---FILE: format
5. If the user asks about code, provide code snippets inline using markdown code blocks
6. Be personable and engaging`;

export class ClaudeService {
  private client: Anthropic;

  constructor() {
    const apiKey = process.env['ANTHROPIC_API_KEY'];
    if (!apiKey || apiKey === 'your-api-key-here') {
      throw new AppError('ANTHROPIC_API_KEY is not configured. Set it in apps/backend/.env', 500);
    }
    this.client = new Anthropic({ apiKey });
  }

  async *streamChat(
    messages: Array<{ role: 'user' | 'assistant'; content: string }>
  ): AsyncGenerator<string> {
    const stream = this.client.messages.stream({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 8192,
      system: SYSTEM_PROMPT,
      messages: messages.map((m) => ({
        role: m.role,
        content: m.content,
      })),
    });

    for await (const event of stream) {
      if (
        event.type === 'content_block_delta' &&
        event.delta.type === 'text_delta'
      ) {
        yield event.delta.text;
      }
    }
  }

  async *streamConversation(
    messages: Array<{ role: 'user' | 'assistant'; content: string }>
  ): AsyncGenerator<string> {
    const stream = this.client.messages.stream({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 4096,
      system: CONVERSATION_SYSTEM_PROMPT,
      messages: messages.map((m) => ({
        role: m.role,
        content: m.content,
      })),
    });

    for await (const event of stream) {
      if (
        event.type === 'content_block_delta' &&
        event.delta.type === 'text_delta'
      ) {
        yield event.delta.text;
      }
    }
  }
}

let serviceInstance: ClaudeService | null = null;

export function getClaudeService(): ClaudeService {
  if (!serviceInstance) {
    serviceInstance = new ClaudeService();
  }
  return serviceInstance;
}
