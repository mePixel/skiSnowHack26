# Environment Variables Configuration Guide

This document outlines all environment variables that should be configured for the Ski Resort Companion application.

## Overview

The application uses environment variables to manage configuration across different environments (development, staging, production). This approach provides:

- **Security**: Sensitive data is not hardcoded in source code
- **Flexibility**: Easy configuration changes without code modifications
- **Portability**: Consistent configuration across different deployment environments

---

## Backend Environment Variables

### File: `backend/.env`

```bash
# Server Configuration
PORT=3001
NODE_ENV=development

# Data Directory
JSON_DATA_PATH=../JSON

# CORS Configuration
CORS_ORIGIN=*

# API Configuration
API_PREFIX=/api

# Logging
LOG_LEVEL=info
```

### Backend Variable Descriptions

| Variable | Type | Default | Description |
|----------|------|---------|-------------|
| `PORT` | Number | `3001` | Port number on which the Express server will listen |
| `NODE_ENV` | String | `development` | Environment mode (`development`, `production`, `test`) |
| `JSON_DATA_PATH` | String | `../JSON` | Relative path to the directory containing trip JSON data files |
| `CORS_ORIGIN` | String | `*` | Allowed CORS origins (use `*` for all, or specific domain like `https://example.com`) |
| `API_PREFIX` | String | `/api` | URL prefix for all API endpoints |
| `LOG_LEVEL` | String | `info` | Logging level (`error`, `warn`, `info`, `debug`) |

### Backend Usage in Code

Currently hardcoded in [`backend/server.js`](backend/server.js):

```javascript
// Line 7: Hardcoded port
const PORT = process.env.PORT || 3001;

// Line 14: Hardcoded JSON directory path
const getJsonDir = () => path.join(__dirname, '../JSON');

// Line 10: Hardcoded CORS
app.use(cors();
```

**Should be updated to:**

```javascript
const PORT = process.env.PORT || 3001;
const NODE_ENV = process.env.NODE_ENV || 'development';
const JSON_DATA_PATH = process.env.JSON_DATA_PATH || '../JSON';
const CORS_ORIGIN = process.env.CORS_ORIGIN || '*';
const API_PREFIX = process.env.API_PREFIX || '/api';

const getJsonDir = () => path.join(__dirname, JSON_DATA_PATH);

app.use(cors({
  origin: CORS_ORIGIN
}));
```

---

## Frontend Environment Variables

### File: `frontend/.env`

```bash
# API Configuration
VITE_API_BASE_URL=http://localhost:3001
VITE_API_TIMEOUT=10000

# Application Configuration
VITE_APP_TITLE=Ski Resort Companion
VITE_APP_VERSION=1.0.0

# Map Configuration
VITE_MAP_DEFAULT_ZOOM=13
VITE_MAP_MAX_ZOOM=19
VITE_MAP_TILE_URL=https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png

# GPS Configuration
VITE_GPS_ACCURACY_THRESHOLD=50

# Analytics Configuration
VITE_ENABLE_ANALYTICS=true
VITE_CHART_ANIMATION_DURATION=300

# Feature Flags
VITE_ENABLE_PLAYBACK=true
VITE_ENABLE_DOWNLOAD=false
```

### Frontend Variable Descriptions

| Variable | Type | Default | Description |
|----------|------|---------|-------------|
| `VITE_API_BASE_URL` | String | `http://localhost:3001` | Base URL for backend API (must start with `VITE_` for Vite) |
| `VITE_API_TIMEOUT` | Number | `10000` | API request timeout in milliseconds |
| `VITE_APP_TITLE` | String | `Ski Resort Companion` | Application title displayed in header |
| `VITE_APP_VERSION` | String | `1.0.0` | Application version number |
| `VITE_MAP_DEFAULT_ZOOM` | Number | `13` | Default zoom level for map initialization |
| `VITE_MAP_MAX_ZOOM` | Number | `19` | Maximum zoom level allowed on map |
| `VITE_MAP_TILE_URL` | String | `https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png` | URL template for map tiles |
| `VITE_GPS_ACCURACY_THRESHOLD` | Number | `50` | GPS accuracy threshold in meters for filtering points |
| `VITE_ENABLE_ANALYTICS` | Boolean | `true` | Enable/disable analytics features |
| `VITE_CHART_ANIMATION_DURATION` | Number | `300` | Chart animation duration in milliseconds |
| `VITE_ENABLE_PLAYBACK` | Boolean | `true` | Enable/disable GPS track playback feature |
| `VITE_ENABLE_DOWNLOAD` | Boolean | `false` | Enable/disable trip data download feature |

### Frontend Usage in Code

Currently hardcoded in various files:

**[`frontend/vite.config.js`](frontend/vite.config.js:9-13):**
```javascript
// Hardcoded proxy target
proxy: {
  '/api': {
    target: 'http://localhost:3001',
    changeOrigin: true,
  }
}
```

**[`frontend/src/components/SlopeMap.jsx`](frontend/src/components/SlopeMap.jsx:263-264):**
```javascript
// Hardcoded zoom levels
center={[startPoint.lat, startPoint.lng]}
zoom={13}
```

**[`frontend/src/components/SlopeMap.jsx`](frontend/src/components/SlopeMap.jsx:270):**
```javascript
// Hardcoded max zoom
maxZoom={19}
```

**[`frontend/src/components/SlopeMap.jsx`](frontend/src/components/SlopeMap.jsx:270):**
```javascript
// Hardcoded tile URL
url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
```

**[`frontend/src/utils/dataParser.js`](frontend/src/utils/dataParser.js:36):**
```javascript
// Hardcoded GPS accuracy threshold
if (typeof accuracy === 'number' && accuracy > 50) return false;
```

**[`frontend/src/components/SkiPass.jsx`](frontend/src/components/SkiPass.jsx:8-17):**
```javascript
// Hardcoded ski pass data
const skiPassData = {
  resortName: 'Alpine Paradise Resort',
  passType: 'Full Day Pass',
  passNumber: 'SP-2024-78542',
  validFrom: '2024-01-16',
  validUntil: '2024-01-16',
  zones: ['All Zones', 'Lift Access', 'Night Skiing'],
  holderName: 'John Doe',
  qrData: 'skisnow26.xaxa.at'
};
```

**Should be updated to use environment variables:**

```javascript
// In vite.config.js
proxy: {
  '/api': {
    target: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001',
    changeOrigin: true,
  }
}

// In SlopeMap.jsx
const defaultZoom = parseInt(import.meta.env.VITE_MAP_DEFAULT_ZOOM) || 13;
const maxZoom = parseInt(import.meta.env.VITE_MAP_MAX_ZOOM) || 19;
const tileUrl = import.meta.env.VITE_MAP_TILE_URL || 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';

// In dataParser.js
const gpsAccuracyThreshold = parseInt(import.meta.env.VITE_GPS_ACCURACY_THRESHOLD) || 50;

// In SkiPass.jsx (could be moved to API or config)
const skiPassData = {
  resortName: import.meta.env.VITE_RESORT_NAME || 'Alpine Paradise Resort',
  passType: import.meta.env.VITE_PASS_TYPE || 'Full Day Pass',
  // ... other fields
};
```

---

## Production Environment Variables

### Backend Production (.env.production)

```bash
PORT=3001
NODE_ENV=production
JSON_DATA_PATH=../JSON
CORS_ORIGIN=https://yourdomain.com
API_PREFIX=/api
LOG_LEVEL=warn
```

### Frontend Production (.env.production)

```bash
VITE_API_BASE_URL=https://api.yourdomain.com
VITE_API_TIMEOUT=10000
VITE_APP_TITLE=Ski Resort Companion
VITE_APP_VERSION=1.0.0
VITE_MAP_DEFAULT_ZOOM=13
VITE_MAP_MAX_ZOOM=19
VITE_MAP_TILE_URL=https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png
VITE_GPS_ACCURACY_THRESHOLD=50
VITE_ENABLE_ANALYTICS=true
VITE_CHART_ANIMATION_DURATION=300
VITE_ENABLE_PLAYBACK=true
VITE_ENABLE_DOWNLOAD=false
```

---

## Security Considerations

### Sensitive Variables

For production deployments, consider using additional environment variables for:

```bash
# Backend Security
API_KEY=your_api_key_here
JWT_SECRET=your_jwt_secret_here
RATE_LIMIT_MAX=100
RATE_LIMIT_WINDOW_MS=900000

# Frontend Security (if needed)
VITE_GOOGLE_ANALYTICS_ID=UA-XXXXXXXXX-X
VITE_SENTRY_DSN=https://xxxxx@sentry.io/xxxxx
```

### Best Practices

1. **Never commit `.env` files** - They are already in `.gitignore`
2. **Use `.env.example` files** - Provide templates for required variables
3. **Document all variables** - Maintain this documentation
4. **Use different values per environment** - Development, staging, production
5. **Rotate secrets regularly** - For API keys and authentication tokens
6. **Use environment-specific files** - `.env.development`, `.env.production`

---

## Implementation Steps

### Step 1: Create Backend .env Files

```bash
# In backend directory
cp .env.example .env
# Edit .env with your local configuration
```

### Step 2: Create Frontend .env Files

```bash
# In frontend directory
cp .env.example .env
# Edit .env with your local configuration
```

### Step 3: Update Backend Code

Modify [`backend/server.js`](backend/server.js) to read from environment variables:

```javascript
const PORT = process.env.PORT || 3001;
const NODE_ENV = process.env.NODE_ENV || 'development';
const JSON_DATA_PATH = process.env.JSON_DATA_PATH || '../JSON';
const CORS_ORIGIN = process.env.CORS_ORIGIN || '*';
const API_PREFIX = process.env.API_PREFIX || '/api';

const getJsonDir = () => path.join(__dirname, JSON_DATA_PATH);

app.use(cors({
  origin: CORS_ORIGIN
}));
```

### Step 4: Update Frontend Code

Modify components to use `import.meta.env` for Vite environment variables:

```javascript
// Example in SlopeMap.jsx
const defaultZoom = parseInt(import.meta.env.VITE_MAP_DEFAULT_ZOOM) || 13;
const maxZoom = parseInt(import.meta.env.VITE_MAP_MAX_ZOOM) || 19;
const tileUrl = import.meta.env.VITE_MAP_TILE_URL || 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
```

### Step 5: Update Vite Config

Modify [`frontend/vite.config.js`](frontend/vite.config.js):

```javascript
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001',
        changeOrigin: true,
      }
    }
  }
})
```

### Step 6: Test Configuration

```bash
# Backend
cd backend
npm start
# Should use PORT from .env

# Frontend
cd frontend
npm run dev
# Should use VITE_API_BASE_URL from .env
```

---

## Deployment-Specific Configurations

### Heroku

Backend variables set in Heroku dashboard:
```
PORT: (automatically set by Heroku)
NODE_ENV: production
JSON_DATA_PATH: ./JSON
CORS_ORIGIN: https://your-frontend.herokuapp.com
```

### Vercel (Frontend)

Environment variables set in Vercel dashboard:
```
VITE_API_BASE_URL: https://your-backend.herokuapp.com
VITE_APP_TITLE: Ski Resort Companion
```

### Docker

```dockerfile
# Backend Dockerfile
ENV PORT=3001
ENV NODE_ENV=production
ENV JSON_DATA_PATH=/app/JSON
```

---

## Troubleshooting

### Issue: Environment variables not loading

**Solution:**
- Ensure `.env` file exists in the correct directory
- Restart the development server after adding variables
- Check that variable names match exactly (case-sensitive)
- For Vite, ensure variables start with `VITE_` prefix

### Issue: CORS errors in production

**Solution:**
- Set `CORS_ORIGIN` to your frontend domain
- Don't use `*` in production for security
- Ensure backend and frontend domains are correctly configured

### Issue: Map not loading

**Solution:**
- Check `VITE_MAP_TILE_URL` is correct
- Verify network connectivity to tile server
- Ensure Leaflet CSS is imported

---

## Additional Resources

- [Vite Environment Variables](https://vitejs.dev/guide/env-and-mode.html)
- [Node.js process.env](https://nodejs.org/api/process.html#processenv)
- [12-Factor App Configuration](https://12factor.net/config)
- [dotenv npm package](https://www.npmjs.com/package/dotenv)

---

## Summary

This document provides a comprehensive guide for configuring environment variables across the Ski Resort Companion application. By following these guidelines, you can:

1. **Secure sensitive configuration** - Keep secrets out of source code
2. **Simplify deployments** - Easy configuration per environment
3. **Improve maintainability** - Centralized configuration management
4. **Enable flexibility** - Quick changes without code modifications

**Next Steps:**
1. Create `.env.example` files for both backend and frontend
2. Update code to use environment variables
3. Test configuration in development environment
4. Deploy with production-specific values
5. Document any project-specific variables as needed

---

**Last Updated:** 2024-01-17