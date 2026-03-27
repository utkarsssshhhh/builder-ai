import { useState, useRef, useEffect, useCallback } from 'react';
import { Send, Sparkles, MessageSquare, User, Bot } from 'lucide-react';
import { useAppStore } from '../../store/appStore';
import { streamChat, parseFilesFromResponse, extractChatText } from '../../services/api';

export function ChatPanel() {
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const messages = useAppStore((s) => s.messages);
  const isStreaming = useAppStore((s) => s.isStreaming);
  const streamingContent = useAppStore((s) => s.streamingContent);
  const addUserMessage = useAppStore((s) => s.addUserMessage);
  const addAssistantMessage = useAppStore((s) => s.addAssistantMessage);
  const setStreaming = useAppStore((s) => s.setStreaming);
  const appendStreamingContent = useAppStore((s) => s.appendStreamingContent);
  const clearStreamingContent = useAppStore((s) => s.clearStreamingContent);
  const setFiles = useAppStore((s) => s.setFiles);

  // Auto-scroll to bottom
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

    setInput('');
    addUserMessage(trimmed);
    setStreaming(true);
    clearStreamingContent();

    // Build messages for API (include conversation history)
    const currentMessages = useAppStore.getState().messages;
    const apiMessages = currentMessages.map((m) => ({
      role: m.role,
      content: m.content,
    }));

    await streamChat(apiMessages, {
      onChunk: (text) => {
        appendStreamingContent(text);
      },
      onDone: (fullText) => {
        const parsedFiles = parseFilesFromResponse(fullText);
        const chatText = extractChatText(fullText);

        addAssistantMessage(chatText || 'Here are your generated files:', parsedFiles);

        if (parsedFiles.length > 0) {
          // Merge with existing files
          const existingFiles = useAppStore.getState().files;
          const fileMap = new Map(existingFiles.map((f) => [f.path, f]));
          for (const file of parsedFiles) {
            fileMap.set(file.path, file);
          }
          setFiles(Array.from(fileMap.values()));
        }

        setStreaming(false);
        clearStreamingContent();
      },
      onError: (error) => {
        addAssistantMessage(`⚠️ Error: ${error}`);
        setStreaming(false);
        clearStreamingContent();
      },
    });
  }, [input, isStreaming, addUserMessage, setStreaming, clearStreamingContent, appendStreamingContent, addAssistantMessage, setFiles]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      void handleSend();
    }
  };

  return (
    <aside className="chat-panel" id="chat-panel">
      <div className="chat-panel__header">
        <span className="chat-panel__title">
          <MessageSquare size={14} />
          Chat
        </span>
      </div>

      <div className="chat-panel__messages" id="chat-messages">
        {messages.length === 0 && !isStreaming ? (
          <div className="chat-panel__empty">
            <div className="chat-panel__empty-icon">
              <Sparkles size={28} color="white" />
            </div>
            <h2 className="chat-panel__empty-title">What shall we build?</h2>
            <p className="chat-panel__empty-desc">
              Describe the web application you want, and I&apos;ll generate the
              code for you in real-time.
            </p>
          </div>
        ) : (
          <>
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`message message--${msg.role}`}
              >
                <div className="message__avatar">
                  {msg.role === 'user' ? <User size={14} /> : <Bot size={14} />}
                </div>
                <div className="message__content">
                  <div className="message__bubble">
                    {msg.content}
                    {msg.files && msg.files.length > 0 && (
                      <div style={{ marginTop: '8px', fontSize: '0.75rem', opacity: 0.7 }}>
                        📁 {msg.files.length} file{msg.files.length > 1 ? 's' : ''} generated
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {isStreaming && (
              <div className="message message--assistant">
                <div className="message__avatar">
                  <Bot size={14} />
                </div>
                <div className="message__content">
                  <div className="message__bubble">
                    {streamingContent ? (
                      extractChatText(streamingContent) || 'Generating files...'
                    ) : (
                      <div className="typing-indicator">
                        <div className="typing-indicator__dot" />
                        <div className="typing-indicator__dot" />
                        <div className="typing-indicator__dot" />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="chat-input" id="chat-input">
        <form
          className="chat-input__form"
          onSubmit={(e) => {
            e.preventDefault();
            void handleSend();
          }}
        >
          <textarea
            ref={textareaRef}
            className="chat-input__textarea"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Describe your app..."
            rows={1}
            disabled={isStreaming}
            id="chat-input-textarea"
          />
          <button
            type="submit"
            className="chat-input__send"
            disabled={!input.trim() || isStreaming}
            id="chat-send-btn"
            aria-label="Send message"
          >
            <Send size={16} />
          </button>
        </form>
      </div>
    </aside>
  );
}
