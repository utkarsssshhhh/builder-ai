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
}

let serviceInstance: ClaudeService | null = null;

export function getClaudeService(): ClaudeService {
  if (!serviceInstance) {
    serviceInstance = new ClaudeService();
  }
  return serviceInstance;
}
