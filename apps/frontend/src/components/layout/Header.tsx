import { useLocation, useNavigate } from 'react-router-dom';
import { Code2, Eye, Columns2, Download, Moon, Link2 } from 'lucide-react';
import { useAppStore } from '../../store/appStore';
import type { ActiveView } from '../../store/appStore';
import { downloadFilesAsZip } from '../../services/download';

export function Header() {
  const location = useLocation();
  const navigate = useNavigate();
  const activeView = useAppStore((s) => s.activeView);
  const setActiveView = useAppStore((s) => s.setActiveView);
  const files = useAppStore((s) => s.files);

  const isBuildRoute = location.pathname === '/build';

  const views: Array<{ id: ActiveView; icon: React.ReactNode; label: string }> = [
    { id: 'code', icon: <Code2 size={14} />, label: 'Code' },
    { id: 'split', icon: <Columns2 size={14} />, label: 'Split' },
    { id: 'preview', icon: <Eye size={14} />, label: 'Preview' },
  ];

  const handleDownload = () => {
    void downloadFilesAsZip(files, 'my-app');
  };

  return (
    <header className="header shadow-header" id="app-header">
      <div className="header__left">
        <div
          className="header__brand"
          onClick={() => navigate('/')}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => { if (e.key === 'Enter') navigate('/'); }}
          style={{ cursor: 'pointer' }}
        >
          <h1 className="shadow-header__title">shadow</h1>
        </div>
      </div>

      <div className="header__actions">
        <button
          className="shadow-header__action-btn"
          title="Toggle dark mode"
          aria-label="Toggle dark mode"
        >
          <Moon size={15} />
        </button>

        {isBuildRoute && (
          <>
            <button
              className="shadow-header__action-btn"
              onClick={handleDownload}
              disabled={files.length === 0}
              title="Download project as ZIP"
              aria-label="Download project as ZIP"
              id="download-zip-btn"
            >
              <Download size={15} />
            </button>

            <div className="shadow-view-toggle" role="tablist" aria-label="View mode">
              {views.map((v) => (
                <button
                  key={v.id}
                  className={`shadow-view-toggle__btn ${activeView === v.id ? 'shadow-view-toggle__btn--active' : ''}`}
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

            <button
              className="shadow-header__action-btn"
              title="Share link"
              aria-label="Share link"
            >
              <Link2 size={15} />
            </button>
          </>
        )}
      </div>
    </header>
  );
}
