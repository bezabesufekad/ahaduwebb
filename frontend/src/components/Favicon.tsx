import { useEffect } from 'react';

interface FaviconProps {
  url: string;
}

export function Favicon({ url }: FaviconProps) {
  useEffect(() => {
    // Remove any existing favicon links
    const existingFavicons = document.querySelectorAll('link[rel="icon"], link[rel="shortcut icon"], link[rel="apple-touch-icon"]');
    existingFavicons.forEach(favicon => favicon.remove());

    // Create new favicon link
    const link = document.createElement('link');
    link.rel = 'icon';
    link.href = url;
    document.head.appendChild(link);

    // Create Apple touch icon link
    const appleLink = document.createElement('link');
    appleLink.rel = 'apple-touch-icon';
    appleLink.href = url;
    document.head.appendChild(appleLink);

    // Update page title to Ahadu Market
    document.title = 'Ahadu Market';

    return () => {
      // Clean up when component unmounts
      link.remove();
      appleLink.remove();
    };
  }, [url]);

  // This component doesn't render anything
  return null;
}
