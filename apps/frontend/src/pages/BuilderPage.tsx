import { ChatPanel } from '../components/chat/ChatPanel';
import { EditorArea } from '../components/editor/EditorArea';
import { PreviewPanel } from '../components/preview/PreviewPanel';
import { useAppStore } from '../store/appStore';
import { Sparkles } from 'lucide-react';

export function BuilderPage() {
  const activeView = useAppStore((s) => s.activeView);

  return (
    <main className="shadow-builder" id="builder-page">
      {/* Column 1: Chat Panel */}
      <div className="shadow-builder__chat">
        <ChatPanel />
      </div>

      {/* Column 2: File Explorer */}
      <div className="shadow-builder__files">
        <FilesPanel />
      </div>

      {/* Column 3: Editor stacked over gradient preview area */}
      <div className="shadow-builder__main">
        {/* Editor/Preview pane (top portion based on activeView) */}
        {activeView !== 'preview' && (
          <div className="shadow-builder__editor">
            <div className="shadow-builder__editor-inner">
              <EditorArea hideExplorer />
            </div>
          </div>
        )}

        {activeView === 'split' && (
          <div className="shadow-builder__editor shadow-builder__editor--preview">
            <div className="shadow-builder__editor-inner">
              <PreviewPanel />
            </div>
          </div>
        )}

        {activeView === 'preview' && (
          <div className="shadow-builder__editor shadow-builder__editor--full">
            <div className="shadow-builder__editor-inner">
              <PreviewPanel />
            </div>
          </div>
        )}

        {/* Large gradient preview area (always at bottom) */}
        <div className="shadow-builder__preview">
          <PreviewGradientArea />
        </div>
      </div>
    </main>
  );
}

function FilesPanel() {
  const files = useAppStore((s) => s.files);
  const activeFilePath = useAppStore((s) => s.activeFilePath);
  const setActiveFile = useAppStore((s) => s.setActiveFile);

  return (
    <div className="shadow-files-panel" id="files-panel">
      <div className="shadow-files-panel__header">
        <span className="shadow-files-panel__title">Files</span>
      </div>
      <div className="shadow-files-panel__body">
        {files.length === 0 ? (
          <p className="shadow-files-panel__empty">
            No files yet. Start a chat to generate code.
          </p>
        ) : (
          files.map((file) => {
            const name = file.path.split('/').pop() ?? file.path;
            return (
              <div
                key={file.path}
                className={`shadow-files-panel__item ${file.path === activeFilePath ? 'shadow-files-panel__item--active' : ''}`}
                onClick={() => setActiveFile(file.path)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => { if (e.key === 'Enter') setActiveFile(file.path); }}
              >
                <span className="shadow-files-panel__item-name">{name}</span>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

function PreviewGradientArea() {
  return (
    <div className="shadow-preview-gradient" id="preview-gradient-area">
      <button
        className="shadow-preview-gradient__fab"
        title="AI Assistant"
        aria-label="AI Assistant"
      >
        <Sparkles size={20} />
      </button>
    </div>
  );
}
