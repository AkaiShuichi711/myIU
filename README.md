# myIU

Unified frontend + backend application with Azure AD OAuth and Appwrite database.

## Quick Start

### 1. Setup Backend
```bash
cd backend
npm install
```

Configure `backend/.env`:
- `AD_CLIENT_ID` — Azure AD client ID
- `AD_TENANT_ID` — Azure AD tenant ID
- `REDIRECT_URI` — OAuth redirect (e.g., `http://localhost:5173/redirect`)
- `AD_CLIENT_ID_SECRET` — Azure AD client secret
- `FRONTEND_ORIGIN` — Frontend URL (e.g., `http://localhost:5173`)
- `BASE_URI_LOCAL` — Base URL for backend (e.g., `http://localhost:5173`)
- `SESSION_SECRET` — Session key for authentication

### 2. Setup Frontend
```bash
cd frontend
npm install
```

Configure `frontend/.env`:
- `VITE_APPWRITE_*` — Appwrite database credentials
- `VITE_AD_CLIENT_ID` — Azure AD client ID
- `VITE_AD_TENANT_ID` — Azure AD tenant ID
- `VITE_REDIRECT_URI` — OAuth redirect (e.g., `http://localhost:5173/redirect`)
- `VITE_OAUTH_BACKEND_URL` — Backend URL through Vite proxy (e.g., `http://localhost:5173`)

### 3. Setup Appwrite (Optional)
```bash
cd appwrite
docker-compose up -d
```

Access Appwrite Console at `http://localhost` and configure:
- Create project, database, and collections (users, posts, saves, likes)
- Create storage bucket for images
- Update `VITE_APPWRITE_*` in `frontend/.env`

### 4. Run Development
```bash
# Terminal 1: Backend (port 8080)
cd backend
npm start

# Terminal 2: Frontend (port 5173)
cd frontend
npm run dev
```

Access at: `http://localhost:5173`

## Architecture

```
frontend/
  ├── src/
  │   ├── _auth/          # Authentication forms
  │   ├── _root/          # App pages & layouts
  │   ├── components/     # React components
  │   ├── lib/            # Utilities & API clients
  │   └── ...
  ├── .env                # Frontend configuration
  └── package.json

backend/
  ├── src/
  │   ├── router.js       # OAuth routes (/auth/login, /redirect)
  │   ├── msal-express-wrapper/
  │   │   └── auth-provider.js  # MSAL OAuth handler
  │   └── app.js          # Express app
  ├── appSettings.js      # Configuration
  ├── .env                # Backend configuration
  └── package.json

appwrite/
  ├── docker-compose.yml  # Appwrite service
  └── scripts/
      └── create-appwrite-schema.ts  # Auto-create DB schema
```

## Routing

Frontend Vite dev proxy (`vite.config.ts`) routes to backend on `8080`:
- `/auth/*` → backend OAuth flow
- `/redirect` → OAuth callback
- `/home` → authenticated home page
- `/api/*` → backend API endpoints

## Environment Variables

See `.env` files in each folder for complete reference.

## Azure AD Setup

1. Create App Registration in Azure Portal
2. Set Redirect URI: `http://localhost:5173/redirect`
3. Get Client ID, Tenant ID, Client Secret
4. Add to `backend/.env` and `frontend/.env`

## Database

Appwrite handles:
- Users collection: profile data, auth info
- Posts collection: user-generated content
- Saves/Likes: relationships

Auto-setup: Run `appwrite/scripts/create-appwrite-schema.ts`

## Troubleshooting

**Backend won't start?**
- Check Node.js version (14+)
- Verify `.env` has all required keys
- Check port 8080 is free

**Frontend can't reach backend?**
- Ensure backend running on port 8080
- Check Vite proxy in `frontend/vite.config.ts`
- Verify `VITE_OAUTH_BACKEND_URL` in `frontend/.env`

**OAuth redirect loops?**
- Verify `REDIRECT_URI` matches Azure App Registration
- Check `returnTo` parameter in OAuth flow
- Ensure `FRONTEND_ORIGIN` is correct

## Production

Replace all `http://localhost:*` URLs with production domain in:
- `backend/.env`: `FRONTEND_ORIGIN`, `BASE_URI_LOCAL`, `REDIRECT_URI`
- `frontend/.env`: `VITE_OAUTH_BACKEND_URL`, `VITE_REDIRECT_URI`
- Azure AD App Registration: redirect URI
