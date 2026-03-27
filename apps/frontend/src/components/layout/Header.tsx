import { Zap, Code2, Eye, Columns2, Download } from 'lucide-react';
import { useAppStore } from '../../store/appStore';
import type { ActiveView } from '../../store/appStore';
import { downloadFilesAsZip } from '../../services/download';

export function Header() {
  const activeView = useAppStore((s) => s.activeView);
  const setActiveView = useAppStore((s) => s.setActiveView);
  const files = useAppStore((s) => s.files);

  const views: Array<{ id: ActiveView; icon: React.ReactNode; label: string }> = [
    { id: 'code', icon: <Code2 size={14} />, label: 'Code' },
    { id: 'split', icon: <Columns2 size={14} />, label: 'Split' },
    { id: 'preview', icon: <Eye size={14} />, label: 'Preview' },
  ];

  const handleDownload = () => {
    void downloadFilesAsZip(files, 'my-app');
  };

  return (
    <header className="header" id="app-header">
      <div className="header__brand">
        <div className="header__logo">
          <Zap size={16} />
        </div>
        <h1 className="header__title">Builder</h1>
      </div>

      <div className="header__actions">
        <button
          className="btn btn--ghost btn--icon"
          onClick={handleDownload}
          disabled={files.length === 0}
          title="Download project as ZIP"
          aria-label="Download project as ZIP"
          id="download-zip-btn"
        >
          <Download size={16} />
        </button>

        <div className="view-toggle" role="tablist" aria-label="View mode">
          {views.map((v) => (
            <button
              key={v.id}
              className={`view-toggle__btn ${activeView === v.id ? 'view-toggle__btn--active' : ''}`}
              onClick={() => setActiveView(v.id)}
              role="tab"
              aria-selected={activeView === v.id}
              aria-label={v.label}
              title={v.label}
            >
              {v.icon}
            </button>
          ))}
        </div>
      </div>
    </header>
  );
}
