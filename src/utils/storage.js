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
 * Safely writes an item to localStorage.
 * @param {string} key
 * @param {*} value
 * @returns {boolean} True if successful, false otherwise
 */
export const setStorage = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (error) {
    console.error(`Error writing key "${key}" to localStorage:`, error);
    return false;
  }
};

/**
 * Safely removes an item from localStorage.
 * @param {string} key
 * @returns {boolean} True if successful, false otherwise
 */
export const removeStorage = (key) => {
  try {
    localStorage.removeItem(key);
    return true;
  } catch (error) {
    console.error(`Error removing key "${key}" from localStorage:`, error);
    return false;
  }
};
