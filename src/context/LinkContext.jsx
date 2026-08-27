import React, { createContext, useState, useContext, useEffect } from 'react';
import { getStorage, setStorage } from '../utils/storage';
import { generateShortId } from '../utils/generateShortId';
import { useAuth } from './AuthContext';

const LinkContext = createContext(null);

export const LinkProvider = ({ children }) => {
  const { currentUser } = useAuth();
  const [allLinks, setAllLinks] = useState([]);

  // Load all links from localStorage on mount
  useEffect(() => {
    const storedLinks = getStorage('affiliateLinks', []);
    setAllLinks(storedLinks);
  }, []);

  // Filter links for the current user
  const userLinks = allLinks.filter(
    link => currentUser && link.userId === currentUser.userId
  );

  /**
   * Creates a new shortened affiliate link.
   * @param {string} originalUrl 
   * @returns {object|null} The created link object
   */
  const createLink = (originalUrl) => {
    if (!currentUser) return null;

    let uniqueId = generateShortId();
    
    // Safety check for unique ID conflicts
    let attempts = 0;
    while (allLinks.some(link => link.id === uniqueId) && attempts < 10) {
      uniqueId = generateShortId();
      attempts++;
    }

    const newLink = {
      id: uniqueId,
      originalUrl,
      shortUrl: `https://short.ly/${uniqueId}`,
      clicks: 0,
      createdAt: new Date().toISOString(),
      userId: currentUser.userId
    };

    const updatedLinks = [newLink, ...allLinks];
    setAllLinks(updatedLinks);
    setStorage('affiliateLinks', updatedLinks);
    
    return newLink;
  };

  /**
   * Deletes an affiliate link by its ID.
   * @param {string} id 
   */
  const deleteLink = (id) => {
    const updatedLinks = allLinks.filter(link => link.id !== id);
    setAllLinks(updatedLinks);
    setStorage('affiliateLinks', updatedLinks);
  };

  /**
   * Simulates an affiliate link click by incrementing its click counter.
   * @param {string} id 
   */
  const addClick = (id) => {
    const updatedLinks = allLinks.map(link => {
      if (link.id === id) {
        return { ...link, clicks: link.clicks + 1 };
      }
      return link;
    });
    setAllLinks(updatedLinks);
    setStorage('affiliateLinks', updatedLinks);
  };

  const value = {
    links: userLinks, // Context consumer sees only current user's links
    createLink,
    deleteLink,
    addClick
  };

  return (
    <LinkContext.Provider value={value}>
      {children}
    </LinkContext.Provider>
  );
};

export const useLinks = () => {
  const context = useContext(LinkContext);
  if (!context) {
    throw new Error('useLinks must be used within a LinkProvider');
  }
  return context;
};
