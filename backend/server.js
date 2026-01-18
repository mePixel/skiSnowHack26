const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');

const app = express();

// Environment Configuration
const PORT = process.env.PORT || 3001;
const NODE_ENV = process.env.NODE_ENV || 'development';
const JSON_DATA_PATH = process.env.JSON_DATA_PATH || './JSON';
const CORS_ORIGIN = process.env.CORS_ORIGIN || '*';
const API_PREFIX = process.env.API_PREFIX || '/api';
const LOG_LEVEL = process.env.LOG_LEVEL || 'info';

// Middleware
app.use(cors({
  origin: CORS_ORIGIN
}));
app.use(express.json());

// Helper function to get JSON directory path
const getJsonDir = () => path.join(__dirname, JSON_DATA_PATH);

// Helper function to get slopes data file path
const getSlopesFilePath = () => path.join(__dirname, 'data', 'slopes.json');

// Helper function to calculate traffic light status based on occupancy
const calculateTrafficLightStatus = (occupancy) => {
  if (occupancy < 30) return 'green';
  if (occupancy <= 70) return 'yellow';
  return 'red';
};

// GET /api/trips - List all available trips
app.get(`${API_PREFIX}/trips`, (req, res) => {
  try {
    const jsonDir = getJsonDir();
    
    // Check if JSON directory exists
    if (!fs.existsSync(jsonDir)) {
      return res.status(404).json({ error: 'JSON directory not found' });
    }

    const files = fs.readdirSync(jsonDir)
      .filter(f => f.endsWith('.json'))
      .map(f => {
        const id = f.replace('.json', '');
        const dateMatch = id.match(/trip_(\d{8})_(\d{6})/);
        let date = 'Unknown';
        
        if (dateMatch) {
          const year = dateMatch[1].substring(0, 4);
          const month = dateMatch[1].substring(4, 6);
          const day = dateMatch[1].substring(6, 8);
          const hour = dateMatch[2].substring(0, 2);
          const minute = dateMatch[2].substring(2, 4);
          date = `${year}-${month}-${day} ${hour}:${minute}`;
        }
        
        return {
          id,
          filename: f,
          date
        };
      })
      .sort((a, b) => b.id.localeCompare(a.id)); // Sort by newest first

    res.json(files);
  } catch (error) {
    console.error('Error listing trips:', error);
    res.status(500).json({ error: 'Failed to list trips' });
  }
});

// GET /api/trips/:id - Get detailed data for a specific trip
app.get(`${API_PREFIX}/trips/:id`, (req, res) => {
  try {
    const { id } = req.params;
    const filePath = path.join(getJsonDir(), `${id}.json`);
    
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'Trip not found' });
    }

    const fileContent = fs.readFileSync(filePath, 'utf8');


      console.log("1")
    // Check if file is empty
    if (!fileContent || fileContent.trim() === '') {
        console.log("1.1")
      console.error(`Trip file is empty: ${id}`);
      return res.status(400).json({ error: 'Trip data file is empty', id });
    }
      console.log("2")

    const data = JSON.parse(fileContent);

      console.log("3")

    // Add metadata
    const response = {
      id,
      data,
      metadata: {
        totalEntries: Object.keys(data).length,
        hasGPS: Object.values(data).some(entry => entry.gps)
      }
    };


      console.log("4")
    
    res.json(response);
  } catch (error) {
    console.error('Error fetching trip:', error);
    if (error instanceof SyntaxError) {
      return res.status(400).json({ error: 'Invalid JSON format in trip data file' });
    }
    res.status(500).json({ error: 'Failed to fetch trip data' });
  }
});

// DELETE /api/trips/:id - Delete a specific trip
app.delete(`${API_PREFIX}/trips/:id`, (req, res) => {
  try {
    const { id } = req.params;
    const filePath = path.join(getJsonDir(), `${id}.json`);
    
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'Trip not found' });
    }

    // Delete the file
    fs.unlinkSync(filePath);
    
    res.json({
      message: 'Trip deleted successfully',
      id
    });
  } catch (error) {
    console.error('Error deleting trip:', error);
    res.status(500).json({ error: 'Failed to delete trip' });
  }
});

// GET /api/slopes - List all slopes with occupancy ratings
app.get(`${API_PREFIX}/slopes`, (req, res) => {
  try {
    const slopesFilePath = getSlopesFilePath();
    
    if (!fs.existsSync(slopesFilePath)) {
      return res.status(404).json({ error: 'Slopes data file not found' });
    }

    const fileContent = fs.readFileSync(slopesFilePath, 'utf8');
    const data = JSON.parse(fileContent);
    
    res.json(data);
  } catch (error) {
    console.error('Error fetching slopes:', error);
    res.status(500).json({ error: 'Failed to fetch slopes data' });
  }
});

// GET /api/slopes/:id - Get specific slope details
app.get(`${API_PREFIX}/slopes/:id`, (req, res) => {
  try {
    const { id } = req.params;
    const slopesFilePath = getSlopesFilePath();
    
    if (!fs.existsSync(slopesFilePath)) {
      return res.status(404).json({ error: 'Slopes data file not found' });
    }

    const fileContent = fs.readFileSync(slopesFilePath, 'utf8');
    const data = JSON.parse(fileContent);
    
    const slope = data.slopes.find(s => s.id === id);
    
    if (!slope) {
      return res.status(404).json({ error: 'Slope not found' });
    }
    
    res.json(slope);
  } catch (error) {
    console.error('Error fetching slope:', error);
    res.status(500).json({ error: 'Failed to fetch slope data' });
  }
});

// PUT /api/slopes/:id - Update slope occupancy (admin endpoint)
app.put(`${API_PREFIX}/slopes/:id`, (req, res) => {
  try {
    const { id } = req.params;
    const { occupancy } = req.body;
    
    if (typeof occupancy !== 'number' || occupancy < 0 || occupancy > 100) {
      return res.status(400).json({ error: 'Occupancy must be a number between 0 and 100' });
    }
    
    const slopesFilePath = getSlopesFilePath();
    
    if (!fs.existsSync(slopesFilePath)) {
      return res.status(404).json({ error: 'Slopes data file not found' });
    }

    const fileContent = fs.readFileSync(slopesFilePath, 'utf8');
    const data = JSON.parse(fileContent);
    
    const slopeIndex = data.slopes.findIndex(s => s.id === id);
    
    if (slopeIndex === -1) {
      return res.status(404).json({ error: 'Slope not found' });
    }
    
    // Update occupancy and status
    data.slopes[slopeIndex].occupancy = occupancy;
    data.slopes[slopeIndex].status = calculateTrafficLightStatus(occupancy);
    data.slopes[slopeIndex].lastUpdated = new Date().toISOString();
    
    // Write updated data back to file
    fs.writeFileSync(slopesFilePath, JSON.stringify(data, null, 2));
    
    res.json({
      message: 'Slope occupancy updated successfully',
      slope: data.slopes[slopeIndex]
    });
  } catch (error) {
    console.error('Error updating slope:', error);
    res.status(500).json({ error: 'Failed to update slope data' });
  }
});

// POST /api/slopes - Create new slope entry (admin endpoint)
app.post(`${API_PREFIX}/slopes`, (req, res) => {
  try {
    const { name, difficulty, length, elevation, occupancy } = req.body;
    
    // Validate required fields
    if (!name || !difficulty || !length || !elevation || occupancy === undefined) {
      return res.status(400).json({
        error: 'Missing required fields: name, difficulty, length, elevation, occupancy'
      });
    }
    
    // Validate difficulty
    const validDifficulties = ['green', 'blue', 'red', 'black'];
    if (!validDifficulties.includes(difficulty)) {
      return res.status(400).json({
        error: 'Invalid difficulty. Must be one of: green, blue, red, black'
      });
    }
    
    // Validate occupancy
    if (typeof occupancy !== 'number' || occupancy < 0 || occupancy > 100) {
      return res.status(400).json({ error: 'Occupancy must be a number between 0 and 100' });
    }
    
    const slopesFilePath = getSlopesFilePath();
    
    // Create file if it doesn't exist
    if (!fs.existsSync(slopesFilePath)) {
      const initialData = { slopes: [] };
      fs.writeFileSync(slopesFilePath, JSON.stringify(initialData, null, 2));
    }
    
    const fileContent = fs.readFileSync(slopesFilePath, 'utf8');
    const data = JSON.parse(fileContent);
    
    // Generate new ID
    const newId = `slope_${String(data.slopes.length + 1).padStart(3, '0')}`;
    
    // Create new slope object
    const newSlope = {
      id: newId,
      name,
      difficulty,
      length,
      elevation,
      occupancy,
      status: calculateTrafficLightStatus(occupancy),
      lastUpdated: new Date().toISOString()
    };
    
    data.slopes.push(newSlope);
    
    // Write updated data back to file
    fs.writeFileSync(slopesFilePath, JSON.stringify(data, null, 2));
    
    res.status(201).json({
      message: 'Slope created successfully',
      slope: newSlope
    });
  } catch (error) {
    console.error('Error creating slope:', error);
    res.status(500).json({ error: 'Failed to create slope' });
  }
});

// GET /api/slopes/summary - Get occupancy statistics
app.get(`${API_PREFIX}/slopes/summary`, (req, res) => {
  try {
    const slopesFilePath = getSlopesFilePath();
    
    if (!fs.existsSync(slopesFilePath)) {
      return res.status(404).json({ error: 'Slopes data file not found' });
    }

    const fileContent = fs.readFileSync(slopesFilePath, 'utf8');
    const data = JSON.parse(fileContent);
    
    const summary = {
      total: data.slopes.length,
      green: data.slopes.filter(s => s.status === 'green').length,
      yellow: data.slopes.filter(s => s.status === 'yellow').length,
      red: data.slopes.filter(s => s.status === 'red').length,
      averageOccupancy: data.slopes.length > 0
        ? Math.round(data.slopes.reduce((sum, s) => sum + s.occupancy, 0) / data.slopes.length)
        : 0
    };
    
    res.json(summary);
  } catch (error) {
    console.error('Error fetching slopes summary:', error);
    res.status(500).json({ error: 'Failed to fetch slopes summary' });
  }
});

// Health check endpoint
app.get(`${API_PREFIX}/health`, (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: NODE_ENV
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// Start server
app.listen(PORT, () => {
  console.log(`🎿 Ski Resort Backend API running on port ${PORT}`);
  console.log(`🌍 Environment: ${NODE_ENV}`);
  console.log(`📍 API endpoints:`);
  console.log(`   GET    http://localhost:${PORT}${API_PREFIX}/trips`);
  console.log(`   GET    http://localhost:${PORT}${API_PREFIX}/trips/:id`);
  console.log(`   DELETE http://localhost:${PORT}${API_PREFIX}/trips/:id`);
  console.log(`   GET    http://localhost:${PORT}${API_PREFIX}/slopes`);
  console.log(`   GET    http://localhost:${PORT}${API_PREFIX}/slopes/:id`);
  console.log(`   PUT    http://localhost:${PORT}${API_PREFIX}/slopes/:id`);
  console.log(`   POST   http://localhost:${PORT}${API_PREFIX}/slopes`);
  console.log(`   GET    http://localhost:${PORT}${API_PREFIX}/slopes/summary`);
  console.log(`   GET    http://localhost:${PORT}${API_PREFIX}/health`);
  console.log(`📁 JSON Data Path: ${path.join(__dirname, JSON_DATA_PATH)}`);
  console.log(`🔒 CORS Origin: ${CORS_ORIGIN}`);
});