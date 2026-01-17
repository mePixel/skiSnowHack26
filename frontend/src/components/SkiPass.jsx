import { useState } from 'react';
import QRCode from 'qrcode.react';
import { Card, CardHeader, CardTitle, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { Mountain, Clock, Scan } from 'lucide-react';

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
  const [isScanning, setIsScanning] = useState(false);

  const handleScan = () => {
    setIsScanning(true);
    // Simulate scan process
    setTimeout(() => {
      setIsScanning(false);
    }, 2000);
  };

  const isValidToday = () => {
    const today = new Date().toISOString().split('T')[0];
    return today >= skiPassData.validFrom && today <= skiPassData.validUntil;
  };

  return (
    <div className="w-full max-w-md mx-auto space-y-6">
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

              {/* Scan button overlay */}
              {isScanning && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-lg">
                  <div className="text-white text-center space-y-2">
                    <Scan className="h-8 w-8 mx-auto animate-pulse" />
                    <p className="text-sm font-medium">Scanning...</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex gap-3">
        <button
          onClick={handleScan}
          disabled={!isValidToday() || isScanning}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-sky-600 hover:bg-sky-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Scan className="h-5 w-5" />
          {isScanning ? 'Scanning...' : 'Scan to Lift'}
        </button>
      </div>

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
  );
}