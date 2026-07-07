import React, { useMemo } from 'react';
import { APIProvider, Map, AdvancedMarker, Pin } from '@vis.gl/react-google-maps';
import { MapPin, Compass, Navigation } from 'lucide-react';
import { motion } from 'motion/react';

const API_KEY =
  process.env.GOOGLE_MAPS_PLATFORM_KEY ||
  (import.meta as any).env.VITE_GOOGLE_MAPS_PLATFORM_KEY ||
  (globalThis as any).GOOGLE_MAPS_PLATFORM_KEY ||
  '';

// Simple check - allow keys that look like Google Maps keys
const hasValidKey = Boolean(API_KEY) && 
                   API_KEY.trim().startsWith('AIzaSy') &&
                   API_KEY !== 'YOUR_API_KEY' && 
                   API_KEY.trim() !== '' &&
                   API_KEY.length > 5;

// Premium dark theme for the mini project map
const darkMapStyle = [
  { "elementType": "geometry", "stylers": [{ "color": "#0f172a" }] },
  { "elementType": "labels.text.stroke", "stylers": [{ "color": "#0f172a" }] },
  { "elementType": "labels.text.fill", "stylers": [{ "color": "#64748b" }] },
  {
    "featureType": "administrative.locality",
    "elementType": "labels.text.fill",
    "stylers": [{ "color": "#06b6d4" }]
  },
  {
    "featureType": "poi",
    "elementType": "labels.text.fill",
    "stylers": [{ "color": "#06b6d4" }]
  },
  {
    "featureType": "poi.park",
    "elementType": "geometry",
    "stylers": [{ "color": "#0f172a" }]
  },
  {
    "featureType": "poi.park",
    "elementType": "labels.text.fill",
    "stylers": [{ "color": "#475569" }]
  },
  {
    "featureType": "road",
    "elementType": "geometry",
    "stylers": [{ "color": "#1e293b" }]
  },
  {
    "featureType": "road",
    "elementType": "geometry.stroke",
    "stylers": [{ "color": "#0f172a" }]
  },
  {
    "featureType": "road",
    "elementType": "labels.text.fill",
    "stylers": [{ "color": "#94a3b8" }]
  },
  {
    "featureType": "road.highway",
    "elementType": "geometry",
    "stylers": [{ "color": "#0284c7" }]
  },
  {
    "featureType": "road.highway",
    "elementType": "geometry.stroke",
    "stylers": [{ "color": "#0f172a" }]
  },
  {
    "featureType": "road.highway",
    "elementType": "labels.text.fill",
    "stylers": [{ "color": "#e2e8f0" }]
  },
  {
    "featureType": "water",
    "elementType": "geometry",
    "stylers": [{ "color": "#020617" }]
  },
  {
    "featureType": "water",
    "elementType": "labels.text.fill",
    "stylers": [{ "color": "#1e293b" }]
  }
];

interface ProjectMiniMapProps {
  lat: number;
  lng: number;
  name: string;
  color?: string;
}

export function ProjectMiniMap({ lat, lng, name, color = '#06b6d4' }: ProjectMiniMapProps) {
  const coordinates = useMemo(() => {
    return { lat: Number(lat) || 0, lng: Number(lng) || 0 };
  }, [lat, lng]);

  if (!hasValidKey) {
    // Beautiful design-compliant fallback that models high-fidelity CAD/GIS radar systems 
    return (
      <div 
        onClick={(e) => e.stopPropagation()}
        className="relative w-full h-32 rounded-xl border border-border/40 overflow-hidden bg-slate-950/80 hover:border-primary/40 transition-colors flex flex-col justify-between p-2.5 font-mono select-none"
      >
        {/* Radar concentric circular grid elements */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-20">
          <div className="w-24 h-24 rounded-full border border-dashed border-primary/40 animate-pulse duration-1000" />
          <div className="w-16 h-16 rounded-full border border-dashed border-primary/20" />
          <div className="w-32 h-32 rounded-full border border-primary/10" />
          {/* Scanning Sweep Radar bar */}
          <div className="absolute w-1/2 h-[1px] bg-gradient-to-r from-transparent to-primary origin-left animate-spin duration-[4000ms] ease-linear" />
        </div>

        {/* Dynamic header specs */}
        <div className="relative z-10 flex items-center justify-between text-[8px] font-bold text-muted-foreground/80 tracking-widest uppercase">
          <div className="flex items-center gap-1 group">
            <Compass className="w-3 h-3 text-primary animate-spin duration-[5000ms]" />
            <span>GEO-PLOTTER</span>
          </div>
          <span className="text-primary tracking-tighter text-[7.5px] border border-primary/20 px-1 rounded">MOCK ACTIVE</span>
        </div>

        {/* Micro coordinate HUD overlay in center */}
        <div className="relative z-10 flex flex-col items-center justify-center text-center">
          <motion.div 
            animate={{ y: [0, -3, 0] }}
            transition={{ repeat: Infinity, duration: 2 }}
            className="flex items-center justify-center w-7 h-7 rounded-full bg-primary/10 border border-primary/30"
          >
            <MapPin className="w-4 h-4" style={{ color }} />
          </motion.div>
          <span className="text-[9px] font-extrabold text-white uppercase mt-1 tracking-tight truncate max-w-[140px]" title={name}>
            {name}
          </span>
        </div>

        {/* Footer Coordinate Tags */}
        <div className="relative z-10 flex justify-between text-[8px] border-t border-border/20 pt-1 text-muted-foreground/80">
          <span className="font-bold">LAT: <span className="text-white font-black">{coordinates.lat.toFixed(4)}</span></span>
          <span className="font-bold">LNG: <span className="text-white font-black">{coordinates.lng.toFixed(4)}</span></span>
        </div>
      </div>
    );
  }

  return (
    <div 
      onClick={(e) => e.stopPropagation()}
      className="relative w-full h-32 rounded-xl border border-border/40 overflow-hidden bg-slate-950/80 hover:border-primary/40 transition-colors"
    >
      <APIProvider apiKey={API_KEY} version="weekly">
        <Map
          defaultCenter={coordinates}
          defaultZoom={11}
          disableDefaultUI={true}
          gestureHandling="cooperative"
          mapTypeId="roadmap"
          styles={darkMapStyle}
          className="w-full h-full"
        >
          <AdvancedMarker position={coordinates}>
            <div className="relative flex items-center justify-center">
              <span className="absolute w-4 h-4 bg-primary/30 rounded-full animate-ping pointer-events-none" />
              <div 
                className="w-5 h-5 rounded-full border border-white flex items-center justify-center shadow-lg cursor-pointer transform hover:scale-110 duration-200" 
                style={{ backgroundColor: color }}
              >
                <Navigation className="w-2.5 h-2.5 text-white transform rotate-45" />
              </div>
            </div>
          </AdvancedMarker>
        </Map>
      </APIProvider>
      <div className="absolute bottom-1 right-2 bg-black/60 border border-white/10 px-1 py-0.5 rounded text-[7px] text-muted-foreground font-mono uppercase tracking-wider z-20 pointer-events-none">
        INTERACTIVE
      </div>
    </div>
  );
}
