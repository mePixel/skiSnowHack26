import { useState, useEffect } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from './components/ui/tabs';
import { Card, CardContent } from './components/ui/card';
import SkiPass from './components/SkiPass';
import SlopeMap from './components/SlopeMap';
import Analytics from './components/Analytics';
import Dialog from './components/ui/dialog';
import { parseTripData } from './utils/dataParser';
import { Loader2, AlertCircle, Mountain } from 'lucide-react';

function App() {
  const [trips, setTrips] = useState([]);
  const [selectedTrip, setSelectedTrip] = useState(null);
  const [tripData, setTripData] = useState(null);
  const [parsedData, setParsedData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('pass');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [tripToDelete, setTripToDelete] = useState(null);

  // Fetch available trips on mount
  useEffect(() => {
    fetchTrips();
  }, []);

  // Fetch trip data when trip is selected
  useEffect(() => {
    if (selectedTrip) {
      fetchTripData(selectedTrip);
    }
  }, [selectedTrip]);

  const fetchTrips = async () => {
    try {
      setLoading(true);
      const response = await fetch(process.env.VITE_API_BASE_URL+'/api/trips');
      if (!response.ok) {
        throw new Error('Failed to fetch trips');
      }
      const data = await response.json();
      setTrips(data);
      
      // Auto-select the first trip if available or if selected trip was deleted
      if (data.length > 0) {
        if (!selectedTrip || !data.find(t => t.id === selectedTrip)) {
          setSelectedTrip(data[0].id);
        }
      } else {
        // No trips available
        setSelectedTrip(null);
        setTripData(null);
        setParsedData(null);
      }
    } catch (err) {
      console.error('Error fetching trips:', err);
      setError('Failed to load trips. Please check if the backend is running.');
    } finally {
      setLoading(false);
    }
  };

  const fetchTripData = async (tripId) => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(process.env.VITE_API_BASE_URL+`/api/trips/${tripId}`);
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        if (response.status === 400) {
          throw new Error(errorData.error || 'Trip data file is empty or invalid');
        }
        throw new Error('Failed to fetch trip data');
      }
      const result = await response.json();
      setTripData(result.data);
      
      // Parse the trip data
      const parsed = parseTripData(result.data);
      setParsedData(parsed);
    } catch (err) {
      console.error('Error fetching trip data:', err);
      setError(err.message || 'Failed to load trip data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleTripSelect = (tripId) => {
    setSelectedTrip(tripId);
    setActiveTab('map'); // Switch to map tab when trip changes
  };

  const handleDeleteClick = (tripId) => {
    const trip = trips.find(t => t.id === tripId);
    if (trip) {
      setTripToDelete(trip);
      setDeleteDialogOpen(true);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!tripToDelete) return;

    try {
      const response = await fetch(process.env.VITE_API_BASE_URL+`/api/trips/${tripToDelete.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to delete trip');
      }

      // Refresh trips list
      await fetchTrips();

      // Close dialog
      setDeleteDialogOpen(false);
      setTripToDelete(null);
    } catch (err) {
      console.error('Error deleting trip:', err);
      setError(err.message || 'Failed to delete trip. Please try again.');
      setDeleteDialogOpen(false);
      setTripToDelete(null);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setTripToDelete(null);
  };

  if (loading && !trips.length) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-sky-100">
        <div className="text-center space-y-4">
          <Loader2 className="h-12 w-12 mx-auto animate-spin text-sky-600" />
          <p className="text-slate-600 text-lg">Loading Ski Resort Companion...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-sky-100">
        <Card className="max-w-md mx-auto border-red-200 bg-red-50">
          <CardContent className="p-6 text-center space-y-4">
            <AlertCircle className="h-16 w-16 mx-auto text-red-600" />
            <h2 className="text-xl font-bold text-red-900">Error Loading Application</h2>
            <p className="text-red-700">{error}</p>
            <button
              onClick={fetchTrips}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors"
            >
              Retry
            </button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-50 via-sky-50 to-sky-100">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-200 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-2">
            {/* Logo/Title */}
            <div className="flex items-center gap-2">
              <div className="p-2 bg-sky-600 rounded-lg">
                <Mountain className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-900">Ski Resort</h1>
                <p className="text-xs text-slate-600">Companion App</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 container mx-auto px-4 py-6">
        {loading && selectedTrip ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center space-y-4">
              <Loader2 className="h-12 w-12 mx-auto animate-spin text-sky-600" />
              <p className="text-slate-600">Loading trip data...</p>
            </div>
          </div>
        ) : (
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-6">
              <TabsTrigger value="pass" className="flex items-center gap-2">
                <span>🎫</span>
                <span>Pass</span>
              </TabsTrigger>
              <TabsTrigger value="map" className="flex items-center gap-2">
                <span>🗺️</span>
                <span>Map</span>
              </TabsTrigger>
              <TabsTrigger value="stats" className="flex items-center gap-2">
                <span>📊</span>
                <span>Stats</span>
              </TabsTrigger>
            </TabsList>

            {/* Pass Tab */}
            <TabsContent value="pass" className="mt-0">
              <SkiPass />
            </TabsContent>

            {/* Map Tab */}
            <TabsContent value="map" className="mt-0">
              <SlopeMap
                trips={trips}
                selectedTrip={selectedTrip}
                onSelectTrip={handleTripSelect}
                parsedData={parsedData}
                onDeleteTrip={handleDeleteClick}
              />
            </TabsContent>

            {/* Stats Tab */}
            <TabsContent value="stats" className="mt-0">
              {parsedData ? (
                <Analytics parsedData={parsedData} />
              ) : (
                <Card className="bg-slate-50 border-slate-200">
                  <CardContent className="p-12 text-center">
                    <Mountain className="h-16 w-16 mx-auto text-slate-400 mb-4" />
                    <p className="text-slate-600">Select a trip to view analytics</p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        )}
      </main>

      {/* Footer */}
      <footer className="mt-12 border-t border-slate-200 bg-white/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
            <p className="text-sm text-slate-600">
              © 2024 Ski Resort Companion. Built with ❤️ for skiers.
            </p>
            <div className="flex gap-4 text-sm text-slate-600">
              <span>📍 Austrian Alps</span>
              <span>🏔️ 2,622m Peak</span>
            </div>
          </div>
        </div>
      </footer>

      {/* Delete Confirmation Dialog */}
      <Dialog
          className={"z-[999]"}
        isOpen={deleteDialogOpen}
        onClose={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        title="Delete Trip"
        message={`Are you sure you want to delete the trip from ${tripToDelete?.date}? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        variant="destructive"
      />
    </div>
  );
}

export default App;