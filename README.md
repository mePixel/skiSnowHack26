# 🎿 Ski Resort Companion

A modern web application for ski resort visitors that serves as both a digital ski pass and a slope tracker/analyzer. Built with React, Vite, Tailwind CSS, and Node.js.

## Features

### 🎫 Digital Ski Pass
- QR code-based lift access
- Real-time validity status
- Resort information display
- Activate/deactivate functionality
- Scan simulation for lift gates

### 🗺️ Interactive Map
- GPS track visualization using Leaflet
- Start, end, and max speed markers
- Auto-fit bounds to track
- OpenStreetMap tiles
- Mobile-friendly zoom and pan

### 📊 Analytics Dashboard
- Speed over time chart
- Altitude over time chart
- Key metrics display:
  - Total distance
  - Max speed
  - Vertical drop
  - Duration
- Additional trip statistics

## Tech Stack

### Backend
- **Node.js** - Runtime
- **Express** - Web framework
- **CORS** - Cross-origin resource sharing

### Frontend
- **React 18+** - UI library
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **Shadcn UI** - Component library
- **react-leaflet** - Map visualization
- **Recharts** - Charts
- **qrcode.react** - QR code generation
- **Lucide React** - Icons

## Project Structure

```
skiSnowHack26/
├── backend/
│   ├── server.js           # Express API server
│   ├── package.json        # Backend dependencies
│   └── .gitignore         # Git ignore rules
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── ui/       # Shadcn UI components
│   │   │   ├── SkiPass.jsx
│   │   │   ├── SlopeMap.jsx
│   │   │   ├── Analytics.jsx
│   │   │   └── TripSelector.jsx
│   │   ├── utils/
│   │   │   ├── dataParser.js
│   │   │   └── cn.js
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── index.html
│   ├── vite.config.js
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   └── package.json
├── JSON/                   # Trip data files
└── README.md
```

## Getting Started

### Prerequisites
- Node.js 18+ installed
- npm or yarn package manager

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd skiSnowHack26
   ```

2. **Install backend dependencies**
   ```bash
   cd backend
   npm install
   ```

3. **Install frontend dependencies**
   ```bash
   cd frontend
   npm install
   ```

### Running the Application

1. **Start the backend server**
   ```bash
   cd backend
   npm start
   ```
   The backend will run on `http://localhost:3001`

2. **Start the frontend development server** (in a new terminal)
   ```bash
   cd frontend
   npm run dev
   ```
   The frontend will run on `http://localhost:3000`

3. **Open your browser**
   Navigate to `http://localhost:3000`

## API Endpoints

### GET /api/trips
Returns a list of all available trips.

**Response:**
```json
[
  {
    "id": "trip_20260116_085444_059C4C69",
    "filename": "trip_20260116_085444_059C4C69.json",
    "date": "2026-01-16 08:54"
  }
]
```

### GET /api/trips/:id
Returns detailed data for a specific trip.

**Response:**
```json
{
  "id": "trip_20260116_085444_059C4C69",
  "data": { /* raw trip data */ },
  "metadata": {
    "totalEntries": 330,
    "hasGPS": true
  }
}
```

### GET /api/health
Health check endpoint.

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2024-01-16T10:00:00.000Z"
}
```

## Data Format

Trip data is stored as JSON files with Unix timestamps as keys:

```json
{
  "1768553684428": {
    "accelerometer": {
      "x": 0.345,
      "y": -0.055,
      "z": -0.924,
      "magnitude": 0.988
    },
    "gyroscope": {
      "x": 0.301,
      "y": -0.393,
      "z": -0.656,
      "magnitude": 0.822
    },
    "gps": {
      "latitude": 46.99,
      "longitude": 10.32,
      "altitude": 2622.90,
      "speed": 1.49,
      "course": 48.16,
      "horizontalAccuracy": 19.39
    }
  }
}
```

## Data Processing

The application processes raw trip data through several steps:

1. **GPS Filtering** - Removes points with accuracy > 50m
2. **Distance Calculation** - Uses Haversine formula for accurate distances
3. **Metric Computation** - Calculates max speed, vertical drop, duration
4. **Visualization** - Formats data for maps and charts

## Design System

### Color Palette
- **Primary**: Sky Blue (`#0ea5e9`)
- **Secondary**: Slate (`#64748b`)
- **Success**: Green (`#22c55e`)
- **Warning**: Orange (`#f59e0b`)
- **Danger**: Red (`#ef4444`)

### Typography
- Sans-serif font family
- Large, legible numbers for metrics
- Clear labels for all data points

### Mobile Optimization
- Touch-friendly UI elements
- Compact layouts for small screens
- Swipe gestures for map interaction
- Optimized chart tooltips for touch

## Building for Production

### Backend
```bash
cd backend
npm install --production
npm start
```

### Frontend
```bash
cd frontend
npm run build
```

The built files will be in the `frontend/dist` directory.

## Deployment

### Backend Deployment
The backend can be deployed to any Node.js hosting service:
- Heroku
- Railway
- Render
- AWS EC2
- DigitalOcean

### Frontend Deployment
The frontend can be deployed to any static hosting service:
- Vercel
- Netlify
- GitHub Pages
- AWS S3 + CloudFront

**Note:** Update the API base URL in production builds to point to your deployed backend.

## Troubleshooting

### Backend won't start
- Check if port 3001 is already in use
- Ensure Node.js is installed correctly
- Check the console for error messages

### Frontend can't connect to backend
- Ensure the backend is running on port 3001
- Check CORS settings in `backend/server.js`
- Verify the API proxy configuration in `frontend/vite.config.js`

### Map not displaying
- Check browser console for Leaflet errors
- Ensure `react-leaflet` and `leaflet` are installed
- Verify CSS imports for Leaflet

### Charts not rendering
- Check if `recharts` is installed
- Verify data format matches chart expectations
- Check browser console for errors

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

ISC

## Acknowledgments

- [OpenStreetMap](https://www.openstreetmap.org/) for map tiles
- [Leaflet](https://leafletjs.com/) for map library
- [Recharts](https://recharts.org/) for charting
- [Shadcn UI](https://ui.shadcn.com/) for component library
- [Lucide](https://lucide.dev/) for icons

## Contact

For questions or support, please open an issue on the repository.

---

**Built with ❤️ for skiers everywhere**