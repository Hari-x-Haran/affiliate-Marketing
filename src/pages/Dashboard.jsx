import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLinks } from '../context/LinkContext';
import StatCard from '../components/StatCard';
import LinkCard from '../components/LinkCard';

export const Dashboard = () => {
  const { currentUser } = useAuth();
  const { links, deleteLink } = useLinks();
  const navigate = useNavigate();

  // 1. Total Links
  const totalLinks = links.length;

  // 2. Total Clicks
  const totalClicks = links.reduce((sum, link) => sum + link.clicks, 0);

  // 3. Today's Clicks
  // Calculate clicks from links created today
  const getTodayClicks = () => {
    const today = new Date().toDateString();
    return links
      .filter(link => new Date(link.createdAt).toDateString() === today)
      .reduce((sum, link) => sum + link.clicks, 0);
  };
  const todayClicks = getTodayClicks();

  // 4. Best Performing Link
  const getBestLink = () => {
    if (links.length === 0) return { label: 'None', sub: 'No links created' };
    
    // Find link with max clicks
    const best = links.reduce((max, link) => (link.clicks > max.clicks ? link : max), links[0]);
    
    if (best.clicks === 0) {
      return { label: 'No clicks yet', sub: `${best.id}` };
    }
    
    return {
      label: `${best.id}`,
      sub: `${best.clicks} click${best.clicks === 1 ? '' : 's'}`
    };
  };
  const bestLink = getBestLink();

  // Recent links (show latest 3)
  const recentLinks = links.slice(0, 3);

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this affiliate link?')) {
      deleteLink(id);
    }
  };

  return (
    <div className="dashboard-page">
      <div className="dashboard-page__header">
        <div>
          <h1 className="page-title">Workspace Dashboard</h1>
          <p className="page-subtitle">Track and optimize your affiliate link performance</p>
        </div>
        <button
          onClick={() => navigate('/create-link')}
          className="btn-primary"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Create Affiliate Link
        </button>
      </div>

      {/* Grid of stats */}
      <div className="stats-grid">
        <StatCard
          title="Total Links"
          value={totalLinks}
          description="Short URLs generated"
        />
        <StatCard
          title="Total Clicks"
          value={totalClicks.toLocaleString()}
          description="Across all active links"
        />
        <StatCard
          title="Today's Clicks"
          value={todayClicks.toLocaleString()}
          description="Traffic in last 24h"
        />
        <StatCard
          title="Best Link"
          value={bestLink.label}
          description={bestLink.sub}
        />
      </div>

      {/* Recent Links Section */}
      <div className="dashboard-content">
        <div className="dashboard-content__main">
          <div className="section-card">
            <div className="section-card__header">
              <h2>Recent Affiliate Links</h2>
              {links.length > 3 && (
                <Link to="/my-links" className="view-all-link">
                  View All ({links.length})
                </Link>
              )}
            </div>

            {recentLinks.length > 0 ? (
              <div className="links-list">
                {recentLinks.map((link) => (
                  <LinkCard
                    key={link.id}
                    link={link}
                    onDelete={handleDelete}
                  />
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <div className="empty-state__icon">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="40"
                    height="40"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                    <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
                  </svg>
                </div>
                <h3>No affiliate links yet</h3>
                <p>Generate your first short link to start tracking click metrics.</p>
                <button
                  onClick={() => navigate('/create-link')}
                  className="btn-primary"
                  style={{ marginTop: '1rem' }}
                >
                  Create Your First Link
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="dashboard-content__side">
          <div className="info-card">
            <h3>Prototype Insights</h3>
            <p>
              This console simulates real-time link click redirects. Real-world redirects require an intermediate server to capture request headers, log IP details, and increment counters.
            </p>
            <div className="info-card__alert">
              <strong>Simulating Clicks:</strong> Click the <em>"Simulate Click"</em> button on any link card to see the statistics and charts update immediately.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
