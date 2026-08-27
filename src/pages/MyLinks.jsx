import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLinks } from '../context/LinkContext';
import LinkCard from '../components/LinkCard';

export const MyLinks = () => {
  const { links, deleteLink } = useLinks();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');

  // Enforce sorted newest first
  const sortedLinks = [...links].sort(
    (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
  );

  // Safe search filtering
  const filteredLinks = sortedLinks.filter(
    (link) =>
      link.shortUrl.toLowerCase().includes(searchQuery.toLowerCase()) ||
      link.originalUrl.toLowerCase().includes(searchQuery.toLowerCase()) ||
      link.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this affiliate link?')) {
      deleteLink(id);
    }
  };

  return (
    <div className="my-links-page">
      <div className="my-links-page__header">
        <div>
          <h1 className="page-title">My Affiliate Links</h1>
          <p className="page-subtitle">
            Manage your generated shortcodes, monitor clicks, and edit redirects
          </p>
        </div>
        {links.length > 0 && (
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
            Create Link
          </button>
        )}
      </div>

      {links.length > 0 ? (
        <>
          {/* Search bar */}
          <div className="my-links-search">
            <div className="input-with-icon">
              <span className="input-icon">
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
                  <circle cx="11" cy="11" r="8" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
              </span>
              <input
                type="text"
                placeholder="Search by short ID, short URL or original URL..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          {filteredLinks.length > 0 ? (
            <div className="links-grid">
              {filteredLinks.map((link) => (
                <LinkCard
                  key={link.id}
                  link={link}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          ) : (
            <div className="empty-state section-card">
              <p className="empty-state__text">
                No links match your search query: "<strong>{searchQuery}</strong>"
              </p>
              <button
                onClick={() => setSearchQuery('')}
                className="btn-secondary"
                style={{ marginTop: '1rem' }}
              >
                Clear Search Filter
              </button>
            </div>
          )}
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
              <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
              <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
            </svg>
          </div>
          <h3>No affiliate links yet</h3>
          <p>
            Simplify your affiliate links and keep track of your click metrics in one dashboard.
          </p>
          <button
            onClick={() => navigate('/create-link')}
            className="btn-primary"
            style={{ marginTop: '1.25rem' }}
          >
            Create Your First Link
          </button>
        </div>
      )}
    </div>
  );
};

export default MyLinks;
