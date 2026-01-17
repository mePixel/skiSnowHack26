/**
 * Parse raw trip JSON data into structured format for visualization
 * @param {Object} rawData - Raw trip data with timestamps as keys
 * @returns {Object} Parsed data with GPS points, polyline, and metrics
 */

// Environment variables
const gpsAccuracyThreshold = parseInt(import.meta.env.VITE_GPS_ACCURACY_THRESHOLD) || 50;

export function parseTripData(rawData) {
  if (!rawData || typeof rawData !== 'object') {
    return {
      gpsPoints: [],
      polyline: [],
      metrics: {
        totalDistance: 0,
        maxSpeed: 0,
        verticalDrop: 0,
        duration: 0,
        maxAltitude: 0,
        minAltitude: 0
      },
      maxSpeedPoint: null,
      startPoint: null,
      endPoint: null
    };
  }

  const entries = Object.entries(rawData);

    console.log("2")

  // Extract GPS points with valid data and filter by accuracy
  const gpsPoints = entries
    .filter(([_, data]) => {
        console.log("Filtering data point:", data)
        console.log(!data.gps)
      // Check if GPS data exists and has required fields
      if (!data.gps) return false;
      if (typeof data.gps.latitude !== 'number' || typeof data.gps.longitude !== 'number') return false;
      if (typeof data.gps.altitude !== 'number' || typeof data.gps.speed !== 'number') return false;
      
      // Filter out points with poor accuracy (based on environment variable)
      const accuracy = data.gps.horizontalAccuracy;
      if (typeof accuracy === 'number' && accuracy > gpsAccuracyThreshold) return false;
      
      return true;
    })
    .map(([timestamp, data]) => ({
      timestamp: parseInt(timestamp),
      lat: data.gps.latitude,
      lng: data.gps.longitude,
      altitude: data.gps.altitude,
      speed: data.gps.speed,
      accuracy: data.gps.horizontalAccuracy || 0,
      course: data.gps.course || 0
    }))
    .sort((a, b) => a.timestamp - b.timestamp);


    console.log("3")

    console.log(gpsPoints)
  // If no valid GPS points, return empty data
  if (gpsPoints.length === 0) {
    return {
      gpsPoints: [],
      polyline: [],
      metrics: {
        totalDistance: 0,
        maxSpeed: 0,
        verticalDrop: 0,
        duration: 0,
        maxAltitude: 0,
        minAltitude: 0
      },
      maxSpeedPoint: null,
      startPoint: null,
      endPoint: null
    };
  }
    console.log("4")

  // Extract arrays for calculations
  const speeds = gpsPoints.map(p => p.speed);
  const altitudes = gpsPoints.map(p => p.altitude);
    console.log("5")
  
  // Calculate basic metrics
  const maxSpeed = Math.max(...speeds);
  const maxAltitude = Math.max(...altitudes);
  const minAltitude = Math.min(...altitudes);
  const verticalDrop = maxAltitude - minAltitude;

    console.log("6")

  // Calculate total distance using Haversine formula
  let totalDistance = 0;
  for (let i = 1; i < gpsPoints.length; i++) {
    totalDistance += calculateDistance(
      gpsPoints[i-1].lat, 
      gpsPoints[i-1].lng,
      gpsPoints[i].lat, 
      gpsPoints[i].lng
    );
  }


    console.log("7")

  // Calculate duration in seconds
  const duration = (gpsPoints[gpsPoints.length - 1].timestamp - gpsPoints[0].timestamp) / 1000;

    console.log("8")
  // Find max speed point
  const maxSpeedPoint = gpsPoints.reduce((max, point) => 
    point.speed > max.speed ? point : max, gpsPoints[0]);

    console.log("9")
  // Create polyline for map (array of [lat, lng] arrays)
  const polyline = gpsPoints.map(p => [p.lat, p.lng]);

    console.log("10")

  return {
    gpsPoints,
    polyline,
    metrics: {
      totalDistance,
      maxSpeed,
      verticalDrop,
      duration,
      maxAltitude,
      minAltitude
    },
    maxSpeedPoint,
    startPoint: gpsPoints[0],
    endPoint: gpsPoints[gpsPoints.length - 1]
  };
}

/**
 * Calculate distance between two points using Haversine formula
 * @param {number} lat1 - Latitude of first point
 * @param {number} lon1 - Longitude of first point
 * @param {number} lat2 - Latitude of second point
 * @param {number} lon2 - Longitude of second point
 * @returns {number} Distance in meters
 */
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth's radius in km
  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);
  
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) *
    Math.sin(dLon/2) * Math.sin(dLon/2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  
  return R * c * 1000; // Distance in meters
}

/**
 * Convert degrees to radians
 * @param {number} degrees - Angle in degrees
 * @returns {number} Angle in radians
 */
function toRadians(degrees) {
  return degrees * (Math.PI / 180);
}

/**
 * Format distance for display
 * @param {number} meters - Distance in meters
 * @returns {string} Formatted distance string
 */
export function formatDistance(meters) {
  if (meters < 1000) {
    return `${Math.round(meters)} m`;
  }
  return `${(meters / 1000).toFixed(2)} km`;
}

/**
 * Format speed for display
 * @param {number} mps - Speed in meters per second
 * @returns {string} Formatted speed string
 */
export function formatSpeed(mps) {
  const kmh = mps * 3.6;
  return `${kmh.toFixed(1)} km/h`;
}

/**
 * Format duration for display
 * @param {number} seconds - Duration in seconds
 * @returns {string} Formatted duration string
 */
export function formatDuration(seconds) {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  
  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  if (minutes > 0) {
    return `${minutes}m ${secs}s`;
  }
  return `${secs}s`;
}

/**
 * Format altitude for display
 * @param {number} meters - Altitude in meters
 * @returns {string} Formatted altitude string
 */
export function formatAltitude(meters) {
  return `${Math.round(meters)} m`;
}

/**
 * Format date for display
 * @param {number} timestamp - Unix timestamp in milliseconds
 * @returns {string} Formatted date string
 */
export function formatDate(timestamp) {
  const date = new Date(timestamp);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}