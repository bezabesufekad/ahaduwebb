// Mock Firebase implementation to prevent initialization errors
// since we don't have actual Firebase configuration

// This function does nothing but prevents errors from appearing
// when the app tries to use Firebase Analytics
export const initAnalytics = async () => {
  console.log('Firebase Analytics is not configured for this application');
  return null;
};

// Export a dummy app to prevent import errors
export default { name: 'mock-firebase-app' };
