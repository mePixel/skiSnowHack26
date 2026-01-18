import { useEffect, useRef, useState } from 'react';
import { MapContainer, TileLayer, Polyline, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MapPin, Gauge, Flag, Play, Pause, SkipBack, SkipForward, Trash2 } from 'lucide-react';
import TripSelector from './TripSelector';
import { Button } from './ui/button';

// Environment variables
const defaultZoom = parseInt(import.meta.env.VITE_MAP_DEFAULT_ZOOM) || 13;
const maxZoom = parseInt(import.meta.env.VITE_MAP_MAX_ZOOM) || 19;
const tileUrl = import.meta.env.VITE_MAP_TILE_URL || 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
const enablePlayback = import.meta.env.VITE_ENABLE_PLAYBACK !== 'false';

// Fix for default marker icons in Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom icons
const createCustomIcon = (color) => {
  return L.divIcon({
    className: 'custom-marker',
    html: `<div style="
      background-color: ${color};
      width: 24px;
      height: 24px;
      border-radius: 50%;
      border: 3px solid white;
      box-shadow: 0 2px 4px rgba(0,0,0,0.3);
    "></div>`,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
  });
};

const startIcon = createCustomIcon('#22c55e'); // Green
const endIcon = createCustomIcon('#ef4444'); // Red
const maxSpeedIcon = createCustomIcon('#f59e0b'); // Orange
const playbackIcon = createCustomIcon('#0ea5e9'); // Sky blue

// Component to auto-fit map bounds
function MapBounds({ polyline }) {
  const map = useMap();
  
  useEffect(() => {
    if (polyline && polyline.length > 0) {
      const bounds = L.latLngBounds(polyline);
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [polyline, map]);
  
  return null;
}

// Component to update playback marker position
function PlaybackMarker({ position, data }) {
  const map = useMap();
  const markerRef = useRef(null);

  useEffect(() => {
    if (markerRef.current && position) {
      markerRef.current.setLatLng(position);
      map.panTo(position, { animate: true, duration: 0.5 });
    }
  }, [position, map]);

  if (!position) return null;

  return (
    <Marker
      position={position}
      icon={playbackIcon}
      ref={markerRef}
    >
      <Popup>
        <div className="space-y-1">
          <div className="flex items-center gap-2 font-semibold text-sky-600">
            <MapPin className="h-4 w-4" />
            Current Position
          </div>
          <div className="text-sm space-y-0.5">
            <p>Altitude: {data?.altitude?.toFixed(1)}m</p>
            <p>Speed: {data?.speed?.toFixed(1)} m/s</p>
            <p>Time: {data?.time}</p>
          </div>
        </div>
      </Popup>
    </Marker>
  );
}

export default function SlopeMap({ trips, selectedTrip, onSelectTrip, parsedData, onDeleteTrip }) {
  const mapRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const intervalRef = useRef(null);

  // Reset playback when trip changes
  useEffect(() => {
    setCurrentIndex(0);
    setIsPlaying(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
  }, [selectedTrip]);

  // Handle playback
  useEffect(() => {
    if (isPlaying && parsedData && parsedData.polyline && parsedData.polyline.length > 0) {
      intervalRef.current = setInterval(() => {
        setCurrentIndex((prev) => {
          if (prev >= parsedData.polyline.length - 1) {
            setIsPlaying(false);
            return prev;
          }
          return prev + 1;
        });
      }, 100 / playbackSpeed);
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isPlaying, playbackSpeed, parsedData]);

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const handleReset = () => {
    setCurrentIndex(0);
    setIsPlaying(false);
  };

  const handleSkipToEnd = () => {
    if (parsedData && parsedData.polyline) {
      setCurrentIndex(parsedData.polyline.length - 1);
      setIsPlaying(false);
    }
  };

  const handleSpeedChange = (speed) => {
    setPlaybackSpeed(speed);
  };

  if (!parsedData || !parsedData.polyline || parsedData.polyline.length === 0) {
      console.log(parsedData);
    return (
      <div className="w-full space-y-4">
        {/* Trip Selector */}
        <div className="max-w-xs">
          <TripSelector
            trips={trips}
            selectedTrip={selectedTrip}
            onSelectTrip={onSelectTrip}
          />
        </div>
        
        <div className="flex items-center justify-center h-96 bg-slate-100 rounded-lg">
          <div className="text-center space-y-2">
            <MapPin className="h-12 w-12 mx-auto text-slate-400" />
            <p className="text-slate-600">No GPS data available for this trip</p>
          </div>
        </div>
      </div>
    );
  }

  const { polyline, startPoint, endPoint, maxSpeedPoint, metrics } = parsedData;
  const currentPosition = polyline[currentIndex];
  const progress = ((currentIndex + 1) / polyline.length) * 100;

  return (
    <div className="w-full space-y-4">
      {/* Trip Selector and Playback Controls */}
      <div className="flex flex-col md:flex-col gap-4 items-start md:items-center justify-between">

          <div className={"w-full"}>
              <div className="flex gap-2 w-full max-w-xs">
              <div className="flex-1">
              <TripSelector
                trips={trips}
                selectedTrip={selectedTrip}
                onSelectTrip={onSelectTrip}
              />
              </div>
              {selectedTrip && onDeleteTrip && (
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => onDeleteTrip(selectedTrip)}
                  className="bg-white/90 backdrop-blur-sm hover:bg-red-50 hover:border-red-200 hover:text-red-600"
                  title="Delete trip"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
              {/* Playback Controls */}
              {enablePlayback && (
                  <div className="flex-1 w-full space-y-2">
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={handleReset}
                      disabled={currentIndex === 0}
                    >
                      <SkipBack className="h-4 w-4" />
                    </Button>
                    <Button
                      variant={isPlaying ? "default" : "outline"}
                      size="icon"
                      onClick={handlePlayPause}
                      className="w-12 h-12"
                    >
                      {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5 ml-1" />}
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={handleSkipToEnd}
                      disabled={currentIndex === polyline.length - 1}
                    >
                      <SkipForward className="h-4 w-4" />
                    </Button>

                    {/* Speed Control */}
                    <div className="flex items-center gap-1 ml-4">
                      <span className="text-sm text-slate-600">Speed:</span>
                      {[0.5, 1, 2, 4].map((speed) => (
                        <Button
                          key={speed}
                          variant={playbackSpeed === speed ? "default" : "outline"}
                          size="sm"
                          onClick={() => handleSpeedChange(speed)}
                          className="min-w-[40px]"
                        >
                          {speed}x
                        </Button>
                      ))}
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full">
                    <div className="flex items-center justify-between text-xs text-slate-600 mb-1">
                      <span>Progress</span>
                      <span>{progress.toFixed(1)}%</span>
                    </div>
                    <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-sky-500 transition-all duration-100 ease-linear"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                    <div className="flex items-center justify-between text-xs text-slate-600 mt-1">
                      <span>Point {currentIndex + 1} of {polyline.length}</span>
                      <span>
                        {currentPosition && (
                          <span>
                            Alt: {currentPosition.altitude?.toFixed(1)}m |
                            Speed: {currentPosition.speed?.toFixed(1)} m/s
                          </span>
                        )}
                      </span>
                    </div>
                  </div>
                </div>
              )}
          </div>

          {/* Map Container */}
          <div className="h-[500px] w-full rounded-lg overflow-hidden shadow-lg z-0">
        <MapContainer
          ref={mapRef}
          center={[startPoint.lat, startPoint.lng]}
          zoom={defaultZoom}
          style={{ height: '100%', width: '100%' }}
          scrollWheelZoom={true}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url={tileUrl}
            maxZoom={maxZoom}
          />

          {/* GPS Path */}
          <Polyline
            positions={polyline}
            color="#0ea5e9"
            weight={4}
            opacity={0.8}
            lineCap="round"
            lineJoin="round"
          />

          {/* Playback Marker */}
          <PlaybackMarker
            position={currentPosition}
            data={currentPosition}
          />

          {/* Start Point */}
          {startPoint && (
            <Marker
              position={[startPoint.lat, startPoint.lng]}
              icon={startIcon}
            >
              <Popup>
                <div className="space-y-1">
                  <div className="flex items-center gap-2 font-semibold text-green-600">
                    <Flag className="h-4 w-4" />
                    Start Point
                  </div>
                  <div className="text-sm space-y-0.5">
                    <p>Altitude: {startPoint.altitude.toFixed(1)}m</p>
                    <p>Speed: {startPoint.speed.toFixed(1)} m/s</p>
                  </div>
                </div>
              </Popup>
            </Marker>
          )}

          {/* End Point */}
          {endPoint && (
            <Marker
              position={[endPoint.lat, endPoint.lng]}
              icon={endIcon}
            >
              <Popup>
                <div className="space-y-1">
                  <div className="flex items-center gap-2 font-semibold text-red-600">
                    <Flag className="h-4 w-4" />
                    End Point
                  </div>
                  <div className="text-sm space-y-0.5">
                    <p>Altitude: {endPoint.altitude.toFixed(1)}m</p>
                    <p>Speed: {endPoint.speed.toFixed(1)} m/s</p>
                  </div>
                </div>
              </Popup>
            </Marker>
          )}

          {/* Max Speed Point */}
          {maxSpeedPoint && (
            <Marker
              position={[maxSpeedPoint.lat, maxSpeedPoint.lng]}
              icon={maxSpeedIcon}
            >
              <Popup>
                <div className="space-y-1">
                  <div className="flex items-center gap-2 font-semibold text-orange-600">
                    <Gauge className="h-4 w-4" />
                    Max Speed Point
                  </div>
                  <div className="text-sm space-y-0.5">
                    <p className="font-bold text-lg">
                      {(maxSpeedPoint.speed * 3.6).toFixed(1)} km/h
                    </p>
                    <p>Altitude: {maxSpeedPoint.altitude.toFixed(1)}m</p>
                  </div>
                </div>
              </Popup>
            </Marker>
          )}

          {/* Auto-fit bounds */}
          <MapBounds polyline={polyline} />
        </MapContainer>
      </div>

          {/* Map Legend */}
          <div className="flex items-center justify-center gap-6 p-4 bg-white rounded-lg shadow-md">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full bg-green-500 border-2 border-white shadow-sm" />
          <span className="text-sm font-medium">Start</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full bg-red-500 border-2 border-white shadow-sm" />
          <span className="text-sm font-medium">End</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full bg-orange-500 border-2 border-white shadow-sm" />
          <span className="text-sm font-medium">Max Speed</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full bg-sky-500 border-2 border-white shadow-sm" />
          <span className="text-sm font-medium">Playback</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-8 h-1 bg-sky-500 rounded" />
          <span className="text-sm font-medium">GPS Track</span>
        </div>
      </div>
      </div>
    </div>
  );
};