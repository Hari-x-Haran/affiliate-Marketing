/**
 * Safely retrieves an item from localStorage.
 * If the key doesn't exist or JSON parsing fails, returns the defaultValue.
 * @param {string} key
 * @param {*} defaultValue
 * @returns {*}
 */
export const getStorage = (key, defaultValue = null) => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.error(`Error reading key "${key}" from localStorage:`, error);
    return defaultValue;
  }
};

/**
 * Syncs the local storage data to the filesystem db.json backend.
 */
export const syncToBackend = async () => {
  const dbData = {
    affiliateUsers: getStorage('affiliateUsers', []),
    affiliateLinks: getStorage('affiliateLinks', []),
    currentAffiliateUser: getStorage('currentAffiliateUser', null)
  };
  try {
    const response = await fetch('/api/db', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(dbData)
    });
    if (!response.ok) {
      console.error('Error response from backend database sync:', response.statusText);
    }
  } catch (error) {
    console.error('Failed to sync state to backend db.json:', error);
  }
};

/**
 * Safely writes an item to localStorage and triggers backend sync.
 * @param {string} key
 * @param {*} value
 * @returns {boolean} True if successful, false otherwise
 */
export const setStorage = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    // Trigger sync in the background
    syncToBackend();
    return true;
  } catch (error) {
    console.error(`Error writing key "${key}" to localStorage:`, error);
    return false;
  }
};

/**
 * Safely removes an item from localStorage and triggers backend sync.
 * @param {string} key
 * @returns {boolean} True if successful, false otherwise
 */
export const removeStorage = (key) => {
  try {
    localStorage.removeItem(key);
    // Trigger sync in the background
    syncToBackend();
    return true;
  } catch (error) {
    console.error(`Error removing key "${key}" from localStorage:`, error);
    return false;
  }
};

