import { LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Card, CardHeader, CardTitle, CardContent } from './ui/card';
import { formatDistance, formatSpeed, formatDuration, formatAltitude } from '../utils/dataParser';
import { calculatePerformanceMetrics, calculateSlopeAnalysis, calculateAltitudeAnalysis } from '../utils/dataParser';
import {
  TrendingUp,
  Gauge,
  Mountain,
  Clock,
  Activity,
  Zap,
  ArrowUp,
  ArrowDown,
  Timer
} from 'lucide-react';

export default function Stats({ parsedData }) {
  if (!parsedData || !parsedData.gpsPoints || parsedData.gpsPoints.length === 0) {
    return (
      <div className="flex items-center justify-center h-96 bg-slate-100 rounded-lg">
        <div className="text-center space-y-2">
          <TrendingUp className="h-12 w-12 mx-auto text-slate-400" />
          <p className="text-slate-600">No stats data available for this trip</p>
        </div>
      </div>
    );
  }

  const { gpsPoints, metrics } = parsedData;
  
  // Calculate advanced metrics
  const performanceMetrics = calculatePerformanceMetrics(gpsPoints);
  const slopeAnalysis = calculateSlopeAnalysis(gpsPoints);
  const altitudeAnalysis = calculateAltitudeAnalysis(gpsPoints);

  // Prepare data for charts
  const speedZonesData = [
    { name: 'Stationary', value: performanceMetrics.speedZones.stationary, color: '#94a3b8' },
    { name: 'Slow', value: performanceMetrics.speedZones.slow, color: '#60a5fa' },
    { name: 'Moderate', value: performanceMetrics.speedZones.moderate, color: '#34d399' },
    { name: 'Fast', value: performanceMetrics.speedZones.fast, color: '#fbbf24' },
    { name: 'Very Fast', value: performanceMetrics.speedZones.veryFast, color: '#f87171' }
  ];

  const slopeDifficultyData = [
    { name: 'Green', value: slopeAnalysis.slopeDifficulty.green, color: '#22c55e' },
    { name: 'Blue', value: slopeAnalysis.slopeDifficulty.blue, color: '#3b82f6' },
    { name: 'Red', value: slopeAnalysis.slopeDifficulty.red, color: '#ef4444' },
    { name: 'Black', value: slopeAnalysis.slopeDifficulty.black, color: '#1f2937' }
  ];

  const elevationZonesData = [
    { name: 'Bottom 25%', value: altitudeAnalysis.elevationZones.bottom, color: '#22c55e' },
    { name: 'Lower 25%', value: altitudeAnalysis.elevationZones.lower, color: '#3b82f6' },
    { name: 'Upper 25%', value: altitudeAnalysis.elevationZones.upper, color: '#f59e0b' },
    { name: 'Top 25%', value: altitudeAnalysis.elevationZones.top, color: '#ef4444' }
  ];

  // Prepare speed consistency chart data
  const speedConsistencyData = gpsPoints.map((point, index) => ({
    index,
    speed: point.speed * 3.6, // Convert to km/h
    avgSpeed: (gpsPoints.reduce((sum, p) => sum + p.speed, 0) / gpsPoints.length) * 3.6
  })).filter((_, index) => index % Math.max(1, Math.floor(gpsPoints.length / 100)) === 0); // Sample for performance

  // Prepare altitude profile with activity indicators
  const altitudeProfileData = gpsPoints.map((point, index) => {
    let activity = 'stationary';
    if (point.speed > 2.0) {
      activity = 'skiing';
    } else if (point.speed > 0.5) {
      // Determine if lift or slow skiing based on altitude trend
      if (index > 0 && point.altitude > gpsPoints[index - 1].altitude) {
        activity = 'lift';
      } else {
        activity = 'skiing';
      }
    }
    
    return {
      index,
      altitude: point.altitude,
      activity
    };
  }).filter((_, index) => index % Math.max(1, Math.floor(gpsPoints.length / 200)) === 0); // Sample for performance

  return (
    <div className="w-full space-y-6">
      {/* Performance Metrics Section */}
      <div className="space-y-4">
        <div className="bg-gradient-to-r from-sky-50 to-blue-50 rounded-xl p-6 shadow-sm border border-sky-100">
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Activity className="h-6 w-6 text-sky-600" />
            Performance Metrics
          </h2>
        </div>
        
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {/* Speed Consistency */}
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <p className="text-blue-600 text-xs font-medium uppercase tracking-wider">Speed Consistency</p>
                  <p className="text-2xl font-bold text-slate-900">
                    {(performanceMetrics.speedConsistency * 3.6).toFixed(1)} km/h
                  </p>
                  <p className="text-xs text-slate-600">Std deviation</p>
                </div>
                <div className="p-2 bg-blue-200 rounded-lg">
                  <Gauge className="h-5 w-5 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Skiing Time */}
          <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <p className="text-green-600 text-xs font-medium uppercase tracking-wider">Skiing Time</p>
                  <p className="text-2xl font-bold text-slate-900">
                    {formatDuration(performanceMetrics.skiingTime)}
                  </p>
                  <p className="text-xs text-slate-600">
                    {((performanceMetrics.skiingTime / metrics.duration) * 100).toFixed(0)}% of trip
                  </p>
                </div>
                <div className="p-2 bg-green-200 rounded-lg">
                  <Activity className="h-5 w-5 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Lift Time */}
          <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <p className="text-orange-600 text-xs font-medium uppercase tracking-wider">Lift Time</p>
                  <p className="text-2xl font-bold text-slate-900">
                    {formatDuration(performanceMetrics.liftTime)}
                  </p>
                  <p className="text-xs text-slate-600">
                    {((performanceMetrics.liftTime / metrics.duration) * 100).toFixed(0)}% of trip
                  </p>
                </div>
                <div className="p-2 bg-orange-200 rounded-lg">
                  <ArrowUp className="h-5 w-5 text-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Acceleration Zones */}
          <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <p className="text-purple-600 text-xs font-medium uppercase tracking-wider">Acceleration Zones</p>
                  <p className="text-2xl font-bold text-slate-900">
                    {performanceMetrics.accelerationZones.length}
                  </p>
                  <p className="text-xs text-slate-600">Rapid accelerations</p>
                </div>
                <div className="p-2 bg-purple-200 rounded-lg">
                  <Zap className="h-5 w-5 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Speed Zones Chart */}
        <Card className="border-slate-200 bg-gradient-to-br from-slate-50 to-blue-50">
          <CardHeader className="bg-gradient-to-r from-sky-100 to-blue-100">
            <CardTitle className="flex items-center gap-2">
              <Timer className="h-5 w-5 text-sky-600" />
              Time Spent in Speed Zones
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={speedZonesData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="name" stroke="#64748b" fontSize={12} />
                  <YAxis
                    stroke="#64748b"
                    fontSize={12}
                    label={{ value: 'Time (seconds)', angle: -90, position: 'insideLeft' }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'rgba(255, 255, 255, 0.95)',
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                    }}
                    formatter={(value) => [formatDuration(value), 'Time']}
                  />
                  <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                    {speedZonesData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Speed Consistency Chart */}
        <Card className="border-slate-200 bg-gradient-to-br from-slate-50 to-blue-50">
          <CardHeader className="bg-gradient-to-r from-sky-100 to-blue-100">
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-sky-600" />
              Speed Consistency Over Time
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={speedConsistencyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="index" stroke="#64748b" fontSize={12} />
                  <YAxis
                    stroke="#64748b"
                    fontSize={12}
                    label={{ value: 'Speed (km/h)', angle: -90, position: 'insideLeft' }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'rgba(255, 255, 255, 0.95)',
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                    }}
                    formatter={(value, name) => {
                      if (name === 'speed') return [`${value.toFixed(1)} km/h`, 'Actual Speed'];
                      if (name === 'avgSpeed') return [`${value.toFixed(1)} km/h`, 'Average Speed'];
                      return [value, name];
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="speed"
                    stroke="url(#speedGradient)"
                    strokeWidth={3}
                    dot={false}
                    activeDot={{ r: 6, fill: '#0ea5e9' }}
                  />
                  <Line
                    type="monotone"
                    dataKey="avgSpeed"
                    stroke="#ef4444"
                    strokeWidth={2}
                    strokeDasharray="5 5"
                    dot={false}
                  />
                  <defs>
                    <linearGradient id="speedGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#0284c7" stopOpacity={0.8}/>
                    </linearGradient>
                  </defs>
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Slope Analysis Section */}
      <div className="space-y-4">
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6 shadow-sm border border-green-100">
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Mountain className="h-6 w-6 text-green-600" />
            Slope Analysis
          </h2>
        </div>
        
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {/* Average Gradient */}
          <Card className="bg-gradient-to-br from-emerald-50 to-emerald-100 border-emerald-200">
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <p className="text-emerald-600 text-xs font-medium uppercase tracking-wider">Avg Gradient</p>
                  <p className="text-2xl font-bold text-slate-900">
                    {slopeAnalysis.averageGradient.toFixed(1)}%
                  </p>
                  <p className="text-xs text-slate-600">Overall slope</p>
                </div>
                <div className="p-2 bg-emerald-200 rounded-lg">
                  <TrendingUp className="h-5 w-5 text-emerald-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Total Runs */}
          <Card className="bg-gradient-to-br from-cyan-50 to-cyan-100 border-cyan-200">
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <p className="text-cyan-600 text-xs font-medium uppercase tracking-wider">Total Runs</p>
                  <p className="text-2xl font-bold text-slate-900">
                    {slopeAnalysis.totalRuns}
                  </p>
                  <p className="text-xs text-slate-600">Distinct descents</p>
                </div>
                <div className="p-2 bg-cyan-200 rounded-lg">
                  <ArrowDown className="h-5 w-5 text-cyan-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Longest Run */}
          <Card className="bg-gradient-to-br from-indigo-50 to-indigo-100 border-indigo-200">
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <p className="text-indigo-600 text-xs font-medium uppercase tracking-wider">Longest Run</p>
                  <p className="text-2xl font-bold text-slate-900">
                    {formatDistance(slopeAnalysis.longestRun)}
                  </p>
                  <p className="text-xs text-slate-600">Max distance</p>
                </div>
                <div className="p-2 bg-indigo-200 rounded-lg">
                  <Mountain className="h-5 w-5 text-indigo-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Steepest Section */}
          <Card className="bg-gradient-to-br from-rose-50 to-rose-100 border-rose-200">
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <p className="text-rose-600 text-xs font-medium uppercase tracking-wider">Steepest</p>
                  <p className="text-2xl font-bold text-slate-900">
                    {slopeAnalysis.steepestSections.length > 0 
                      ? `${slopeAnalysis.steepestSections[0].gradient.toFixed(1)}%`
                      : '0%'
                    }
                  </p>
                  <p className="text-xs text-slate-600">Max gradient</p>
                </div>
                <div className="p-2 bg-rose-200 rounded-lg">
                  <TrendingUp className="h-5 w-5 text-rose-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Slope Difficulty Distribution */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Card className="border-slate-200 bg-gradient-to-br from-green-50 to-emerald-50">
            <CardHeader className="bg-gradient-to-r from-green-100 to-emerald-100">
              <CardTitle className="flex items-center gap-2">
                <Mountain className="h-5 w-5 text-green-600" />
                Slope Difficulty Distribution
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={slopeDifficultyData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {slopeDifficultyData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value) => [formatDistance(value), 'Distance']}
                      contentStyle={{
                        backgroundColor: 'rgba(255, 255, 255, 0.95)',
                        border: '1px solid #e2e8f0',
                        borderRadius: '8px',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Steepest Sections */}
          <Card className="border-slate-200 bg-gradient-to-br from-rose-50 to-orange-50">
            <CardHeader className="bg-gradient-to-r from-rose-100 to-orange-100">
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-rose-600" />
                Steepest Sections
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {slopeAnalysis.steepestSections.slice(0, 5).map((section, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gradient-to-r from-slate-50 to-slate-100 rounded-lg shadow-sm">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-gradient-to-br from-rose-200 to-orange-200 rounded-full flex items-center justify-center shadow-sm">
                        <span className="text-sm font-bold text-rose-700">{index + 1}</span>
                      </div>
                      <div>
                        <p className="font-medium text-slate-900">{section.gradient.toFixed(1)}% gradient</p>
                        <p className="text-xs text-slate-600">{formatDistance(section.distance)}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-slate-900">
                        {formatAltitude(section.altitudeChange)} drop
                      </p>
                    </div>
                  </div>
                ))}
                {slopeAnalysis.steepestSections.length === 0 && (
                  <p className="text-center text-slate-500 py-4">No steep sections found</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Altitude Analysis Section */}
      <div className="space-y-4">
        <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl p-6 shadow-sm border border-purple-100">
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <ArrowUp className="h-6 w-6 text-purple-600" />
            Altitude Analysis
          </h2>
        </div>
        
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {/* Elevation Zones */}
          <Card className="border-slate-200 bg-gradient-to-br from-purple-50 to-indigo-50">
            <CardHeader className="bg-gradient-to-r from-purple-100 to-indigo-100">
              <CardTitle className="flex items-center gap-2">
                <Mountain className="h-5 w-5 text-purple-600" />
                Time Spent at Elevation Zones
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={elevationZonesData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {elevationZonesData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value) => [formatDuration(value), 'Time']}
                      contentStyle={{
                        backgroundColor: 'rgba(255, 255, 255, 0.95)',
                        border: '1px solid #e2e8f0',
                        borderRadius: '8px',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Altitude Profile with Activity */}
          <Card className="border-slate-200 bg-gradient-to-br from-purple-50 to-indigo-50">
            <CardHeader className="bg-gradient-to-r from-purple-100 to-indigo-100">
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-purple-600" />
                Altitude Profile with Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={altitudeProfileData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="index" stroke="#64748b" fontSize={12} />
                    <YAxis
                      stroke="#64748b"
                      fontSize={12}
                      label={{ value: 'Altitude (m)', angle: -90, position: 'insideLeft' }}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'rgba(255, 255, 255, 0.95)',
                        border: '1px solid #e2e8f0',
                        borderRadius: '8px',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                      }}
                      formatter={(value, name) => {
                        if (name === 'altitude') return [`${value.toFixed(1)} m`, 'Altitude'];
                        return [value, name];
                      }}
                      labelFormatter={(value) => `Point ${value}`}
                    />
                    <Area
                      type="monotone"
                      dataKey="altitude"
                      stroke="url(#altitudeGradient)"
                      strokeWidth={2}
                      fill="url(#altitudeFill)"
                    />
                    <defs>
                      <linearGradient id="altitudeGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0.8}/>
                      </linearGradient>
                      <linearGradient id="altitudeFill" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.6}/>
                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0.1}/>
                      </linearGradient>
                    </defs>
                  </AreaChart>
                </ResponsiveContainer>
              </div>
              <div className="flex items-center justify-center gap-4 mt-4 p-3 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-gradient-to-r from-green-400 to-green-600 rounded-full shadow-sm"></div>
                  <span className="text-sm text-slate-600">Skiing</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-gradient-to-r from-blue-400 to-blue-600 rounded-full shadow-sm"></div>
                  <span className="text-sm text-slate-600">Lift</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-gradient-to-r from-gray-400 to-gray-600 rounded-full shadow-sm"></div>
                  <span className="text-sm text-slate-600">Stationary</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Altitude Rate Stats */}
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <p className="text-green-600 text-xs font-medium uppercase tracking-wider">Ascent Time</p>
                  <p className="text-2xl font-bold text-slate-900">
                    {formatDuration(altitudeAnalysis.ascentTime)}
                  </p>
                </div>
                <div className="p-2 bg-green-200 rounded-lg">
                  <ArrowUp className="h-5 w-5 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <p className="text-blue-600 text-xs font-medium uppercase tracking-wider">Descent Time</p>
                  <p className="text-2xl font-bold text-slate-900">
                    {formatDuration(altitudeAnalysis.descentTime)}
                  </p>
                </div>
                <div className="p-2 bg-blue-200 rounded-lg">
                  <ArrowDown className="h-5 w-5 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <p className="text-orange-600 text-xs font-medium uppercase tracking-wider">Max Ascent</p>
                  <p className="text-2xl font-bold text-slate-900">
                    {(altitudeAnalysis.maxAscentRate * 3.6).toFixed(1)}
                  </p>
                  <p className="text-xs text-slate-600">km/h vertical</p>
                </div>
                <div className="p-2 bg-orange-200 rounded-lg">
                  <TrendingUp className="h-5 w-5 text-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <p className="text-purple-600 text-xs font-medium uppercase tracking-wider">Max Descent</p>
                  <p className="text-2xl font-bold text-slate-900">
                    {(altitudeAnalysis.maxDescentRate * 3.6).toFixed(1)}
                  </p>
                  <p className="text-xs text-slate-600">km/h vertical</p>
                </div>
                <div className="p-2 bg-purple-200 rounded-lg">
                  <TrendingUp className="h-5 w-5 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}