import React from 'react';
import CopyButton from './CopyButton';
import { useLinks } from '../context/LinkContext';

/**
 * Renders detailed card for an individual shortened affiliate link.
 * @param {object} link - The link data object
 * @param {function} onDelete - Callback to execute on link deletion
 */
export const LinkCard = ({ link, onDelete }) => {
  const { addClick } = useLinks();

  // Format the ISO timestamp to a nice readable string
  const formatDate = (isoString) => {
    try {
      const date = new Date(isoString);
      return date.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      });
    } catch (e) {
      return 'N/A';
    }
  };

  return (
    <div className="link-card">
      <div className="link-card__header">
        <div className="link-card__short-info">
          <span className="link-card__label">SHORT URL</span>
          <a
            href={link.originalUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="link-card__short-url"
            title="Open original target link"
          >
            {link.shortUrl}
          </a>
        </div>
        <div className="link-card__clicks-badge">
          <span className="link-card__clicks-count">{link.clicks}</span>
          <span className="link-card__clicks-label">{link.clicks === 1 ? 'click' : 'clicks'}</span>
        </div>
      </div>

      <div className="link-card__body">
        <div className="link-card__original-info">
          <span className="link-card__label">Original URL</span>
          <p className="link-card__original-url" title={link.originalUrl}>
            {link.originalUrl}
          </p>
        </div>
      </div>

      <div className="link-card__footer">
        <span className="link-card__date">
          Created: {formatDate(link.createdAt)}
        </span>
        <div className="link-card__actions">
          <button
            type="button"
            className="btn-simulate"
            onClick={() => addClick(link.id)}
            title="Simulate click on this link"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
              <polyline points="16 7 22 7 22 13" />
            </svg>
            Simulate Click
          </button>
          <CopyButton text={link.shortUrl} />
          <button
            type="button"
            className="btn-delete"
            onClick={() => onDelete(link.id)}
            title="Delete affiliate link"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="3 6 5 6 21 6" />
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
              <line x1="10" y1="11" x2="10" y2="17" />
              <line x1="14" y1="11" x2="14" y2="17" />
            </svg>
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

export default LinkCard;
