/**
 * Railway Deployment Guide for Ahadu Market
 * 
 * This guide provides instructions for migrating the Ahadu Market app
 * from Databutton to Railway.io, which offers a simpler deployment experience.
 */

export const deploymentGuide = `
# AHADU MARKET DEPLOYMENT GUIDE

This guide will help you migrate your Ahadu Market e-commerce app from Databutton to Railway.io

## STEP 1: EXPORT YOUR DATA

Use the /migration/export-data endpoint to get all your data as JSON. Save this to a file.

## STEP 2: CREATE YOUR REPOSITORY STRUCTURE

Create a new GitHub repository with this structure:

/
├── backend/
│   ├── app/
│   │   ├── main.py
│   │   ├── database.py
│   │   └── ... (other backend files)
│   ├── Dockerfile
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   └── ... (frontend code)
│   ├── Dockerfile
│   ├── nginx.conf
│   └── package.json

## STEP 3: UPDATE API ENDPOINTS

Update API_URL in your frontend code.
In frontend/src/utils/api.ts (or similar):

```typescript
// Replace with environment variable
export const API_URL = import.meta.env.VITE_API_URL || '/api';
```

Then use this API_URL in all your fetch/axios requests.

## STEP 4: DEPLOY ON RAILWAY

1. Create a Railway account at railway.app
2. Create a new project from your GitHub repo
3. Add two services:
   - Backend service (using the backend Dockerfile)
   - Frontend service (using the frontend Dockerfile)
4. Configure environment variables for your backend:
   - DATABASE_URL=postgresql://[username]:[password]@[host]:[port]/[database]
   - JWT_SECRET=[your-secret-key]
   - ADMIN_EMAIL=[your-admin-email]
5. Set up a PostgreSQL database service
6. Deploy your application
`;

/**
 * Helper function to display the deployment guide in the UI
 */
export const showDeploymentGuide = () => {
  console.log("Displaying deployment guide");
  alert("The deployment guide is available in the console. Press F12 to view it.");
  console.log(deploymentGuide);
};
