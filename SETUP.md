# 🚀 Quick Start Guide

Follow these steps to get the Ski Resort Companion application running on your local machine.

## Prerequisites

Ensure you have the following installed:
- **Node.js** (v18 or higher) - [Download here](https://nodejs.org/)
- **npm** (comes with Node.js) or **yarn**

## Step 1: Install Backend Dependencies

```bash
cd backend
npm install
```

This will install:
- `express` - Web framework
- `cors` - Cross-origin resource sharing

## Step 2: Start Backend Server

Open a new terminal window and run:

```bash
cd backend
npm start
```

You should see:
```
🎿 Ski Resort Backend API running on port 3001
📍 API endpoints:
   GET  http://localhost:3001/api/trips
   GET  http://localhost:3001/api/trips/:id
   GET  http://localhost:3001/api/health
```

**Keep this terminal open!** The backend needs to stay running.

## Step 3: Install Frontend Dependencies

Open a new terminal window and run:

```bash
cd frontend
npm install
```

This will install:
- `react` & `react-dom` - UI library
- `react-leaflet` & `leaflet` - Map visualization
- `recharts` - Charts
- `qrcode.react` - QR code generation
- `lucide-react` - Icons
- `tailwindcss` - Styling
- And other dependencies...

## Step 4: Start Frontend Development Server

In the same terminal (frontend directory), run:

```bash
npm run dev
```

You should see:
```
  VITE v5.0.8  ready in 123 ms

  ➜  Local:   http://localhost:3000/
  ➜  Network: use --host to expose
```

## Step 5: Open Your Browser

Navigate to: **http://localhost:3000**

You should see the Ski Resort Companion application with:
- 🎫 Digital Ski Pass tab
- 🗺️ Map tab
- 📊 Stats tab

## Troubleshooting

### Backend won't start

**Problem:** Port 3001 is already in use

**Solution:**
```bash
# Find what's using port 3001
lsof -i :3001

# Kill the process
kill -9 <PID>

# Or use a different port
PORT=3002 npm start
```

### Frontend can't connect to backend

**Problem:** API requests failing

**Solutions:**

1. **Check if backend is running**
   ```bash
   curl http://localhost:3001/api/health
   ```
   Should return: `{"status":"ok","timestamp":"..."}`

2. **Check CORS settings**
   - Backend CORS is enabled in `backend/server.js`
   - Frontend proxy is configured in `frontend/vite.config.js`

3. **Clear browser cache**
   - Hard refresh: `Cmd+Shift+R` (Mac) or `Ctrl+Shift+R` (Windows)

### Map not displaying

**Problem:** Map shows blank or errors

**Solutions:**

1. **Check browser console** (F12) for Leaflet errors
2. **Verify Leaflet CSS is loaded** - Check `frontend/src/index.css`
3. **Check if coordinates are valid** - Ensure trip has GPS data

### Charts not rendering

**Problem:** Charts show empty or errors

**Solutions:**

1. **Check browser console** for Recharts errors
2. **Verify data format** - Ensure parsed data has correct structure
3. **Check if trip has data** - Select a different trip

### Dependencies installation fails

**Problem:** `npm install` errors

**Solutions:**

1. **Clear npm cache**
   ```bash
   npm cache clean --force
   ```

2. **Delete node_modules and reinstall**
   ```bash
   rm -rf node_modules package-lock.json
   npm install
   ```

3. **Use a different registry**
   ```bash
   npm install --registry=https://registry.npmjs.org/
   ```

## Development Workflow

### Making Changes

1. **Backend changes** - Server auto-restarts with `nodemon` (if installed)
   ```bash
   npm run dev  # Instead of npm start
   ```

2. **Frontend changes** - Vite hot-reloads automatically
   - Save any file in `frontend/src/`
   - Browser updates instantly

### Testing API Endpoints

**List all trips:**
```bash
curl http://localhost:3001/api/trips
```

**Get specific trip:**
```bash
curl http://localhost:3001/api/trips/trip_20260116_085444_059C4C69
```

**Health check:**
```bash
curl http://localhost:3001/api/health
```

## Project Structure Reference

```
skiSnowHack26/
├── backend/
│   ├── server.js          # Express API (port 3001)
│   ├── package.json       # Backend dependencies
│   └── node_modules/    # Installed packages
├── frontend/
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── utils/         # Helper functions
│   │   ├── App.jsx        # Main app
│   │   └── main.jsx       # Entry point
│   ├── index.html
│   ├── vite.config.js     # Vite config (proxy to backend)
│   └── node_modules/    # Installed packages
├── JSON/                 # Trip data files
└── README.md
```

## Next Steps

Once the application is running:

1. **Select a trip** from the dropdown in the header
2. **View the Map** - See your GPS track on the map
3. **Check Analytics** - Review speed, altitude, and stats
4. **Use Ski Pass** - Scan QR code at lift gates

## Stopping the Application

To stop the servers:

1. **Backend** - Press `Ctrl+C` in the backend terminal
2. **Frontend** - Press `Ctrl+C` in the frontend terminal

## Production Build

To build for production:

```bash
# Frontend
cd frontend
npm run build
# Output: frontend/dist/

# Backend (no build needed, just run)
cd backend
npm start
```

## Need Help?

- Check the main [`README.md`](README.md) for detailed documentation
- Review [`IMPLEMENTATION_PLAN.md`](IMPLEMENTATION_PLAN.md) for architecture details
- Open an issue on GitHub for bugs or feature requests

---

**Happy skiing! 🎿❄️**