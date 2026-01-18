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

/**
 * Calculate advanced performance metrics for ski trip analysis
 * @param {Array} gpsPoints - Array of GPS points
 * @returns {Object} Advanced performance metrics
 */
export function calculatePerformanceMetrics(gpsPoints) {
  if (!gpsPoints || gpsPoints.length < 2) {
    return {
      speedConsistency: 0,
      accelerationZones: [],
      decelerationZones: [],
      skiingTime: 0,
      liftTime: 0,
      stoppedTime: 0,
      speedZones: {
        stationary: 0,
        slow: 0,
        moderate: 0,
        fast: 0,
        veryFast: 0
      }
    };
  }

  // Calculate speed statistics
  const speeds = gpsPoints.map(p => p.speed);
  const avgSpeed = speeds.reduce((sum, speed) => sum + speed, 0) / speeds.length;
  const speedVariance = speeds.reduce((sum, speed) => sum + Math.pow(speed - avgSpeed, 2), 0) / speeds.length;
  const speedConsistency = Math.sqrt(speedVariance); // Standard deviation

  // Find acceleration and deceleration zones
  const accelerationZones = [];
  const decelerationZones = [];
  const accelerationThreshold = 1.0; // m/s²
  const minZoneDuration = 3; // Minimum points to consider a zone

  for (let i = 1; i < gpsPoints.length - 1; i++) {
    const prevPoint = gpsPoints[i - 1];
    const currPoint = gpsPoints[i];
    const nextPoint = gpsPoints[i + 1];
    
    const timeDiff1 = (currPoint.timestamp - prevPoint.timestamp) / 1000;
    const timeDiff2 = (nextPoint.timestamp - currPoint.timestamp) / 1000;
    
    if (timeDiff1 > 0 && timeDiff2 > 0) {
      const accel1 = (currPoint.speed - prevPoint.speed) / timeDiff1;
      const accel2 = (nextPoint.speed - currPoint.speed) / timeDiff2;
      const avgAccel = (accel1 + accel2) / 2;
      
      if (avgAccel > accelerationThreshold) {
        // Check if we're continuing an existing acceleration zone
        if (accelerationZones.length > 0 &&
            accelerationZones[accelerationZones.length - 1].endIndex === i - 1) {
          accelerationZones[accelerationZones.length - 1].endIndex = i;
          accelerationZones[accelerationZones.length - 1].maxAcceleration =
            Math.max(accelerationZones[accelerationZones.length - 1].maxAcceleration, avgAccel);
        } else {
          accelerationZones.push({
            startIndex: i - 1,
            endIndex: i,
            maxAcceleration: avgAccel,
            startSpeed: prevPoint.speed,
            endSpeed: nextPoint.speed
          });
        }
      } else if (avgAccel < -accelerationThreshold) {
        // Check if we're continuing an existing deceleration zone
        if (decelerationZones.length > 0 &&
            decelerationZones[decelerationZones.length - 1].endIndex === i - 1) {
          decelerationZones[decelerationZones.length - 1].endIndex = i;
          decelerationZones[decelerationZones.length - 1].maxDeceleration =
            Math.min(decelerationZones[decelerationZones.length - 1].maxDeceleration, avgAccel);
        } else {
          decelerationZones.push({
            startIndex: i - 1,
            endIndex: i,
            maxDeceleration: avgAccel,
            startSpeed: prevPoint.speed,
            endSpeed: nextPoint.speed
          });
        }
      }
    }
  }

  // Filter zones by minimum duration
  const filteredAccelZones = accelerationZones.filter(zone =>
    (zone.endIndex - zone.startIndex + 1) >= minZoneDuration
  );
  const filteredDecelZones = decelerationZones.filter(zone =>
    (zone.endIndex - zone.startIndex + 1) >= minZoneDuration
  );

  // Calculate time spent in different activities
  let skiingTime = 0;
  let liftTime = 0;
  let stoppedTime = 0;
  
  // Speed thresholds (m/s)
  const stoppedThreshold = 0.5;
  const liftThreshold = 2.0;
  
  for (let i = 1; i < gpsPoints.length; i++) {
    const timeDiff = (gpsPoints[i].timestamp - gpsPoints[i-1].timestamp) / 1000;
    const avgSpeed = (gpsPoints[i].speed + gpsPoints[i-1].speed) / 2;
    
    if (avgSpeed < stoppedThreshold) {
      stoppedTime += timeDiff;
    } else if (avgSpeed < liftThreshold) {
      // This could be either slow skiing or lift - determine by altitude change
      const altitudeChange = gpsPoints[i].altitude - gpsPoints[i-1].altitude;
      if (altitudeChange > 0) {
        liftTime += timeDiff;
      } else {
        skiingTime += timeDiff;
      }
    } else {
      skiingTime += timeDiff;
    }
  }

  // Calculate time spent in different speed zones
  const speedZones = {
    stationary: 0,    // < 0.5 m/s
    slow: 0,          // 0.5 - 2.0 m/s
    moderate: 0,      // 2.0 - 5.0 m/s
    fast: 0,          // 5.0 - 10.0 m/s
    veryFast: 0       // > 10.0 m/s
  };

  for (let i = 1; i < gpsPoints.length; i++) {
    const timeDiff = (gpsPoints[i].timestamp - gpsPoints[i-1].timestamp) / 1000;
    const avgSpeed = (gpsPoints[i].speed + gpsPoints[i-1].speed) / 2;
    
    if (avgSpeed < 0.5) {
      speedZones.stationary += timeDiff;
    } else if (avgSpeed < 2.0) {
      speedZones.slow += timeDiff;
    } else if (avgSpeed < 5.0) {
      speedZones.moderate += timeDiff;
    } else if (avgSpeed < 10.0) {
      speedZones.fast += timeDiff;
    } else {
      speedZones.veryFast += timeDiff;
    }
  }

  return {
    speedConsistency,
    accelerationZones: filteredAccelZones,
    decelerationZones: filteredDecelZones,
    skiingTime,
    liftTime,
    stoppedTime,
    speedZones
  };
}

/**
 * Calculate slope analysis metrics
 * @param {Array} gpsPoints - Array of GPS points
 * @returns {Object} Slope analysis metrics
 */
export function calculateSlopeAnalysis(gpsPoints) {
  if (!gpsPoints || gpsPoints.length < 2) {
    return {
      steepestSections: [],
      averageGradient: 0,
      slopeDifficulty: {
        green: 0,    // < 15%
        blue: 0,     // 15-25%
        red: 0,      // 25-40%
        black: 0     // > 40%
      },
      totalRuns: 0,
      longestRun: 0
    };
  }

  // Calculate gradient for each segment
  const segments = [];
  let totalGradient = 0;
  let totalDistance = 0;

  for (let i = 1; i < gpsPoints.length; i++) {
    const prevPoint = gpsPoints[i - 1];
    const currPoint = gpsPoints[i];
    
    const distance = calculateDistance(prevPoint.lat, prevPoint.lng, currPoint.lat, currPoint.lng);
    const altitudeChange = prevPoint.altitude - currPoint.altitude; // Positive for descent
    
    if (distance > 0) {
      const gradient = (altitudeChange / distance) * 100; // Percentage
      segments.push({
        startIndex: i - 1,
        endIndex: i,
        gradient: Math.abs(gradient),
        isDescent: altitudeChange > 0,
        distance: distance,
        altitudeChange: altitudeChange
      });
      
      totalGradient += Math.abs(gradient) * distance;
      totalDistance += distance;
    }
  }

  // Calculate average gradient
  const averageGradient = totalDistance > 0 ? totalGradient / totalDistance : 0;

  // Find steepest sections (top 5)
  const steepestSections = segments
    .filter(seg => seg.isDescent) // Only consider descents
    .sort((a, b) => b.gradient - a.gradient)
    .slice(0, 5);

  // Categorize slopes by difficulty
  const slopeDifficulty = {
    green: 0,    // < 15%
    blue: 0,     // 15-25%
    red: 0,      // 25-40%
    black: 0     // > 40%
  };

  segments.forEach(seg => {
    if (seg.isDescent) {
      if (seg.gradient < 15) {
        slopeDifficulty.green += seg.distance;
      } else if (seg.gradient < 25) {
        slopeDifficulty.blue += seg.distance;
      } else if (seg.gradient < 40) {
        slopeDifficulty.red += seg.distance;
      } else {
        slopeDifficulty.black += seg.distance;
      }
    }
  });

  // Identify runs (continuous descents)
  const runs = [];
  let currentRun = null;

  for (let i = 0; i < segments.length; i++) {
    const seg = segments[i];
    
    if (seg.isDescent) {
      if (!currentRun) {
        currentRun = {
          startIndex: seg.startIndex,
          endIndex: seg.endIndex,
          distance: seg.distance,
          altitudeDrop: Math.abs(seg.altitudeChange)
        };
      } else {
        // Continue current run
        currentRun.endIndex = seg.endIndex;
        currentRun.distance += seg.distance;
        currentRun.altitudeDrop += Math.abs(seg.altitudeChange);
      }
    } else {
      // End current run if it exists
      if (currentRun) {
        runs.push(currentRun);
        currentRun = null;
      }
    }
  }

  // Add the last run if the trip ends with a descent
  if (currentRun) {
    runs.push(currentRun);
  }

  const totalRuns = runs.length;
  const longestRun = runs.length > 0 ? Math.max(...runs.map(run => run.distance)) : 0;

  return {
    steepestSections,
    averageGradient,
    slopeDifficulty,
    totalRuns,
    longestRun
  };
}

/**
 * Calculate altitude analysis metrics
 * @param {Array} gpsPoints - Array of GPS points
 * @returns {Object} Altitude analysis metrics
 */
export function calculateAltitudeAnalysis(gpsPoints) {
  if (!gpsPoints || gpsPoints.length < 2) {
    return {
      elevationZones: {},
      ascentTime: 0,
      descentTime: 0,
      maxAscentRate: 0,
      maxDescentRate: 0
    };
  }

  // Define elevation zones (relative to min/max altitude)
  const minAltitude = Math.min(...gpsPoints.map(p => p.altitude));
  const maxAltitude = Math.max(...gpsPoints.map(p => p.altitude));
  const altitudeRange = maxAltitude - minAltitude;
  
  const elevationZones = {
    bottom: 0,    // 0-25%
    lower: 0,     // 25-50%
    upper: 0,     // 50-75%
    top: 0        // 75-100%
  };

  let ascentTime = 0;
  let descentTime = 0;
  let maxAscentRate = 0;
  let maxDescentRate = 0;

  for (let i = 1; i < gpsPoints.length; i++) {
    const prevPoint = gpsPoints[i - 1];
    const currPoint = gpsPoints[i];
    
    const timeDiff = (currPoint.timestamp - prevPoint.timestamp) / 1000;
    const altitudeChange = currPoint.altitude - prevPoint.altitude;
    
    if (timeDiff > 0) {
      const altitudeRate = altitudeChange / timeDiff; // m/s
      
      if (altitudeChange > 0) {
        ascentTime += timeDiff;
        maxAscentRate = Math.max(maxAscentRate, altitudeRate);
      } else {
        descentTime += timeDiff;
        maxDescentRate = Math.max(maxDescentRate, Math.abs(altitudeRate));
      }
    }
    
    // Calculate time spent in elevation zones
    const relativeAltitude = (currPoint.altitude - minAltitude) / altitudeRange;
    if (relativeAltitude < 0.25) {
      elevationZones.bottom += timeDiff;
    } else if (relativeAltitude < 0.5) {
      elevationZones.lower += timeDiff;
    } else if (relativeAltitude < 0.75) {
      elevationZones.upper += timeDiff;
    } else {
      elevationZones.top += timeDiff;
    }
  }

  return {
    elevationZones,
    ascentTime,
    descentTime,
    maxAscentRate,
    maxDescentRate
  };
}