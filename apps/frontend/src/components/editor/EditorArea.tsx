import { useCallback } from 'react';
import Editor from '@monaco-editor/react';
import { X, FileText, FileCode2, FileJson, Code2 } from 'lucide-react';
import { useAppStore } from '../../store/appStore';

function getFileIcon(path: string) {
  const ext = path.split('.').pop()?.toLowerCase() ?? '';
  switch (ext) {
    case 'html':
      return <FileCode2 size={12} style={{ color: '#e44d26' }} />;
    case 'css':
      return <FileCode2 size={12} style={{ color: '#264de4' }} />;
    case 'js':
    case 'jsx':
      return <FileText size={12} style={{ color: '#f7df1e' }} />;
    case 'ts':
    case 'tsx':
      return <FileCode2 size={12} style={{ color: '#3178c6' }} />;
    case 'json':
      return <FileJson size={12} style={{ color: '#5fb660' }} />;
    default:
      return <FileText size={12} />;
  }
}

function getMonacoLanguage(path: string): string {
  const ext = path.split('.').pop()?.toLowerCase() ?? '';
  const map: Record<string, string> = {
    html: 'html',
    css: 'css',
    js: 'javascript',
    jsx: 'javascript',
    ts: 'typescript',
    tsx: 'typescript',
    json: 'json',
    md: 'markdown',
    svg: 'xml',
  };
  return map[ext] ?? 'plaintext';
}

interface EditorAreaProps {
  hideExplorer?: boolean;
}

export function EditorArea({ hideExplorer = false }: EditorAreaProps) {
  const files = useAppStore((s) => s.files);
  const activeFilePath = useAppStore((s) => s.activeFilePath);
  const openTabs = useAppStore((s) => s.openTabs);
  const setActiveFile = useAppStore((s) => s.setActiveFile);
  const closeTab = useAppStore((s) => s.closeTab);
  const updateFile = useAppStore((s) => s.updateFile);

  const activeFile = files.find((f) => f.path === activeFilePath);

  const handleEditorChange = useCallback(
    (value: string | undefined) => {
      if (activeFilePath && value !== undefined) {
        updateFile(activeFilePath, value);
      }
    },
    [activeFilePath, updateFile]
  );

  return (
    <div className="editor-area" id="editor-area">
      {/* Tab Bar */}
      <div className="tab-bar">
        <div className="tab-bar__tabs">
          {openTabs.map((tabPath) => {
            const fileName = tabPath.split('/').pop() ?? tabPath;
            return (
              <button
                key={tabPath}
                className={`tab-bar__tab ${tabPath === activeFilePath ? 'tab-bar__tab--active' : ''}`}
                onClick={() => setActiveFile(tabPath)}
                title={tabPath}
              >
                {getFileIcon(tabPath)}
                <span>{fileName}</span>
                <span
                  className="tab-bar__tab-close"
                  role="button"
                  tabIndex={0}
                  onClick={(e) => {
                    e.stopPropagation();
                    closeTab(tabPath);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.stopPropagation();
                      closeTab(tabPath);
                    }
                  }}
                  aria-label={`Close ${fileName}`}
                >
                  <X size={10} />
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Editor Content */}
      <div className="editor-content">
        {/* File Explorer Sidebar */}
        {!hideExplorer && (
          <aside className="editor-content__sidebar" id="file-explorer">
            <div className="file-explorer">
              <div className="file-explorer__header">
                <span className="file-explorer__title">Files</span>
              </div>
              {files.length === 0 ? (
                <div style={{ padding: '12px 16px', fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>
                  No files yet. Start a chat to generate code.
                </div>
              ) : (
                files.map((file) => (
                  <div
                    key={file.path}
                    className={`file-tree__item ${file.path === activeFilePath ? 'file-tree__item--active' : ''}`}
                    onClick={() => setActiveFile(file.path)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') setActiveFile(file.path);
                    }}
                  >
                    <span className="file-tree__icon">{getFileIcon(file.path)}</span>
                    <span className="file-tree__name">{file.path}</span>
                  </div>
                ))
              )}
            </div>
          </aside>
        )}

        {/* Monaco Editor */}
        <div className="editor-content__main">
          {activeFile ? (
            <Editor
              key={activeFilePath}
              height="100%"
              language={getMonacoLanguage(activeFile.path)}
              value={activeFile.content}
              onChange={handleEditorChange}
              theme="vs-dark"
              options={{
                fontSize: 13,
                fontFamily: "'JetBrains Mono', 'Fira Code', 'Cascadia Code', monospace",
                fontLigatures: true,
                minimap: { enabled: false },
                padding: { top: 16, bottom: 16 },
                scrollBeyondLastLine: false,
                smoothScrolling: true,
                cursorBlinking: 'smooth',
                cursorSmoothCaretAnimation: 'on',
                renderLineHighlight: 'all',
                bracketPairColorization: { enabled: true },
                wordWrap: 'on',
                tabSize: 2,
                automaticLayout: true,
              }}
            />
          ) : (
            <div className="editor-empty">
              <div className="editor-empty__icon">
                <Code2 size={32} />
              </div>
              <h3 className="editor-empty__title">No file selected</h3>
              <p className="editor-empty__desc">
                Select a file from the explorer or generate code through the chat.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
