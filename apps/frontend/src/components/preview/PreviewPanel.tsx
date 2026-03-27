import { useMemo } from 'react';
import { RefreshCw, ExternalLink, Monitor } from 'lucide-react';
import { useAppStore } from '../../store/appStore';

/**
 * Builds a standalone HTML document from the virtual file system.
 * Injects CSS via <style> tags and JS via <script> tags into the HTML.
 * If no index.html exists, wraps everything in a basic HTML shell.
 */
function buildPreviewHtml(files: Array<{ path: string; content: string }>): string {
  if (files.length === 0) return '';

  const htmlFile = files.find((f) => f.path.endsWith('.html'));
  const cssFiles = files.filter((f) => f.path.endsWith('.css'));
  const jsFiles = files.filter((f) => f.path.endsWith('.js'));

  let html = htmlFile?.content ?? '';

  if (!htmlFile) {
    // If there's no HTML file, create a basic shell
    const cssContent = cssFiles.map((f) => f.content).join('\n\n');
    const jsContent = jsFiles.map((f) => f.content).join('\n\n');

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>${cssContent}</style>
</head>
<body>
  <script>${jsContent}<\/script>
</body>
</html>`;
  }

  // Inject CSS files before </head>
  if (cssFiles.length > 0) {
    const cssBlock = cssFiles
      .map((f) => `<style>/* ${f.path} */\n${f.content}</style>`)
      .join('\n');

    if (html.includes('</head>')) {
      html = html.replace('</head>', `${cssBlock}\n</head>`);
    } else {
      html = `${cssBlock}\n${html}`;
    }
  }

  // Inject JS files before </body>
  if (jsFiles.length > 0) {
    const jsBlock = jsFiles
      .map((f) => `<script>/* ${f.path} */\n${f.content}<\/script>`)
      .join('\n');

    if (html.includes('</body>')) {
      html = html.replace('</body>', `${jsBlock}\n</body>`);
    } else {
      html = `${html}\n${jsBlock}`;
    }
  }

  // Remove any external CSS/JS links that reference local files
  // (since we've already inlined them)
  html = html.replace(/<link\s+rel="stylesheet"\s+href="(?!http).*?"[^>]*>/g, '');
  html = html.replace(/<script\s+src="(?!http).*?"[^>]*><\/script>/g, '');

  return html;
}

export function PreviewPanel() {
  const files = useAppStore((s) => s.files);

  const previewHtml = useMemo(() => buildPreviewHtml(files), [files]);

  const handleRefresh = () => {
    // Force re-render by toggling a key (handled by React's key prop)
    const iframe = document.getElementById('preview-iframe') as HTMLIFrameElement | null;
    if (iframe) {
      iframe.srcdoc = previewHtml;
    }
  };

  const handleOpenExternal = () => {
    const blob = new Blob([previewHtml], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    window.open(url, '_blank');
  };

  if (files.length === 0) {
    return (
      <div className="preview-panel" id="preview-panel">
        <div className="preview-panel__header">
          <Monitor size={14} style={{ color: 'var(--text-tertiary)' }} />
          <div className="preview-panel__url">Preview</div>
        </div>
        <div className="preview-panel__empty">
          <Monitor size={48} style={{ opacity: 0.2 }} />
          <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-tertiary)' }}>
            Your app preview will appear here
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="preview-panel" id="preview-panel">
      <div className="preview-panel__header">
        <Monitor size={14} style={{ color: 'var(--text-tertiary)' }} />
        <div className="preview-panel__url">localhost:preview</div>
        <div style={{ display: 'flex', gap: '4px' }}>
          <button
            className="btn btn--ghost btn--icon btn--sm"
            onClick={handleRefresh}
            title="Refresh preview"
            aria-label="Refresh preview"
          >
            <RefreshCw size={13} />
          </button>
          <button
            className="btn btn--ghost btn--icon btn--sm"
            onClick={handleOpenExternal}
            title="Open in new tab"
            aria-label="Open in new tab"
          >
            <ExternalLink size={13} />
          </button>
        </div>
      </div>

      <iframe
        id="preview-iframe"
        className="preview-panel__iframe"
        srcDoc={previewHtml}
        title="App Preview"
        sandbox="allow-scripts allow-modals allow-forms allow-same-origin"
      />
    </div>
  );
}
