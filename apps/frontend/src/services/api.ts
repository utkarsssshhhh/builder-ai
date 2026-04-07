import type { GeneratedFile } from '@builder/common';
import { getLanguageFromPath } from '@builder/common';

const API_BASE = '/https://builder-ai-backend.vercel.app/';

interface StreamCallbacks {
  onChunk: (text: string) => void;
  onDone: (fullText: string) => void;
  onError: (error: string) => void;
}

export async function streamChat(
  messages: Array<{ role: 'user' | 'assistant'; content: string }>,
  callbacks: StreamCallbacks
): Promise<void> {
  const response = await fetch(`${API_BASE}/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ messages }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: 'Request failed' }));
    callbacks.onError(errorData.message ?? `HTTP ${response.status}`);
    return;
  }

  const reader = response.body?.getReader();
  if (!reader) {
    callbacks.onError('No response stream available');
    return;
  }

  const decoder = new TextDecoder();
  let fullText = '';
  let buffer = '';

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() ?? '';

      for (const line of lines) {
        if (!line.startsWith('data: ')) continue;

        const jsonStr = line.slice(6).trim();
        if (!jsonStr) continue;

        try {
          const event = JSON.parse(jsonStr) as {
            type: string;
            content?: string;
            error?: string;
          };

          if (event.type === 'text_delta' && event.content) {
            fullText += event.content;
            callbacks.onChunk(event.content);
          } else if (event.type === 'done') {
            callbacks.onDone(fullText);
            return;
          } else if (event.type === 'error') {
            callbacks.onError(event.error ?? 'Unknown streaming error');
            return;
          }
        } catch {
          // Skip malformed JSON lines
        }
      }
    }

    // If stream ended without a 'done' event
    callbacks.onDone(fullText);
  } catch (error) {
    callbacks.onError(error instanceof Error ? error.message : 'Stream interrupted');
  }
}

/**
 * Streams a conversational chat response (no code generation).
 * Uses the /api/chat/conversation endpoint.
 */
export async function streamConversation(
  messages: Array<{ role: 'user' | 'assistant'; content: string }>,
  callbacks: StreamCallbacks
): Promise<void> {
  const response = await fetch(`${API_BASE}/chat/conversation`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ messages }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: 'Request failed' }));
    callbacks.onError(errorData.message ?? `HTTP ${response.status}`);
    return;
  }

  const reader = response.body?.getReader();
  if (!reader) {
    callbacks.onError('No response stream available');
    return;
  }

  const decoder = new TextDecoder();
  let fullText = '';
  let buffer = '';

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() ?? '';

      for (const line of lines) {
        if (!line.startsWith('data: ')) continue;

        const jsonStr = line.slice(6).trim();
        if (!jsonStr) continue;

        try {
          const event = JSON.parse(jsonStr) as {
            type: string;
            content?: string;
            error?: string;
          };

          if (event.type === 'text_delta' && event.content) {
            fullText += event.content;
            callbacks.onChunk(event.content);
          } else if (event.type === 'done') {
            callbacks.onDone(fullText);
            return;
          } else if (event.type === 'error') {
            callbacks.onError(event.error ?? 'Unknown streaming error');
            return;
          }
        } catch {
          // Skip malformed JSON lines
        }
      }
    }

    callbacks.onDone(fullText);
  } catch (error) {
    callbacks.onError(error instanceof Error ? error.message : 'Stream interrupted');
  }
}

/**
 * Parses the AI response text to extract file blocks.
 *
 * Expected format:
 * ---FILE: path/to/file.ext---
 * file content here
 * ---END FILE---
 */
export function parseFilesFromResponse(text: string): GeneratedFile[] {
  const files: GeneratedFile[] = [];
  const regex = /---FILE:\s*(.+?)---\n([\s\S]*?)---END FILE---/g;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(text)) !== null) {
    const path = match[1]!.trim();
    const content = match[2]!;
    files.push({
      path,
      content: content.trimEnd(),
      language: getLanguageFromPath(path),
    });
  }

  return files;
}

/**
 * Extracts the non-file-block text from an AI response (the chat portion).
 */
export function extractChatText(text: string): string {
  return text
    .replace(/---FILE:\s*.+?---[\s\S]*?---END FILE---/g, '')
    .trim();
}
