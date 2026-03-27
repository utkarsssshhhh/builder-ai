import { Header } from './components/layout/Header';
import { ChatPanel } from './components/chat/ChatPanel';
import { EditorArea } from './components/editor/EditorArea';
import { PreviewPanel } from './components/preview/PreviewPanel';
import { useAppStore } from './store/appStore';

export default function App() {
  const activeView = useAppStore((s) => s.activeView);

  return (
    <>
      <Header />
      <main className="main-layout">
        <ChatPanel />
        {activeView === 'code' || activeView === 'split' ? (
          <EditorArea />
        ) : null}
        {activeView === 'preview' || activeView === 'split' ? (
          <PreviewPanel />
        ) : null}
      </main>
    </>
  );
}
