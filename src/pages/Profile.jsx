import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLinks } from '../context/LinkContext';

export const Profile = () => {
  const { currentUser, logout } = useAuth();
  const { links } = useLinks();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="profile-page">
      <div className="profile-page__header">
        <h1 className="page-title">Profile Settings</h1>
        <p className="page-subtitle">Manage your credentials, sessions, and system integrations</p>
      </div>

      <div className="profile-page__content">
        <div className="section-card">
          <h2>Account Details</h2>
          <p className="section-card__desc">Basic information associated with your workspace session.</p>

          {currentUser && (
            <div className="profile-details">
              <div className="profile-detail-row">
                <span className="profile-detail-row__label">User ID</span>
                <span className="profile-detail-row__value">{currentUser.userId}</span>
              </div>
              <div className="profile-detail-row">
                <span className="profile-detail-row__label">Account Status</span>
                <span className="profile-detail-row__value profile-detail-row__value--active">
                  <span className="status-dot"></span>
                  Active (Prototype Mode)
                </span>
              </div>
              <div className="profile-detail-row">
                <span className="profile-detail-row__label">Total Created Links</span>
                <span className="profile-detail-row__value">{links.length}</span>
              </div>
            </div>
          )}

          <div style={{ marginTop: '2rem' }}>
            <button
              onClick={handleLogout}
              className="btn-danger"
              style={{ padding: '0.75rem 1.5rem', width: 'auto' }}
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
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" y1="12" x2="9" y2="12" />
              </svg>
              Logout from Session
            </button>
          </div>
        </div>

        {/* Developer Integration Mock (Premium details) */}
        {/* <div className="section-card">
          <h2>Developer Access</h2>
          <p className="section-card__desc">Use this mock API key to authenticate programmatically in the future.</p>
          
          <div className="api-key-box">
            <label htmlFor="apiKey">Secret API Token</label>
            <div className="api-key-box__input-wrapper">
              <input
                type="text"
                id="apiKey"
                readOnly
                value="sk_aff_x7kP2A901b5f928c50d_prototype"
                className="api-key-box__input"
              />
              <button
                type="button"
                className="btn-secondary"
                onClick={() => {
                  navigator.clipboard.writeText('sk_aff_x7kP2A901b5f928c50d_prototype');
                  alert('Mock API key copied to clipboard! (Prototype)');
                }}
              >
                Copy Key
              </button>
            </div>
            <p className="form-help-text" style={{ marginTop: '0.5rem' }}>
              Warning: Keep this key confidential. Do not share secret keys in public code repositories.
            </p>
          </div>
        </div> */}
      </div>
    </div>
  );
};

export default Profile;
