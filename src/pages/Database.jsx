import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getStorage, setStorage } from '../utils/storage';

export const Database = () => {
  const navigate = useNavigate();
  const [dbData, setDbData] = useState({ affiliateUsers: [], affiliateLinks: [], currentAffiliateUser: null });
  const [editorText, setEditorText] = useState('');
  const [jsonError, setJsonError] = useState(null);
  const [syncStatus, setSyncStatus] = useState('checking'); // 'checking', 'synced', 'offline', 'error'
  const [activeTab, setActiveTab] = useState('editor'); // 'editor', 'users', 'links'
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Load database from API on mount
  const fetchDb = async () => {
    try {
      setSyncStatus('checking');
      const res = await fetch('/api/db');
      if (res.ok) {
        const data = await res.json();
        setDbData(data);
        setEditorText(JSON.stringify(data, null, 2));
        setJsonError(null);
        setSyncStatus('synced');
      } else {
        setSyncStatus('error');
      }
    } catch (err) {
      console.error('Failed to connect to backend JSON DB:', err);
      setSyncStatus('offline');
      // Load fallback from localStorage
      const localDb = {
        affiliateUsers: JSON.parse(localStorage.getItem('affiliateUsers') || '[]'),
        affiliateLinks: JSON.parse(localStorage.getItem('affiliateLinks') || '[]'),
        currentAffiliateUser: JSON.parse(localStorage.getItem('currentAffiliateUser') || 'null')
      };
      setDbData(localDb);
      setEditorText(JSON.stringify(localDb, null, 2));
    }
  };

  useEffect(() => {
    fetchDb();
  }, []);

  // Handle live textarea editing and JSON validation
  const handleEditorChange = (e) => {
    const text = e.target.value;
    setEditorText(text);
    setSaveSuccess(false);
    
    if (!text.trim()) {
      setJsonError('Database cannot be empty');
      return;
    }

    try {
      const parsed = JSON.parse(text);
      
      // Structural validation check
      if (typeof parsed !== 'object' || parsed === null) {
        setJsonError('Root element must be a JSON object');
        return;
      }
      
      if (!Array.isArray(parsed.affiliateUsers)) {
        setJsonError('Missing "affiliateUsers" array property');
        return;
      }
      
      if (!Array.isArray(parsed.affiliateLinks)) {
        setJsonError('Missing "affiliateLinks" array property');
        return;
      }

      setJsonError(null);
    } catch (err) {
      setJsonError(`JSON Syntax Error: ${err.message}`);
    }
  };

  // Save JSON text to disk and state
  const handleSave = async () => {
    if (jsonError) return;
    
    try {
      const parsed = JSON.parse(editorText);
      
      // Update local storage
      localStorage.setItem('affiliateUsers', JSON.stringify(parsed.affiliateUsers));
      localStorage.setItem('affiliateLinks', JSON.stringify(parsed.affiliateLinks));
      
      if (parsed.currentAffiliateUser === null) {
        localStorage.removeItem('currentAffiliateUser');
      } else {
        localStorage.setItem('currentAffiliateUser', JSON.stringify(parsed.currentAffiliateUser));
      }

      // Sync to filesystem
      const response = await fetch('/api/db', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(parsed)
      });

      if (response.ok) {
        setDbData(parsed);
        setSaveSuccess(true);
        setSyncStatus('synced');
        setTimeout(() => {
          setSaveSuccess(false);
          // Reload page to re-initialize App contexts with the new database state
          window.location.reload();
        }, 1500);
      } else {
        setSyncStatus('error');
        alert('Server returned error while saving database.');
      }
    } catch (err) {
      console.error(err);
      alert('Failed to save. Please review the JSON format errors.');
    }
  };

  // Download DB as file
  const handleDownload = () => {
    const jsonStr = JSON.stringify(dbData, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(jsonStr);
    
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataUri);
    downloadAnchor.setAttribute('download', 'db.json');
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // Upload JSON file
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const parsed = JSON.parse(event.target.result);
        
        // Validation check
        if (!Array.isArray(parsed.affiliateUsers) || !Array.isArray(parsed.affiliateLinks)) {
          alert('Upload failed: Invalid db.json schema. Must contain affiliateUsers and affiliateLinks arrays.');
          return;
        }

        // Apply changes
        localStorage.setItem('affiliateUsers', JSON.stringify(parsed.affiliateUsers));
        localStorage.setItem('affiliateLinks', JSON.stringify(parsed.affiliateLinks));
        if (parsed.currentAffiliateUser) {
          localStorage.setItem('currentAffiliateUser', JSON.stringify(parsed.currentAffiliateUser));
        } else {
          localStorage.removeItem('currentAffiliateUser');
        }

        // Sync to server
        await fetch('/api/db', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(parsed)
        });

        alert('Database imported successfully! Reloading...');
        window.location.reload();
      } catch (error) {
        alert(`Failed to parse file as JSON: ${error.message}`);
      }
    };
    reader.readAsText(file);
  };

  // Clear database to factory settings
  const handleClearDb = async () => {
    if (!window.confirm('Are you absolutely sure you want to purge the entire database? This deletes all users, shortened links, and sessions.')) {
      return;
    }

    const defaultState = {
      affiliateUsers: [],
      affiliateLinks: [],
      currentAffiliateUser: null
    };

    localStorage.removeItem('affiliateUsers');
    localStorage.removeItem('affiliateLinks');
    localStorage.removeItem('currentAffiliateUser');

    try {
      await fetch('/api/db', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(defaultState)
      });
      alert('Database purged successfully. Reloading application...');
      window.location.reload();
    } catch (err) {
      console.error(err);
      alert('Cleared local state, but server failed to update db.json.');
      window.location.reload();
    }
  };

  // Copy to clipboard
  const handleCopyClipboard = () => {
    navigator.clipboard.writeText(editorText);
    alert('Database JSON copied to clipboard!');
  };

  return (
    <div className="database-page">
      <div className="database-page__header">
        <div>
          <h1 className="page-title">Live JSON Database</h1>
          <p className="page-subtitle">
            Direct real-time visualizer and local file backup interface for the project's data engine.
          </p>
        </div>
      </div>

      {/* Sync Banner Status */}
      <div className={`db-status-banner db-status-banner--${syncStatus}`}>
        <div className="db-status-banner__left">
          <span className={`status-dot status-dot--${syncStatus}`}></span>
          <span className="db-status-banner__title">
            {syncStatus === 'synced' && 'Database Online & Synced'}
            {syncStatus === 'checking' && 'Connecting to database server...'}
            {syncStatus === 'offline' && 'Offline Mode (Local Storage Fallback)'}
            {syncStatus === 'error' && 'Server sync error'}
          </span>
        </div>
        <span className="db-status-banner__path">
          File Path: <code>/data/db.json</code>
        </span>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid" style={{ marginBottom: '2rem' }}>
        <div className="stat-card">
          <span className="stat-card__title">Total Registered Users</span>
          <span className="stat-card__value">{(dbData.affiliateUsers || []).length}</span>
          <span className="stat-card__desc">Accounts registered in db.json</span>
        </div>
        <div className="stat-card">
          <span className="stat-card__title">Total Affiliate Links</span>
          <span className="stat-card__value">{(dbData.affiliateLinks || []).length}</span>
          <span className="stat-card__desc">Active redirect destinations</span>
        </div>
        <div className="stat-card">
          <span className="stat-card__title">Database Size</span>
          <span className="stat-card__value">
            {(JSON.stringify(dbData).length / 1024).toFixed(2)} KB
          </span>
          <span className="stat-card__desc">Calculated size of db.json payload</span>
        </div>
      </div>

      {/* Actions Toolbar */}
      <div className="db-actions-bar">
        <div className="db-actions-bar__left">
          <button onClick={handleDownload} className="btn-secondary">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
            Download db.json
          </button>
          
          <label className="btn-secondary cursor-pointer" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', margin: 0 }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
            Upload Backup
            <input type="file" accept=".json" onChange={handleFileUpload} style={{ display: 'none' }} />
          </label>

          <button onClick={handleCopyClipboard} className="btn-secondary">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
            Copy Data
          </button>
        </div>

        <button onClick={handleClearDb} className="btn-danger-outline">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
          Wipe Database File
        </button>
      </div>

      {/* Tabs */}
      <div className="db-tabs">
        <button 
          onClick={() => setActiveTab('editor')} 
          className={`db-tabs__btn ${activeTab === 'editor' ? 'db-tabs__btn--active' : ''}`}
        >
          JSON Live Editor
        </button>
        <button 
          onClick={() => setActiveTab('users')} 
          className={`db-tabs__btn ${activeTab === 'users' ? 'db-tabs__btn--active' : ''}`}
        >
          Visual Users List ({ (dbData.affiliateUsers || []).length })
        </button>
        <button 
          onClick={() => setActiveTab('links')} 
          className={`db-tabs__btn ${activeTab === 'links' ? 'db-tabs__btn--active' : ''}`}
        >
          Visual Links List ({ (dbData.affiliateLinks || []).length })
        </button>
      </div>

      {/* Tab Contents */}
      <div className="section-card" style={{ marginTop: 0, borderTopLeftRadius: 0, borderTopRightRadius: 0 }}>
        {activeTab === 'editor' && (
          <div className="json-editor-tab">
            <div className="json-editor-tab__meta">
              <span className="text-secondary text-sm">
                You can directly edit the raw database contents below. Your input will be validated in real-time.
              </span>
              {jsonError ? (
                <span className="badge badge--danger">{jsonError}</span>
              ) : (
                <span className="badge badge--success">JSON Structure Valid</span>
              )}
            </div>

            <textarea
              className={`json-editor-textarea ${jsonError ? 'json-editor-textarea--error' : ''}`}
              value={editorText}
              onChange={handleEditorChange}
              placeholder="Loading database state..."
              spellCheck="false"
            />

            <div className="json-editor-tab__footer">
              <button 
                onClick={fetchDb} 
                className="btn-secondary"
                disabled={syncStatus === 'checking'}
              >
                Reset to Current Disk State
              </button>
              
              <button
                onClick={handleSave}
                className="btn-primary"
                disabled={!!jsonError || saveSuccess}
              >
                {saveSuccess ? 'Changes Saved & Reloading...' : 'Save & Overwrite db.json'}
              </button>
            </div>
          </div>
        )}

        {activeTab === 'users' && (
          <div className="visual-tab">
            <h3>Registered User Directory</h3>
            <p className="text-secondary text-sm" style={{ marginBottom: '1.5rem' }}>
              Read-only list of credentials stored in <code>data/db.json</code>.
            </p>

            {(dbData.affiliateUsers || []).length === 0 ? (
              <div className="empty-state-small">No users registered in database.</div>
            ) : (
              <div className="db-table-wrapper">
                <table className="db-table">
                  <thead>
                    <tr>
                      <th>User ID (Username)</th>
                      <th>Password Hash (Plaintext Prototype)</th>
                      <th>Current Session</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(dbData.affiliateUsers || []).map((user, idx) => {
                      const isCurrent = dbData.currentAffiliateUser?.userId === user.userId;
                      return (
                        <tr key={idx} className={isCurrent ? 'row-highlight' : ''}>
                          <td>
                            <strong>{user.userId}</strong>
                          </td>
                          <td>
                            <code>{user.password}</code>
                          </td>
                          <td>
                            {isCurrent ? (
                              <span className="badge badge--success">Logged In</span>
                            ) : (
                              <span className="text-muted">—</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {activeTab === 'links' && (
          <div className="visual-tab">
            <h3>Shortened Link Registers</h3>
            <p className="text-secondary text-sm" style={{ marginBottom: '1.5rem' }}>
              Read-only list of shortened endpoints registered in <code>data/db.json</code>.
            </p>

            {(dbData.affiliateLinks || []).length === 0 ? (
              <div className="empty-state-small">No affiliate links registered in database.</div>
            ) : (
              <div className="db-table-wrapper">
                <table className="db-table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Original (Target) URL</th>
                      <th>Shortened Redirect</th>
                      <th>Clicks</th>
                      <th>Created By (User)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(dbData.affiliateLinks || []).map((link, idx) => (
                      <tr key={idx}>
                        <td><code>{link.id}</code></td>
                        <td className="max-width-cell" title={link.originalUrl}>
                          {link.originalUrl}
                        </td>
                        <td>
                          <a href={link.originalUrl} target="_blank" rel="noopener noreferrer">
                            {link.shortUrl}
                          </a>
                        </td>
                        <td>
                          <strong>{link.clicks}</strong> hits
                        </td>
                        <td>
                          <span className="badge badge--user">{link.userId}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Database;
