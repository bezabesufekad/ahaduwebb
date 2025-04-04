/**
 * Image utilities for optimizing image loading and handling image errors
 */

/**
 * Creates a colored placeholder image with text using data URL
 * This is much faster than loading a placeholder from an external URL
 */
export const getPlaceholderImage = (text: string = 'No Image'): string => {
  // Create a canvas to generate our placeholder
  const canvas = document.createElement('canvas');
  canvas.width = 300;
  canvas.height = 300;
  const ctx = canvas.getContext('2d');
  
  if (!ctx) return ''; // Fallback if canvas is not supported
  
  // Fill background with a light gray
  ctx.fillStyle = '#f0f0f0';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  
  // Add text
  ctx.fillStyle = '#888888';
  ctx.font = 'bold 20px Arial';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  
  // Handle multi-line text
  const words = text.split(' ');
  let lines = [];
  let currentLine = words[0];
  
  for (let i = 1; i < words.length; i++) {
    const testLine = currentLine + ' ' + words[i];
    const metrics = ctx.measureText(testLine);
    if (metrics.width < canvas.width - 40) {
      currentLine = testLine;
    } else {
      lines.push(currentLine);
      currentLine = words[i];
    }
  }
  lines.push(currentLine);
  
  // Draw each line of text
  lines.forEach((line, index) => {
    const y = canvas.height/2 - ((lines.length - 1) * 15) + (index * 30);
    ctx.fillText(line, canvas.width/2, y);
  });
  
  // Convert to data URL
  return canvas.toDataURL('image/png');
};

/**
 * Preloads an array of images in the background with a concurrent loading limit
 * This prevents too many simultaneous HTTP requests
 */
export const preloadImages = (imageUrls: string[]): Promise<void> => {
  // Filter out empty or invalid URLs
  const validUrls = imageUrls.filter(url => 
    url && typeof url === 'string' && url.trim() !== ''
  );
  
  if (validUrls.length === 0) {
    return Promise.resolve();
  }
  
  return new Promise((resolve) => {
    // For faster performance, limit the number of concurrent preloads
    const MAX_CONCURRENT = 3;
    let loadedCount = 0;
    const totalImages = validUrls.length;
    let currentIndex = 0;
    
    // Function to check if all images are loaded
    const checkAllLoaded = () => {
      loadedCount++;
      if (loadedCount >= totalImages) {
        resolve();
      } else {
        // Load next image if there are more to load
        if (currentIndex < totalImages) {
          loadNextImage();
        }
      }
    };
    
    // Function to load a single image
    const loadNextImage = () => {
      const index = currentIndex++;
      if (index >= totalImages) return;
      
      const img = new Image();
      img.onload = checkAllLoaded;
      img.onerror = checkAllLoaded; // Continue even if an image fails to load
      img.src = validUrls[index];
      
      // Set importance attribute for the first few images
      if (index < 2) {
        img.importance = 'high';
      }
    };
    
    // Start loading the first batch of images
    const initialBatch = Math.min(MAX_CONCURRENT, totalImages);
    for (let i = 0; i < initialBatch; i++) {
      loadNextImage();
    }
  });
};

/**
 * Preloads a single image and returns a promise
 */
export const preloadImage = (imageUrl: string): Promise<void> => {
  if (!imageUrl || typeof imageUrl !== 'string' || imageUrl.trim() === '') {
    return Promise.resolve();
  }
  
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve();
    img.onerror = () => resolve(); // Still resolve even if it fails
    img.src = imageUrl;
  });
};

/**
 * Returns a valid image URL or a placeholder if the URL is invalid
 */
export const getImageWithFallback = (imageUrl: string, fallbackText = 'No Image'): string => {
  if (!imageUrl || typeof imageUrl !== 'string' || imageUrl.trim() === '') {
    return getPlaceholderImage(fallbackText);
  }
  return imageUrl;
};
