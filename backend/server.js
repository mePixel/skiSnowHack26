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
    
    // Check if file is empty
    if (!fileContent || fileContent.trim() === '') {
      console.error(`Trip file is empty: ${id}`);
      return res.status(400).json({ error: 'Trip data file is empty', id });
    }

    const data = JSON.parse(fileContent);
    
    // Add metadata
    const response = {
      id,
      data,
      metadata: {
        totalEntries: Object.keys(data).length,
        hasGPS: Object.values(data).some(entry => entry.gps)
      }
    };
    
    res.json(response);
  } catch (error) {
    console.error('Error fetching trip:', error);
    if (error instanceof SyntaxError) {
      return res.status(400).json({ error: 'Invalid JSON format in trip data file' });
    }
    res.status(500).json({ error: 'Failed to fetch trip data' });
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
  console.log(`   GET  http://localhost:${PORT}${API_PREFIX}/trips`);
  console.log(`   GET  http://localhost:${PORT}${API_PREFIX}/trips/:id`);
  console.log(`   GET  http://localhost:${PORT}${API_PREFIX}/health`);
  console.log(`📁 JSON Data Path: ${path.join(__dirname, JSON_DATA_PATH)}`);
  console.log(`🔒 CORS Origin: ${CORS_ORIGIN}`);
});