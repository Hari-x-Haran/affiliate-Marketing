import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useLinks } from '../context/LinkContext';
import StatCard from '../components/StatCard';

export const Analytics = () => {
  const { links } = useLinks();
  const navigate = useNavigate();

  // Metrics calculations
  const totalLinks = links.length;
  const totalClicks = links.reduce((sum, link) => sum + link.clicks, 0);

  // Find max clicks for relative bar widths
  const maxClicks = links.reduce((max, link) => (link.clicks > max ? link.clicks : max), 0);
  
  // Sort links by clicks descending
  const sortedByClicks = [...links].sort((a, b) => b.clicks - a.clicks);

  return (
    <div className="analytics-page">
      <div className="analytics-page__header">
        <div>
          <h1 className="page-title">Link Analytics</h1>
          <p className="page-subtitle">
            Analyze traffic distribution and identifying your highest performing affiliate targets
          </p>
        </div>
      </div>

      {links.length > 0 ? (
        <>
          {/* Stats Summary Grid */}
          <div className="stats-grid">
            <StatCard
              title="Total Links"
              value={totalLinks}
              description="Generated redirect endpoints"
            />
            <StatCard
              title="Total Clicks"
              value={totalClicks.toLocaleString()}
              description="Aggregated lifetime hits"
            />
            <StatCard
              title="Highest Clicks"
              value={maxClicks.toLocaleString()}
              description="Best link record"
            />
          </div>

          {/* Bar Chart Section */}
          <div className="section-card" style={{ marginTop: '2rem' }}>
            <div className="section-card__header">
              <h2>Link Performance Distribution</h2>
              <p style={{ color: '#9ca3af', fontSize: '0.875rem', marginTop: '0.25rem' }}>
                Relative click metrics compared to your top performing link
              </p>
            </div>

            <div className="analytics-chart">
              {sortedByClicks.map((link) => {
                // Calculate percentage relative to the highest click count.
                // Avoid division by zero.
                const percentage = maxClicks > 0 ? (link.clicks / maxClicks) * 100 : 0;
                
                return (
                  <div key={link.id} className="chart-row">
                    <div className="chart-row__info">
                      <span className="chart-row__short" title={link.shortUrl}>
                        short.ly/{link.id}
                      </span>
                      <span className="chart-row__clicks" title={`${link.clicks} clicks`}>
                        <strong>{link.clicks}</strong> click{link.clicks === 1 ? '' : 's'}
                      </span>
                    </div>

                    <div className="chart-row__bar-container">
                      <div
                        className="chart-row__bar-fill"
                        style={{ width: `${Math.max(percentage, 2)}%` }}
                      >
                        {percentage > 10 && (
                          <span className="chart-row__bar-label">
                            {Math.round(percentage)}%
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="chart-row__target-url" title={link.originalUrl}>
                      Target: {link.originalUrl}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </>
      ) : (
        <div className="empty-state section-card">
          <div className="empty-state__icon">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="48"
              height="48"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="18" y1="20" x2="18" y2="10" />
              <line x1="12" y1="20" x2="12" y2="4" />
              <line x1="6" y1="20" x2="6" y2="14" />
            </svg>
          </div>
          <h3>No analytics data available</h3>
          <p>
            You must create some affiliate links and register click metrics to render data visualizations.
          </p>
          <button
            onClick={() => navigate('/create-link')}
            className="btn-primary"
            style={{ marginTop: '1.25rem' }}
          >
            Create Affiliate Link
          </button>
        </div>
      )}
    </div>
  );
};

export default Analytics;
