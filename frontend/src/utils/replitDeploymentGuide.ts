/**
 * Ahadu Market - Replit Deployment Guide
 * 
 * This guide explains how to deploy the Ahadu Market application on Replit
 */

export const REPLIT_DEPLOYMENT_GUIDE = {
  title: "Ahadu Market Deployment Guide for Replit",
  sections: [
    {
      title: "Prerequisites",
      content: [
        "A Replit account (https://replit.com)",
        "The Ahadu Market codebase (frontend and backend)"
      ]
    },
    {
      title: "Step 1: Create a New Repl",
      content: [
        "Log in to your Replit account",
        "Click on '+ Create Repl'",
        "Select 'Node.js' as the template",
        "Name your Repl 'Ahadu-Market' or any name you prefer",
        "Click 'Create Repl'"
      ]
    },
    {
      title: "Step 2: Set Up the Project Structure",
      content: [
        "In the Replit file explorer, create the following folder structure:",
        "- /src (for backend code)",
        "- /ui (for frontend code)",
        "",
        "Download the Ahadu Market codebase from your development environment",
        "Upload the files to the corresponding folders in Replit"
      ]
    },
    {
      title: "Step 3: Configure Environment Variables",
      content: [
        "In Replit, click on the 'Secrets' tool in the left sidebar (lock icon)",
        "Add the following environment variables:",
        "- TELEGRAM_BOT_TOKEN (if using Telegram notifications)",
        "- TELEGRAM_CHAT_ID (if using Telegram notifications)",
        "- Any other API keys or secrets your app needs"
      ]
    },
    {
      title: "Step 4: Install Dependencies",
      content: [
        "In the Replit Shell, run the following commands:",
        "",
        "```",
        "# Install backend dependencies",
        "cd src",
        "npm install",
        "",
        "# Install frontend dependencies",
        "cd ../ui",
        "npm install",
        "```"
      ]
    },
    {
      title: "Step 5: Configure the Backend",
      content: [
        "Update the src/main.js file to use Replit's environment variables",
        "Update any connection strings or API endpoints if necessary"
      ]
    },
    {
      title: "Step 6: Configure the Frontend",
      content: [
        "In the ui/src/brain/index.ts file, update the API_URL to point to your Replit backend URL",
        "Make any other necessary adjustments for Replit hosting"
      ]
    },
    {
      title: "Step 7: Set Up the Start Script",
      content: [
        "Create or modify the index.js file in the root directory with the following content:",
        "",
        "```javascript",
        "const { spawn } = require('child_process');",
        "",
        "// Start the backend server",
        "const backend = spawn('node', ['src/main.js']);",
        "backend.stdout.on('data', (data) => {",
        "  console.log(`Backend: ${data}`);",
        "});",
        "backend.stderr.on('data', (data) => {",
        "  console.error(`Backend error: ${data}`);",
        "});",
        "",
        "// Start the frontend development server",
        "const frontend = spawn('npm', ['start', '--prefix', 'ui']);",
        "frontend.stdout.on('data', (data) => {",
        "  console.log(`Frontend: ${data}`);",
        "});",
        "frontend.stderr.on('data', (data) => {",
        "  console.error(`Frontend error: ${data}`);",
        "});",
        "```",
        "",
        "Modify the package.json in the root directory to include:",
        "",
        "```json",
        "{",
        "  \"name\": \"ahadu-market\",",
        "  \"version\": \"1.0.0\",",
        "  \"description\": \"Ahadu Market E-commerce Platform\",",
        "  \"main\": \"index.js\",",
        "  \"scripts\": {",
        "    \"start\": \"node index.js\"",
        "  },",
        "  \"dependencies\": {",
        "    \"express\": \"^4.18.2\"",
        "  }",
        "}",
        "```"
      ]
    },
    {
      title: "Step 8: Run the Application",
      content: [
        "In Replit, click the 'Run' button at the top",
        "Replit will install dependencies and start the application",
        "Once the app is running, you'll see the URL where your app is hosted"
      ]
    },
    {
      title: "Step 9: Connect a Custom Domain (Optional)",
      content: [
        "In Replit, go to the 'Settings' tab",
        "Scroll down to 'Custom Domain'",
        "Enter your domain name and follow the instructions to set up DNS"
      ]
    },
    {
      title: "Troubleshooting",
      content: [
        "If you encounter CORS issues, make sure your backend is configured to accept requests from your Replit domain",
        "If storage issues occur, consider using a cloud database instead of local storage",
        "For memory limitations, optimize your application to use fewer resources"
      ]
    },
    {
      title: "Maintenance",
      content: [
        "To update your application:",
        "- Pull the latest code from your repository",
        "- Upload the new files to Replit",
        "- Restart the application by clicking 'Stop' and then 'Run'",
        "",
        "Monitor your application's logs for any errors or issues",
        "",
        "Regularly back up your data to prevent data loss",
        "",
        "Congratulations! Your Ahadu Market e-commerce platform should now be deployed on Replit."
      ]
    }
  ]
};
