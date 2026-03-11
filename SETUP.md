# Nigeria Economic Dashboard - Setup with Vercel Postgres

## Live Dashboard
**https://nigeria-economic-dashboard.vercel.app**

---

## Step-by-Step Setup

### Step 1: Create Vercel Project with Postgres

1. Go to [vercel.com](https://vercel.com) → **Dashboard**
2. Click **"Add New..."** → **Project**
3. Select your GitHub repository: `Collins76/Nigeria-Economic-Dashboard`
4. Click **"Continue"**

### Step 2: Add Postgres Database

5. Under **"Configure Project"**, scroll to **"Storage"**
6. Click **"+ Create Database"**
7. Select **"Postgres"**
8. Configure:
   - **Database Name**: `nigeria_economy`
   - **Region**: `eu-west-2 (London)` or closest to you
9. Click **"Create"**
10. Wait for it to attach

### Step 3: Deploy

11. Click **"Deploy"** button at the bottom
12. Wait ~1 minute for deployment to complete

### Step 4: Get Database Connection URL

After deployment:
1. Go to your project → **Storage** tab
2. Click on your Postgres database
3. Click **".env.local"** tab
4. Copy the `POSTGRES_URL` value

### Step 5: Add GitHub Secrets

Go to: https://github.com/Collins76/Nigeria-Economic-Dashboard/settings/secrets/actions

Add these secrets:

| Secret Name | Value |
|-------------|-------|
| `VERCEL_TOKEN` | Get from [vercel.com/account/tokens](https://vercel.com/account/tokens) |
| `VERCEL_ORG_ID` | Run: `npx vercel link` then check `.vercel/project.json` |
| `VERCEL_PROJECT_ID` | Run: `npx vercel link` then check `.vercel/project.json` |
| `VERCEL_POSTGRES_URL` | The `POSTGRES_URL` from Storage → .env.local |

### Step 6: Run ETL Pipeline Manually

1. Go to **Actions** tab in your GitHub repo
2. Click **"ETL & Deploy"** workflow
3. Click **"Run workflow"** → **"Run workflow"**

This will:
- Initialize database tables
- Fetch data from World Bank API
- Redeploy to Vercel

---

## Automated Updates

The workflow runs:
- **Daily at 6:00 AM UTC** - Auto fetches latest data
- **On push to main** - Deploys changes
- **Manual trigger** - Run from Actions tab

---

## Local Development with Vercel Postgres

```bash
# Clone and setup
git clone https://github.com/Collins76/Nigeria-Economic-Dashboard.git
cd Nigeria-Economic-Dashboard

# Install dependencies
npm install
cd server && npm install && cd ..

# Link to Vercel
npx vercel link

# Pull environment variables
npx vercel env pull .env.local

# Initialize database
cd server && npm run db:init

# Run ETL to fetch data
npm run etl:run

# Start development
npm run dev
```

---

## Project Structure

```
Nigeria-Economic-Dashboard/
├── src/                    # Frontend (React + TypeScript)
│   ├── components/         # UI components
│   ├── data/              # Mock data files
│   └── store/             # State management
├── server/                 # Backend API
│   └── src/
│       ├── config/        # Database & indicators
│       └── etl/          # ETL pipeline
├── .github/workflows/    # CI/CD automation
└── SETUP.md              # This guide
```

---

## Features

- 23 Nigerian economic indicators
- Interactive charts & KPIs
- Dark/Light mode
- CSV data export
- Auto-updating from World Bank
- Daily ETL runs automatically
