import { useEffect, useState, useCallback, useMemo, useRef } from 'react';
import { APIProvider, Map, AdvancedMarker, Pin, InfoWindow, useAdvancedMarkerRef, useMap } from '@vis.gl/react-google-maps';
import { ProjectProgressRing } from './ProjectProgressRing';
import { Navigation, Target, Plus, Minus, MapPin, Layers, LayoutPanelLeft, Search, X, Maximize2, ChevronDown, ChevronUp, BarChart3 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useToast } from './Toast';
import { useLanguage } from '../lib/i18n';
import * as d3 from 'd3';

const API_KEY =
  process.env.GOOGLE_MAPS_PLATFORM_KEY ||
  (import.meta as any).env.VITE_GOOGLE_MAPS_PLATFORM_KEY ||
  (globalThis as any).GOOGLE_MAPS_PLATFORM_KEY ||
  '';

// Simple check - allow keys that look like Google Maps keys (start with AIzaSy)
const hasValidKey = Boolean(API_KEY) && 
                   API_KEY.trim().startsWith('AIzaSy') &&
                   API_KEY !== 'YOUR_API_KEY' && 
                   API_KEY.trim() !== '' &&
                   API_KEY.length > 5;

// Mathematics for Geodesic distances and Surface areas using custom, ultra-precise formulas
function getHaversineDistance(p1: { lat: number; lng: number }, p2: { lat: number; lng: number }) {
  const R = 6371000; // m
  const dLat = (p2.lat - p1.lat) * Math.PI / 180;
  const dLng = (p2.lng - p1.lng) * Math.PI / 180;
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(p1.lat * Math.PI / 180) * Math.cos(p2.lat * Math.PI / 180) *
            Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function getPolygonArea(coords: { lat: number; lng: number }[]) {
  if (coords.length < 3) return 0;
  const R = 6378137; // Semi-major axis of Earth
  const latParts = coords.map(c => c.lat * Math.PI / 180);
  const lngParts = coords.map(c => c.lng * Math.PI / 180);
  let area = 0;
  for (let i = 0; i < coords.length; i++) {
    const j = (i + 1) % coords.length;
    area += (lngParts[j] - lngParts[i]) * (2 + Math.sin(latParts[i]) + Math.sin(latParts[j]));
  }
  area = Math.abs(area * R * R / 2);
  return area;
}

// Custom declarative wrappers for Google Maps Overlays using useMap() hooks
export function MapPolyline({ paths, color = '#00b0ff' }: { paths: { lat: number; lng: number }[]; color?: string }) {
  const map = useMap();
  const polyRef = useRef<google.maps.Polyline | null>(null);

  useEffect(() => {
    if (!map) return;
    const poly = new google.maps.Polyline({
      path: paths,
      geodesic: true,
      strokeColor: color,
      strokeOpacity: 0.9,
      strokeWeight: 4,
    });
    poly.setMap(map);
    polyRef.current = poly;

    return () => {
      poly.setMap(null);
    };
  }, [map]);

  useEffect(() => {
    if (polyRef.current) {
      polyRef.current.setPath(paths);
    }
  }, [paths]);

  return null;
}

export function MapPolygon({ paths, color = '#10b981' }: { paths: { lat: number; lng: number }[]; color?: string }) {
  const map = useMap();
  const polyRef = useRef<google.maps.Polygon | null>(null);

  useEffect(() => {
    if (!map) return;
    const polygon = new google.maps.Polygon({
      paths: paths,
      strokeColor: color,
      strokeOpacity: 0.8,
      strokeWeight: 2.5,
      fillColor: color,
      fillOpacity: 0.25,
    });
    polygon.setMap(map);
    polyRef.current = polygon;

    return () => {
      polygon.setMap(null);
    };
  }, [map]);

  useEffect(() => {
    if (polyRef.current) {
      polyRef.current.setPaths(paths);
    }
  }, [paths]);

  return null;
}

interface ProjectMapProps {
  projects: any[];
}

export function ProjectMap({ projects }: ProjectMapProps) {
  const [currentLocation, setCurrentLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  const [mapTypeId, setMapTypeId] = useState('roadmap');
  const [showD3Cadastral, setShowD3Cadastral] = useState(false);
  const [showTraffic, setShowTraffic] = useState(false);
  
  // Custom land surveying measurement states
  const [measureMode, setMeasureMode] = useState<'distance' | 'area' | null>(null);
  const [measurePoints, setMeasurePoints] = useState<{ lat: number; lng: number }[]>([]);
  const [currentBounds, setCurrentBounds] = useState<any>(null);
  
  const { showToast } = useToast();
  const { t } = useLanguage();

  // Dynamic calculations
  const totalDistance = useMemo(() => {
    if (measurePoints.length < 2) return 0;
    let dist = 0;
    for (let i = 0; i < measurePoints.length - 1; i++) {
      dist += getHaversineDistance(measurePoints[i], measurePoints[i+1]);
    }
    return dist;
  }, [measurePoints]);

  const totalArea = useMemo(() => {
    if (measurePoints.length < 3) return 0;
    return getPolygonArea(measurePoints);
  }, [measurePoints]);

  const cadastralStyle = useMemo(() => [
    {
      "featureType": "landscape.man_made",
      "elementType": "geometry.stroke",
      "stylers": [{ "visibility": "on" }, { "color": "#ff0000" }, { "weight": 0.5 }]
    },
    {
      "featureType": "poi",
      "stylers": [{ "visibility": "off" }]
    },
    {
      "featureType": "road",
      "elementType": "geometry",
      "stylers": [{ "color": "#2c2c2c" }]
    },
    {
       "featureType": "water",
       "elementType": "geometry",
       "stylers": [{ "color": "#000000" }]
    },
    {
      "elementType": "labels.text.fill",
      "stylers": [{ "color": "#8d8d8d" }]
    }
  ], []);

  if (!hasValidKey) {
    return (
      <div className="flex flex-col items-center justify-center h-[600px] bg-card border border-border rounded-2xl p-8 text-center space-y-6">
        <div className="w-16 h-16 rounded-full bg-rose-500/10 flex items-center justify-center">
          <Pin background="#f43f5e" glyphColor="#fff" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-white">{t('apiKeyRequired')}</h2>
          <p className="text-sm text-muted-foreground mt-2 max-w-md mx-auto">
            {t('addApiKeyDesc')}
          </p>
        </div>
        <div className="text-left bg-muted/20 p-5 rounded-xl text-xs space-y-4 font-sans text-muted-foreground max-w-md mx-auto border border-border/50">
          <p className="font-bold text-white mb-2 text-sm border-b border-border/50 pb-2">{t('howToFixMap')}</p>
          <div className="space-y-2">
            <p className="flex gap-2">
              <span className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center text-[10px] text-primary shrink-0">1</span>
              <span>{t('step1Key')}</span>
            </p>
            <p className="flex gap-2">
              <span className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center text-[10px] text-primary shrink-0">2</span>
              <span>{t('step2Secrets')}</span>
            </p>
            <p className="flex gap-2">
              <span className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center text-[10px] text-primary shrink-0">3</span>
              <span>{t('step3Name')}</span>
            </p>
            <p className="flex gap-2">
              <span className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center text-[10px] text-primary shrink-0">4</span>
              <span>{t('step4Value')}</span>
            </p>
          </div>
          <p className="text-[10px] italic pt-2 text-primary/80">{t('rebuildNote')}</p>
        </div>
      </div>
    );
  }

  return (
    <div id="map-container" className="h-[600px] rounded-2xl overflow-hidden border border-border shadow-2xl relative">
      <APIProvider apiKey={API_KEY} version="weekly">
        <Map
          defaultCenter={{ lat: 2.0469, lng: 45.3182 }}
          defaultZoom={6}
          mapId="DEMO_MAP_ID"
          internalUsageAttributionIds={['gmp_mcp_codeassist_v1_aistudio']}
          gestureHandling={'greedy'}
          disableDefaultUI={true}
          style={{ width: '100%', height: '100%' }}
          mapTypeId={mapTypeId === 'cadastral' ? 'roadmap' : mapTypeId}
          styles={mapTypeId === 'cadastral' ? cadastralStyle : []}
          onClick={(ev) => {
            if (measureMode && ev.detail.latLng) {
              const clickedLatLng = ev.detail.latLng;
              setMeasurePoints((prev) => [...prev, { lat: clickedLatLng.lat, lng: clickedLatLng.lng }]);
            }
          }}
          onCameraChanged={(ev) => {
            setCurrentBounds(ev.detail.bounds);
          }}
        >
          {projects.map(p => (
            <MarkerWithInfo key={p.id} project={p} />
          ))}

          {currentLocation && (
            <CurrentLocationMarker 
              position={currentLocation} 
              onClear={() => setCurrentLocation(null)} 
            />
          )}

          {/* Active geodetic measurements */}
          {measurePoints.length > 0 && measureMode === 'distance' && (
            <MapPolyline paths={measurePoints} color="#00b0ff" />
          )}
          {measurePoints.length > 0 && measureMode === 'area' && (
            <MapPolygon paths={measurePoints} color="#10b981" />
          )}

          {/* Vertex markers for current path */}
          {measurePoints.map((pt, idx) => (
            <AdvancedMarker key={`measure-${idx}`} position={pt}>
              <div 
                onClick={(e) => {
                  e.stopPropagation();
                  setMeasurePoints(prev => prev.filter((_, i) => i !== idx));
                }}
                className="w-5 h-5 rounded-full border border-white flex items-center justify-center text-[9px] font-black shadow-2xl cursor-pointer hover:scale-110 transition-all text-white shrink-0"
                style={{ backgroundColor: measureMode === 'area' ? '#10b981' : '#00b0ff' }}
                title={t('language') === 'so' ? 'Guji si aad u masaxdo' : 'Click to delete point'}
              >
                {idx + 1}
              </div>
            </AdvancedMarker>
          ))}

          {projects.length === 0 && (
             <div className="absolute inset-0 flex items-center justify-center bg-background/50 backdrop-blur-[2px] z-10">
                <div className="bg-card border border-border p-6 rounded-2xl shadow-2xl text-center max-w-xs animate-in fade-in zoom-in duration-300">
                   <div className="w-12 h-12 rounded-full bg-muted/20 flex items-center justify-center mx-auto mb-4">
                      <Target className="w-6 h-6 text-muted-foreground opacity-50" />
                   </div>
                   <h3 className="text-sm font-bold text-white uppercase tracking-widest">{t('noProjectsFound')}</h3>
                   <p className="text-xs text-muted-foreground mt-2">{t('adjustFilters')}</p>
                </div>
             </div>
          )}

          <MapControls 
            projects={projects}
            onLocate={(pos) => {
              setCurrentLocation(pos);
              showToast(t('locationCaptured'), 'success');
            }} 
            isLocating={isLocating}
            setIsLocating={setIsLocating}
            mapTypeId={mapTypeId}
            setMapTypeId={setMapTypeId}
            showD3Cadastral={showD3Cadastral}
            setShowD3Cadastral={setShowD3Cadastral}
            showTraffic={showTraffic}
            setShowTraffic={setShowTraffic}
          />

          {/* Custom Geodetic Measurement Terminal Overlay */}
          <div className="absolute top-16 left-4 z-40 max-w-[240px] w-full bg-card/95 backdrop-blur-md border border-border rounded-xl shadow-2xl p-3 text-white">
            <div className="flex items-center justify-between mb-2 pb-1.5 border-b border-border/40">
              <span className="text-[10px] font-black uppercase tracking-wider text-[#00b0ff]">
                {t('language') === 'so' ? 'Qalabka Cabirka' : 'Measurement Rig'}
              </span>
              {measurePoints.length > 0 && (
                <button
                  onClick={() => {
                    setMeasurePoints([]);
                    showToast(t('language') === 'so' ? 'Masaafadii waa la masaxay' : 'Cleared measurement path', 'info');
                  }}
                  className="text-[9px] text-rose-500 hover:text-rose-400 font-bold uppercase transition-all"
                >
                  {t('language') === 'so' ? 'Masax' : 'Clear'}
                </button>
              )}
            </div>

            <div className="flex gap-1.5 mb-2">
              <button
                type="button"
                onClick={() => {
                  setMeasureMode(measureMode === 'distance' ? null : 'distance');
                  setMeasurePoints([]);
                }}
                className={`flex-1 py-1 px-1.5 rounded-md text-[9px] font-bold text-center border transition-all ${
                  measureMode === 'distance'
                    ? 'bg-primary border-primary text-primary-foreground font-black'
                    : 'bg-muted/10 border-border/80 text-muted-foreground hover:bg-muted/15 hover:text-white'
                }`}
              >
                {t('language') === 'so' ? 'Masaafada' : 'Distance'}
              </button>

              <button
                type="button"
                onClick={() => {
                  setMeasureMode(measureMode === 'area' ? null : 'area');
                  setMeasurePoints([]);
                }}
                className={`flex-1 py-1 px-1.5 rounded-md text-[9px] font-bold text-center border transition-all ${
                  measureMode === 'area'
                    ? 'bg-emerald-500 border-emerald-500 text-white font-black'
                    : 'bg-muted/10 border-border/80 text-muted-foreground hover:bg-muted/15 hover:text-white'
                }`}
              >
                {t('language') === 'so' ? 'Area/Bed' : 'Area / Bed'}
              </button>
            </div>

            {measureMode ? (
              <div className="space-y-2">
                <p className="text-[9px] text-muted-foreground leading-normal italic">
                  {t('language') === 'so'
                    ? 'Guji maabka si aad baro u dhigto.'
                    : 'Click on actual map coordinates.'}
                </p>

                <div className="bg-sidebar/50 p-2 rounded-lg border border-border/40 font-mono text-[9px] space-y-1">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground uppercase text-[8px] font-black">{t('language') === 'so' ? 'Baraha' : 'Nodes'}:</span>
                    <span className="text-white font-bold">{measurePoints.length}</span>
                  </div>

                  {measureMode === 'distance' && (
                    <div className="flex justify-between border-t border-border/20 pt-1">
                      <span className="text-muted-foreground uppercase text-[8px] font-black">{t('language') === 'so' ? 'Khadka' : 'Distance'}:</span>
                      <span className="text-[#00b0ff] font-bold">
                        {totalDistance < 1000
                          ? `${totalDistance.toFixed(1)} m`
                          : `${(totalDistance / 1000).toFixed(3)} km`}
                      </span>
                    </div>
                  )}

                  {measureMode === 'area' && (
                    <div className="flex justify-between border-t border-border/20 pt-1">
                      <span className="text-muted-foreground uppercase text-[8px] font-black">{t('language') === 'so' ? 'Bedka' : 'Area'}:</span>
                      <span className="text-emerald-400 font-bold">
                        {totalArea < 10000
                          ? `${totalArea.toFixed(1)} m²`
                          : `${(totalArea / 10000).toFixed(3)} ha`}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <p className="text-[8px] text-muted-foreground italic text-center uppercase tracking-wider py-1">
                {t('language') === 'so' ? 'Ma jiro cabir firfircooni' : 'No active measurement'}
              </p>
            )}
          </div>

          {showD3Cadastral && <D3CadastralLayer projects={projects} />}
          {showTraffic && <TrafficLayer />}
          
          <MapLegend showD3Cadastral={showD3Cadastral} />
          <MapSearch projects={projects} />
          <MapViewStatsWidget projects={projects} currentBounds={currentBounds} />
        </Map>
      </APIProvider>
    </div>
  );
}

interface MapViewStatsWidgetProps {
  projects: any[];
  currentBounds: any;
}

function MapViewStatsWidget({ projects, currentBounds }: MapViewStatsWidgetProps) {
  const { t } = useLanguage();
  const [isExpanded, setIsExpanded] = useState(true);

  const isSo = t('language') === 'so';

  const visibleProjects = useMemo(() => {
    if (!currentBounds) return projects;
    return projects.filter((p) => {
      if (typeof p.lat !== 'number' || typeof p.lng !== 'number') return false;
      const { north, south, east, west } = currentBounds;
      const isLatInBounds = p.lat >= south && p.lat <= north;
      let isLngInBounds = false;
      if (west <= east) {
        isLngInBounds = p.lng >= west && p.lng <= east;
      } else {
        isLngInBounds = p.lng >= west || p.lng <= east;
      }
      return isLatInBounds && isLngInBounds;
    });
  }, [projects, currentBounds]);

  const stats = useMemo(() => {
    let total = visibleProjects.length;
    let active = 0;
    let delayed = 0;
    let completed = 0;
    let totalBudgetSum = 0;
    const regionBudgets: Record<string, number> = {};

    visibleProjects.forEach((p) => {
      if (p.health === 'Delayed') {
        delayed++;
      } else if (p.status === 'completed' || p.health === 'Completed') {
        completed++;
      } else {
        active++;
      }

      const budgetVal = p.budgetAmt || 0;
      totalBudgetSum += budgetVal;

      const region = p.location ? p.location.split(',')[0].trim() : (isSo ? 'Kale' : 'Other');
      regionBudgets[region] = (regionBudgets[region] || 0) + budgetVal;
    });

    const regionsSorted = Object.entries(regionBudgets)
      .map(([region, totalBudget]) => ({ region, totalBudget }))
      .sort((a, b) => b.totalBudget - a.totalBudget);

    return {
      total,
      active,
      delayed,
      completed,
      totalBudgetSum,
      regions: regionsSorted,
    };
  }, [visibleProjects, isSo]);

  const formatCurrency = (val: number) => {
    return '$' + val.toLocaleString();
  };

  return (
    <div className="absolute bottom-4 right-4 z-40 max-w-[280px] sm:max-w-[320px] w-full font-sans">
      <div className="bg-card/95 backdrop-blur-md border border-border rounded-xl shadow-2xl overflow-hidden text-white">
        <button
          type="button"
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full px-4 py-3 bg-muted/20 hover:bg-muted/30 flex items-center justify-between border-b border-border/50 transition-colors text-left"
        >
          <div className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-primary" />
            <span className="text-xs font-bold uppercase tracking-wider">
              {isSo ? 'Xogta Khariidada' : 'Viewport Stats'}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] font-mono bg-primary/20 text-primary px-1.5 py-0.5 rounded-md font-bold">
              {stats.total} {isSo ? 'Mashruuc' : 'Projects'}
            </span>
            {isExpanded ? (
              <ChevronUp className="w-4 h-4 text-muted-foreground" />
            ) : (
              <ChevronDown className="w-4 h-4 text-muted-foreground" />
            )}
          </div>
        </button>

        <AnimatePresence initial={false}>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="p-4 space-y-4">
                <div className="grid grid-cols-3 gap-2">
                  <div className="bg-muted/10 border border-border/30 rounded-lg p-2 text-center">
                    <span className="text-[9px] text-muted-foreground font-bold uppercase tracking-wider">
                      {isSo ? 'Firfircoon' : 'Active'}
                    </span>
                    <p className="text-xs font-black text-primary mt-0.5">{stats.active}</p>
                  </div>
                  <div className="bg-muted/10 border border-border/30 rounded-lg p-2 text-center">
                    <span className="text-[9px] text-rose-400 font-bold uppercase tracking-wider">
                      {isSo ? 'Dib-u-dhac' : 'Delayed'}
                    </span>
                    <p className="text-xs font-black text-rose-400 mt-0.5">{stats.delayed}</p>
                  </div>
                  <div className="bg-muted/10 border border-border/30 rounded-lg p-2 text-center">
                    <span className="text-[9px] text-emerald-400 font-bold uppercase tracking-wider">
                      {isSo ? 'Dhamaaday' : 'Done'}
                    </span>
                    <p className="text-xs font-black text-emerald-400 mt-0.5">{stats.completed}</p>
                  </div>
                </div>

                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                      {isSo ? 'Miisaaniyadda' : 'Budget Per Region'}
                    </span>
                    <span className="text-[10px] text-primary/80 font-mono font-bold">
                      {formatCurrency(stats.totalBudgetSum)}
                    </span>
                  </div>

                  {stats.regions.length > 0 ? (
                    <div className="space-y-2 max-h-[140px] overflow-y-auto pr-1">
                      {stats.regions.map(({ region, totalBudget }) => {
                        const maxBudget = Math.max(...stats.regions.map(r => r.totalBudget)) || 1;
                        const percentage = (totalBudget / maxBudget) * 100;
                        return (
                          <div key={region} className="space-y-1">
                            <div className="flex justify-between items-center text-[10px]">
                              <span className="font-bold text-white/90 truncate max-w-[120px]">{region}</span>
                              <span className="font-mono text-primary font-bold">{formatCurrency(totalBudget)}</span>
                            </div>
                            <div className="w-full bg-muted/25 h-1.5 rounded-full overflow-hidden">
                              <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${percentage}%` }}
                                transition={{ duration: 0.5, ease: 'easeOut' }}
                                className="bg-primary h-full rounded-full"
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="text-[10px] text-muted-foreground italic py-2 text-center">
                      {isSo ? 'Ma jiraan mashaariic firfircoon oo muuqda.' : 'No visible projects.'}
                    </p>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

function TrafficLayer() {
  const map = useMap();
  useEffect(() => {
    if (!map) return;
    const trafficLayer = new google.maps.TrafficLayer();
    trafficLayer.setMap(map);
    return () => trafficLayer.setMap(null);
  }, [map]);
  return null;
}

function MapLegend({ showD3Cadastral }: { showD3Cadastral: boolean }) {
  const { t } = useLanguage();
  
  return (
    <div className="absolute bottom-4 left-4 z-40">
      <div className="bg-card/90 backdrop-blur-md border border-border rounded-xl shadow-2xl p-3 flex flex-col gap-3 min-w-[140px]">
        <div className="flex items-center gap-2 pb-2 border-b border-border/50">
          <Layers className="w-3.5 h-3.5 text-primary" />
          <span className="text-[10px] font-black text-white uppercase tracking-widest">{t('mapLegend')}</span>
        </div>
        
        <div className="space-y-2.5">
          {/* Markers */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-primary border border-white" />
              <span className="text-[10px] text-muted-foreground font-medium">{t('projectSite')}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="relative">
                <div className="w-2.5 h-2.5 rounded-full bg-[#06b6d4] border border-white" />
                <div className="absolute inset-0 bg-[#06b6d4]/40 rounded-full animate-pulse scale-150" />
              </div>
              <span className="text-[10px] text-muted-foreground font-medium">{t('yourLocation')}</span>
            </div>
          </div>

          {/* Boundaries */}
          {showD3Cadastral && (
            <div className="flex items-center gap-2">
              <div className="w-5 h-2 rounded-sm border border-[#06b6d4] border-dashed bg-[#06b6d4]/10" />
              <span className="text-[10px] text-muted-foreground font-medium">{t('cadastralParcel')}</span>
            </div>
          )}

          {/* Status Indicators */}
          <div className="pt-1 space-y-1.5 border-t border-border/30">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-400" />
              <span className="text-[9px] text-muted-foreground font-bold uppercase tracking-tight">{t('onTrack')}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-rose-400" />
              <span className="text-[9px] text-muted-foreground font-bold uppercase tracking-tight">{t('delayed')}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function MapSearch({ projects }: { projects: any[] }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [showResults, setShowResults] = useState(false);
  const map = useMap();
  const { t } = useLanguage();

  useEffect(() => {
    if (query.length < 2) {
      setResults([]);
      setShowResults(false);
      return;
    }

    const filtered = projects.filter(p => 
      p.name.toLowerCase().includes(query.toLowerCase()) ||
      p.location.toLowerCase().includes(query.toLowerCase())
    );
    setResults(filtered);
    setShowResults(true);
  }, [query, projects]);

  const handleSelect = (project: any) => {
    map?.panTo({ lat: project.lat, lng: project.lng });
    map?.setZoom(16);
    setQuery('');
    setShowResults(false);
  };

  return (
    <div className="absolute top-4 left-4 z-50 w-full max-w-xs sm:max-w-sm px-4 sm:px-0">
      <div className="relative group">
        <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
          <Search className="w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
        </div>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t('mapSearchPlaceholder')}
          className="w-full bg-card/90 backdrop-blur-md border border-border rounded-xl py-2.5 pl-10 pr-10 text-xs text-white placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 shadow-2xl transition-all"
        />
        {query && (
          <button
            onClick={() => setQuery('')}
            className="absolute inset-y-0 right-3 flex items-center"
          >
            <X className="w-4 h-4 text-muted-foreground hover:text-white transition-colors" />
          </button>
        )}

        <AnimatePresence>
          {showResults && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="absolute top-full left-0 right-0 mt-2 bg-card/95 backdrop-blur-md border border-border rounded-xl shadow-2xl overflow-hidden z-50 max-h-[300px] overflow-y-auto"
            >
              {results.length > 0 ? (
                results.map((project) => (
                  <button
                    key={project.id}
                    onClick={() => handleSelect(project)}
                    className="w-full text-left px-4 py-3 hover:bg-muted/50 transition-colors border-b border-border/50 last:border-0"
                  >
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-2 h-2 rounded-full shrink-0" 
                        style={{ backgroundColor: project.color }}
                      />
                      <div>
                        <div className="text-[11px] font-bold text-white">{project.name}</div>
                        <div className="text-[9px] text-muted-foreground uppercase tracking-wider mt-0.5">{project.location}</div>
                      </div>
                    </div>
                  </button>
                ))
              ) : (
                <div className="p-4 text-center text-xs text-muted-foreground">
                  {t('noResults')}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

function MapControls({ 
  projects,
  onLocate, 
  isLocating, 
  setIsLocating,
  mapTypeId,
  setMapTypeId,
  showD3Cadastral,
  setShowD3Cadastral,
  showTraffic,
  setShowTraffic
}: { 
  projects: any[];
  onLocate: (pos: { lat: number; lng: number }) => void;
  isLocating: boolean;
  setIsLocating: (v: boolean) => void;
  mapTypeId: string;
  setMapTypeId: (v: string) => void;
  showD3Cadastral: boolean;
  setShowD3Cadastral: (v: boolean) => void;
  showTraffic: boolean;
  setShowTraffic: (v: boolean) => void;
}) {
  const map = useMap();
  const { showToast } = useToast();
  const { t } = useLanguage();
  const [isLayersOpen, setIsLayersOpen] = useState(false);
  const [isOverlaysOpen, setIsOverlaysOpen] = useState(false);

  const scales = [
    { label: '1:100', zoom: 21 },
    { label: '1:500', zoom: 19 },
    { label: '1:1000', zoom: 18 },
  ];

  const baseLayers = [
    { id: 'satellite', label: 'Satellite' },
    { id: 'terrain', label: 'Topographic' },
    { id: 'cadastral', label: 'Cadastral' },
    { id: 'roadmap', label: 'Default' },
  ];

  const handleLocate = () => {
    if (!navigator.geolocation) {
      showToast('Geolocation is not supported by your browser', 'error');
      return;
    }

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const pos = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        };
        onLocate(pos);
        map?.panTo(pos);
        map?.setZoom(15);
        setIsLocating(false);
      },
      (error) => {
        console.error('Geolocation error:', error);
        showToast(t('geolocationError'), 'error');
        setIsLocating(false);
      },
      { enableHighAccuracy: true }
    );
  };

  const handleFitBounds = () => {
    if (!map) return;
    if (!projects || projects.length === 0) {
      showToast(
        t('language') === 'so' 
          ? 'Ma jiraan mashaariic firfircoon oo khariidada lagu habeyn karo' 
          : 'No active projects found to fit bounds', 
        'info'
      );
      return;
    }

    try {
      const bounds = new google.maps.LatLngBounds();
      let count = 0;
      projects.forEach((p) => {
        if (p && typeof p.lat === 'number' && typeof p.lng === 'number') {
          bounds.extend({ lat: p.lat, lng: p.lng });
          count++;
        }
      });
      if (count > 0) {
        map.fitBounds(bounds);
        showToast(
          t('language') === 'so' 
            ? 'Khariidadda waa la habeeyey si mashaariicda oo dhan loo wada arko' 
            : 'Map adjusted to fit all active projects', 
          'success'
        );
      } else {
        showToast(
          t('language') === 'so' 
            ? 'Mashaariicdu ma laha isuduwayaal sax ah' 
            : 'Projects do not have valid coordinates', 
          'error'
        );
      }
    } catch (error) {
      console.error('Error fitting bounds:', error);
      showToast('Error fitting bounds', 'error');
    }
  };

  return (
    <div className="absolute top-4 right-4 flex flex-col items-end gap-2">
      <div className="flex gap-2 items-center">
        {/* Layer Selector */}
        <div className="flex gap-1 bg-card/90 backdrop-blur-md border border-border rounded-xl shadow-xl p-1">
          <button
            onClick={() => setIsLayersOpen(!isLayersOpen)}
            title="Base Layers"
            className={`
              p-2 rounded-lg transition-all active:scale-95
              ${isLayersOpen ? 'text-primary bg-primary/10' : 'text-muted-foreground hover:text-white hover:bg-muted'}
            `}
          >
            <Layers className="w-5 h-5" />
          </button>

          <div className="w-px h-6 bg-border/50 my-auto mx-0.5" />

          <button
            onClick={() => setShowD3Cadastral(!showD3Cadastral)}
            title="Toggle Cadastral Layout"
            className={`
              p-2 rounded-lg transition-all active:scale-95 flex items-center gap-1.5 relative
              ${showD3Cadastral ? 'text-primary bg-primary/10 ring-1 ring-primary/30' : 'text-muted-foreground hover:text-white hover:bg-muted'}
            `}
          >
            {showD3Cadastral && (
              <div className="absolute inset-0 bg-primary/20 rounded-lg animate-pulse" />
            )}
            <LayoutPanelLeft className="w-5 h-5 relative z-10" />
            <span className="text-[9px] font-black uppercase tracking-tighter pr-0.5 relative z-10">CAD</span>
          </button>

          <div className="w-px h-6 bg-border/50 my-auto mx-0.5" />

          <button
            onClick={() => setIsOverlaysOpen(!isOverlaysOpen)}
            title={t('overlays')}
            className={`
              p-2 rounded-lg transition-all active:scale-95
              ${isOverlaysOpen ? 'text-primary bg-primary/10' : 'text-muted-foreground hover:text-white hover:bg-muted'}
            `}
          >
            <MapPin className="w-5 h-5" />
          </button>
        </div>

        <div className="relative">
          <AnimatePresence>
            {/* Overlays Dropdown */}
            {isOverlaysOpen && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                className="absolute top-full right-0 mt-2 w-48 bg-card/95 backdrop-blur-md border border-border rounded-xl shadow-2xl p-1 z-50"
              >
                <div className="px-3 py-1.5 border-b border-border/50 mb-1">
                   <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">{t('overlays')}</span>
                </div>
                
                <button
                  onClick={() => {
                    setShowTraffic(!showTraffic);
                    setIsOverlaysOpen(false);
                  }}
                  className={`
                    w-full text-left px-3 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-between
                    ${showTraffic ? 'bg-primary/20 text-primary' : 'text-muted-foreground hover:bg-muted hover:text-white'}
                  `}
                >
                  <div className="flex items-center gap-2">
                    <Navigation className="w-3.5 h-3.5" />
                    {t('traffic')}
                  </div>
                  {showTraffic && <div className="w-1.5 h-1.5 rounded-full bg-primary" />}
                </button>

                <button
                  onClick={() => {
                    setMapTypeId('terrain');
                    setIsOverlaysOpen(false);
                  }}
                  className={`
                    w-full text-left px-3 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-between
                    ${mapTypeId === 'terrain' ? 'bg-primary/20 text-primary' : 'text-muted-foreground hover:bg-muted hover:text-white'}
                  `}
                >
                  <div className="flex items-center gap-2">
                    <LayoutPanelLeft className="w-3.5 h-3.5" />
                    Topographic
                  </div>
                </button>
              </motion.div>
            )}

            {/* Base Layers Dropdown */}
            {isLayersOpen && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                className="absolute top-full right-0 mt-2 w-40 bg-card/95 backdrop-blur-md border border-border rounded-xl shadow-2xl p-1 z-50"
              >
                {baseLayers.map((layer) => (
                  <button
                    key={layer.id}
                    onClick={() => {
                      setMapTypeId(layer.id);
                      setIsLayersOpen(false);
                    }}
                    className={`
                      w-full text-left px-3 py-2 rounded-lg text-xs font-bold transition-all
                      ${mapTypeId === layer.id 
                        ? 'bg-primary text-primary-foreground' 
                        : 'text-muted-foreground hover:bg-muted hover:text-white'}
                    `}
                  >
                    {layer.label}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Zoom Level Selector */}
        <div className="bg-card/90 backdrop-blur-md border border-border rounded-xl shadow-xl flex gap-0.5 p-1 items-center overflow-hidden">
          <div className="px-2 border-r border-border/50 mr-1">
             <span className="text-[8px] font-black text-primary uppercase tracking-tighter">Scale</span>
          </div>
          {scales.map((s) => (
            <button
              key={s.label}
              onClick={() => map?.setZoom(s.zoom)}
              className="px-2.5 py-1.5 text-[10px] font-bold text-muted-foreground hover:text-white hover:bg-primary/10 hover:text-primary rounded-lg transition-all whitespace-nowrap"
            >
              {s.label}
            </button>
          ))}
        </div>

        <button
          onClick={handleLocate}
          disabled={isLocating}
          className={`
            flex items-center gap-2 px-4 py-2.5 bg-card/90 backdrop-blur-md border border-border rounded-xl shadow-xl 
            text-xs font-bold uppercase tracking-widest transition-all active:scale-95
            ${isLocating ? 'opacity-50 cursor-not-allowed' : 'hover:bg-muted text-white'}
          `}
        >
          <Navigation className={`w-4 h-4 text-primary ${isLocating ? 'animate-pulse' : ''}`} />
          {isLocating ? t('locating') : t('takePoint')}
        </button>
      </div>

      <div className="flex flex-col bg-card/90 backdrop-blur-md border border-border rounded-xl shadow-xl overflow-hidden">
        <button 
          id="map-zoom-in-btn"
          onClick={() => map?.setZoom((map.getZoom() || 0) + 1)}
          title={t('language') === 'so' ? 'Kordhi Zoom-ka' : 'Zoom In'}
          className="p-3 hover:bg-muted text-muted-foreground hover:text-white transition-colors border-b border-border"
        >
          <Plus className="w-4 h-4" />
        </button>
        <button 
          id="map-zoom-out-btn"
          onClick={() => map?.setZoom((map.getZoom() || 0) - 1)}
          title={t('language') === 'so' ? 'Yaree Zoom-ka' : 'Zoom Out'}
          className="p-3 hover:bg-muted text-muted-foreground hover:text-white transition-colors border-b border-border"
        >
          <Minus className="w-4 h-4" />
        </button>
        <button 
          id="map-fit-bounds-btn"
          onClick={handleFitBounds}
          title={t('language') === 'so' ? 'Ku habee Mashaariicda' : 'Fit All Projects'}
          className="p-3 hover:bg-muted text-muted-foreground hover:text-white transition-colors"
        >
          <Maximize2 className="w-4 h-4 text-primary" />
        </button>
      </div>
    </div>
  );
}

function CurrentLocationMarker({ position, onClear }: { position: { lat: number; lng: number }; onClear: () => void }) {
  const [markerRef, marker] = useAdvancedMarkerRef();
  const [isOpen, setIsOpen] = useState(true);
  const { t } = useLanguage();

  const isUserAdmin = (() => {
    try {
      const raw = localStorage.getItem('geomds_user');
      if (raw) {
        const parsed = JSON.parse(raw);
        return parsed.role === 'Maamulaha';
      }
    } catch (e) {
      console.error(e);
    }
    return false;
  })();

  return (
    <>
      <AdvancedMarker
        ref={markerRef}
        position={position}
        onClick={() => setIsOpen(true)}
      >
        <motion.div 
          className="relative"
          animate={{
            scale: [1, 1.15, 1],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          <div className="absolute inset-0 bg-[#06b6d4]/20 rounded-full animate-ping scale-150" />
          <Pin 
            background="#06b6d4" 
            borderColor="#fff" 
            glyphColor="#fff" 
            scale={1.4}
          >
            <MapPin className="w-4 h-4 text-white" />
          </Pin>
        </motion.div>
      </AdvancedMarker>

      {isOpen && (
        <InfoWindow
          anchor={marker}
          onCloseClick={() => setIsOpen(false)}
          className="p-0 m-0 overflow-hidden rounded-xl border-none shadow-none"
        >
          <div className="p-4 bg-card text-white min-w-[220px] space-y-4">
             <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20">
                   <Target className="w-5 h-5 text-primary" />
                </div>
                <div>
                   <h4 className="text-sm font-bold tracking-tight">{t('yourLocation')}</h4>
                   <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">{t('takePoint')}</p>
                </div>
             </div>
             
             <div className="bg-sidebar/50 rounded-xl p-3 border border-border/50 font-mono text-[10px] space-y-1">
                <div className="flex justify-between">
                   <span className="text-muted-foreground">LAT:</span>
                   <span className="text-primary font-bold">{position.lat.toFixed(6)}</span>
                </div>
                <div className="flex justify-between">
                   <span className="text-muted-foreground">LNG:</span>
                   <span className="text-primary font-bold">{position.lng.toFixed(6)}</span>
                </div>
             </div>

             {isUserAdmin ? (
               <div className="flex gap-2">
                  <button 
                    onClick={onClear}
                    className="flex-1 py-2 rounded-lg bg-rose-500/10 text-rose-500 text-[10px] font-bold uppercase hover:bg-rose-500 hover:text-white transition-all"
                  >
                     {t('delete')}
                  </button>
                  <button 
                    className="flex-2 py-2 px-4 rounded-lg bg-primary text-primary-foreground text-[10px] font-bold uppercase shadow-lg shadow-primary/20 hover:opacity-90 transition-all"
                  >
                     Add Project Here
                  </button>
               </div>
             ) : (
               <div className="text-center p-3 rounded-xl bg-amber-500/10 border border-amber-500/25">
                 <p className="text-[10px] font-bold text-amber-500 uppercase tracking-wide">
                   {t('language') === 'so' ? 'Doorka: Akhri-Kaliya' : 'Role: Read-Only'}
                 </p>
                 <p className="text-[9px] text-muted-foreground mt-0.5 leading-normal">
                   {t('language') === 'so' ? 'Maamulaha kaliya ayaa awood u leh inuu mashaariic ku daro.' : 'Only administrators can add projects.'}
                 </p>
               </div>
             )}
          </div>
        </InfoWindow>
      )}
    </>
  );
}

function MarkerWithInfo({ project }: { project: any; key?: any }) {
  const [markerRef, marker] = useAdvancedMarkerRef();
  const [isOpen, setIsOpen] = useState(false);
  const { t } = useLanguage();

  return (
    <>
      <AdvancedMarker
        ref={markerRef}
        position={{ lat: project.lat, lng: project.lng }}
        onClick={() => setIsOpen(true)}
      >
        <Pin 
          background={project.color} 
          borderColor="#fff" 
          glyphColor="#fff" 
          scale={1.2}
        />
      </AdvancedMarker>

      {isOpen && (
        <InfoWindow
          anchor={marker}
          onCloseClick={() => setIsOpen(false)}
          className="p-0 m-0 overflow-hidden rounded-xl border-none shadow-none"
        >
          <div className="p-4 bg-card text-white min-w-[200px] space-y-3">
             <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold truncate pr-4">{project.name}</h4>
                <div className="flex items-center justify-center bg-muted/30 rounded-lg p-1">
                   <ProjectProgressRing progress={project.progress} size={30} strokeWidth={3} color={project.color} />
                </div>
             </div>
             <div className="space-y-1">
                <p className="text-[10px] text-muted-foreground flex items-center gap-1 uppercase font-bold tracking-widest">
                   {project.location}
                </p>
                <div className={`text-[9px] font-bold uppercase ${
                   project.health === 'On Track' ? 'text-emerald-400' :
                   project.health === 'Delayed' ? 'text-rose-400' : 'text-primary'
                }`}>
                   Status: {project.health}
                </div>
             </div>
             <button className="w-full bg-primary/20 text-primary py-1.5 rounded-lg text-[10px] font-bold uppercase transition-colors hover:bg-primary hover:text-white">
                {t('viewProjectFiles')}
             </button>
          </div>
        </InfoWindow>
      )}
    </>
  );
}

function D3CadastralLayer({ projects }: { projects: any[] }) {
  const map = useMap();
  const [selectedParcelId, setSelectedParcelId] = useState<string | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  // Generate some dummy parcel data around project sites
  const parcels = useMemo(() => {
    return projects.flatMap(p => {
      const baseLat = p.lat;
      const baseLng = p.lng;
      
      // Create 4 parcels around each project
      return [
        { id: `${p.id}-1`, coords: [
          { lat: baseLat + 0.001, lng: baseLng + 0.001 },
          { lat: baseLat + 0.003, lng: baseLng + 0.001 },
          { lat: baseLat + 0.003, lng: baseLng + 0.003 },
          { lat: baseLat + 0.001, lng: baseLng + 0.003 }
        ], lot: "A101" },
        { id: `${p.id}-2`, coords: [
          { lat: baseLat - 0.001, lng: baseLng - 0.001 },
          { lat: baseLat - 0.003, lng: baseLng - 0.001 },
          { lat: baseLat - 0.003, lng: baseLng - 0.003 },
          { lat: baseLat - 0.001, lng: baseLng - 0.003 }
        ], lot: "B202" }
      ];
    });
  }, [projects]);

  useEffect(() => {
    if (!map) return;

    const overlay = new google.maps.OverlayView();

    overlay.onAdd = function() {
      const container = d3.select(this.getPanes().overlayLayer)
        .append('div')
        .attr('class', 'd3-cadastral-overlay')
        .style('position', 'absolute')
        .style('top', 0)
        .style('left', 0)
        .style('width', '100%')
        .style('height', '100%')
        .style('pointer-events', 'none');

      const svg = container.append('svg')
        .attr('width', '100%')
        .attr('height', '100%')
        .style('pointer-events', 'none');
        
      (this as any).svg = svg;
    };

    overlay.draw = function() {
      const projection = this.getProjection();
      if (!projection) return;

      const svg = (this as any).svg;
      
      const projectPoint = (lat: number, lng: number) => {
        const point = projection.fromLatLngToDivPixel(new google.maps.LatLng(lat, lng));
        return point;
      };

      const lineGenerator = d3.line<any>()
        .x(d => projectPoint(d.lat, d.lng).x)
        .y(d => projectPoint(d.lat, d.lng).y);

      const paths = svg.selectAll('.cadastral-parcel')
        .data(parcels, (d: any) => d.id);

      paths.enter()
        .append('path')
        .attr('class', (d: any) => `cadastral-parcel ${d.id === selectedParcelId ? 'cadastral-pulse-path' : ''}`)
        .style('pointer-events', 'auto')
        .style('cursor', 'pointer')
        .attr('fill', 'rgba(6, 182, 212, 0.1)')
        .attr('stroke', '#06b6d4')
        .attr('stroke-width', 2)
        .attr('stroke-dasharray', '4,2')
        .on('click', (event: any, d: any) => {
          event.stopPropagation();
          setSelectedParcelId(d.id === selectedParcelId ? null : d.id);
        })
        .merge(paths)
        .attr('class', (d: any) => `cadastral-parcel ${d.id === selectedParcelId ? 'cadastral-pulse-path' : ''}`)
        .attr('d', (d: any) => lineGenerator([...d.coords, d.coords[0]]));

      paths.exit().remove();
      
      const labels = svg.selectAll('.cadastral-label')
        .data(parcels, (d: any) => d.id);
        
      labels.enter()
        .append('text')
        .attr('class', 'cadastral-label')
        .attr('font-size', '10px')
        .attr('font-weight', 'bold')
        .attr('fill', '#06b6d4')
        .attr('text-anchor', 'middle')
        .style('pointer-events', 'none')
        .merge(labels)
        .attr('x', (d: any) => projectPoint(d.coords[0].lat, d.coords[0].lng).x)
        .attr('y', (d: any) => projectPoint(d.coords[0].lat, d.coords[0].lng).y - 5)
        .text((d: any) => d.lot);
        
      labels.exit().remove();
    };

    overlay.onRemove = function() {
      d3.selectAll('.d3-cadastral-overlay').remove();
    };

    overlay.setMap(map);

    return () => {
      overlay.setMap(null);
    };
  }, [map, parcels, selectedParcelId]);

  return null;
}
