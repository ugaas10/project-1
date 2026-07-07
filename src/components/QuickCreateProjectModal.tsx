import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, Sparkles, Map, Briefcase, Workflow, MapPin, User, DollarSign, 
  Calendar, Loader2, ChevronLeft, ChevronRight, Layers, Cpu, 
  Compass, Activity, Database, Info 
} from 'lucide-react';
import { useToast } from './Toast';

export interface QuickCreateProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: { name: string } | null;
  onProjectCreate: (project: any) => void;
}

const templates = [
  {
    id: 'topo',
    title: 'Topographical Survey',
    description: 'Establish terrain mapping layout, elevation benchmarks, contours and GPS controls.',
    color: '#06b6d4',
    badge: 'Terrain / Contours',
    icon: Map,
    defaultNamePrefix: 'Topo_Layout_Zone_',
    milestones: [
      { label: 'Site Init', status: 'active', width: '25%' },
      { label: 'Topo Scan', status: 'todo', width: '25%' },
      { label: 'Contours mapping', status: 'todo', width: '25%' },
      { label: 'Stakeout Delivery', status: 'todo', width: '25%' }
    ],
    budget: '$35,000',
    daysRemaining: 15
  },
  {
    id: 'cadastral',
    title: 'Plat Boundary Mapping',
    description: 'Deed verification, property subdivision layouts, parcel boundary marking & legal filings.',
    color: '#34d399',
    badge: 'Legal / Deed Plot',
    icon: Briefcase,
    defaultNamePrefix: 'Boundary_Plot_Plat_',
    milestones: [
      { label: 'Registry Check', status: 'active', width: '33%' },
      { label: 'Field Spotting', status: 'todo', width: '33%' },
      { label: 'Submit Deeds', status: 'todo', width: '33%' }
    ],
    budget: '$18,000',
    daysRemaining: 10
  },
  {
    id: 'road',
    title: 'Infrastructure Corridor',
    description: 'Centerline alignment, cross-section grades, depth profiles, & hydrology drainage planning.',
    color: '#fbbf24',
    badge: 'Highway / Route',
    icon: Workflow,
    defaultNamePrefix: 'Corridor_Extension_A',
    milestones: [
      { label: 'Route Flights', status: 'active', width: '33%' },
      { label: 'Cross Sections', status: 'todo', width: '33%' },
      { label: 'Design Printout', status: 'todo', width: '33%' }
    ],
    budget: '$95,000',
    daysRemaining: 45
  }
];

const templatePreviews: Record<string, Array<{
  title: string;
  subtitle: string;
  type: 'workflow' | 'layers' | 'hardware';
  content: any;
}>> = {
  topo: [
    {
      title: 'Workflow Execution Stages',
      subtitle: 'Phased topographical pipeline',
      type: 'workflow',
      content: [
        { phase: '01', title: 'GNSS Control Network', desc: 'Siting dual-frequency RTK base coordinates.' },
        { phase: '02', title: 'Dense Point Cloud Acquisition', desc: 'Aerial UAV photogrammetry photopolite surveys.' },
        { phase: '03', title: 'Grid Contour Vectorization', desc: 'Extracting 0.5m elevation contours to CAD formats.' },
        { phase: '04', title: 'QA Verification', desc: 'Validating spot heights against local benchmark markers.' }
      ]
    },
    {
      title: 'Auto-Provisioned GIS Layer Schema',
      subtitle: 'Secure workspace default geo-files',
      type: 'layers',
      content: [
        { file: 'TOPO_INDEX_CONTOURS.dwg', size: '4.2 MB', desc: 'Major 5-meter index contours with elevations text' },
        { file: 'TOPO_INTERM_CONTOURS.dwg', size: '8.9 MB', desc: 'Minor 0.5-meter survey interval relief curves' },
        { file: 'GNSS_GROUND_CONTROLS.shp', size: '120 KB', desc: 'Ground base reference coordinates for GIS systems' },
        { file: 'SURFACE_MESH_DTM.dxf', size: '15.4 MB', desc: '3D Digital Terrain Model surface triangulations' }
      ]
    },
    {
      title: 'Hardware & Survey Telemetry',
      subtitle: 'Optimized hardware configurations',
      type: 'hardware',
      content: {
        receiver: 'Leica GS18 T SmartAntenna',
        drone: 'DJI Matrice 350 RTK (L2 LiDAR)',
        precision: 'H: ±15mm, V: ±25mm',
        format: 'LAS Point Cloud & DWG curves'
      }
    }
  ],
  cadastral: [
    {
      title: 'Workflow Execution Stages',
      subtitle: 'Plat boundary mapping stages',
      type: 'workflow',
      content: [
        { phase: '01', title: 'Historical Deed Retrieval', desc: 'Extracting municipal deeds and survey boundaries.' },
        { phase: '02', title: 'Iron Pin Boundary Recovery', desc: 'Physical stationing and identifying boundary corners.' },
        { phase: '03', title: 'Survey Mathematical Closure', desc: 'Calculating errors of closure with rigorous standard deviations.' },
        { phase: '04', title: 'Deed Plat Layout Drafting', desc: 'Compiling legal drawings for municipal filings.' }
      ]
    },
    {
      title: 'Auto-Provisioned GIS Layer Schema',
      subtitle: 'Secure workspace default geo-files',
      type: 'layers',
      content: [
        { file: 'PROPERTY_PARCEL_LIMITS.shp', size: '410 KB', desc: 'Metes and bounds polygon shapes for property boundaries' },
        { file: 'EASEMENTS_SETBACKS.dwg', size: '1.4 MB', desc: 'Right-of-ways and municipal utilities corridors' },
        { file: 'LOT_CORNER_MONUMENTS.dxf', size: '85 KB', desc: 'GPS-measured coordinate marker layouts' },
        { file: 'LEGAL_BOUNDS_DESC.docx', size: '45 KB', desc: 'Autogenerated legal property boundary descriptions' }
      ]
    },
    {
      title: 'Hardware & Survey Telemetry',
      subtitle: 'Optimized hardware configurations',
      type: 'hardware',
      content: {
        receiver: 'Trimble S7 Robotic Total Station',
        drone: 'Not required for standard plat surveys',
        precision: 'Angular Accuracy: 2 Arc-Seconds',
        format: 'CAD Dwg & COGO coordinate tables'
      }
    }
  ],
  road: [
    {
      title: 'Workflow Execution Stages',
      subtitle: 'Corridor alignment phases',
      type: 'workflow',
      content: [
        { phase: '01', title: 'Horizontal Centerline Layout', desc: 'Drafting main curves, tangents and coordinate alignments.' },
        { phase: '02', title: 'Transverse Cross-Sections', desc: 'Extracting vertical profiles at constant 20m interval stakes.' },
        { phase: '03', title: 'Hydrology & Runoff Analysis', desc: 'Mapping culverts, flow direction lines and concrete barriers.' },
        { phase: '04', title: 'Excavation Mass-Haul Report', desc: 'Exporting cut-and-fill soil volumes to CSV profiles.' }
      ]
    },
    {
      title: 'Auto-Provisioned GIS Layer Schema',
      subtitle: 'Secure workspace default geo-files',
      type: 'layers',
      content: [
        { file: 'ROAD_CENTERLINE_ALIGN.dwg', size: '2.8 MB', desc: 'Geometric baseline curves with station labels' },
        { file: 'PROFILE_GRADE_PROFILES.dwg', size: '5.2 MB', desc: 'Vertical elevation alignments & cross grades cuts' },
        { file: 'HYDRO_DRAINAGE_MAP.shp', size: '1.1 MB', desc: 'Hydraulics layout, catch basins, & culvert vectors' },
        { file: 'MASS_HAUL_SOIL_PROFILE.csv', size: '850 KB', desc: 'Tabular soil volume cut/fill statistics data' }
      ]
    },
    {
      title: 'Hardware & Survey Telemetry',
      subtitle: 'Optimized hardware configurations',
      type: 'hardware',
      content: {
        receiver: 'Trimble R12i GNSS Receiver System',
        drone: 'WingtraOne Gen II VTOL fixed-wing drone',
        precision: 'Elevation Grade Resolution: <30mm',
        format: 'Civil 3D LandXML Alignment Profiles'
      }
    }
  ]
};

const locationCoordinates: Record<string, { lat: number; lng: number }> = {
  'Mogadishu, Somalia': { lat: 2.0469, lng: 45.3182 },
  'Hargeisa, Somalia': { lat: 9.5624, lng: 44.0770 },
  'Kismayo, Somalia': { lat: -0.3582, lng: 42.5454 },
  'Berbera, Somalia': { lat: 10.4396, lng: 45.0135 },
  'Garowe, Somalia': { lat: 8.4064, lng: 48.4818 }
};

export function QuickCreateProjectModal({ isOpen, onClose, currentUser, onProjectCreate }: QuickCreateProjectModalProps) {
  const [selectedTemplateId, setSelectedTemplateId] = useState(templates[0].id);
  const [projectName, setProjectName] = useState('');
  const [location, setLocation] = useState('Mogadishu, Somalia');
  const [engineer, setEngineer] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const { showToast } = useToast();

  const selectedTemplate = templates.find(t => t.id === selectedTemplateId) || templates[0];
  const previews = templatePreviews[selectedTemplateId] || templatePreviews.topo;
  const slide = previews[currentSlideIndex] || previews[0];

  // Auto-generate name and default engineer, reset carousel on template click
  useEffect(() => {
    if (isOpen) {
      const rand = Math.floor(100 + Math.random() * 900);
      setProjectName(`${selectedTemplate.defaultNamePrefix}${rand}`);
      setEngineer(currentUser?.name || 'Eng. Mohamed Ali');
      setCurrentSlideIndex(0);
    }
  }, [selectedTemplateId, isOpen, currentUser]);

  if (!isOpen) return null;

  const handleNextSlide = () => {
    setCurrentSlideIndex((prev) => (prev + 1) % previews.length);
  };

  const handlePrevSlide = () => {
    setCurrentSlideIndex((prev) => (prev - 1 + previews.length) % previews.length);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectName.trim()) {
      showToast('Fadlan geli magaca mashruuca', 'error');
      return;
    }

    setIsCreating(true);
    showToast(`Initializing ${selectedTemplate.title} shell template...`, 'info');

    // Artificial delay for immersive visual experience
    await new Promise(resolve => setTimeout(resolve, 1400));

    const coords = locationCoordinates[location] || { lat: 2.0469, lng: 45.3182 };

    const newProject = {
      id: Date.now(),
      name: projectName,
      location: location,
      lat: coords.lat,
      lng: coords.lng,
      status: 'active',
      health: 'On Track',
      progress: 0,
      docRate: 0,
      budget: selectedTemplate.budget,
      daysRemaining: selectedTemplate.daysRemaining,
      engineer: engineer || 'Unassigned',
      milestones: selectedTemplate.milestones,
      docs: 0,
      date: new Date().toISOString().split('T')[0],
      bg: selectedTemplate.color === '#06b6d4' ? 'bg-primary/5' : selectedTemplate.color === '#34d399' ? 'bg-cyan-500/5' : 'bg-amber-500/5',
      color: selectedTemplate.color,
      desc: selectedTemplate.description,
      coords: `${coords.lat > 0 ? coords.lat.toFixed(4) + '°N' : Math.abs(coords.lat).toFixed(4) + '°S'}, ${coords.lng.toFixed(4)}°E`,
      users: 1,
      pending: 0
    };

    onProjectCreate(newProject);
    setIsCreating(false);
    showToast(`Project shell "${projectName}" initialized successfully!`, 'success');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[5000] flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-background/90 backdrop-blur-sm"
      />
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        transition={{ duration: 0.2 }}
        className="bg-card border border-border rounded-2xl shadow-2xl w-full max-w-5xl relative z-[5001] overflow-hidden flex flex-col max-h-[92vh]"
      >
        {/* Header */}
        <div className="p-6 border-b border-border flex items-center justify-between bg-muted/10">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-primary/10 rounded-xl">
              <Sparkles className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white tracking-tight">Quick Project Shell Creator</h3>
              <p className="text-[11px] text-muted-foreground uppercase font-bold tracking-widest mt-0.5">
                Generate Instant CAD/GIS Workspaces with Structure Preview
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-muted text-muted-foreground transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Dynamic Multi-Column Workspace with Layout Preview */}
        <form onSubmit={handleCreate} className="flex-1 flex flex-col overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-12 overflow-hidden flex-1 max-h-[calc(92vh-100px)]">
            
            {/* Left Column: Form Controls */}
            <div className="lg:col-span-7 overflow-y-auto p-6 md:p-8 space-y-6 border-r border-border/40">
              
              {/* Step 1: Select Template */}
              <div className="space-y-3">
                <label className="text-[10px] font-bold uppercase tracking-[0.15em] text-muted-foreground/80 block">
                  1. Choose Project Template
                </label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {templates.map(tmpl => {
                    const IconComponent = tmpl.icon;
                    const isSelected = selectedTemplateId === tmpl.id;
                    return (
                      <div 
                        key={tmpl.id}
                        onClick={() => setSelectedTemplateId(tmpl.id)}
                        className={`p-4 rounded-xl border transition-all cursor-pointer flex flex-col justify-between text-left relative overflow-hidden group ${
                          isSelected 
                            ? 'border-primary bg-primary/5 shadow-lg shadow-primary/5' 
                            : 'border-border/60 hover:border-primary/40 bg-sidebar/20'
                        }`}
                      >
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <div className={`p-2 rounded-lg ${isSelected ? 'bg-primary/20 text-primary' : 'bg-muted text-muted-foreground group-hover:text-white'}`}>
                              <IconComponent className="w-4 h-4" />
                            </div>
                            <span className="text-[8px] font-bold uppercase tracking-widest border px-1.5 py-0.5 rounded-full" style={{ color: tmpl.color, borderColor: `${tmpl.color}30`, backgroundColor: `${tmpl.color}08` }}>
                              {tmpl.badge}
                            </span>
                          </div>
                          <h4 className="text-[13px] font-bold text-white leading-tight">{tmpl.title}</h4>
                          <p className="text-[11px] text-muted-foreground leading-relaxed italic line-clamp-3">
                            {tmpl.description}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Step 2: Configure Workspace */}
              <div className="space-y-4 pt-4 border-t border-border/30">
                <label className="text-[10px] font-bold uppercase tracking-[0.15em] text-muted-foreground/80 block">
                  2. Shell Details & Metadata
                </label>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-1">
                      <Workflow className="w-3.5 h-3.5 text-primary/70" /> Project Name / Code
                    </label>
                    <input 
                      type="text"
                      required
                      value={projectName}
                      onChange={(e) => setProjectName(e.target.value)}
                      placeholder="e.g. Survey_Sool_Zone4"
                      className="w-full bg-sidebar border border-border/80 rounded-lg px-4 py-2.5 text-xs text-white outline-none focus:border-primary/60 transition-colors"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-primary/70" /> Survey Location
                    </label>
                    <select 
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      className="w-full bg-sidebar border border-border/80 rounded-lg px-4 py-2.5 text-xs text-white outline-none focus:border-primary/60 transition-colors"
                    >
                      <option>Mogadishu, Somalia</option>
                      <option>Hargeisa, Somalia</option>
                      <option>Berbera, Somalia</option>
                      <option>Kismayo, Somalia</option>
                      <option>Garowe, Somalia</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-1">
                      <User className="w-3.5 h-3.5 text-primary/70" /> Assigned Lead Engineer
                    </label>
                    <input 
                      type="text"
                      required
                      value={engineer}
                      onChange={(e) => setEngineer(e.target.value)}
                      placeholder="Lead Surveyor/Engineer name"
                      className="w-full bg-sidebar border border-border/80 rounded-lg px-4 py-2.5 text-xs text-white outline-none focus:border-primary/60 transition-colors"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-1">
                        <DollarSign className="w-3.5 h-3.5 text-emerald-500/75" /> Est. Budget
                      </label>
                      <div className="bg-sidebar/50 border border-border/80 rounded-lg px-4 py-2.5 text-xs text-emerald-400 font-bold font-mono">
                        {selectedTemplate.budget}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-amber-500/75" /> Duration
                      </label>
                      <div className="bg-sidebar/50 border border-border/80 rounded-lg px-4 py-2.5 text-xs text-amber-400 font-bold font-mono">
                        {selectedTemplate.daysRemaining} days
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-primary/5 rounded-xl border border-primary/10 p-4 space-y-2 text-left">
                <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-primary block">
                  Automated Milestones Initialized:
                </span>
                <div className="flex flex-wrap gap-2">
                  {selectedTemplate.milestones.map((m, idx) => (
                    <span key={idx} className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-tighter border ${
                      m.status === 'active' 
                        ? 'bg-primary/20 text-primary border-primary/30 font-black animate-pulse' 
                        : 'bg-muted/50 text-muted-foreground border-border/30'
                    }`}>
                      {m.label} ({m.status.toUpperCase()})
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Column: Structure Preview Carousel */}
            <div className="lg:col-span-5 bg-muted/20 p-6 md:p-8 flex flex-col justify-between overflow-y-auto border-t lg:border-t-0 border-border/20">
              <div className="space-y-5">
                
                {/* Title Section */}
                <div className="flex items-center justify-between border-b border-border/30 pb-3">
                  <div className="space-y-0.5">
                    <h4 className="text-xs font-bold text-white uppercase tracking-[0.12em] flex items-center gap-1.5">
                      <Layers className="w-4 h-4 text-primary" /> Template Blueprint Preview
                    </h4>
                    <p className="text-[10px] text-muted-foreground">Detailed layout specs before container creation</p>
                  </div>

                  {/* Indicator Page Badges */}
                  <div className="flex items-center gap-1">
                    {previews.map((_, idx) => (
                      <span 
                        key={idx} 
                        className={`h-1.5 rounded-full transition-all duration-300 ${
                          currentSlideIndex === idx ? 'w-4 bg-primary' : 'w-1.5 bg-border hover:bg-border-focus'
                        }`} 
                      />
                    ))}
                  </div>
                </div>

                {/* Sub-Header Slider Progress Banner */}
                <div className="flex items-center justify-between bg-sidebar/50 rounded-lg p-2.5 border border-border/30">
                  <button 
                    type="button"
                    onClick={handlePrevSlide}
                    className="p-1 px-1.5 rounded bg-muted/60 hover:bg-muted text-muted-foreground hover:text-white transition-colors"
                    title="Prevous Information"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>

                  <div className="text-center">
                    <span className="text-[10px] font-black tracking-widest text-primary block uppercase">
                      {slide.title}
                    </span>
                    <span className="text-[9px] text-muted-foreground italic font-medium">
                      {slide.subtitle} ({currentSlideIndex + 1} of {previews.length})
                    </span>
                  </div>

                  <button 
                    type="button"
                    onClick={handleNextSlide}
                    className="p-1 px-1.5 rounded bg-muted/60 hover:bg-muted text-muted-foreground hover:text-white transition-colors"
                    title="Next Information"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>

                {/* Main Slide Carousel Body with Animation */}
                <div className="min-h-[240px] bg-sidebar/30 rounded-2xl p-4 border border-border/20 relative flex flex-col justify-center">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={`${selectedTemplateId}-${currentSlideIndex}`}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.2 }}
                      className="w-full space-y-4"
                    >
                      {/* Slide Type: 'workflow' */}
                      {slide.type === 'workflow' && (
                        <div className="space-y-4 text-left">
                          {slide.content.map((item: any, idx: number) => (
                            <div key={idx} className="flex gap-3 items-start relative group">
                              {idx < slide.content.length - 1 && (
                                <span className="absolute left-[13px] top-[26px] bottom-[-18px] w-[1.5px] bg-border/30 group-hover:bg-primary/30 transition-colors" />
                              )}
                              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-primary/30 bg-primary/10 text-primary text-[10px] font-black tracking-tight font-mono shadow-[0_0_12px_rgba(6,182,212,0.15)]">
                                {item.phase}
                              </div>
                              <div className="space-y-0.5">
                                <h5 className="text-[12px] font-bold text-white tracking-wide">{item.title}</h5>
                                <p className="text-[11px] text-muted-foreground leading-relaxed italic opacity-75">{item.desc}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Slide Type: 'layers' */}
                      {slide.type === 'layers' && (
                        <div className="space-y-2.5">
                          {slide.content.map((item: any, idx: number) => (
                            <div key={idx} className="flex items-center justify-between p-2.5 rounded-lg bg-sidebar/40 border border-border/30 hover:border-primary/20 hover:bg-sidebar/60 transition-all text-left">
                              <div className="flex items-center gap-3 min-w-0">
                                <div className="p-1.5 bg-cyan-400/10 text-cyan-400 rounded-md shrink-0">
                                  <Layers className="w-3.5 h-3.5" />
                                </div>
                                <div className="min-w-0">
                                  <p className="text-[11px] font-mono font-bold text-white truncate max-w-[170px] lg:max-w-xs">{item.file}</p>
                                  <p className="text-[10px] text-muted-foreground italic line-clamp-1">{item.desc}</p>
                                </div>
                              </div>
                              <span className="text-[9px] font-mono font-bold text-muted-foreground bg-muted px-1.5 py-0.5 rounded shrink-0 ml-1">
                                {item.size}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Slide Type: 'hardware' */}
                      {slide.type === 'hardware' && (
                        <div className="space-y-3 font-mono text-[11px] text-muted-foreground text-left">
                          <div className="p-4 rounded-xl border border-border/20 bg-sidebar/20 space-y-3">
                            <div className="flex justify-between border-b border-border/10 pb-2 flex-wrap gap-1">
                              <span className="text-muted-foreground uppercase text-[9px] font-bold tracking-widest flex items-center gap-1">
                                <Cpu className="w-3.5 h-3.5 text-primary" /> Primary GNSS/RTK
                              </span>
                              <span className="text-white font-bold">{slide.content.receiver}</span>
                            </div>
                            
                            <div className="flex justify-between border-b border-border/10 pb-2 flex-wrap gap-1">
                              <span className="text-muted-foreground uppercase text-[9px] font-bold tracking-widest flex items-center gap-1">
                                <Compass className="w-3.5 h-3.5 text-primary" /> Aerial Platform
                              </span>
                              <span className="text-white font-bold">{slide.content.drone}</span>
                            </div>

                            <div className="flex justify-between border-b border-border/10 pb-2 flex-wrap gap-1">
                              <span className="text-muted-foreground uppercase text-[9px] font-bold tracking-widest flex items-center gap-1">
                                <Activity className="w-3.5 h-3.5 text-emerald-400" /> Accuracy Margin
                              </span>
                              <span className="text-emerald-400 font-bold">{slide.content.precision}</span>
                            </div>

                            <div className="flex justify-between pt-1 flex-wrap gap-1">
                              <span className="text-muted-foreground uppercase text-[9px] font-bold tracking-widest flex items-center gap-1">
                                <Database className="w-3.5 h-3.5 text-amber-500" /> Output Standard
                              </span>
                              <span className="text-amber-400 font-bold">{slide.content.format}</span>
                            </div>
                          </div>
                        </div>
                      )}
                    </motion.div>
                  </AnimatePresence>
                </div>
              </div>

              {/* Informative Help Box */}
              <div className="bg-primary/5 rounded-xl border border-primary/10 p-4 space-y-2 text-left mt-4">
                <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-primary flex items-center gap-1">
                  <Info className="w-3.5 h-3.5 text-primary" /> System Provisioning Policy
                </span>
                <p className="text-[11px] text-muted-foreground italic leading-relaxed">
                  Initializing the workspace secures local storage segments & enables real-time field survey synchronization.
                </p>
              </div>
            </div>

          </div>

          {/* Footer Submit / Cancel Controls */}
          <div className="p-6 border-t border-border flex justify-end gap-3 bg-muted/10">
            <button 
              type="button" 
              onClick={onClose}
              className="px-5 py-2.5 rounded-lg border border-border text-muted-foreground hover:bg-muted font-bold text-xs uppercase tracking-wider transition-colors"
            >
              Cancel
            </button>
            <button 
              type="submit"
              disabled={isCreating}
              className="bg-primary hover:opacity-90 active:scale-95 text-primary-foreground font-black uppercase tracking-widest text-xs px-6 py-2.5 rounded-lg shadow-[0_0_20px_rgba(6,182,212,0.25)] flex items-center gap-2 transition-all disabled:opacity-50"
            >
              {isCreating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Generating Shell...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  Initialize Project Shell
                </>
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
