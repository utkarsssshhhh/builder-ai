import { useState, useRef, useEffect, useCallback } from 'react';
import { Send, Moon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { streamConversation } from '../services/api';

interface ChatMsg {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

let msgCounter = 0;
function nextId() {
  return `chat-msg-${++msgCounter}-${Date.now()}`;
}

export function ChatPage() {
  const navigate = useNavigate();
  const [messages, setMessages] = useState<ChatMsg[]>([
    {
      id: nextId(),
      role: 'assistant',
      content: 'Shadow online. I am ready to analyze or assist. What is your directive?',
    },
  ]);
  const [input, setInput] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamingContent, setStreamingContent] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, streamingContent]);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 160)}px`;
    }
  }, [input]);

  const handleSend = useCallback(async () => {
    const trimmed = input.trim();
    if (!trimmed || isStreaming) return;

    const userMsg: ChatMsg = { id: nextId(), role: 'user', content: trimmed };
    setInput('');
    setMessages((prev) => [...prev, userMsg]);
    setIsStreaming(true);
    setStreamingContent('');

    const apiMessages = [...messages, userMsg].map((m) => ({
      role: m.role,
      content: m.content,
    }));

    await streamConversation(apiMessages, {
      onChunk: (text) => {
        setStreamingContent((prev) => prev + text);
      },
      onDone: (fullText) => {
        setMessages((prev) => [
          ...prev,
          { id: nextId(), role: 'assistant', content: fullText },
        ]);
        setIsStreaming(false);
        setStreamingContent('');
      },
      onError: (error) => {
        setMessages((prev) => [
          ...prev,
          { id: nextId(), role: 'assistant', content: `⚠️ ${error}` },
        ]);
        setIsStreaming(false);
        setStreamingContent('');
      },
    });
  }, [input, isStreaming, messages]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      void handleSend();
    }
  };

  return (
    <div className="chat-view" id="chat-page">
      {/* Gradient background (same as landing page) */}
      <div className="home-page__gradient-bg" />

      {/* Top bar */}
      <header className="chat-view__topbar">
        <button className="chat-view__brand" onClick={() => navigate('/')} aria-label="Go home">
          shadow
        </button>
        <button className="home-page__theme-toggle" aria-label="Toggle theme">
          <Moon size={18} />
        </button>
      </header>

      {/* Messages */}
      <div className="chat-view__messages" id="chat-page-messages">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`chat-view__msg chat-view__msg--${msg.role}`}
          >
            <div className="chat-view__bubble">
              {msg.content}
            </div>
          </div>
        ))}

        {isStreaming && (
          <div className="chat-view__msg chat-view__msg--assistant">
            <div className="chat-view__bubble">
              {streamingContent || (
                <div className="typing-indicator">
                  <div className="typing-indicator__dot" />
                  <div className="typing-indicator__dot" />
                  <div className="typing-indicator__dot" />
                </div>
              )}
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input bar */}
      <div className="chat-view__input-wrap" id="chat-page-input">
        <form
          className="chat-view__input-form"
          onSubmit={(e) => {
            e.preventDefault();
            void handleSend();
          }}
        >
          <textarea
            ref={textareaRef}
            className="chat-view__textarea"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type your message..."
            rows={1}
            disabled={isStreaming}
            id="chat-page-textarea"
          />
          <button
            type="submit"
            className="chat-view__send-btn"
            disabled={!input.trim() || isStreaming}
            id="chat-page-send-btn"
            aria-label="Send message"
          >
            <Send size={16} />
          </button>
        </form>
      </div>
    </div>
  );
}
