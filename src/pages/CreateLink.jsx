import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLinks } from '../context/LinkContext';
// import { isValidUrl } from '../utils/validators';
import CopyButton from '../components/CopyButton';
import  isValidAffiliateUrl  from "../utils/validators";

export const CreateLink = () => {
  const { createLink } = useLinks();
  const navigate = useNavigate();
  const [originalUrl, setOriginalUrl] = useState('');
  const [error, setError] = useState('');
  const [generatedLink, setGeneratedLink] = useState(null);
  const [loading, setLoading] = useState(false);

  // if (!isValidAffiliateUrl(originalUrl)) {
    //   return;
    // }

  // setLoading(true);
  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");
    setGeneratedLink(null);

    const inputUrl = originalUrl.trim();
    if (!inputUrl) {
      setError("Please enter an affiliate URL.");
      return;
    }
    
    if (!isValidAffiliateUrl(inputUrl)) {
      setError("Only Amazon and Flipkart links are allowed.");
      // setError('Invalid URL. Please enter a valid URL starting with http:// or https://');
      return;
    }

    // setLoading(true);

    // Simulate link creation with quick loader
    setTimeout(() => {
      const link = createLink(inputUrl);

      // setLoading(false);

      if (link) {
        setGeneratedLink(link);
        setOriginalUrl("");
      } else {
        setError("Error creating affiliate link. Please check your session.");
      }
    }, 450);
  };

  return (
    <div className="create-link-page">
      <div className="create-link-page__header">
        <h1 className="page-title">Create Affiliate Link</h1>
        <p className="page-subtitle">Transform long tracking links into clean, copyable shorts</p>
      </div>

      <div className="create-link-content">
        <div className="form-card">
          <form onSubmit={handleSubmit} className="create-link-form">
            <div className="form-group">
              <label htmlFor="affiliateUrl">Affiliate Target URL</label>
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
                    <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                    <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
                  </svg>
                </span>
                <input
                  type="text"
                  id="affiliateUrl"
                  value={originalUrl}
                  onChange={(e) => setOriginalUrl(e.target.value)}
                  placeholder="https://example.com/product/123?aff=yourname"
                  disabled={loading}
                />
              </div>
              <p className="form-help-text">
                Ensure your URL starts with <strong>http://</strong> or <strong>https://</strong>.
              </p>
            </div>

            {error && (
              <div className="form-error-alert" role="alert">
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
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              className="btn-primary"
              disabled={loading}
              style={{ width: '100%', height: '46px' }}
            >
              {loading ? 'Generating Link...' : 'Generate Short Link'}
            </button>
          </form>
        </div>

        {/* Display generated response details */}
        {generatedLink && (
          <div className="result-card fade-in">
            <h3>Your Affiliate Link</h3>
            <p className="result-card__desc">
              Copy and share this short link. It redirects visitors to your original affiliate destination.
            </p>
            
            <div className="result-box">
              <span className="result-box__link" title="Generated Short Link">
                {generatedLink.shortUrl}
              </span>
              <CopyButton text={generatedLink.shortUrl} />
            </div>

            <div className="result-card__actions">
              <button
                type="button"
                className="btn-secondary"
                onClick={() => navigate('/my-links')}
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
                  <line x1="8" y1="6" x2="21" y2="6" />
                  <line x1="8" y1="12" x2="21" y2="12" />
                  <line x1="8" y1="18" x2="21" y2="18" />
                  <line x1="3" y1="6" x2="3.01" y2="6" />
                  <line x1="3" y1="12" x2="3.01" y2="12" />
                  <line x1="3" y1="18" x2="3.01" y2="18" />
                </svg>
                View My Links
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CreateLink;

// import React, { useState } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { useLinks } from '../context/LinkContext';
// import { isValidAffiliateUrl } from '../utils/validators';
// import CopyButton from '../components/CopyButton';

// const CreateLink = () => {
//   const { createLink } = useLinks();
//   const navigate = useNavigate();

//   const [originalUrl, setOriginalUrl] = useState('');
//   const [error, setError] = useState('');
//   const [generatedLink, setGeneratedLink] = useState(null);
//   const [loading, setLoading] = useState(false);

//   const handleSubmit = (e) => {
//     e.preventDefault();

//     setError('');
//     setGeneratedLink(null);

//     const inputUrl = originalUrl.trim();

//     if (!inputUrl) {
//       setError('Please enter an affiliate URL.');
//       return;
//     }

//     if (!isValidAffiliateUrl(inputUrl)) {
//       setError('Only Amazon and Flipkart HTTPS links are allowed.');
//       return;
//     }

//     setLoading(true);

//     setTimeout(() => {
//       const link = createLink(inputUrl);

//       setLoading(false);

//       if (link) {
//         setGeneratedLink(link);
//         setOriginalUrl('');
//       } else {
//         setError('Error creating affiliate link.');
//       }
//     }, 450);
  
//   };
// };

// export default CreateLink;