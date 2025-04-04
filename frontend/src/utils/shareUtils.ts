/**
 * Utility functions for sharing products
 */

interface ShareOptions {
  title: string;
  text: string;
  url: string;
}

/**
 * Share product using the Web Share API if available,
 * otherwise fallback to copying the URL to clipboard
 */
export const shareProduct = async (options: ShareOptions): Promise<boolean> => {
  // Check if Web Share API is available
  if (navigator.share) {
    try {
      await navigator.share(options);
      return true;
    } catch (error) {
      // User canceled or sharing failed
      console.error("Error sharing:", error);
      return false;
    }
  } else {
    // Fallback to copying the URL
    try {
      await navigator.clipboard.writeText(
        `${options.title}\n${options.text}\n${options.url}`
      );
      return true;
    } catch (error) {
      console.error("Clipboard error:", error);
      return false;
    }
  }
};
