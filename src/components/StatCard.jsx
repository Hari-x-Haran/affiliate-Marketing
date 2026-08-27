import React from 'react';

/**
 * Reusable stat component for metrics display.
 * @param {string} title - Stat title/label
 * @param {string|number} value - Stat count/value
 * @param {string} description - Small description context
 */
export const StatCard = ({ title, value, description }) => {
  return (
    <div className="stat-card">
      <div className="stat-card__title">{title}</div>
      <div className="stat-card__value">{value}</div>
      {description && <div className="stat-card__desc">{description}</div>}
    </div>
  );
};

export default StatCard;
