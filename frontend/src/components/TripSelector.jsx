import { useState, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';
import { Button } from './ui/button';

export default function TripSelector({ trips, selectedTrip, onSelectTrip }) {
  const [isOpen, setIsOpen] = useState(false);

  const handleSelect = (trip) => {
    onSelectTrip(trip.id);
    setIsOpen(false);
  };

  if (!trips || trips.length === 0) {
    return (
      <div className="w-full p-4 text-center text-muted-foreground">
        No trips available
      </div>
    );
  }

  const selectedTripData = trips.find(t => t.id === selectedTrip);

  return (
    <div className="relative w-full">
      <Button
        variant="outline"
        className="w-full justify-between bg-white/90 backdrop-blur-sm"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="truncate">
          {selectedTripData ? `${selectedTripData.date}` : 'Select a trip'}
        </span>
        <ChevronDown className={`ml-2 h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </Button>

      {isOpen && (
        <div className="absolute z-[9999] mt-2 w-full rounded-md border bg-popover shadow-lg">
          <div className="max-h-60 overflow-y-auto">
            {trips.map((trip) => (
              <button
                key={trip.id}
                className={`w-full px-4 py-3 text-left text-sm transition-colors hover:bg-accent hover:text-accent-foreground ${
                  selectedTrip === trip.id ? 'bg-accent text-accent-foreground' : ''
                }`}
                onClick={() => handleSelect(trip)}
              >
                <div className="font-medium">{trip.date}</div>
                <div className="text-xs text-muted-foreground">{trip.id}</div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}