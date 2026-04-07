import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Header } from './components/layout/Header';
import { HomePage } from './pages/HomePage';
import { ChatPage } from './pages/ChatPage';
import { BuilderPage } from './pages/BuilderPage';

export default function App() {
  const location = useLocation();
  const isHome = location.pathname === '/' || location.pathname === '/chat';

  return (
    <>
      {!isHome && <Header />}
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/chat" element={<ChatPage />} />
        <Route path="/build" element={<BuilderPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}
