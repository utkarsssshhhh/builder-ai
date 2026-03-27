// ─── Chat Message Types ─────────────────────────────────────────────────────

export type MessageRole = 'user' | 'assistant';

export interface ChatMessage {
  id: string;
  role: MessageRole;
  content: string;
  timestamp: number;
  files?: GeneratedFile[];
}

export interface ChatRequest {
  messages: Array<{ role: MessageRole; content: string }>;
  systemPrompt?: string;
}

export interface ChatStreamChunk {
  type: 'text_delta' | 'file_delta' | 'done' | 'error';
  content?: string;
  error?: string;
}

// ─── File System Types ──────────────────────────────────────────────────────

export interface GeneratedFile {
  path: string;
  content: string;
  language: string;
}

export interface FileNode {
  name: string;
  path: string;
  isDirectory: boolean;
  children?: FileNode[];
  content?: string;
  language?: string;
}

// ─── Project Types ──────────────────────────────────────────────────────────

export interface Project {
  id: string;
  name: string;
  files: GeneratedFile[];
  createdAt: number;
  updatedAt: number;
}

// ─── API Response Types ─────────────────────────────────────────────────────

export interface ApiErrorResponse {
  error: string;
  message: string;
  statusCode: number;
}

// ─── Utility Types ──────────────────────────────────────────────────────────

export function getLanguageFromPath(filePath: string): string {
  const ext = filePath.split('.').pop()?.toLowerCase() ?? '';
  const langMap: Record<string, string> = {
    ts: 'typescript',
    tsx: 'typescriptreact',
    js: 'javascript',
    jsx: 'javascriptreact',
    html: 'html',
    css: 'css',
    json: 'json',
    md: 'markdown',
    svg: 'xml',
  };
  return langMap[ext] ?? 'plaintext';
}

export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
}
