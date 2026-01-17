import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Card, CardHeader, CardTitle, CardContent } from './ui/card';
import { formatDistance, formatSpeed, formatDuration, formatAltitude } from '../utils/dataParser';
import { Ruler, Gauge, Mountain, Clock, TrendingUp } from 'lucide-react';

export default function Analytics({ parsedData }) {
  if (!parsedData || !parsedData.gpsPoints || parsedData.gpsPoints.length === 0) {
    return (
      <div className="flex items-center justify-center h-96 bg-slate-100 rounded-lg">
        <div className="text-center space-y-2">
          <TrendingUp className="h-12 w-12 mx-auto text-slate-400" />
          <p className="text-slate-600">No analytics data available for this trip</p>
        </div>
      </div>
    );
  }

  const { gpsPoints, metrics } = parsedData;

  // Prepare chart data
  const chartData = gpsPoints.map((point, index) => ({
    time: index,
    speed: point.speed * 3.6, // Convert to km/h
    altitude: point.altitude,
    timestamp: point.timestamp
  }));

  // Format time for x-axis
  const formatXAxis = (value) => {
    const point = gpsPoints[value];
    if (!point) return '';
    const date = new Date(point.timestamp);
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="w-full space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {/* Total Distance */}
        <Card className="bg-gradient-to-br from-sky-50 to-sky-100 border-sky-200">
          <CardContent className="p-4">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <p className="text-sky-600 text-xs font-medium uppercase tracking-wider">Distance</p>
                <p className="text-2xl font-bold text-slate-900">
                  {formatDistance(metrics.totalDistance)}
                </p>
              </div>
              <div className="p-2 bg-sky-200 rounded-lg">
                <Ruler className="h-5 w-5 text-sky-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Max Speed */}
        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
          <CardContent className="p-4">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <p className="text-orange-600 text-xs font-medium uppercase tracking-wider">Max Speed</p>
                <p className="text-2xl font-bold text-slate-900">
                  {formatSpeed(metrics.maxSpeed)}
                </p>
              </div>
              <div className="p-2 bg-orange-200 rounded-lg">
                <Gauge className="h-5 w-5 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Vertical Drop */}
        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardContent className="p-4">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <p className="text-green-600 text-xs font-medium uppercase tracking-wider">Vertical Drop</p>
                <p className="text-2xl font-bold text-slate-900">
                  {formatAltitude(metrics.verticalDrop)}
                </p>
              </div>
              <div className="p-2 bg-green-200 rounded-lg">
                <Mountain className="h-5 w-5 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Duration */}
        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <CardContent className="p-4">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <p className="text-purple-600 text-xs font-medium uppercase tracking-wider">Duration</p>
                <p className="text-2xl font-bold text-slate-900">
                  {formatDuration(metrics.duration)}
                </p>
              </div>
              <div className="p-2 bg-purple-200 rounded-lg">
                <Clock className="h-5 w-5 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Speed Chart */}
      <Card className="border-slate-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Gauge className="h-5 w-5 text-sky-600" />
            Speed Over Time
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis
                  dataKey="time"
                  tickFormatter={formatXAxis}
                  stroke="#64748b"
                  fontSize={12}
                />
                <YAxis
                  stroke="#64748b"
                  fontSize={12}
                  label={{ value: 'Speed (km/h)', angle: -90, position: 'insideLeft' }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#ffffff',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                  }}
                  formatter={(value, name) => {
                    if (name === 'speed') return [`${value.toFixed(1)} km/h`, 'Speed'];
                    return [value, name];
                  }}
                  labelFormatter={formatXAxis}
                />
                <Line
                  type="monotone"
                  dataKey="speed"
                  stroke="#0ea5e9"
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 6, fill: '#0ea5e9', stroke: '#0ea5e9' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Altitude Chart */}
      <Card className="border-slate-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mountain className="h-5 w-5 text-green-600" />
            Altitude Over Time
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis
                  dataKey="time"
                  tickFormatter={formatXAxis}
                  stroke="#64748b"
                  fontSize={12}
                />
                <YAxis
                  stroke="#64748b"
                  fontSize={12}
                  label={{ value: 'Altitude (m)', angle: -90, position: 'insideLeft' }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#ffffff',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                  }}
                  formatter={(value, name) => {
                    if (name === 'altitude') return [`${value.toFixed(1)} m`, 'Altitude'];
                    return [value, name];
                  }}
                  labelFormatter={formatXAxis}
                />
                <Area
                  type="monotone"
                  dataKey="altitude"
                  stroke="#22c55e"
                  strokeWidth={2}
                  fill="#22c55e"
                  fillOpacity={0.3}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Additional Stats */}
      <Card className="bg-slate-50 border-slate-200">
        <CardHeader>
          <CardTitle>Trip Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-1">
              <p className="text-slate-600 text-sm">GPS Points Recorded</p>
              <p className="text-xl font-bold text-slate-900">{gpsPoints.length}</p>
            </div>
            <div className="space-y-1">
              <p className="text-slate-600 text-sm">Highest Altitude</p>
              <p className="text-xl font-bold text-slate-900">{formatAltitude(metrics.maxAltitude)}</p>
            </div>
            <div className="space-y-1">
              <p className="text-slate-600 text-sm">Lowest Altitude</p>
              <p className="text-xl font-bold text-slate-900">{formatAltitude(metrics.minAltitude)}</p>
            </div>
            <div className="space-y-1">
              <p className="text-slate-600 text-sm">Average Speed</p>
              <p className="text-xl font-bold text-slate-900">
                {formatSpeed(gpsPoints.reduce((sum, p) => sum + p.speed, 0) / gpsPoints.length)}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}