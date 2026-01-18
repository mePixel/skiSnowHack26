import { useState, useEffect } from 'react';
import QRCode from 'qrcode.react';
import { Card, CardHeader, CardTitle, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { Mountain, Clock, Activity, RefreshCw } from 'lucide-react';

// Environment variables for ski pass configuration
const skiPassData = {
  resortName: import.meta.env.VITE_RESORT_NAME || 'Alpine Paradise Resort',
  passType: import.meta.env.VITE_PASS_TYPE || 'Full Day Pass',
  passNumber: import.meta.env.VITE_PASS_NUMBER || 'SP-2024-78542',
  validFrom: import.meta.env.VITE_VALID_FROM || '2026-01-16',
  validUntil: import.meta.env.VITE_VALID_UNTIL || '2026-01-19',
  zones: ['All Zones', 'Lift Access', 'Night Skiing'],
  holderName: import.meta.env.VITE_HOLDER_NAME || 'John Doe',
  qrData: import.meta.env.VITE_QR_DATA || 'skisnow26.xaxa.at'
};

export default function SkiPass() {
  const [slopes, setSlopes] = useState([]);
  const [loadingSlopes, setLoadingSlopes] = useState(false);
  const [filter, setFilter] = useState('all'); // 'all', 'green', 'blue', 'red', 'black'
  const [lastUpdated, setLastUpdated] = useState(null);
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';

  // Fetch slopes data on component mount
  useEffect(() => {
    fetchSlopes();
  }, []);

  // Helper function to calculate estimated wait time based on occupancy
  const getWaitTime = (occupancy) => {
    if (occupancy < 30) return 'No wait';
    if (occupancy < 50) return '~5 min';
    if (occupancy < 70) return '~10 min';
    return '15+ min';
  };

  // Helper function to format distance for display
  const formatDistance = (meters) => {
    if (meters >= 1000) {
      return `${(meters / 1000).toFixed(1)} km`;
    }
    return `${meters} m`;
  };

  // Fetch slopes data from API
  const fetchSlopes = async () => {
    try {
      setLoadingSlopes(true);
      const response = await fetch(`${API_BASE_URL}/api/slopes`);
      const data = await response.json();
      setSlopes(data.slopes || []);
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Error fetching slopes:', error);
    } finally {
      setLoadingSlopes(false);
    }
  };

  const isValidToday = () => {
    const today = new Date().toISOString().split('T')[0];
    return today >= skiPassData.validFrom && today <= skiPassData.validUntil;
  };

  return (
    <div className="w-full max-w-6xl mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left Column - Ski Pass */}
        <div className="space-y-6">
          {/* Main Pass Card */}
      <Card className="overflow-hidden bg-gradient-to-br from-sky-500 via-sky-600 to-sky-700 text-white border-0 shadow-2xl">
        <CardHeader className="pb-4">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <CardTitle className="text-white text-2xl font-bold">
                {skiPassData.resortName}
              </CardTitle>
              <p className="text-sky-100 text-sm">{skiPassData.passType}</p>
            </div>
            <Badge 
              variant={isValidToday() ? "default" : "destructive"}
              className="bg-white/20 text-white border-white/30 hover:bg-white/30"
            >
              {isValidToday() ? 'Valid Today' : 'Expired'}
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Pass Details */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="space-y-1">
              <p className="text-sky-200 text-xs uppercase tracking-wider">Pass Number</p>
              <p className="font-mono font-semibold">{skiPassData.passNumber}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sky-200 text-xs uppercase tracking-wider">Holder</p>
              <p className="font-semibold">{skiPassData.holderName}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sky-200 text-xs uppercase tracking-wider">Valid From</p>
              <p className="font-semibold flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {skiPassData.validFrom}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-sky-200 text-xs uppercase tracking-wider">Valid Until</p>
              <p className="font-semibold flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {skiPassData.validUntil}
              </p>
            </div>
          </div>

          {/* Zones */}
          <div className="space-y-2">
            <p className="text-sky-200 text-xs uppercase tracking-wider">Access Zones</p>
            <div className="flex flex-wrap gap-2">
              {skiPassData.zones.map((zone, index) => (
                <Badge 
                  key={index}
                  variant="secondary"
                  className="bg-white/20 text-white border-white/30"
                >
                  {zone}
                </Badge>
              ))}
            </div>
          </div>

          {/* QR Code Section */}
          <div className="flex items-center justify-between pt-4 border-t border-white/20">
            <div className="space-y-1">
              <p className="text-sky-200 text-xs uppercase tracking-wider">Scan at Lift</p>
              <p className="text-xs text-sky-100">Show QR code to lift attendant</p>
            </div>
            <div className="relative">
              {/* Pulse animation ring */}
              {isValidToday() && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-32 h-32 rounded-full bg-white/20 pulse-ring" />
                </div>
              )}
              
              {/* QR Code */}
              <div className="relative bg-white p-3 rounded-lg shadow-lg">
                <QRCode
                  value={skiPassData.qrData}
                  size={100}
                  level="H"
                  includeMargin={false}
                  bgColor="#ffffff"
                  fgColor="#0ea5e9"
                />
              </div>

            </div>
          </div>
        </CardContent>
      </Card>

      {/* Resort Info Card */}
      <Card className="bg-slate-50 border-slate-200">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-sky-100 rounded-lg">
              <Mountain className="h-6 w-6 text-sky-600" />
            </div>
            <div className="flex-1 space-y-1">
              <h3 className="font-semibold text-slate-900">Resort Information</h3>
              <p className="text-sm text-slate-600">
                {skiPassData.resortName} offers world-class skiing across 50+ runs 
                with stunning alpine views. Open daily from 8:00 AM to 10:00 PM.
              </p>
              <div className="flex gap-4 text-xs text-slate-500">
                <span>📍 Austrian Alps</span>
                <span>🏔️ 2,622m Peak</span>
                <span>❄️ 120km Runs</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
        </div>

        {/* Right Column - Slope Occupancy */}
        <div className="space-y-6">
          {/* Slope Occupancy Section */}
          <Card className="bg-gradient-to-br from-slate-50 to-sky-50 border-slate-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-sky-600" />
            Slope Occupancy
            {lastUpdated && (
              <span className="text-xs font-normal text-slate-500 ml-auto">
                Updated {lastUpdated.toLocaleTimeString()}
              </span>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Traffic Light Legend */}
          <div className="flex flex-wrap gap-4 mb-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span>Low (under 30%)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
              <span>Moderate (30-70%)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              <span>High (over 70%)</span>
            </div>
          </div>

          {/* Difficulty Filter */}
          <div className="flex flex-wrap gap-2 mb-4">
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
                <div key={slope.id} className="flex items-center justify-between p-3 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow">
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
                        <Badge
                          variant="secondary"
                          className={`mr-2 ${
                            slope.difficulty === 'green' ? 'bg-green-100 text-green-800' :
                            slope.difficulty === 'blue' ? 'bg-blue-100 text-blue-800' :
                            slope.difficulty === 'red' ? 'bg-red-100 text-red-800' :
                            'bg-slate-800 text-white'
                          }`}
                        >
                          {slope.difficulty}
                        </Badge>
                        {formatDistance(slope.length)} • {slope.elevation}m
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
            
            {slopes.filter(slope => filter === 'all' || slope.difficulty === filter).length === 0 && (
              <div className="text-center py-8 text-slate-500">
                <Activity className="h-12 w-12 mx-auto mb-2 text-slate-300" />
                <p>No slopes found for this filter</p>
              </div>
            )}
          </div>

          {/* Refresh Button */}
          <button
            onClick={fetchSlopes}
            disabled={loadingSlopes}
            className="w-full mt-4 flex items-center justify-center gap-2 px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <RefreshCw className={`h-4 w-4 ${loadingSlopes ? 'animate-spin' : ''}`} />
            {loadingSlopes ? 'Updating...' : 'Refresh Occupancy'}
          </button>
        </CardContent>
      </Card>
        </div>
      </div>
    </div>
  );
}