const isValidAffiliateUrl = (value) => {
  if (!value) return false;

  try {
    const url = new URL(value.trim());

    if (url.protocol !== "https:") {
      return false;
    }

    const hostname = url.hostname.toLowerCase();

    // Support subdomains (like www., dl.) and short links (like amzn.in, amzn.to)
    const isAmazon = 
      hostname === "amazon.in" || hostname.endsWith(".amazon.in") ||
      hostname === "amazon.com" || hostname.endsWith(".amazon.com") ||
      hostname === "amzn.in" || hostname.endsWith(".amzn.in") ||
      hostname === "amzn.to" || hostname.endsWith(".amzn.to");

    const isFlipkart = 
      hostname === "flipkart.com" || hostname.endsWith(".flipkart.com");

    return isAmazon || isFlipkart;
  } catch {
    return false;
  }
};

export default isValidAffiliateUrl;