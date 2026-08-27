/**
 * Generates a unique 6-character short ID using cryptographically strong random values
 * where available, falling back to Math.random.
 * @returns {string}
 */
export const generateShortId = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  const length = 6;

  try {
    if (typeof window !== 'undefined' && window.crypto && typeof window.crypto.getRandomValues === 'function') {
      const array = new Uint32Array(length);
      window.crypto.getRandomValues(array);
      for (let i = 0; i < length; i++) {
        result += chars.charAt(array[i] % chars.length);
      }
      return result;
    }
  } catch (error) {
    console.warn('Crypto API failed, falling back to Math.random:', error);
  }

  // Fallback if crypto is unavailable
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  
  return result;
};
