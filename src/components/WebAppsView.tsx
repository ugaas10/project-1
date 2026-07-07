import { 
  Globe, Map, Compass, Orbit, Layers, FileCode, Anchor, 
  Search, Plus, ExternalLink, Heart, Info, X, ChevronRight, 
  Trash2, Check, Calculator, RefreshCw, Sliders, MapPin, Sparkles, BookOpen
} from 'lucide-react';
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { supabase, handleSupabaseError, OperationType } from '../lib/supabase';
import { useLanguage } from '../lib/i18n';

interface WebApp {
  id: string;
  name: string;
  description_en: string;
  description_so: string;
  url: string;
  category: string;
  icon: string;
  color: string;
  createdBy?: string;
  isFavorite?: boolean;
}

const defaultWebApps: WebApp[] = [
  {
    id: 'somalia-cadastral',
    name: 'Somalia Cadastral Portal',
    description_en: 'Digital land registration and cadastral boundary registry for urban planning and deed verification in Somalia.',
    description_so: 'Diiwaangelinta dhulka dhijitaalka ah iyo xuduudaha canshuuraha ee qorshaynta magaalooyinka iyo xaqiijinta lahaanshaha.',
    url: 'https://www.openstreetmap.org/#map=12/2.0469/45.3182',
    category: 'Land & Surveying',
    icon: 'Map',
    color: 'cyan',
    isFavorite: true
  },
  {
    id: 'copernicus-browser',
    name: 'Copernicus Land Space Browser',
    description_en: 'High-resolution remote sensing satellite imagery analysis tool for tracking water resources, vegetation, and terrain changes.',
    description_so: 'Qalabka falanqaynta sawirada dayax-gacmeedka ee Copernicus si loola socdo ilaha biyaha, dhirta, iyo isbeddelka dhulka.',
    url: 'https://browser.dataspace.copernicus.eu/',
    category: 'Remote Sensing',
    icon: 'Orbit',
    color: 'emerald',
    isFavorite: true
  },
  {
    id: 'openstreetmap-somalia',
    name: 'OSM Somalia Infrastructure Map',
    description_en: 'Community-driven geographic information systems mapping public infrastructure, roads, and waterways across East Africa.',
    description_so: 'Nidaamyada macluumaadka juqraafi ee bulshadu horseedka ka tahay oo khariidada ka dhigaya kaabayaasha guud, wadooyinka, iyo kanaalada.',
    url: 'https://www.openstreetmap.org/search?query=Somalia',
    category: 'Mapping & GIS',
    icon: 'Compass',
    color: 'sky',
    isFavorite: false
  },
  {
    id: 'autodesk-viewer',
    name: 'CAD Online Blueprint Viewer',
    description_en: 'Cloud viewer for CAD layouts, DWG/DXF surveying drawings, and multi-layered land topography maps.',
    description_so: 'Qalabka lagu eego khariidadaha injineernimada ee DWG, DXF iyo AutoCAD si toos ah khadka internetka.',
    url: 'https://viewer.autodesk.com/',
    category: 'Surveying Utilities',
    icon: 'FileCode',
    color: 'indigo',
    isFavorite: false
  },
  {
    id: 'mogadishu-maritime',
    name: 'Mogadishu Vessel & Port Tracker',
    description_en: 'Marine logistics and vessel tracker for offshore boundaries, custom shipping corridors, and harbor georeferencing.',
    description_so: 'Codsiga la socodka gaadiidka badda ee sahanka xuduudaha badda iyo dekedda caalamiga ah ee Muqdisho.',
    url: 'https://www.marinetraffic.com/',
    category: 'Mapping & GIS',
    icon: 'Anchor',
    color: 'rose',
    isFavorite: false
  }
];

export function WebAppsView({ currentUser, showToast }: { currentUser: any; showToast: (msg: string, type: 'success' | 'error' | 'info') => void }) {
  const { t, language } = useLanguage();
  const [webApps, setWebApps] = useState<WebApp[]>(() => {
    const cached = localStorage.getItem('geodms_webapps');
    return cached ? JSON.parse(cached) : defaultWebApps;
  });
  
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [favorites, setFavorites] = useState<string[]>(() => {
    const saved = localStorage.getItem('geodms_favorite_apps');
    return saved ? JSON.parse(saved) : ['somalia-cadastral', 'copernicus-browser'];
  });

  // UTM Converter State
  const [convLat, setConvLat] = useState<string>('2.0469');
  const [convLng, setConvLng] = useState<string>('45.3182');
  const [utmResult, setUtmResult] = useState<any>(null);

  // App Creation Modal State
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newAppName, setNewAppName] = useState('');
  const [newAppUrl, setNewAppUrl] = useState('');
  const [newAppDescEn, setNewAppDescEn] = useState('');
  const [newAppDescSo, setNewAppDescSo] = useState('');
  const [newAppCategory, setNewAppCategory] = useState('Mapping & GIS');
  const [newAppIcon, setNewAppIcon] = useState('Globe');
  const [newAppColor, setNewAppColor] = useState('cyan');

  // Preview Modal State
  const [previewApp, setPreviewApp] = useState<WebApp | null>(null);

  // Fetch from Supabase
  useEffect(() => {
    const fetchApps = async () => {
      try {
        const { data, error } = await supabase.from('webapps').select('*');
        if (error) throw error;
        
        const cloudApps: WebApp[] = data ? data.map(d => d.data as WebApp) : [];
        
        // Merge cloud apps with defaults to avoid empty state
        if (cloudApps.length === 0) {
          setWebApps(defaultWebApps);
          localStorage.setItem('geodms_webapps', JSON.stringify(defaultWebApps));
        } else {
          // De-duplicate defaults with cloud entries
          const merged = [...cloudApps];
          defaultWebApps.forEach(def => {
            if (!merged.some(m => m.id === def.id)) {
              merged.push(def);
            }
          });
          setWebApps(merged);
          localStorage.setItem('geodms_webapps', JSON.stringify(merged));
        }
      } catch (error) {
        handleSupabaseError(error, OperationType.LIST, 'webapps');
      }
    };

    fetchApps();

    const channel = supabase.channel('public:webapps')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'webapps' }, () => {
        fetchApps();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Save favorites to localStorage
  useEffect(() => {
    localStorage.setItem('geodms_favorite_apps', JSON.stringify(favorites));
  }, [favorites]);

  // UTM Conversion formula for Somalia geodetic zones
  const calculateUTM = () => {
    const lat = parseFloat(convLat);
    const lon = parseFloat(convLng);

    if (isNaN(lat) || isNaN(lon)) {
      showToast(language === 'so' ? 'Fadlan geli isuduwaha saxda ah' : 'Please enter valid coordinate values', 'error');
      return;
    }

    if (lat < -90 || lat > 90 || lon < -180 || lon > 180) {
      showToast(language === 'so' ? 'Isuduwayaasha waxay ka baxsan yihiin xadka' : 'Coordinates out of bounds (-90 to 90 lat, -180 to 180 lng)', 'error');
      return;
    }

    try {
      const zone = Math.floor((lon + 180) / 6) + 1;
      const isNorthern = lat >= 0;
      
      const latRad = (lat * Math.PI) / 180;
      const lonRad = (lon * Math.PI) / 180;
      
      const a = 6378137; // WGS84
      const f = 1 / 298.257223563;
      const b = a * (1 - f);
      const eSq = (a*a - b*b) / (a*a);
      const k0 = 0.9996;
      
      const lonOrigin = (zone - 1) * 6 - 180 + 3;
      const lonOriginRad = (lonOrigin * Math.PI) / 180;
      
      const N = a / Math.sqrt(1 - eSq * Math.sin(latRad) * Math.sin(latRad));
      const T = Math.tan(latRad) * Math.tan(latRad);
      const C = eSq * Math.cos(latRad) * Math.cos(latRad) / (1 - eSq);
      const A = (lonRad - lonOriginRad) * Math.cos(latRad);
      
      const M = a * (
        (1 - eSq/4 - 3*eSq*eSq/64 - 5*eSq*eSq*eSq/256) * latRad -
        (3*eSq/8 + 3*eSq*eSq/32 + 45*eSq*eSq*eSq/1024) * Math.sin(2*latRad) +
        (15*eSq*eSq/256 + 45*eSq*eSq*eSq/1024) * Math.sin(4*latRad) -
        (35*eSq*eSq*eSq/3072) * Math.sin(6*latRad)
      );
      
      const easting = k0 * N * (
        A +
        (1 - T + C) * A*A*A / 6 +
        (5 - 18*T + T*T + 72*C - 58*eSq) * A*A*A*A*A / 120
      ) + 500000;
      
      let northing = k0 * (
        M +
        N * Math.tan(latRad) * (
          A*A / 2 +
          (5 - T + 9*C + 4*C*C) * A*A*A*A / 24 +
          (61 - 58*T + T*T + 600*C - 330*eSq) * A*A*A*A*A*A / 720
        )
      );
      
      if (!isNorthern) {
        northing += 10000000;
      }

      // Determine Somali region details
      let regionInfo = 'Somalia Geodetic Zone';
      if (zone === 37) {
        regionInfo = 'Zone 37N (Covering Jubaland, Gedo, Kismayo and South-West)';
      } else if (zone === 38) {
        regionInfo = 'Zone 38N (Covering Mogadishu, Banadir, Galmudug, Hiran, and Somaliland/Hargeisa)';
      } else if (zone === 39) {
        regionInfo = 'Zone 39N (Covering Puntland, Bari, Bosaso, and Guardafui Cape)';
      }

      setUtmResult({
        zone: `${zone}N`,
        easting: easting.toFixed(2),
        northing: northing.toFixed(2),
        region: regionInfo,
        datum: 'WGS-84 / Adindan'
      });
      showToast(language === 'so' ? 'Isuduwaha UTM waa la xisaabiyay!' : 'UTM coordinate projected successfully!', 'success');
    } catch (e: any) {
      console.error(e);
      showToast('Error converting coordinates', 'error');
    }
  };

  // Run initial conversion
  useEffect(() => {
    calculateUTM();
  }, []);

  const toggleFavorite = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setFavorites(prev => {
      const isFav = prev.includes(id);
      if (isFav) {
        showToast(language === 'so' ? 'Waa laga saaray xulshada' : 'Removed from favorites', 'info');
        return prev.filter(item => item !== id);
      } else {
        showToast(language === 'so' ? 'Waa lagu daray xulshada!' : 'Added to favorites!', 'success');
        return [...prev, id];
      }
    });
  };

  const handleCreateApp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAppName.trim() || !newAppUrl.trim()) {
      showToast(language === 'so' ? 'Magaca iyo URL-ka waa muhiim!' : 'Name and URL are required!', 'error');
      return;
    }

    const cleanUrl = newAppUrl.startsWith('http://') || newAppUrl.startsWith('https://') 
      ? newAppUrl 
      : `https://${newAppUrl}`;

    const newApp: WebApp = {
      id: `app_${Date.now()}`,
      name: newAppName.trim(),
      description_en: newAppDescEn.trim() || 'Custom registered web tool.',
      description_so: newAppDescSo.trim() || 'Qalabka gaarka ah ee diiwaangashan.',
      url: cleanUrl,
      category: newAppCategory,
      icon: newAppIcon,
      color: newAppColor,
      createdBy: currentUser?.name || 'Surveyor'
    };

    try {
      await supabase.from('webapps').upsert({ id: newApp.id, data: newApp });
      showToast(language === 'so' ? 'Codsiga cusub waa la kaydiyay!' : 'New application registered successfully!', 'success');
      
      // Reset states
      setNewAppName('');
      setNewAppUrl('');
      setNewAppDescEn('');
      setNewAppDescSo('');
      setNewAppCategory('Mapping & GIS');
      setNewAppIcon('Globe');
      setNewAppColor('cyan');
      setIsCreateOpen(false);
    } catch (err) {
      console.error(err);
      showToast('Error registering webapp in database', 'error');
    }
  };

  const handleDeleteApp = async (id: string, name: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm(language === 'so' ? `Ma hubtaa inaad tirtirto "${name}"?` : `Are you sure you want to delete "${name}"?`)) {
      return;
    }

    try {
      // If it is a default app, remove from local state; otherwise delete from Firestore
      if (defaultWebApps.some(d => d.id === id)) {
        setWebApps(prev => prev.filter(app => app.id !== id));
      } else {
        await supabase.from('webapps').delete().eq('id', id);
      }
      showToast(language === 'so' ? 'Codsiga waa la tirtiray!' : 'Application deleted successfully!', 'success');
    } catch (err) {
      console.error(err);
      showToast('Failed to delete web application', 'error');
    }
  };

  // Helper to render correct icon
  const renderIcon = (iconName: string, className = "w-6 h-6") => {
    switch (iconName) {
      case 'Map': return <Map className={className} />;
      case 'Orbit': return <Orbit className={className} />;
      case 'Compass': return <Compass className={className} />;
      case 'FileCode': return <FileCode className={className} />;
      case 'Anchor': return <Anchor className={className} />;
      case 'Layers': return <Layers className={className} />;
      case 'Calculator': return <Calculator className={className} />;
      default: return <Globe className={className} />;
    }
  };

  // Helper for color class
  const getColorClass = (color: string) => {
    switch (color) {
      case 'cyan': return { bg: 'bg-cyan-500/10 border-cyan-500/30 text-cyan-400', hover: 'hover:border-cyan-500/50 hover:bg-cyan-500/5', fill: 'bg-cyan-500' };
      case 'emerald': return { bg: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400', hover: 'hover:border-emerald-500/50 hover:bg-emerald-500/5', fill: 'bg-emerald-500' };
      case 'amber': return { bg: 'bg-amber-500/10 border-amber-500/30 text-amber-400', hover: 'hover:border-amber-500/50 hover:bg-amber-500/5', fill: 'bg-amber-500' };
      case 'indigo': return { bg: 'bg-indigo-500/10 border-indigo-500/30 text-indigo-400', hover: 'hover:border-indigo-500/50 hover:bg-indigo-500/5', fill: 'bg-indigo-500' };
      case 'rose': return { bg: 'bg-rose-500/10 border-rose-500/30 text-rose-400', hover: 'hover:border-rose-500/50 hover:bg-rose-500/5', fill: 'bg-rose-500' };
      case 'sky': return { bg: 'bg-sky-500/10 border-sky-500/30 text-sky-400', hover: 'hover:border-sky-500/50 hover:bg-sky-500/5', fill: 'bg-sky-500' };
      default: return { bg: 'bg-primary/10 border-primary/30 text-primary', hover: 'hover:border-primary/50 hover:bg-primary/5', fill: 'bg-primary' };
    }
  };

  // Filter list
  const filteredApps = webApps.filter(app => {
    const isFav = favorites.includes(app.id);
    const matchesCategory = activeCategory === 'All' 
      || (activeCategory === 'Favorites' && isFav)
      || app.category === activeCategory;
    
    const term = searchQuery.toLowerCase();
    const nameMatch = app.name.toLowerCase().includes(term);
    const descEnMatch = app.description_en.toLowerCase().includes(term);
    const descSoMatch = app.description_so.toLowerCase().includes(term);
    
    return matchesCategory && (nameMatch || descEnMatch || descSoMatch);
  });

  const categories = ['All', 'Favorites', 'Mapping & GIS', 'Remote Sensing', 'Land & Surveying', 'Surveying Utilities'];

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 pb-12">
      {/* Top Banner Section */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 p-6 border border-border/50 rounded-2xl bg-card relative overflow-hidden shadow-xl">
        <div className="absolute inset-0 bg-grid-pattern opacity-5 pointer-events-none" />
        <div className="relative z-10 flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/30 flex items-center justify-center text-primary shadow-[0_0_15px_rgba(6,182,212,0.15)]">
            <Globe className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight">
              {language === 'so' ? 'Hub-ka Codsiyada Web-ka' : 'Geospatial Web Applications Hub'}
            </h2>
            <p className="text-sm text-muted-foreground max-w-xl">
              {language === 'so' 
                ? 'Ku gal khariidadaha, dayax-gacmeedka Copernicus, diiwaangelinta canshuuraha iyo qalabka xisaabinta geodetic si toos ah oo la isku xidhay.' 
                : 'Access cadastral portals, remote sensing imagery, custom GIS links, and surveying conversion toolkits natively inside your survey manager.'}
            </p>
          </div>
        </div>

        <button 
          onClick={() => setIsCreateOpen(true)}
          className="relative z-10 flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:opacity-90 transition-all shadow-lg hover:shadow-primary/20 active:scale-95 self-start md:self-auto"
        >
          <Plus className="w-4 h-4" />
          {language === 'so' ? 'Ku Dar App Cusub' : 'Register Web App'}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Left 2 Columns: Application Grid & Filters */}
        <div className="lg:col-span-2 space-y-6">
          {/* Controls Bar */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            {/* Horizontal Categories */}
            <div className="flex gap-1.5 overflow-x-auto pb-2 md:pb-0 no-scrollbar max-w-full">
              {categories.map((cat) => {
                const label = language === 'so' 
                  ? (cat === 'All' ? 'Dhammaan' : cat === 'Favorites' ? 'Xulshadaada' : cat) 
                  : cat;
                const isActive = activeCategory === cat;
                return (
                  <button
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all border ${
                      isActive 
                        ? 'bg-primary/15 text-primary border-primary/30' 
                        : 'bg-card text-muted-foreground border-border/50 hover:bg-sidebar-accent/50 hover:text-white'
                    }`}
                  >
                    {label}
                  </button>
                );
              })}
            </div>

            {/* Search */}
            <div className="relative w-full md:w-64">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder={language === 'so' ? 'Raadi codsi...' : 'Search applications...'}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-xs rounded-xl bg-card border border-border/60 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary text-white placeholder:text-muted-foreground/60 transition-colors"
              />
            </div>
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <AnimatePresence mode="popLayout">
              {filteredApps.map((app) => {
                const colors = getColorClass(app.color);
                const isFav = favorites.includes(app.id);
                const desc = language === 'so' ? app.description_so : app.description_en;

                return (
                  <motion.div
                    layout
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    key={app.id}
                    onClick={() => setPreviewApp(app)}
                    className={`p-5 rounded-2xl bg-card border border-border/60 hover:border-border transition-all duration-300 relative group cursor-pointer flex flex-col justify-between h-[210px] shadow-md hover:shadow-lg`}
                  >
                    <div>
                      {/* Top bar of card */}
                      <div className="flex items-start justify-between">
                        <div className={`w-10 h-10 rounded-xl ${colors.bg} border flex items-center justify-center transition-all group-hover:scale-105`}>
                          {renderIcon(app.icon)}
                        </div>
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={(e) => toggleFavorite(app.id, e)}
                            className={`p-2 rounded-lg transition-colors border ${
                              isFav 
                                ? 'bg-rose-500/10 text-rose-400 border-rose-500/20' 
                                : 'bg-sidebar-accent/30 text-muted-foreground border-transparent hover:text-rose-400 hover:bg-rose-500/5'
                            }`}
                          >
                            <Heart className={`w-4 h-4 ${isFav ? 'fill-current' : ''}`} />
                          </button>
                          
                          {/* Trash button for custom webapps */}
                          {(!defaultWebApps.some(d => d.id === app.id) || currentUser?.role === 'Maamulaha') && (
                            <button
                              onClick={(e) => handleDeleteApp(app.id, app.name, e)}
                              className="p-2 rounded-lg bg-sidebar-accent/30 text-muted-foreground border border-transparent hover:text-rose-400 hover:border-rose-500/20 hover:bg-rose-500/5 transition-all opacity-0 group-hover:opacity-100"
                              title="Delete Application"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Title and description */}
                      <div className="mt-4 space-y-1">
                        <h3 className="text-sm font-bold text-white group-hover:text-primary transition-colors flex items-center gap-1.5">
                          {app.name}
                        </h3>
                        <p className="text-xs text-muted-foreground line-clamp-2">
                          {desc}
                        </p>
                      </div>
                    </div>

                    {/* Bottom Status metadata */}
                    <div className="flex items-center justify-between pt-4 border-t border-border/30 mt-auto">
                      <span className="text-[10px] font-semibold text-muted-foreground/80 uppercase bg-sidebar-accent/40 px-2 py-1 rounded-md">
                        {app.category}
                      </span>
                      <div className="flex items-center gap-1 text-[11px] font-bold text-primary group-hover:translate-x-1 transition-transform">
                        <span>{language === 'so' ? 'Ka Fur' : 'Launch'}</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>

            {filteredApps.length === 0 && (
              <div className="col-span-2 text-center py-16 bg-card rounded-2xl border border-border/40 p-8">
                <Globe className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
                <h4 className="text-sm font-bold text-white">
                  {language === 'so' ? 'Ma jiro codsiyo la helay' : 'No Webapps Found'}
                </h4>
                <p className="text-xs text-muted-foreground mt-1 max-w-md mx-auto">
                  {language === 'so' 
                    ? 'Isku day inaad bedesho filtarka ama aad ku darto codsi cusub adoo isticmaalaya badhanka midigta sare.' 
                    : 'Try checking your search keyword, choosing another category, or register a custom engineering link.'}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Right 1 Column: Interactive UTM Converter Widget */}
        <div className="space-y-6">
          <div className="p-6 border border-border/50 rounded-2xl bg-card shadow-lg relative overflow-hidden">
            <div className="absolute inset-0 bg-grid-pattern opacity-5 pointer-events-none" />
            
            <div className="relative z-10 flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
                <Calculator className="w-5 h-5 animate-spin-slow" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white tracking-tight">
                  {language === 'so' ? 'UTM Isuduwe Projector' : 'UTM Coordinate Projector'}
                </h3>
                <p className="text-[11px] text-muted-foreground">
                  {language === 'so' ? 'Sahan & Geodetic Converter' : 'WGS84 GPS to Somalia UTM Projection'}
                </p>
              </div>
            </div>

            {/* Inputs */}
            <div className="space-y-3 relative z-10">
              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1 block">
                  {language === 'so' ? 'Latitude (Loolka - Waqooyi/Koonfur)' : 'Latitude (N/S)'}
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-2.5 w-3.5 h-3.5 text-muted-foreground" />
                  <input
                    type="number"
                    step="any"
                    value={convLat}
                    onChange={(e) => setConvLat(e.target.value)}
                    placeholder="e.g. 2.0469"
                    className="w-full pl-9 pr-4 py-2 text-xs rounded-xl bg-sidebar/50 border border-border/60 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary text-white font-mono placeholder:text-muted-foreground/40 transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1 block">
                  {language === 'so' ? 'Longitude (Dhighedka - Bari/Galbeed)' : 'Longitude (E/W)'}
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-2.5 w-3.5 h-3.5 text-muted-foreground" />
                  <input
                    type="number"
                    step="any"
                    value={convLng}
                    onChange={(e) => setConvLng(e.target.value)}
                    placeholder="e.g. 45.3182"
                    className="w-full pl-9 pr-4 py-2 text-xs rounded-xl bg-sidebar/50 border border-border/60 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary text-white font-mono placeholder:text-muted-foreground/40 transition-colors"
                  />
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={calculateUTM}
                  className="w-full py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-amber-950 font-bold text-xs transition-all shadow-md active:scale-95 flex items-center justify-center gap-1.5"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  {language === 'so' ? 'Xisaabi UTM Isuduwe' : 'Project coordinates'}
                </button>
              </div>
            </div>

            {/* Output Results */}
            {utmResult && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-5 p-4 rounded-xl bg-sidebar/40 border border-border/50 space-y-3 relative z-10"
              >
                <div className="flex justify-between items-center pb-2 border-b border-border/30">
                  <span className="text-[10px] font-bold text-muted-foreground uppercase">{language === 'so' ? 'Sone-ka' : 'UTM Grid Zone'}</span>
                  <span className="text-xs font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-md border border-amber-500/20">{utmResult.zone}</span>
                </div>

                <div className="grid grid-cols-2 gap-3 font-mono">
                  <div className="p-2 rounded bg-card border border-border/30">
                    <span className="text-[9px] uppercase tracking-widest text-muted-foreground block mb-0.5">{language === 'so' ? 'Bari (Easting)' : 'Easting (E)'}</span>
                    <span className="text-xs font-bold text-white text-glow-amber">{utmResult.easting} m</span>
                  </div>
                  <div className="p-2 rounded bg-card border border-border/30">
                    <span className="text-[9px] uppercase tracking-widest text-muted-foreground block mb-0.5">{language === 'so' ? 'Waqooyi (Northing)' : 'Northing (N)'}</span>
                    <span className="text-xs font-bold text-white text-glow-amber">{utmResult.northing} m</span>
                  </div>
                </div>

                <div className="text-[10px] text-muted-foreground space-y-1 bg-card/40 p-2.5 rounded border border-border/25">
                  <div className="flex justify-between">
                    <span>{language === 'so' ? 'Goobta Sahanka:' : 'Coverage Area:'}</span>
                    <span className="text-white font-semibold text-right max-w-[150px] overflow-hidden text-ellipsis whitespace-nowrap">{utmResult.region}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>{language === 'so' ? 'Daatumka:' : 'Geodetic Datum:'}</span>
                    <span className="text-white font-semibold">{utmResult.datum}</span>
                  </div>
                </div>
              </motion.div>
            )}
          </div>

          {/* Guidelines Box */}
          <div className="p-5 border border-border/40 rounded-2xl bg-card relative overflow-hidden text-xs">
            <h4 className="font-bold text-white flex items-center gap-1.5 mb-2">
              <BookOpen className="w-4 h-4 text-primary" />
              {language === 'so' ? 'Tilmaamaha Sahanka Soomaaliya' : 'Somalia Grid Guidelines'}
            </h4>
            <ul className="space-y-2 text-muted-foreground list-disc pl-4 text-[11px]">
              <li>{language === 'so' ? 'Magaalada Kismayo iyo Jubada Hoose waxay ku yaalaan Sone-ka 37N.' : 'Kismayo and Southern regions mostly fall inside UTM Grid Zone 37N.'}</li>
              <li>{language === 'so' ? 'Mogadishu, Hargeisa, Garowe iyo inta badan dalka waxay ku jiraan Sone-ka 38N.' : 'Mogadishu, Hargeisa, Garowe, and Central plains are projected inside Grid Zone 38N.'}</li>
              <li>{language === 'so' ? 'Bosaso, Guardafui iyo qaybta Bari ee Bari waxay galaan Sone-ka 39N.' : 'Bosaso and East Bari cape fall inside UTM Grid Zone 39N.'}</li>
              <li>{language === 'so' ? 'Sahan kasta oo canshuur dhul ah (cadastral) waa inuu tixraaco WGS84.' : 'All land surveyors in Somalia must standardise CAD formats on WGS84.'}</li>
            </ul>
          </div>
        </div>
      </div>

      {/* MODAL: Launch / Web Sandbox Preview Modal */}
      <AnimatePresence>
        {previewApp && (
          <div className="fixed inset-0 bg-background/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-6xl h-[85vh] bg-card border border-border rounded-3xl overflow-hidden flex flex-col shadow-2xl relative"
            >
              {/* Modal Header */}
              <div className="px-6 py-4 border-b border-border bg-sidebar-accent/40 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl ${getColorClass(previewApp.color).bg} border flex items-center justify-center`}>
                    {renderIcon(previewApp.icon)}
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white">{previewApp.name}</h3>
                    <p className="text-[11px] text-muted-foreground font-mono truncate max-w-md md:max-w-xl">{previewApp.url}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <a 
                    href={previewApp.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-bold hover:opacity-90 transition-all shadow"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>{language === 'so' ? 'Ku Fur Tab Cusub' : 'Open in New Tab'}</span>
                  </a>
                  <button 
                    onClick={() => setPreviewApp(null)}
                    className="p-2 rounded-lg bg-sidebar-accent hover:bg-sidebar-accent/80 text-white transition-colors border border-border"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Modal Body / Iframe Viewport with Warning */}
              <div className="flex-1 bg-sidebar relative flex flex-col">
                <div className="p-4 bg-amber-500/10 border-b border-amber-500/20 text-xs text-amber-400 flex items-center gap-2 shrink-0">
                  <Info className="w-4 h-4 shrink-0" />
                  <p>
                    {language === 'so' 
                      ? 'Fadlan la soco: Mareegaha qaarkood ma ogola iframe-yada sababo amni awgood (X-Frame-Options). Markay taasi dhacdo, badhanka kore u isticmaal si aad ugu furto tab cusub.' 
                      : 'Please note: Some systems deny iframe loading due to strict browser security policies. If the portal remains blank, use the button on the right to Open in New Tab.'}
                  </p>
                </div>

                {/* Actual App IFrame Previewer */}
                <iframe 
                  src={previewApp.url} 
                  title={previewApp.name}
                  className="w-full flex-1 bg-white border-none"
                  sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
                  referrerPolicy="no-referrer"
                />
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL: Register New App Form */}
      <AnimatePresence>
        {isCreateOpen && (
          <div className="fixed inset-0 bg-background/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-lg bg-card border border-border rounded-2xl overflow-hidden shadow-2xl"
            >
              <div className="px-6 py-4 border-b border-border flex items-center justify-between">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-primary" />
                  {language === 'so' ? 'Diiwaangeli Codsi Web' : 'Register Custom Web Application'}
                </h3>
                <button 
                  onClick={() => setIsCreateOpen(false)}
                  className="p-1.5 rounded-lg hover:bg-sidebar-accent text-muted-foreground hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCreateApp} className="p-6 space-y-4">
                <div>
                  <label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-1 block">
                    {language === 'so' ? 'Magaca Codsiga' : 'Application Name'} *
                  </label>
                  <input
                    type="text"
                    required
                    value={newAppName}
                    onChange={(e) => setNewAppName(e.target.value)}
                    placeholder="e.g. Bosaso Land Registry"
                    className="w-full px-4 py-2 text-xs rounded-xl bg-sidebar/60 border border-border/60 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary text-white transition-colors"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-1 block">
                    {language === 'so' ? 'Mareegta URL-ka' : 'Website URL'} *
                  </label>
                  <input
                    type="text"
                    required
                    value={newAppUrl}
                    onChange={(e) => setNewAppUrl(e.target.value)}
                    placeholder="e.g. openstreetmap.org"
                    className="w-full px-4 py-2 text-xs rounded-xl bg-sidebar/60 border border-border/60 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary text-white font-mono transition-colors"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-1 block">
                      {language === 'so' ? 'Qaybta' : 'Category'}
                    </label>
                    <select
                      value={newAppCategory}
                      onChange={(e) => setNewAppCategory(e.target.value)}
                      className="w-full px-4 py-2 text-xs rounded-xl bg-sidebar/60 border border-border/60 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary text-white transition-colors"
                    >
                      <option value="Mapping & GIS">Mapping & GIS</option>
                      <option value="Remote Sensing">Remote Sensing</option>
                      <option value="Land & Surveying">Land & Surveying</option>
                      <option value="Surveying Utilities">Surveying Utilities</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-1 block">
                      {language === 'so' ? 'Astaanta (Icon)' : 'Icon Style'}
                    </label>
                    <select
                      value={newAppIcon}
                      onChange={(e) => setNewAppIcon(e.target.value)}
                      className="w-full px-4 py-2 text-xs rounded-xl bg-sidebar/60 border border-border/60 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary text-white transition-colors"
                    >
                      <option value="Globe">Globe (Kuwada dhan)</option>
                      <option value="Map">Map (Khariidad)</option>
                      <option value="Compass">Compass (Abaaro)</option>
                      <option value="Orbit">Orbit (Dayaxgacmeed)</option>
                      <option value="Layers">Layers (Lakabyo)</option>
                      <option value="FileCode">CAD / Blueprint</option>
                      <option value="Anchor">Maritime / Port</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-1 block">
                      {language === 'so' ? 'Midabka Call-Out-ka' : 'Theme Color'}
                    </label>
                    <select
                      value={newAppColor}
                      onChange={(e) => setNewAppColor(e.target.value)}
                      className="w-full px-4 py-2 text-xs rounded-xl bg-sidebar/60 border border-border/60 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary text-white transition-colors"
                    >
                      <option value="cyan">Cyan / Sea</option>
                      <option value="emerald">Emerald / Green</option>
                      <option value="amber">Amber / Gold</option>
                      <option value="sky">Sky / Light Blue</option>
                      <option value="indigo">Indigo / Royal</option>
                      <option value="rose">Rose / Coral</option>
                    </select>
                  </div>

                  <div className="flex items-center justify-center p-2 rounded-xl border border-dashed border-border/40 mt-5">
                    <span className="text-[10px] text-muted-foreground">
                      Preview: 
                    </span>
                    <div className={`ml-3 w-8 h-8 rounded-lg ${getColorClass(newAppColor).bg} border flex items-center justify-center`}>
                      {renderIcon(newAppIcon, "w-4 h-4")}
                    </div>
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-1 block">
                    {language === 'so' ? 'Sharaxaadda Ingiriisiga' : 'Description (English)'}
                  </label>
                  <textarea
                    rows={2}
                    value={newAppDescEn}
                    onChange={(e) => setNewAppDescEn(e.target.value)}
                    placeholder="Brief details about what the app handles..."
                    className="w-full px-4 py-2 text-xs rounded-xl bg-sidebar/60 border border-border/60 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary text-white transition-colors resize-none"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-1 block">
                    {language === 'so' ? 'Sharaxaadda Soomaaliga' : 'Description (Somali)'}
                  </label>
                  <textarea
                    rows={2}
                    value={newAppDescSo}
                    onChange={(e) => setNewAppDescSo(e.target.value)}
                    placeholder="Faahfaahin kooban oo ku saabsan codsiga..."
                    className="w-full px-4 py-2 text-xs rounded-xl bg-sidebar/60 border border-border/60 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary text-white transition-colors resize-none"
                  />
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsCreateOpen(false)}
                    className="flex-1 py-2.5 rounded-xl border border-border text-xs text-muted-foreground hover:bg-sidebar-accent hover:text-white font-semibold transition-all"
                  >
                    {language === 'so' ? 'Ka Noqo' : 'Cancel'}
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2.5 rounded-xl bg-primary text-primary-foreground text-xs font-semibold hover:opacity-90 transition-all shadow-md"
                  >
                    {language === 'so' ? 'Kaydi' : 'Save Application'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
