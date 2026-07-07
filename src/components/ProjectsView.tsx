import React, { useState, useEffect, useRef } from 'react';
import { Briefcase, Map, Plus, ChevronRight, User, FileText, Calendar, Download, X, Upload, FileUp, Send, LayoutGrid, QrCode, Settings, Activity, Sparkles, Layers, Loader2, AlertTriangle, CheckCircle2, Trash2, ChevronDown, Heart, Search } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { ProjectProgressRing } from './ProjectProgressRing';
import { useToast } from './Toast';
import { QRLabelModal } from './QRLabelModal';
import { ProjectMap } from './ProjectMap';
import { ProjectSettingsModal } from './ProjectSettingsModal';
import { useOfflineCache } from '../hooks/useOfflineCache';
import { ConfirmationModal } from './ConfirmationModal';
import { ProjectBudgetVsSpendCard } from './ProjectBudgetVsSpendCard';
import { ProjectMiniMap } from './ProjectMiniMap';
import { supabase } from '../lib/supabase';

const projectsData = [
  { 
    id: 1, 
    name: 'Highway A42 Survey', 
    location: 'Mogadishu, Somalia', 
    lat: 2.0469, 
    lng: 45.3182,
    status: 'active', 
    health: 'On Track',
    progress: 75,
    docRate: 88,
    budget: '$45,000',
    budgetAmt: 45000,
    actualSpendAmt: 41200,
    daysRemaining: 12,
    engineer: 'Eng. Ahmed Ali',
    milestones: [
      { label: 'Site Init', status: 'done', width: '25%' },
      { label: 'Topo Scan', status: 'done', width: '25%' },
      { label: 'Analysis', status: 'active', width: '25%' },
      { label: 'Review', status: 'todo', width: '25%' },
    ],
    docs: 24,
    date: '2026-05-25',
    bg: 'bg-primary/5',
    color: '#06b6d4'
  },
  { 
    id: 2, 
    name: 'Commercial Complex Plot', 
    location: 'Hargeisa, Somalia', 
    lat: 9.5624, 
    lng: 44.0770,
    status: 'active', 
    health: 'Delayed',
    progress: 45,
    docRate: 30,
    budget: '$120,000',
    budgetAmt: 120000,
    actualSpendAmt: 132500,
    daysRemaining: 4,
    engineer: 'Eng. Sarah J.',
    milestones: [
      { label: 'Boundary', status: 'done', width: '33%' },
      { label: 'Subdivision', status: 'active', width: '33%' },
      { label: 'Permitting', status: 'todo', width: '33%' },
    ],
    docs: 12,
    date: '2026-04-15',
    bg: 'bg-cyan-500/5',
    color: '#34d399'
  },
  { 
    id: 3, 
    name: 'Riverside Cadastral Mapping', 
    location: 'Kismayo, Somalia', 
    lat: -0.3582, 
    lng: 42.5454,
    status: 'pending', 
    health: 'On Track',
    progress: 15,
    docRate: 10,
    budget: '$28,500',
    budgetAmt: 28500,
    actualSpendAmt: 22000,
    daysRemaining: 145,
    engineer: 'Eng. Hassan M.',
    milestones: [
      { label: 'Registry', status: 'active', width: '50%' },
      { label: 'Mapping', status: 'todo', width: '50%' },
    ],
    docs: 18,
    date: '2026-05-20',
    bg: 'bg-amber-500/5',
    color: '#fbbf24'
  },
  { 
    id: 4, 
    name: 'Industrial Zone Subdivision', 
    location: 'Berbera, Somalia', 
    lat: 10.4396, 
    lng: 45.0135,
    status: 'completed', 
    health: 'Completed',
    progress: 100,
    docRate: 100,
    budget: '$85,200',
    budgetAmt: 85200,
    actualSpendAmt: 83100,
    daysRemaining: 0,
    engineer: 'Eng. Aisha K.',
    milestones: [
      { label: 'Survey', status: 'done', width: '100%' },
    ],
    docs: 45,
    date: '2026-03-10',
    bg: 'bg-emerald-500/5',
    color: '#10b981'
  },
];

interface ProjectsViewProps {
  viewMode?: 'List' | 'Map';
  onViewModeChange?: (mode: 'List' | 'Map') => void;
  isUserAdmin?: boolean;
  projects?: any[];
  setProjects?: React.Dispatch<React.SetStateAction<any[]>>;
}

export function ProjectsView({ 
  viewMode: externalViewMode, 
  onViewModeChange, 
  isUserAdmin: propIsAdmin,
  projects: propProjects,
  setProjects: propSetProjects
}: ProjectsViewProps) {
  const [localProjects, setLocalProjects] = useOfflineCache<any[]>('geodms_projects_data', projectsData);
  const projects = propProjects || localProjects;
  const setProjects = propSetProjects || setLocalProjects;

  const [filter, setFilter] = useState('All');
  const [sortBy, setSortBy] = useState('Date');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Active' | 'Delayed' | 'Completed'>('All');
  const [healthFilter, setHealthFilter] = useState<'All' | 'On Track' | 'Delayed' | 'Completed'>('All');
  const [isHealthDropdownOpen, setIsHealthDropdownOpen] = useState(false);
  const healthDropdownRef = useRef<HTMLDivElement>(null);
  const [internalViewMode, setInternalViewMode] = useState<'List' | 'Map'>('List');
  const [searchQuery, setSearchQuery] = useState('');

  // Handle close health dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (healthDropdownRef.current && !healthDropdownRef.current.contains(event.target as Node)) {
        setIsHealthDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  
  // Check if current user is admin (using prop with localStorage fallback)
  const isUserAdmin = propIsAdmin !== undefined ? propIsAdmin : (() => {
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

  const viewMode = externalViewMode || internalViewMode;
  const setViewMode = onViewModeChange || setInternalViewMode;
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);
  const [isQRLabelOpen, setIsQRLabelOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [activeProject, setActiveProject] = useState<any>(null);
  const [selectedProjectId, setSelectedProjectId] = useState<number>(projects[0]?.id || 1);
  const [progressView, setProgressView] = useState<'Project' | 'Docs'>('Project');
  const { showToast } = useToast();
  const [projectToDelete, setProjectToDelete] = useState<any>(null);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);

  const selectedProject = projects.find(p => p.id === selectedProjectId) || projects[0];

  const handleDeleteConfirm = async () => {
    if (!projectToDelete) return;
    try {
      // 1. Delete locally / from cache
      setProjects(prev => prev.filter(p => p.id !== projectToDelete.id));
      
      // 2. Delete from Firestore
      await supabase.from('projects').delete().eq('id', String(projectToDelete.id));
      
      showToast(`Project "${projectToDelete.name}" has been deleted permanently`, 'success');
    } catch (err) {
      console.error("Firestore delete project error: ", err);
      showToast('Error deleting project from database', 'error');
    } finally {
      setProjectToDelete(null);
    }
  };

  const filteredProjects = projects.filter(p => {
    // 0. Search Query Filter (name or location or engineer)
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase().trim();
      const nameMatch = p.name?.toLowerCase().includes(q);
      const locMatch = p.location?.toLowerCase().includes(q);
      const engMatch = p.engineer?.toLowerCase().includes(q);
      if (!nameMatch && !locMatch && !engMatch) {
        return false;
      }
    }

    // 1. Date Filter
    if (filter !== 'All') {
      const projectDate = new Date(p.date);
      const now = new Date();
      if (filter === 'This Month') {
        const isThisMonth = projectDate.getMonth() === now.getMonth() && projectDate.getFullYear() === now.getFullYear();
        if (!isThisMonth) return false;
      } else if (filter === 'Last Quarter') {
        const threeMonthsAgo = new Date();
        threeMonthsAgo.setMonth(now.getMonth() - 3);
        if (projectDate < threeMonthsAgo) return false;
      } else if (filter === 'This Year') {
        const isThisYear = projectDate.getFullYear() === now.getFullYear();
        if (!isThisYear) return false;
      }
    }

    // 2. Project State Filter (Active, Delayed, Completed)
    if (statusFilter !== 'All') {
      if (statusFilter === 'Active') {
        // Active means status is active/pending and health is NOT Delayed
        const isActive = (p.status === 'active' || p.status === 'pending') && p.health !== 'Delayed';
        if (!isActive) return false;
      } else if (statusFilter === 'Delayed') {
        const isDelayed = p.health === 'Delayed';
        if (!isDelayed) return false;
      } else if (statusFilter === 'Completed') {
        const isCompleted = p.status === 'completed' || p.health === 'Completed';
        if (!isCompleted) return false;
      }
    }

    // 3. Health Status Filter (On Track, Delayed, Completed)
    if (healthFilter !== 'All') {
      if (p.health !== healthFilter) {
        return false;
      }
    }

    return true;
  }).sort((a, b) => {
    if (sortBy === 'Date') return new Date(b.date).getTime() - new Date(a.date).getTime();
    if (sortBy === 'Progress') return b.progress - a.progress;
    if (sortBy === 'Health') return a.health.localeCompare(b.health);
    return 0;
  });

  const exportCSV = () => {
    const headers = ['Project Name', 'Location', 'Current Status', 'Health Condition', 'Completion Progress', 'Document Count', 'Creation Date', 'Active Milestone'];
    const rows = projects.map(p => {
      const activeMilestone = p.milestones.find(m => m.status === 'active')?.label || 'N/A';
      return [
        p.name, 
        p.location, 
        p.status, 
        p.health, 
        `${p.progress}%`, 
        p.docs, 
        p.date,
        activeMilestone
      ];
    });

    const csvContent = [headers, ...rows].map(row => 
      row.map(cell => `"${(cell ?? "").toString().replace(/"/g, '""')}"`).join(",")
    ).join("\n");

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `geodms_projects_comprehensive_report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    showToast('Comprehensive project report generated', 'success');
  };

  const [isGeneratingReport, setIsGeneratingReport] = useState(false);

  const totalPrjs = projects.length;
  const delayedPrjs = projects.filter(p => p.health === 'Delayed').length;
  const onTrackPrjs = projects.filter(p => p.health === 'On Track').length;
  const completedPrjs = projects.filter(p => p.health === 'Completed').length;
  
  const completedCount = projects.filter(p => p.status === 'completed' || p.health === 'Completed').length;
  const delayedCount = projects.filter(p => p.health === 'Delayed').length;
  const onTrackCount = Math.max(0, totalPrjs - completedCount - delayedCount);
  
  const healthyPercentage = totalPrjs ? Math.round(((onTrackPrjs + completedPrjs) / totalPrjs) * 100) : 0;
  
  let healthLabel = 'Stable';
  let healthColor = 'text-emerald-400';
  let healthBg = 'bg-emerald-500/10';
  let healthIndicatorColor = 'bg-emerald-400';
  if (healthyPercentage >= 90) {
    healthLabel = 'Optimal';
    healthColor = 'text-cyan-400';
    healthBg = 'bg-cyan-500/10';
    healthIndicatorColor = 'bg-cyan-400';
  } else if (healthyPercentage >= 70) {
    healthLabel = 'Stable';
    healthColor = 'text-emerald-400';
    healthBg = 'bg-emerald-500/10';
    healthIndicatorColor = 'bg-emerald-400';
  } else if (healthyPercentage >= 50) {
    healthLabel = 'Moderate Risk';
    healthColor = 'text-amber-400';
    healthBg = 'bg-amber-500/10';
    healthIndicatorColor = 'bg-amber-400';
  } else {
    healthLabel = 'Critical Warning';
    healthColor = 'text-rose-400';
    healthBg = 'bg-rose-500/10';
    healthIndicatorColor = 'bg-rose-400';
  }

  const generateReport = async () => {
    setIsGeneratingReport(true);
    showToast('Analyzing survey repositories and parsing geometric parameters...', 'info');
    
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    let reportText = `========================================================\n`;
    reportText += `       GEODMS CAD/GIS REPOSITORY STATUS REPORT\n`;
    reportText += `       Date generated: ${new Date().toLocaleString()}\n`;
    reportText += `========================================================\n\n`;
    
    reportText += `SUMMARY STATISTICS:\n`;
    reportText += `-------------------\n`;
    reportText += `Total Project Repositories: ${projects.length}\n`;
    reportText += `Workspace Health Index Code: ${healthyPercentage}% (${healthLabel})\n`;
    reportText += `Active Survey Sites: ${projects.filter(p => p.status === 'active').length}\n`;
    reportText += `Pending Review Files: ${projects.filter(p => p.status === 'pending').length}\n`;
    reportText += `Completed Subdivisions: ${projects.filter(p => p.status === 'completed').length}\n\n`;
    
    reportText += `DETAILED PROJECT LOGS:\n`;
    reportText += `----------------------\n\n`;
    
    projects.forEach((p, idx) => {
      const activeMilestone = p.milestones.find(m => m.status === 'active')?.label || 'N/A';
      reportText += `${idx + 1}. [${p.status.toUpperCase()}] ${p.name}\n`;
      reportText += `   Location:      ${p.location} (${p.coords || p.lat + ', ' + p.lng})\n`;
      reportText += `   Health State:  ${p.health}\n`;
      reportText += `   Completion:    ${p.progress}%\n`;
      reportText += `   Est. Budget:   ${p.budget || 'N/A'}\n`;
      reportText += `   Lead Planner:  ${p.engineer || 'Unassigned'}\n`;
      reportText += `   Active Phase:  ${activeMilestone}\n`;
      reportText += `   Docs Attached: ${p.docs} files\n`;
      reportText += `   Description:   ${p.desc || 'No description'}\n`;
      reportText += `--------------------------------------------------------\n`;
    });
    
    reportText += `\nEnd of System Digest.\nGenerated by GeoDMS Management Console.\n`;
    
    const blob = new Blob([reportText], { type: 'text/plain;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.href = url;
    link.setAttribute("download", `geodms_workspace_digest_${new Date().toISOString().split('T')[0]}.txt`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    setIsGeneratingReport(false);
    showToast('Polished status report compiled and downloaded successfully', 'success');
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-white font-sans uppercase">Project Repositories</h2>
          <p className="text-[13px] text-muted-foreground mt-1">Manage survey sites and land development projects.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex bg-card border border-border rounded-xl p-1 p-0.5 mr-2">
            {[
              { id: 'List', icon: LayoutGrid },
              { id: 'Map', icon: Map },
            ].map((mode) => (
              <button
                key={mode.id}
                onClick={() => setViewMode(mode.id as any)}
                className={`p-2 rounded-lg transition-all flex items-center gap-2 px-3 ${
                  viewMode === mode.id 
                    ? 'bg-primary text-primary-foreground shadow-lg' 
                    : 'text-muted-foreground hover:text-white'
                }`}
              >
                <mode.icon className="w-4 h-4" />
                <span className="text-[10px] font-bold uppercase tracking-widest">{mode.id} View</span>
              </button>
            ))}
          </div>
          <button 
            onClick={exportCSV}
            className="bg-card border border-border text-white px-4 py-2.5 rounded-xl font-bold uppercase tracking-widest text-[10px] flex items-center gap-2 hover:bg-muted transition-all"
          >
            <Download className="w-4 h-4" />
            Generate Report
          </button>
          {isUserAdmin && (
            <button 
              onClick={() => {
                setActiveProject(null);
                setIsQuickAddOpen(true);
              }}
              className="bg-primary text-primary-foreground px-5 py-2.5 rounded-xl font-bold uppercase tracking-wider text-[11px] flex items-center gap-2 hover:opacity-90 active:scale-95 transition-all shadow-[0_0_20px_rgba(6,182,212,0.3)]"
            >
              <Plus className="w-4 h-4" />
              New Project
            </button>
          )}
        </div>
      </div>

      {/* Quick State filter button group */}
      <div className="bg-card border border-border/50 rounded-2xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-lg shadow-black/10 animate-in fade-in slide-in-from-top-2 duration-300">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-primary/10 text-primary rounded-xl">
            <Layers className="w-4 h-4" />
          </div>
          <div className="text-left">
            <h4 className="text-[11px] font-black tracking-widest uppercase text-white">Project States</h4>
            <p className="text-[9px] text-muted-foreground mt-0.5">Toggle visibility by current field status index</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-1.5 bg-sidebar/40 p-1 rounded-xl border border-border/25">
          {[
            { id: 'All', label: 'All Projects', icon: Briefcase, color: 'text-primary border-primary/20', activeBg: 'bg-primary text-primary-foreground' },
            { id: 'Active', label: 'Active', icon: Activity, color: 'text-emerald-400 border-emerald-500/10', activeBg: 'bg-emerald-500 text-white' },
            { id: 'Delayed', label: 'Delayed', icon: AlertTriangle, color: 'text-amber-400 border-amber-500/10', activeBg: 'bg-amber-500 text-black' },
            { id: 'Completed', label: 'Completed', icon: CheckCircle2, color: 'text-cyan-400 border-cyan-500/10', activeBg: 'bg-cyan-500 text-white' }
          ].map((item) => {
            const isSelected = statusFilter === item.id;
            const Icon = item.icon;
            
            // Calculate dynamic count
            let count = 0;
            if (item.id === 'All') {
              count = projects.length;
            } else if (item.id === 'Active') {
              count = projects.filter(p => (p.status === 'active' || p.status === 'pending') && p.health !== 'Delayed').length;
            } else if (item.id === 'Delayed') {
              count = projects.filter(p => p.health === 'Delayed').length;
            } else if (item.id === 'Completed') {
              count = projects.filter(p => p.status === 'completed' || p.health === 'Completed').length;
            }

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  setStatusFilter(item.id as any);
                  showToast(`Viewing ${item.label} projects`, 'info');
                }}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all cursor-pointer ${
                  isSelected 
                    ? `${item.activeBg} shadow-md shadow-black/25 scale-[1.02]` 
                    : 'text-muted-foreground hover:text-white hover:bg-muted/40'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isSelected ? 'text-current animate-pulse' : item.color.split(' ')[0]}`} />
                <span>{item.label}</span>
                <span className={`px-1.5 py-0.5 rounded-md text-[9px] font-bold font-mono ${
                  isSelected ? 'bg-black/20 text-current' : 'bg-muted text-muted-foreground'
                }`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-6 border-b border-border/30 pb-6">
        <div className="flex flex-wrap items-center gap-4 w-full lg:w-auto">
          {/* Elegant Search Bar */}
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/60" />
            <input
              type="text"
              placeholder="Search by name or location..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-card hover:bg-muted/40 focus:bg-muted/70 border border-border/60 focus:border-primary/50 rounded-full pl-10 pr-9 py-1.5 text-xs text-white placeholder-muted-foreground/50 transition-all outline-none"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground/60 hover:text-white transition-colors cursor-pointer"
                title="Clear Search"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/60 mr-2">Filter Repository:</span>
            {['All', 'This Month', 'Last Quarter', 'This Year'].map((f) => (
              <button 
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-1.5 rounded-full border transition-all text-[11px] font-bold uppercase tracking-widest ${
                  filter === f 
                  ? 'bg-primary border-primary/20 text-white shadow-lg' 
                  : 'border-border text-muted-foreground hover:border-primary/50 hover:text-white'
                }`}
              >
                {f}
              </button>
            ))}
          </div>

          {/* Health Status Filter Dropdown */}
          <div className="relative" ref={healthDropdownRef}>
            <button
              id="health-filter-btn"
              onClick={() => setIsHealthDropdownOpen(!isHealthDropdownOpen)}
              className="flex items-center gap-2 px-4 py-1.5 rounded-full border border-border bg-card/60 hover:bg-muted text-[11px] font-bold uppercase tracking-widest transition-all text-white cursor-pointer"
            >
              <Heart className={`w-3.5 h-3.5 text-primary ${healthFilter !== 'All' ? 'fill-primary animate-pulse' : ''}`} />
              <span>Health: </span>
              <span className={`font-black ${
                healthFilter === 'On Track' ? 'text-emerald-400' :
                healthFilter === 'Delayed' ? 'text-amber-400' :
                healthFilter === 'Completed' ? 'text-cyan-400' : 'text-primary'
              }`}>
                {healthFilter}
              </span>
              <ChevronDown className={`w-3.5 h-3.5 text-muted-foreground transition-transform duration-200 ${isHealthDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            <AnimatePresence>
              {isHealthDropdownOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  transition={{ duration: 0.15 }}
                  className="absolute left-0 mt-2 w-52 bg-card border border-border rounded-xl shadow-2xl z-50 overflow-hidden"
                >
                  <div className="p-2 space-y-1">
                    <div className="px-3 py-1 text-[9px] font-black uppercase tracking-widest text-muted-foreground border-b border-border/40 mb-1 pb-1">
                      Choose Health Status
                    </div>
                    {[
                      { id: 'All', label: 'All Conditions', color: 'bg-primary' },
                      { id: 'On Track', label: 'On Track', color: 'bg-emerald-400' },
                      { id: 'Delayed', label: 'Delayed', color: 'bg-amber-400' },
                      { id: 'Completed', label: 'Completed', color: 'bg-cyan-400' },
                    ].map((opt) => (
                      <button
                        key={opt.id}
                        id={`health-opt-${opt.id}`}
                        onClick={() => {
                          setHealthFilter(opt.id as any);
                          setIsHealthDropdownOpen(false);
                          showToast(`Health condition filter updated to: ${opt.label}`, 'info');
                        }}
                        className={`
                          w-full flex items-center justify-between px-3 py-2 rounded-lg transition-colors group cursor-pointer text-left
                          ${healthFilter === opt.id ? 'bg-primary/10 text-primary' : 'hover:bg-muted text-muted-foreground hover:text-white'}
                        `}
                      >
                        <div className="flex items-center gap-2.5">
                          <span className={`w-2 h-2 rounded-full ${opt.color}`} />
                          <span className="text-xs font-bold uppercase tracking-wider">{opt.label}</span>
                        </div>
                        {healthFilter === opt.id && (
                          <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                        )}
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/60 mr-2">Sort By:</span>
          {['Date', 'Progress', 'Health'].map((s) => (
            <button 
              key={s}
              onClick={() => setSortBy(s)}
              className={`text-[10px] font-bold uppercase tracking-widest transition-all ${
                sortBy === s ? 'text-primary' : 'text-muted-foreground hover:text-white'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {viewMode === 'List' ? (
        <div className="space-y-6">
          {/* Summary Card */}
          <div className="bg-card border border-border/60 rounded-2xl p-5 md:p-6 relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl shadow-black/20">
            <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-cyan-500 via-emerald-500 to-amber-500 opacity-60" />
            
            <div className="flex flex-wrap items-center gap-6 w-full md:w-auto text-left">
              {/* Stat 1: Total Projects */}
              <div className="flex items-center gap-3">
                <div className="p-3 bg-primary/10 text-primary rounded-xl shrink-0">
                  <Briefcase className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">Total Workspace Sites</span>
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-2xl font-black text-white font-mono tracking-tight">{totalPrjs}</span>
                    <span className="text-[10px] text-muted-foreground">repos</span>
                  </div>
                </div>
              </div>

              {/* Divider */}
              <span className="hidden md:block w-[1px] h-10 bg-border/40 shrink-0" />

              {/* Stat 2: Average Health */}
              <div className="flex items-center gap-3">
                <div className={`p-3 ${healthBg} ${healthColor} rounded-xl shrink-0`}>
                  <Activity className="w-5 h-5" />
                </div>
                <div className="space-y-0.5">
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">Field Status Integrity</span>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-black text-white font-mono tracking-tight">{healthyPercentage}%</span>
                    <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider ${healthBg} ${healthColor} border border-current/15`}>
                      {healthLabel}
                    </span>
                  </div>
                </div>
              </div>

              {/* Divider */}
              <span className="hidden xl:block w-[1px] h-10 bg-border/40 shrink-0" />

              {/* Stat 3: Project Distribution Chart */}
              <div className="flex flex-col gap-1.5 min-w-[200px] sm:min-w-[240px] w-full lg:w-auto xl:w-[260px]">
                <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest block">Health Distribution</span>
                {totalPrjs > 0 ? (
                  <div className="space-y-1.5">
                    {/* Stacked Percentage Bar */}
                    <div className="h-3 w-full rounded-full overflow-hidden bg-sidebar flex border border-border/30">
                      {completedCount > 0 && (
                        <div 
                          className="bg-cyan-500 h-full transition-all" 
                          style={{ width: `${(completedCount / totalPrjs) * 100}%` }}
                          title={`Completed: ${completedCount} (${Math.round((completedCount / totalPrjs) * 100)}%)`}
                        />
                      )}
                      {onTrackCount > 0 && (
                        <div 
                          className="bg-emerald-500 h-full transition-all" 
                          style={{ width: `${(onTrackCount / totalPrjs) * 100}%` }}
                          title={`On Track: ${onTrackCount} (${Math.round((onTrackCount / totalPrjs) * 100)}%)`}
                        />
                      )}
                      {delayedCount > 0 && (
                        <div 
                          className="bg-amber-500 h-full transition-all" 
                          style={{ width: `${(delayedCount / totalPrjs) * 100}%` }}
                          title={`Delayed: ${delayedCount} (${Math.round((delayedCount / totalPrjs) * 100)}%)`}
                        />
                      )}
                    </div>
                    {/* Legend */}
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[9px] font-bold font-mono tracking-tighter uppercase">
                      {completedCount > 0 && (
                        <span className="flex items-center gap-1 text-cyan-400">
                          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" /> Done ({completedCount})
                        </span>
                      )}
                      {onTrackCount > 0 && (
                        <span className="flex items-center gap-1 text-emerald-400">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" /> Active ({onTrackCount})
                        </span>
                      )}
                      {delayedCount > 0 && (
                        <span className="flex items-center gap-1 text-amber-500">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" /> Delayed ({delayedCount})
                        </span>
                      )}
                    </div>
                  </div>
                ) : (
                  <span className="text-xs text-muted-foreground italic font-medium">No active sites</span>
                )}
              </div>
            </div>

            {/* Right Action: Status Report Quick Action */}
            <div className="w-full md:w-auto flex flex-col sm:flex-row items-stretch sm:items-center gap-4 bg-sidebar/30 md:bg-transparent p-4 md:p-0 rounded-xl border border-border/20 md:border-0">
              <div className="space-y-0.5 text-left md:text-right">
                <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest block">System Digest Registry</span>
                <span className="text-[10px] text-muted-foreground italic font-medium">Exports detailed surveyors report (.txt)</span>
              </div>
              <button
                type="button"
                disabled={isGeneratingReport}
                onClick={generateReport}
                className="bg-primary text-primary-foreground font-black uppercase tracking-widest text-[10px] px-5 py-3 rounded-xl flex items-center justify-center gap-2 hover:opacity-95 active:scale-95 transition-all shadow-[0_0_20px_rgba(6,182,212,0.25)] disabled:opacity-50 shrink-0"
              >
                {isGeneratingReport ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    Compiling Logs...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5" />
                    Generate Status Report
                  </>
                )}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
            {/* Left Column: Project Repositories Cards List */}
            <div className="xl:col-span-8">
              {filteredProjects.length === 0 ? (
                <div id="no-projects-view" className="flex flex-col items-center justify-center p-12 py-16 border border-dashed border-border/30 rounded-2xl bg-card/10 text-center animate-in fade-in duration-300">
                  <div className="p-4 bg-muted/20 text-muted-foreground/80 rounded-full mb-4">
                    <Search className="w-6 h-6" />
                  </div>
                  <p className="text-sm font-bold text-white uppercase tracking-widest">No matching projects found</p>
                  <p className="text-xs text-muted-foreground mt-1 max-w-xs">No projects in your active repositories or locations match your current search query or filter index.</p>
                  <button
                    type="button"
                    onClick={() => {
                      setSearchQuery('');
                      setFilter('All');
                      setStatusFilter('All');
                      setHealthFilter('All');
                      showToast('Search query and active filters cleared', 'info');
                    }}
                    className="mt-5 px-5 py-2 hover:bg-muted border border-border/60 hover:border-primary/50 text-[10px] font-black uppercase tracking-widest rounded-full transition-all text-white cursor-pointer active:scale-95 animate-pulse"
                  >
                    Clear search filters
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <AnimatePresence mode="popLayout">
                    {filteredProjects.map((project, i) => (
                      <motion.div
                        layout
                        key={project.id}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ delay: i * 0.05 }}
                        onClick={() => {
                          setSelectedProjectId(project.id);
                          showToast(`Selected ${project.name} for financial analysis`, 'info');
                        }}
                        className={`p-6 rounded-2xl bg-card border transition-all cursor-pointer group relative overflow-hidden text-left ${
                          selectedProjectId === project.id 
                            ? 'border-primary ring-1 ring-primary/40 shadow-[0_0_20px_rgba(6,182,212,0.15)] bg-slate-900/40' 
                            : 'border-border/50 hover:border-primary/30'
                        }`}
                      >
                <div className={`absolute inset-0 ${project.bg} opacity-20 pointer-events-none`} />
                
                <div className="relative z-10 flex flex-col md:flex-row gap-6">
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-lg font-bold text-white group-hover:text-primary transition-colors">{project.name}</h3>
                        </div>
                        <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                          <Map className="w-3.5 h-3.5" /> {project.location}
                        </p>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                         <div className="flex items-center gap-2">
                           {isUserAdmin && (
                             <>
                               <button 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setActiveProject(project);
                                  setIsSettingsOpen(true);
                                }}
                                className="p-1.5 rounded-lg border border-border hover:bg-muted text-muted-foreground group/settings"
                                title="Project Settings"
                               >
                                <Settings className="w-4 h-4 group-hover/settings:text-white" />
                               </button>
                               <button 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setProjectToDelete(project);
                                  setIsDeleteConfirmOpen(true);
                                }}
                                className="p-1.5 rounded-lg border border-border hover:bg-destructive/10 hover:border-destructive/30 hover:text-destructive text-muted-foreground group/delete"
                                title="Delete Project"
                               >
                                <Trash2 className="w-4 h-4 shadow-sm" />
                               </button>
                             </>
                           )}
                           <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              setActiveProject(project);
                              setIsQRLabelOpen(true);
                            }}
                            className="p-1.5 rounded-lg border border-border hover:bg-muted text-muted-foreground group/qr"
                            title="Generate QR Label"
                           >
                            <QrCode className="w-4 h-4 group-hover/qr:text-primary" />
                           </button>
                           <motion.div 
                            animate={project.health === 'Delayed' ? {
                              scale: [1, 1.04, 1],
                              boxShadow: [
                                "0 0 10px rgba(244, 63, 94, 0.15)",
                                "0 0 22px rgba(244, 63, 94, 0.45)",
                                "0 0 10px rgba(244, 63, 94, 0.15)"
                              ]
                            } : {}}
                            transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[9px] font-bold uppercase border transition-all ${
                              project.health === 'On Track' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 shadow-[0_0_10px_rgba(16,185,129,0.1)]' :
                              project.health === 'Delayed' ? 'bg-rose-500/10 text-rose-400 border-rose-500/20' :
                              'bg-primary/10 text-primary border-primary/20 shadow-[0_0_10px_rgba(6,182,212,0.1)]'
                            }`}
                           >
                            <span className="relative w-1.5 h-1.5 flex items-center justify-center shrink-0">
                              {project.health === 'Delayed' && (
                                <span className="absolute inset-0 rounded-full bg-rose-400 animate-ping opacity-75" />
                              )}
                              <span className={`w-1.5 h-1.5 rounded-full relative z-10 ${
                                project.health === 'On Track' ? 'bg-emerald-400 animate-pulse' :
                                project.health === 'Delayed' ? 'bg-rose-400' :
                                'bg-primary'
                              }`} />
                            </span>
                            {project.health}
                           </motion.div>
                         </div>
                        <span className={`px-2 py-0.5 rounded text-[8px] font-bold uppercase opacity-30 border border-current font-mono tracking-tighter`}>
                          {project.status}
                        </span>
                      </div>
                    </div>

                  {/* Timeline Visualizer */}
                  <div className="mb-4 space-y-2">
                    <div className="flex items-center justify-between text-[9px] font-bold uppercase tracking-[0.15em] text-muted-foreground/60">
                      <span>Timeline Milestones</span>
                      <span>Phase {project.milestones.findIndex(m => m.status === 'active') + 1} of {project.milestones.length}</span>
                    </div>
                    <div className="flex h-1.5 w-full bg-sidebar-accent rounded-full overflow-hidden border border-white/5">
                      {project.milestones.map((m, idx) => (
                        <div 
                          key={idx} 
                          style={{ width: m.width }}
                          className={`h-full border-r border-background/20 last:border-0 transition-colors ${
                            m.status === 'done' ? 'bg-emerald-500' :
                            m.status === 'active' ? 'bg-primary animate-pulse' : 'bg-muted'
                          }`}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Small Interactive Google Maps Preview */}
                  <div className="mb-4">
                    <ProjectMiniMap 
                      lat={project.lat} 
                      lng={project.lng} 
                      name={project.name} 
                      color={project.color} 
                    />
                  </div>

                  {/* Summary Metrics */}
                  <div className="grid grid-cols-2 gap-3 mb-6">
                    <div className="bg-sidebar/40 p-2.5 rounded-xl border border-border/10 flex flex-col items-center">
                       <span className="text-[8px] font-bold text-muted-foreground uppercase tracking-widest mb-1">Budget Spent</span>
                       <span className="text-xs font-black text-emerald-400 font-mono tracking-tighter">{project.budget}</span>
                    </div>
                    <div className="bg-sidebar/40 p-2.5 rounded-xl border border-border/10 flex flex-col items-center">
                       <span className="text-[8px] font-bold text-muted-foreground uppercase tracking-widest mb-1">Days Remaining</span>
                       <span className={`text-xs font-black font-mono tracking-tighter ${project.daysRemaining < 7 ? 'text-rose-400 animate-pulse' : 'text-white'}`}>{project.daysRemaining}d</span>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between pt-4 border-t border-border/30">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1.5 text-[10px] font-bold text-white/70">
                          <FileText className="w-3.5 h-3.5 text-primary" /> {project.docs} Docs
                        </div>
                        <div className="flex items-center gap-1.5 text-[10px] font-bold text-white/70">
                          <User className="w-3.5 h-3.5 text-accent" /> 3 Team
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {project.health === 'Delayed' && (
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              showToast(`Team notified for ${project.name}`, 'info');
                            }}
                            className="bg-rose-500/10 text-rose-400 hover:bg-rose-500 hover:text-white px-2 py-1 rounded text-[9px] font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 border border-rose-500/20"
                          >
                            <Send className="w-3 h-3" />
                            Notify Team
                          </button>
                        )}
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveProject(project);
                            setIsQuickAddOpen(true);
                          }}
                          className="bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground px-3 py-1 rounded text-[10px] font-bold uppercase tracking-widest transition-all glow-border"
                        >
                          Quick Add
                        </button>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 px-2 py-1 bg-sidebar/50 rounded-lg border border-border/20">
                        <Calendar className="w-3 h-3 text-muted-foreground" /> 
                        <span className="text-[10px] font-mono text-muted-foreground font-bold">{project.date}</span>
                      </div>
                      <button className="text-[10px] font-bold uppercase text-primary hover:underline flex items-center gap-1 transition-colors">
                        Details <ChevronRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                      </button>
                    </div>
                  </div>
                </div>

                <div 
                  onClick={(e) => {
                    e.stopPropagation();
                    setProgressView(v => v === 'Project' ? 'Docs' : 'Project');
                  }}
                  className="flex flex-col items-center justify-center bg-sidebar-accent/20 rounded-2xl p-4 min-w-[120px] backdrop-blur-sm border border-border/10 hover:bg-sidebar-accent/40 transition-colors cursor-pointer group/progress"
                >
                  <ProjectProgressRing progress={progressView === 'Project' ? project.progress : project.docRate} size={80} strokeWidth={8} color={project.color} />
                  <p className="mt-2 text-[8px] font-bold uppercase tracking-[0.2em] text-muted-foreground opacity-60 group-hover/progress:opacity-90">
                    {progressView === 'Project' ? 'Project Completion' : 'Docs Processed'}
                  </p>
                  <div className="mt-1 flex gap-1">
                    <div className={`w-1 h-1 rounded-full ${progressView === 'Project' ? 'bg-primary' : 'bg-muted'}`} />
                    <div className={`w-1 h-1 rounded-full ${progressView === 'Docs' ? 'bg-primary' : 'bg-muted'}`} />
                  </div>
                </div>
              </div>
              </motion.div>
            ))}
                </AnimatePresence>
              </div>
            )}
            </div>

            {/* Right Column: Interactive Budget vs. Actual Spend Financial Analysis */}
            <div className="xl:col-span-4 xl:sticky xl:top-6">
              <ProjectBudgetVsSpendCard 
                selectedProject={selectedProject} 
                projects={projects}
                onSelectProject={(id) => setSelectedProjectId(id)}
              />
            </div>
          </div>
        </div>
      ) : (
        <ProjectMap projects={filteredProjects} />
      )}

      <QuickAddModal 
        isOpen={isQuickAddOpen} 
        onClose={() => setIsQuickAddOpen(false)} 
        project={activeProject} 
      />

      <QRLabelModal 
        isOpen={isQRLabelOpen}
        onClose={() => setIsQRLabelOpen(false)}
        project={activeProject}
      />

      <ProjectSettingsModal 
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        project={activeProject}
      />

      <ConfirmationModal 
        isOpen={isDeleteConfirmOpen}
        onClose={() => {
          setIsDeleteConfirmOpen(false);
          setProjectToDelete(null);
        }}
        onConfirm={handleDeleteConfirm}
        title="Confirm Project Deletion"
        message={`Are you sure you want to delete "${projectToDelete?.name || ''}"? This action is irreversible and will permanently remove all associated CAD survey layouts, GNSS spatial settings, and team tracking data from the repositories.`}
        confirmLabel="Permanently Delete"
        cancelLabel="Discard Action"
        type="danger"
      />
    </div>
  );
}

function QuickAddModal({ isOpen, onClose, project }: { isOpen: boolean; onClose: () => void; project?: any }) {
  const [category, setCategory] = useState(() => localStorage.getItem('geodms_quickadd_category') || 'Engineering Survey');
  
  useEffect(() => {
    localStorage.setItem('geodms_quickadd_category', category);
  }, [category]);

  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[3000] flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-background/90 backdrop-blur-sm"
      />
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="bg-card border border-border rounded-2xl shadow-2xl w-full max-w-md relative z-[3001] overflow-hidden"
      >
        <div className="p-6 border-b border-border flex items-center justify-between">
          <div>
            <h3 className="text-xl font-bold text-white tracking-tight">Quick Add Document</h3>
            <p className="text-xs text-muted-foreground mt-1">
              Context: <span className="text-primary font-bold">{project ? project.name : 'General Archive'}</span>
            </p>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-muted text-muted-foreground transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-8 space-y-6">
          <div className="border-2 border-dashed border-border rounded-xl p-10 flex flex-col items-center justify-center space-y-4 hover:border-primary/50 transition-all cursor-pointer group">
            <div className="w-16 h-16 rounded-full bg-primary/5 flex items-center justify-center group-hover:bg-primary/10 transition-colors">
              <Upload className="w-8 h-8 text-primary/50 group-hover:text-primary transition-colors" />
            </div>
            <div className="text-center">
               <p className="text-sm font-bold text-white">Click to browse or drop file</p>
               <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest mt-1">Maximum size: 50MB</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Document Category</label>
              <select 
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-sidebar border border-border rounded-lg px-4 py-2 text-sm text-white outline-none focus:border-primary/50"
              >
                <option>Engineering Survey</option>
                <option>CAD Blueprint</option>
                <option>Legal Contract</option>
                <option>Employee HR</option>
              </select>
            </div>
            <button 
              onClick={() => {
                localStorage.removeItem('geodms_quickadd_category');
                onClose();
              }}
              className="w-full bg-primary text-primary-foreground py-3 rounded-xl font-bold uppercase tracking-[0.2em] text-[11px] shadow-lg hover:opacity-90 active:scale-[0.98] transition-all"
            >
              Upload for Verification
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

