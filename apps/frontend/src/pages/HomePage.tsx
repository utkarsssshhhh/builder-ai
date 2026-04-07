import { useNavigate } from 'react-router-dom';
import { Moon } from 'lucide-react';

export function HomePage() {
  const navigate = useNavigate();

  return (
    <div className="home-page" id="home-page">
      {/* Soft gradient background */}
      <div className="home-page__gradient-bg" />

      {/* Dark mode toggle */}
      <button className="home-page__theme-toggle" aria-label="Toggle theme">
        <Moon size={18} />
      </button>

      {/* Content */}
      <div className="home-page__content">
        <div className="home-page__hero">
          <h1 className="home-page__title">shadow</h1>
          <p className="home-page__tagline">INTELLIGENCE REDEFINED</p>
        </div>

        <div className="home-page__cards">
          <button
            className="home-card"
            onClick={() => navigate('/chat')}
            id="nav-chat-card"
          >
            <span className="home-card__label">chat</span>
          </button>

          <button
            className="home-card"
            onClick={() => navigate('/build')}
            id="nav-build-card"
          >
            <span className="home-card__label">build</span>
          </button>
        </div>

        <p className="home-page__footer">DESIGNED FOR CLARITY</p>
      </div>
    </div>
  );
}
