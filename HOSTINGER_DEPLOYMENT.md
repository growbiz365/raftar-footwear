# Hostinger Deployment Guide — Raftar Footwear (MERN)

## Overvie

This document explains how Raftar Footwear (MongoDB + Express + React/Vite + Node.js) is configured for a **single combined deployment** on Hostinger's shared hosting. Both the frontend (React/Vite) and backend (Express API) run in one Node.js app.

---

## 1. Combined Repository Structure

```
repo-root/
├── package.json              # Root package.json (start + build scripts)
├── build.sh                  # Build script (installs backend deps only)
├── HOSTINGER_DEPLOYMENT.md   # This file
├── frontend/
│   ├── dist/                 # Pre-built React app (committed to git)
│   ├── src/
│   │   └── services/
│   │       └── api.js        # API baseURL: import.meta.env.VITE_API_URL || '/api'
│   ├── vite.config.js        # Proxy /api + /uploads for local dev
│   └── package.json
└── backend/
    ├── src/server.js         # Express: serves API + frontend/dist/
    ├── src/uploads/          # Local image uploads (persists on shared hosting)
    ├── .env                  # Local dev env vars (git-ignored)
    ├── .env.example          # Template (committed, no real secrets)
    └── package.json
```

---

## 2. Key Changes Made

### 2a. Root `package.json` (created)
```json
{
  "name": "raftar-footwear",
  "scripts": {
    "start": "node backend/src/server.js",
    "build": "bash build.sh"
  }
}
```
- **`start`** — Hostinger runs this to start the app
- **`build`** — Hostinger runs this during deployment

### 2b. `build.sh` (created)
```bash
#!/bin/bash
set -e
echo "Installing backend dependencies..."
cd backend
npm ci --omit=dev || npm install --omit=dev
```
Only installs backend deps. The frontend is pre-built (`frontend/dist/` is committed) — avoids Vite build issues on Hostinger.

### 2c. `backend/src/server.js` — Modified
- Serves the React build from `frontend/dist/` via `express.static`
- SPA catch-all returns `index.html` for any non-API path
- JSON 404 for unknown API routes
- `/api/health` is public (no `X-App-Key` required) for uptime checks
- `dotenv.config({ path: <backend>/.env })` — resolves env regardless of cwd
- Existing API security stays active (`ALLOWED_ORIGINS` origin guard, `API_ACCESS_KEY` header guard, POST rate-limit, login brute-force limit)

```js
// Serve React build
const clientDist = path.join(__dirname, '..', '..', 'frontend', 'dist');
if (fs.existsSync(path.join(clientDist, 'index.html'))) {
  app.use(express.static(clientDist));

  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api') || req.path.startsWith('/uploads')) return next();
    res.sendFile(path.join(clientDist, 'index.html'));
  });
}

// 404 for unknown API routes
app.use((req, res) => res.status(404).json({ success: false, message: 'Route not found' }));
```

### 2d. `frontend/src/services/api.js` — Modified
```js
baseURL: import.meta.env.VITE_API_URL || '/api',
```
Uses a relative `/api` so all calls go to the same origin (combined deployment). It also sends `X-App-Key` on every request.

### 2e. `frontend/vite.config.js` — Already configured
```js
proxy: {
  '/api': 'http://localhost:5000',
  '/uploads': 'http://localhost:5000'
}
```

### 2f. Root `.gitignore` — Modified
`frontend/dist/` is explicitly **allowed** (committed) so Hostinger never needs to run Vite. `.env` files stay ignored.

### 2g. `frontend/dist/` — Pre-built and committed
Built locally with `npm run build` and committed. Hostinger serves it directly.

---

## 3. Hostinger hPanel Configuration

### Step 1: Go to Websites → Manage → Node.js Apps
Do NOT use the "Add Website" quick deploy — it auto-detects Vite and locks the root to `frontend/`.

### Step 2: Click "Add App" → "Import Git Repository"
Connect your GitHub repo.

### Step 3: Build & Start Settings

| Setting | Value |
|---|---|
| **Root directory** | `./` |
| **Framework preset** | Other |
| **Branch** | your branch (e.g. `main`) |
| **Node version** | 22.x |
| **Build command** | `npm run build` |
| **Start command** | `npm start` |
| **Entry file** | `backend/src/server.js` |
| **Output directory** | `dist` (ignored for Node apps) |

### Step 4: Environment Variables
Set these in the **Environment Variables** section:

| Key | Value |
|---|---|
| `PORT` | `5000` |
| `NODE_ENV` | `production` |
| `MONGO_URI` | your MongoDB Atlas connection string |
| `JWT_SECRET` | a long random string |
| `CLOUDINARY_CLOUD_NAME` | your Cloudinary cloud name |
| `CLOUDINARY_API_KEY` | your Cloudinary API key |
| `CLOUDINARY_API_SECRET` | your Cloudinary API secret |
| `ALLOWED_ORIGINS` | `https://raftarfootwear.com,https://www.raftarfootwear.com` |
| `API_ACCESS_KEY` | a unique shared secret (see warning below) |

> **⚠ API key warning:** if you change `API_ACCESS_KEY` in Hostinger, you MUST also build `frontend/dist` with `VITE_APP_KEY` set to the **same value**, then commit + push the new dist. Otherwise the site's requests will be rejected with 403.

### Step 5: Click "Save and Redeploy"

---

## 4. Deployment Flow

When you click Redeploy, Hostinger:

1. Clones the repo from GitHub
2. Runs `npm run build` → `bash build.sh` → installs backend dependencies
3. Runs `npm start` → `node backend/src/server.js` → starts Express

Express then:
- Listens on `PORT`
- Connects to MongoDB Atlas
- Serves API routes at `/api/*` (behind origin + app-key guards)
- Serves the React app from `frontend/dist/` at all other routes

---

## 5. Working With Uploads

Admin images upload via Cloudinary with a local fallback to `backend/src/uploads/`. On Hostinger shared hosting the filesystem **persists** (it is not serverless), so local uploads survive redeploys. They are served at `/uploads/...` by the same app.

---

## 6. Troubleshooting

### 6a. Build fails — `vite` / `tsc` not found
**Cause:** Hostinger's npm doesn't add `node_modules/.bin` to PATH properly.
**Fix:** Don't build on Hostinger. Commit `frontend/dist/` (pre-built) to git. `build.sh` only installs backend deps.

### 6b. API calls fail in production but work locally
**Cause:** The frontend bundle was built with `VITE_API_URL` pointing at localhost, or with a `VITE_APP_KEY` that doesn't match the backend `API_ACCESS_KEY`.
**Fix:** Rebuild with `VITE_API_URL=/api` and matching key: `cd frontend && VITE_APP_KEY=<key> npm run build`, then commit `frontend/dist/` and redeploy.

### 6c. Frontend shows blank page / no data
Check:
1. Visit `https://raftarfootwear.com/api/health` — should return `{"status":"ok"}`
2. Open browser console (F12 → Console) and check for 403 network errors → verify `X-App-Key` matches `API_ACCESS_KEY`
3. Verify env vars in Hostinger
4. Ensure MongoDB Atlas allows connections from Hostinger's IP (Network Access)

### 6d. Need to update the frontend?
1. Make changes in `frontend/src/`
2. Run `cd frontend && npm run build` locally
3. Commit and push `frontend/dist/`
4. Redeploy in Hostinger (only `npm install` runs, no Vite)

---

## 7. Important Notes

- **MongoDB Atlas:** whitelist Hostinger's server IP in Atlas Network Access
- **Node.js version:** 22.x (available in Hostinger)
- **Git ignored files:** `.env` files are in `.gitignore` — never commit secrets
- **`frontend/dist/`** is intentionally committed — keep it in sync with `frontend/src/`