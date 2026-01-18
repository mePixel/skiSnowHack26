# Ski Slope Occupancy Feature - Implementation Plan

## Overview
Implement a real-time slope occupancy rating system using a traffic light method (Green/Yellow/Red) to display how busy each ski slope is.

## Architecture

### Backend Implementation

#### 1. Data Structure
Create a JSON file to store slope occupancy data:

```json
{
  "slopes": [
    {
      "id": "slope_001",
      "name": "Kitzsteinhorn Gipfel",
      "difficulty": "black",
      "length": 3500,
      "elevation": 3020,
      "occupancy": 25,
      "lastUpdated": "2026-01-18T09:00:00Z",
      "status": "green"
    },
    {
      "id": "slope_002",
      "name": "Möslalm Abfahrt",
      "difficulty": "red",
      "length": 2800,
      "elevation": 2450,
      "occupancy": 65,
      "lastUpdated": "2026-01-18T09:00:00Z",
      "status": "yellow"
    }
  ]
}
```

#### 2. Traffic Light Logic
- **Green**: Occupancy < 30% - Low traffic, ideal conditions
- **Yellow**: Occupancy 30-70% - Moderate traffic, acceptable conditions
- **Red**: Occupancy > 70% - High traffic, crowded conditions

#### 3. API Routes

**GET /api/slopes**
- Returns all slopes with current occupancy ratings
- Response: Array of slope objects

**GET /api/slopes/:id**
- Returns specific slope details
- Response: Single slope object

**PUT /api/slopes/:id**
- Updates slope occupancy (admin endpoint)
- Body: `{ "occupancy": 45 }`
- Automatically updates status based on traffic light logic

**POST /api/slopes**
- Creates new slope entry (admin endpoint)
- Body: Full slope object without id and status

**GET /api/slopes/summary**
- Returns summary statistics
- Response: `{ total: 20, green: 8, yellow: 7, red: 5 }`

### Frontend Implementation

#### 1. SkiPass Component Enhancements

Add a new section to display slope occupancy:

```jsx
{/* Slope Occupancy Section */}
<Card className="bg-gradient-to-br from-slate-50 to-sky-50 border-slate-200">
  <CardHeader>
    <CardTitle className="flex items-center gap-2">
      <Activity className="h-5 w-5 text-sky-600" />
      Slope Occupancy
    </CardTitle>
  </CardHeader>
  <CardContent>
    {/* Traffic Light Legend */}
    <div className="flex gap-4 mb-4 text-sm">
      <div className="flex items-center gap-2">
        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
        <span>Low (<30%)</span>
      </div>
      <div className="flex items-center gap-2">
        <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
        <span>Moderate (30-70%)</span>
      </div>
      <div className="flex items-center gap-2">
        <div className="w-3 h-3 bg-red-500 rounded-full"></div>
        <span>High (>70%)</span>
      </div>
    </div>

    {/* Difficulty Filter */}
    <div className="flex gap-2 mb-4">
      <button
        onClick={() => setFilter('all')}
        className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
          filter === 'all'
            ? 'bg-sky-600 text-white'
            : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
        }`}
      >
        All
      </button>
      <button
        onClick={() => setFilter('green')}
        className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
          filter === 'green'
            ? 'bg-green-600 text-white'
            : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
        }`}
      >
        Green
      </button>
      <button
        onClick={() => setFilter('blue')}
        className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
          filter === 'blue'
            ? 'bg-blue-600 text-white'
            : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
        }`}
      >
        Blue
      </button>
      <button
        onClick={() => setFilter('red')}
        className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
          filter === 'red'
            ? 'bg-red-600 text-white'
            : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
        }`}
      >
        Red
      </button>
      <button
        onClick={() => setFilter('black')}
        className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
          filter === 'black'
            ? 'bg-slate-800 text-white'
            : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
        }`}
      >
        Black
      </button>
    </div>

    {/* Slope List */}
    <div className="space-y-3">
      {slopes
        .filter(slope => filter === 'all' || slope.difficulty === filter)
        .map(slope => (
        <div key={slope.id} className="flex items-center justify-between p-3 bg-white rounded-lg shadow-sm">
          <div className="flex items-center gap-3">
            {/* Traffic Light Indicator */}
            <div className={`w-4 h-4 rounded-full ${
              slope.status === 'green' ? 'bg-green-500' :
              slope.status === 'yellow' ? 'bg-yellow-500' :
              'bg-red-500'
            }`}></div>
            
            <div>
              <p className="font-medium text-slate-900">{slope.name}</p>
              <p className="text-xs text-slate-600">
                {slope.difficulty} • {formatDistance(slope.length)}
              </p>
            </div>
          </div>
          
          <div className="text-right">
            <p className="font-bold text-slate-900">{slope.occupancy}%</p>
            <p className="text-xs text-slate-600">
              {getWaitTime(slope.occupancy)}
            </p>
          </div>
        </div>
      ))}
    </div>

    {/* Refresh Button */}
    <button
      onClick={refreshSlopes}
      className="w-full mt-4 flex items-center justify-center gap-2 px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-lg font-medium transition-colors"
    >
      <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
      Refresh Occupancy
    </button>
  </CardContent>
</Card>
```

#### 2. Helper Functions

```javascript
// Calculate estimated wait time based on occupancy
const getWaitTime = (occupancy) => {
  if (occupancy < 30) return 'No wait';
  if (occupancy < 50) return '~5 min';
  if (occupancy < 70) return '~10 min';
  return '15+ min';
};

// Format distance for display
const formatDistance = (meters) => {
  if (meters >= 1000) {
    return `${(meters / 1000).toFixed(1)} km`;
  }
  return `${meters} m`;
};
```

#### 3. State Management

```javascript
const [slopes, setSlopes] = useState([]);
const [loading, setLoading] = useState(false);
const [lastUpdated, setLastUpdated] = useState(null);
const [filter, setFilter] = useState('all'); // 'all', 'green', 'blue', 'red', 'black'

// Fetch slopes on component mount
useEffect(() => {
  fetchSlopes();
}, []);

// Refresh slopes data
const fetchSlopes = async () => {
  try {
    setLoading(true);
    const response = await fetch(`${API_BASE_URL}/api/slopes`);
    const data = await response.json();
    setSlopes(data.slopes);
    setLastUpdated(new Date());
  } catch (error) {
    console.error('Error fetching slopes:', error);
  } finally {
    setLoading(false);
  }
};
```

### Implementation Steps

#### Phase 1: Backend Setup
1. Create `backend/data/slopes.json` with initial slope data
2. Add API routes to `backend/server.js`
3. Implement traffic light logic helper function
4. Test API endpoints with curl/Postman

#### Phase 2: Frontend Integration
1. Add state management to SkiPass component
2. Implement fetchSlopes function
3. Create slope occupancy UI section
4. Add traffic light indicators and badges
5. Implement refresh functionality
6. Add loading states and error handling

#### Phase 3: Testing & Refinement
1. Test with various occupancy levels
2. Verify traffic light logic
3. Test refresh functionality
4. Check responsive design
5. Verify error handling

### Data Model Details

#### Slope Object Properties
- `id`: Unique identifier (string)
- `name`: Slope name (string)
- `difficulty`: green/blue/red/black (string)
- `length`: Length in meters (number)
- `elevation`: Elevation in meters (number)
- `occupancy`: Current occupancy percentage (0-100)
- `lastUpdated`: ISO timestamp of last update
- `status`: Auto-calculated (green/yellow/red)

### UI/UX Considerations

1. **Visual Hierarchy**: Traffic light indicators should be prominent
2. **Color Coding**: Use consistent colors (green/yellow/red) throughout
3. **Information Density**: Balance between detail and readability
4. **Refresh Rate**: Consider auto-refresh every 5-10 minutes
5. **Mobile Friendly**: Ensure good touch targets and readable text
6. **Accessibility**: Use ARIA labels for color indicators

### Future Enhancements

1. Historical occupancy data
2. Predictive occupancy based on time of day
3. User-reported occupancy
4. Push notifications for slope status changes
5. Integration with lift queue times
6. Weather condition overlays
7. Slope closure status
8. Advanced filtering (by elevation, length, occupancy range)
9. Sort slopes by various criteria (name, difficulty, occupancy)
10. Favorite slopes for quick access

### Environment Variables

Add to `.env`:
```
VITE_SLOPES_REFRESH_INTERVAL=300000  # 5 minutes in milliseconds
```

### Testing Checklist

- [ ] API returns correct slope data
- [ ] Traffic light logic works correctly
- [ ] UI displays slopes with correct colors
- [ ] Refresh button updates data
- [ ] Loading states display properly
- [ ] Error handling works
- [ ] Responsive design tested
- [ ] Accessibility verified