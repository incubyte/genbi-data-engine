# Deploying GenBI Data Engine to Render

This guide explains how to deploy the GenBI Data Engine application to Render.

## Prerequisites

1. A [Render](https://render.com) account
2. An [Anthropic API key](https://console.anthropic.com/)

## Deployment Options

### Option 1: Deploy with Blueprint (Recommended)

1. Fork or clone this repository to your GitHub account
2. Connect your GitHub account to Render
3. Create a new Blueprint on Render and select your repository
4. Render will automatically detect the `render.yaml` file and set up the service
5. Set the required environment variables:
   - `ANTHROPIC_API_KEY`: Your Anthropic API key

### Option 2: Manual Deployment

1. Create a new Web Service on Render
2. Connect your GitHub repository
3. Configure the following settings:
   - **Name**: `genbi-data-engine` (or your preferred name)
   - **Environment**: `Node`
   - **Build Command**: `npm ci && cd frontend && npm ci && npm run build && cd ..`
   - **Start Command**: `node server.js`
4. Add the following environment variables:
   - `NODE_ENV`: `production`
   - `PORT`: `3000`
   - `ANTHROPIC_API_KEY`: Your Anthropic API key
   - `ANTHROPIC_MODEL`: `claude-3-7-sonnet-20250219`
   - `LOG_LEVEL`: `info`
   - `CORS_ORIGINS`: The URL of your deployed application (e.g., `https://genbi-data-engine.onrender.com`)
5. Add a disk:
   - **Name**: `data`
   - **Mount Path**: `/app/data`
   - **Size**: `1 GB`

## Environment Variables

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `NODE_ENV` | Environment mode | Yes | `production` |
| `PORT` | Port to run the server on | No | `3000` |
| `ANTHROPIC_API_KEY` | Your Anthropic API key | Yes | - |
| `ANTHROPIC_MODEL` | Anthropic model to use | No | `claude-3-7-sonnet-20250219` |
| `LOG_LEVEL` | Logging level | No | `info` |
| `CORS_ORIGINS` | Allowed CORS origins | No | Your app's URL |
| `USER_DATA_DB_PATH` | Path to SQLite database | No | `./data/user-data.db` |

## Persistent Storage and Database Initialization

The application uses a SQLite database to store user data (saved connections and queries). Render provides persistent disk storage that survives deployments.

### How Database Initialization Works

1. The database file is stored in the `/app/data` directory, which is mounted as a persistent disk on Render.
2. When the application starts for the first time, it automatically:
   - Creates the data directory if it doesn't exist
   - Creates a new SQLite database file if it doesn't exist
   - Creates the necessary tables (saved_connections and saved_queries)
3. On subsequent starts, the application detects the existing database and connects to it without recreating the tables.

### Important Notes

- No manual database setup is required
- The database schema is automatically created on first run
- All user data (saved connections and queries) will persist across deployments
- If you need to reset the database, you can delete the persistent disk in the Render dashboard and create a new one

## Troubleshooting

### Common Issues

1. **Application crashes on startup**:
   - Check the logs in the Render dashboard
   - Ensure all required environment variables are set
   - Verify that the persistent disk is properly mounted

2. **Frontend not loading**:
   - Check that the build command completed successfully
   - Verify that the static files are being served correctly

3. **API requests failing**:
   - Check CORS configuration
   - Verify that the Anthropic API key is valid

### Viewing Logs

Render provides comprehensive logging capabilities that are essential for monitoring your application and troubleshooting issues:

1. **Dashboard Logs**:
   - Log in to your Render account
   - Navigate to your service (genbi-data-engine)
   - Click on the "Logs" tab in the service dashboard
   - You'll see real-time logs displayed in the browser

2. **Log Filtering Options**:
   - **Log Type**: Filter by "Build", "Runtime", or "System" logs
   - **Time Range**: View logs from specific time periods
   - **Search**: Search for specific text within logs
   - **Log Level**: Filter by log level (info, error, etc.)

3. **Log Retention**:
   - Free tier: 7 days of logs
   - Paid tiers: 30+ days of logs

4. **Downloading Logs**:
   - Navigate to the Logs tab
   - Click the "Download" button
   - Select the time range and log types you want to download

5. **Important Log Events to Monitor**:
   - Database initialization logs (look for "Initializing user database")
   - Server startup logs (look for "Server running on port")
   - API request logs (each API request is logged)
   - Error logs (look for "error" or "failed")
   - Database operation logs (look for "DB Operation")

## Local Testing Before Deployment

To test the production build locally before deploying:

1. Build the frontend:
   ```bash
   cd frontend
   npm run build
   cd ..
   ```

2. Set environment variables:
   ```bash
   export NODE_ENV=production
   export PORT=3000
   export ANTHROPIC_API_KEY=your_api_key
   ```

3. Start the server:
   ```bash
   node server.js
   ```

4. Visit `http://localhost:3000` in your browser

## Updating Your Deployment

When you push changes to your GitHub repository, Render will automatically rebuild and redeploy your application.

For manual updates:
1. Make your changes locally
2. Push to GitHub
3. Render will automatically detect the changes and redeploy
