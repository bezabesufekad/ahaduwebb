/**
 * Ahadu Market - Railway Deployment Guide
 * 
 * This guide explains how to deploy the Ahadu Market application on Railway
 */

export const RAILWAY_DEPLOYMENT_GUIDE = {
  title: "Ahadu Market Deployment Guide for Railway",
  sections: [
    {
      title: "Prerequisites",
      content: [
        "A Railway account (https://railway.app)",
        "The Ahadu Market codebase (frontend and backend)",
        "GitHub account (for connecting your repository)",
        "Git installed on your local machine"
      ]
    },
    {
      title: "Step 1: Prepare Your Repository",
      content: [
        "Push your Ahadu Market code to a GitHub repository",
        "Ensure your repository has the following structure:",
        "- /src (backend code)",
        "- /ui (frontend code)",
        "- package.json (in the root directory)",
        "- Railway needs a root package.json file to identify your project"
      ]
    },
    {
      title: "Step 2: Create Railway Project",
      content: [
        "Log in to your Railway account",
        "Click on 'New Project'",
        "Select 'Deploy from GitHub repo'",
        "Connect your GitHub account if not already connected",
        "Select your Ahadu Market repository",
        "Click 'Deploy Now'"
      ]
    },
    {
      title: "Step 3: Configure Environment Variables",
      content: [
        "In your Railway project dashboard, click on 'Variables'",
        "Add the following environment variables:",
        "- TELEGRAM_BOT_TOKEN (if using Telegram notifications)",
        "- TELEGRAM_CHAT_ID (if using Telegram notifications)",
        "- NODE_ENV=production",
        "- PORT=8080 (or your preferred port)",
        "- Any other API keys or secrets your app needs"
      ]
    },
    {
      title: "Step 4: Configure the Root Package.json",
      content: [
        "Create or update the package.json in your root directory:",
        "",
        "```json",
        "{",
        "  \"name\": \"ahadu-market\",",
        "  \"version\": \"1.0.0\",",
        "  \"description\": \"Ahadu Market E-commerce Platform\",",
        "  \"main\": \"index.js\",",
        "  \"scripts\": {",
        "    \"start\": \"node index.js\",",
        "    \"build\": \"cd ui && npm install && npm run build && cd ../src && pip install -r requirements.txt\"",
        "  },",
        "  \"engines\": {",
        "    \"node\": \">=16\"",
        "  },",
        "  \"dependencies\": {",
        "    \"express\": \"^4.18.2\"",
        "  }",
        "}",
        "```"
      ]
    },
    {
      title: "Step 5: Create an Index.js File",
      content: [
        "Create an index.js file in the root directory to start both backend and frontend:",
        "",
        "```javascript",
        "const express = require('express');",
        "const path = require('path');",
        "const { spawn } = require('child_process');",
        "",
        "const app = express();",
        "const PORT = 8080; // Or use environment variables in production",
        "",
        "// Start the backend server as a separate process",
        "const backend = spawn('python', ['-m', 'uvicorn', 'src.app.main:app', '--host', '0.0.0.0', '--port', '3001']);",
        "backend.stdout.on('data', (data) => {",
        "  console.log(`Backend: ${data}`);",
        "});",
        "backend.stderr.on('data', (data) => {",
        "  console.error(`Backend error: ${data}`);",
        "});",
        "",
        "// Serve the frontend build",
        "app.use(express.static(path.join(__dirname, 'ui/dist')));",
        "",
        "// Handle API requests by forwarding to backend",
        "const { createProxyMiddleware } = require('http-proxy-middleware');",
        "app.use('/routes', createProxyMiddleware({",
        "  target: 'http://localhost:3001',",
        "  changeOrigin: true",
        "}));",
        "",
        "// Handle all other requests by serving the frontend",
        "app.get('*', (req, res) => {",
        "  res.sendFile(path.join(__dirname, 'ui/dist/index.html'));",
        "});",
        "",
        "app.listen(PORT, () => {",
        "  console.log(`Server running on port ${PORT}`);",
        "});",
        "```"
      ]
    },
    {
      title: "Step 6: Update Packages and Dependencies",
      content: [
        "Add the http-proxy-middleware package to your root package.json:",
        "",
        "```bash",
        "npm install http-proxy-middleware --save",
        "```",
        "",
        "Update your src/requirements.txt to include these dependencies:",
        "",
        "```",
        "python-dotenv==1.0.0",
        "psycopg2-binary==2.9.6",
        "```"
      ]
    },
    {
      title: "Step 7: Configure Railway Build Settings",
      content: [
        "In your Railway project settings, click on 'Settings'",
        "Under 'Build & Deploy', make sure:",
        "- Root Directory: / (or the directory containing your package.json)",
        "- Build Command: npm run build",
        "- Start Command: npm start",
        "- Port: 8080 (or the port specified in your index.js)"
      ]
    },
    {
      title: "Step 8: Database Migration",
      content: [
        "To migrate from Databutton storage to a PostgreSQL database:",
        "",
        "1. Add a PostgreSQL service in Railway dashboard",
        "2. Create a new file src/app/db.py with this code:",
        "",
        "```python",
        "import os",
        "import psycopg2",
        "from psycopg2.extras import RealDictCursor",
        "",
        "def get_db_connection():",
        "    conn = psycopg2.connect(",
        "        os.getenv('DATABASE_URL'),",
        "        cursor_factory=RealDictCursor",
        "    )",
        "    return conn",
        "```",
        "",
        "3. Create a migration script to export data from Databutton storage:",
        "",
        "```python",
        "# migration.py",
        "import json",
        "import databutton as db",
        "import os",
        "",
        "# Export products",
        "products = db.storage.json.get('products', default=[])",
        "with open('products-export.json', 'w') as f:",
        "    json.dump(products, f)",
        "",
        "# Export users",
        "users = db.storage.json.get('users', default=[])",
        "with open('users-export.json', 'w') as f:",
        "    json.dump(users, f)",
        "",
        "# Export orders",
        "orders = db.storage.json.get('orders', default=[])",
        "with open('orders-export.json', 'w') as f:",
        "    json.dump(orders, f)",
        "```",
        "",
        "4. Create SQL schema for your PostgreSQL database:",
        "",
        "```sql",
        "CREATE TABLE users (",
        "  id VARCHAR(255) PRIMARY KEY,",
        "  name VARCHAR(255) NOT NULL,",
        "  email VARCHAR(255) NOT NULL UNIQUE,",
        "  password VARCHAR(255) NOT NULL,",
        "  role VARCHAR(50) NOT NULL,",
        "  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP",
        ");",
        "",
        "CREATE TABLE products (",
        "  id VARCHAR(255) PRIMARY KEY,",
        "  name VARCHAR(255) NOT NULL,",
        "  description TEXT,",
        "  price DECIMAL(10, 2) NOT NULL,",
        "  category VARCHAR(255),",
        "  image_url VARCHAR(255),",
        "  stock_count INTEGER NOT NULL DEFAULT 0,",
        "  supplier_id VARCHAR(255) REFERENCES users(id),",
        "  featured BOOLEAN DEFAULT FALSE,",
        "  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP",
        ");",
        "",
        "CREATE TABLE orders (",
        "  id VARCHAR(255) PRIMARY KEY,",
        "  user_id VARCHAR(255) REFERENCES users(id),",
        "  status VARCHAR(50) NOT NULL,",
        "  total DECIMAL(10, 2) NOT NULL,",
        "  shipping_address JSONB,",
        "  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP",
        ");",
        "```",
        "",
        "5. Update all API endpoints to use PostgreSQL instead of Databutton storage"
      ]
    },
    {
      title: "Step 9: Update Environment Variables",
      content: [
        "Replace all Databutton secrets with environment variables:",
        "",
        "```python",
        "# Before",
        "import databutton as db",
        "telegram_bot_token = db.secrets.get(key='TELEGRAM_BOT_TOKEN')",
        "",
        "# After",
        "import os",
        "from dotenv import load_dotenv",
        "",
        "load_dotenv()",
        "telegram_bot_token = os.getenv('TELEGRAM_BOT_TOKEN')",
        "```"
      ]
    },
    {
      title: "Step 10: Deploy to Railway",
      content: [
        "Once your configuration is complete:",
        "",
        "1. Commit and push all changes to your GitHub repository",
        "2. Railway will automatically detect the changes and deploy your app",
        "3. Monitor the deployment logs for any errors",
        "4. Once deployment is successful, click on 'Deployments' to see your app URL"
      ]
    },
    {
      title: "Step 11: Set Up Custom Domain (Optional)",
      content: [
        "To use a custom domain with your Railway deployment:",
        "",
        "1. Click on 'Settings' in your Railway project",
        "2. Scroll to 'Domains' and click 'Generate Domain' to get a Railway subdomain first",
        "3. Then click 'Custom Domain' and enter your domain",
        "4. Follow Railway's instructions to configure DNS settings for your domain",
        "5. Wait for DNS propagation (can take up to 48 hours)"
      ]
    },
    {
      title: "Troubleshooting",
      content: [
        "Common issues and solutions:",
        "",
        "- Build fails: Check that your package.json scripts are correct",
        "- API requests not working: Verify proxy configuration in index.js",
        "- Database connection issues: Check environment variables and connection strings",
        "- Application crashes: Check logs in Railway dashboard",
        "- Memory issues: Consider upgrading your Railway plan or optimizing your application"
      ]
    }
  ]
};

// Backward compatibility with previous export
export const railwayGuide = RAILWAY_DEPLOYMENT_GUIDE;
