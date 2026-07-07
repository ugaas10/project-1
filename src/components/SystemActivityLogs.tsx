import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Filter, 
  ArrowUpDown, 
  ShieldAlert, 
  AlertTriangle, 
  Info, 
  Download, 
  RefreshCw, 
  X, 
  PlusCircle, 
  Trash2, 
  Eye, 
  User, 
  Server, 
  Terminal, 
  Network, 
  Database,
  FileCode,
  Laptop,
  CheckCircle,
  FileSpreadsheet,
  Settings,
  ChevronLeft,
  ChevronRight,
  MapPin
} from 'lucide-react';
import { useLanguage } from '../lib/i18n';

export interface ActivityLog {
  id: string;
  event: string;
  type: 'Info' | 'Warning' | 'Critical';
  user: string;
  role: string;
  ip: string;
  time: string;
  details: string;
  category: 'Auth' | 'Document' | 'Database' | 'Security' | 'API';
  location: string;
  userAgent: string;
}

const DEFAULT_LOGS: ActivityLog[] = [
  {
    id: 'LOG-1001',
    event: 'CAD Metadata Extraction Success',
    type: 'Info',
    user: 'engmohamedyare7@gmail.com',
    role: 'Maamulaha',
    ip: '192.168.1.45',
    time: '2026-05-28 08:42:15',
    details: 'Automatically extracted 24 survey layers, coordinate scale, and title block metadata from Highway_A42_Layout.dwg.',
    category: 'Document',
    location: 'Mogadishu, SO',
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Chrome/124.0.0.0'
  },
  {
    id: 'LOG-1002',
    event: 'Failed Login Attempt Triggered',
    type: 'Warning',
    user: 'unknown@geodms.com',
    role: 'Guest',
    ip: '198.51.100.12',
    time: '2026-05-28 08:15:30',
    details: 'Login password failure threshold exceeded on user account unknown@geodms.com (Attempt 3). IP placed on temporary 5-min cooldown.',
    category: 'Auth',
    location: 'Hargeisa, SO',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Safari/537.36'
  },
  {
    id: 'LOG-1003',
    event: 'Database Storage Critical Threshold',
    type: 'Critical',
    user: 'System Process',
    role: 'System',
    ip: 'internal-sync-01',
    time: '2026-05-28 07:54:12',
    details: 'GeoDMS cloud persistent storage database backup transaction log file size crossed warning threshold of 92% capacity.',
    category: 'Database',
    location: 'Cloud Host - Frankfurt',
    userAgent: 'Docker Engine daemon v25.0.3 (Linux)'
  },
  {
    id: 'LOG-1004',
    event: 'Document Permanently Excluded',
    type: 'Warning',
    user: 'admin@admin.com',
    role: 'Maamulaha',
    ip: '192.168.1.1',
    time: '2026-05-28 06:12:05',
    details: 'User deleted Old_Archive_2020.zip containing superseded surveyor coordinates per project lead instructions.',
    category: 'Document',
    location: 'Garowe, SO',
    userAgent: 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 Chrome/123.0.0.0'
  },
  {
    id: 'LOG-1005',
    event: 'New Surveyor Verification Succeeded',
    type: 'Info',
    user: 'admin@admin.com',
    role: 'Maamulaha',
    ip: '192.168.1.1',
    time: '2026-05-28 04:30:11',
    details: 'Activation approval granted for new surveyor registration applicant: injineer@geodms.com with full upload scopes.',
    category: 'Auth',
    location: 'Garowe, SO',
    userAgent: 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 Chrome/123.0.0.0'
  },
  {
    id: 'LOG-1006',
    event: 'GCP Map Tiles API Key Renewed',
    type: 'Info',
    user: 'System Process',
    role: 'System',
    ip: 'internal-daemon',
    time: '2026-05-27 23:55:00',
    details: 'Google Maps and cadastral satellite tile renderer credentials refreshed with zero performance-level interruption.',
    category: 'API',
    location: 'Cloud Host - London',
    userAgent: 'gcloud-sdk-cli / node18-executor'
  },
  {
    id: 'LOG-1007',
    event: 'Abnormal API Rate Extraction',
    type: 'Warning',
    user: 'user@example.com',
    role: 'Injineerka',
    ip: '192.168.1.99',
    time: '2026-05-27 18:22:45',
    details: 'Downloaded more than 50 bulk land-survey parcels and topographic models within a 3-minute window.',
    category: 'API',
    location: 'Mogadishu, SO',
    userAgent: 'Python-urllib/3.10 requests/2.31.0'
  },
  {
    id: 'LOG-1008',
    event: 'SQL Injection Blocked by WAF',
    type: 'Critical',
    user: 'Anonymous Threat',
    role: 'Guest',
    ip: '203.0.113.88',
    time: '2026-05-27 14:10:02',
    details: 'Cloud Armor Web Application Firewall intercepted a malicious SQL escape sequence injection attempt in query field: /api/projects?search=SELECT%20*%20FROM%20users.',
    category: 'Security',
    location: 'External WAN IP Route',
    userAgent: 'sqlmap/1.8.3#stable (https://sqlmap.org)'
  },
  {
    id: 'LOG-1009',
    event: 'MFA Authentication Rule Policy Changed',
    type: 'Info',
    user: 'engmohamedyare7@gmail.com',
    role: 'Maamulaha',
    ip: '192.168.1.45',
    time: '2026-05-26 11:05:40',
    details: 'System-wide policy updated: Enforced Multi-Factor Authentication requirement protocols for all accounts with role Maamulaha.',
    category: 'Security',
    location: 'Mogadishu, SO',
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Chrome/124.0.0.0'
  },
  {
    id: 'LOG-1010',
    event: 'Land Parcel SO-1023 Updated',
    type: 'Info',
    user: 'injineer@geodms.com',
    role: 'Injineerka',
    ip: '192.168.1.201',
    time: '2026-05-26 09:12:18',
    details: 'Topographic GPS boundary polygon modified for Parcel ID: SO-1023 within Mogadishu central district. Precision error rating ± 0.02m.',
    category: 'Database',
    location: 'Hargeisa, SO',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Safari/537.36'
  }
];

export function SystemActivityLogs() {
  const { language } = useLanguage();
  const [logs, setLogs] = useState<ActivityLog[]>(() => {
    const cached = localStorage.getItem('geomds_activity_logs');
    if (cached) {
      try {
        return JSON.parse(cached);
      } catch (e) {
        return DEFAULT_LOGS;
      }
    }
    localStorage.setItem('geomds_activity_logs', JSON.stringify(DEFAULT_LOGS));
    return DEFAULT_LOGS;
  });

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<string>('All');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [sortBy, setSortBy] = useState<'id' | 'time' | 'type' | 'event' | 'user'>('time');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [selectedLog, setSelectedLog] = useState<ActivityLog | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Sync to localStorage
  const saveLogs = (updatedLogs: ActivityLog[]) => {
    setLogs(updatedLogs);
    localStorage.setItem('geomds_activity_logs', JSON.stringify(updatedLogs));
  };

  // Predefined lists for triggers
  const SAMPLE_EVENTS = [
    { event: 'Bulk Drawings Archived', type: 'Info', category: 'Document', details: 'Compressed and stored 12 inactive project design plans into deep glacier archive structure.' },
    { event: 'Critical Firewall Block', type: 'Critical', category: 'Security', details: 'Unauthorized login attempts exceeded. Suspicious subnet range range block triggered.' },
    { event: 'Database Shard Split Completed', type: 'Info', category: 'Database', details: 'Distributed regional survey index tables across multi-zone database nodes to optimize reading loads.' },
    { event: 'Project Assignment Update', type: 'Info', category: 'Auth', details: 'Assigned Lead Engineer responsibility status update of parcel #4521 to surveyor.' },
    { event: 'Rate Limiter Acted on Port', type: 'Warning', category: 'API', details: 'Automatic DDoS request rate throttled for anomalous traffic from sub-domain endpoint api/v1/meta.' }
  ];

  const SAMPLE_USERS = [
    { user: 'engmohamedyare7@gmail.com', role: 'Maamulaha', location: 'Mogadishu, SO' },
    { user: 'injineer@geodms.com', role: 'Injineerka', location: 'Hargeisa, SO' },
    { user: 'admin@admin.com', role: 'Maamulaha', location: 'Garowe, SO' },
    { user: 'user@example.com', role: 'Injineerka', location: 'Mogadishu, SO' }
  ];

  const triggerMockLog = () => {
    const randomEvent = SAMPLE_EVENTS[Math.floor(Math.random() * SAMPLE_EVENTS.length)];
    const randomUser = SAMPLE_USERS[Math.floor(Math.random() * SAMPLE_USERS.length)];
    const newId = `LOG-${Date.now().toString().slice(-4)}`;
    
    // Generate actual ISO Date string adapted to simulated GMT
    const dateStr = new Date().toISOString().replace('T', ' ').slice(0, 19);

    const newLog: ActivityLog = {
      id: newId,
      event: randomEvent.event,
      type: randomEvent.type as 'Info' | 'Warning' | 'Critical',
      user: randomUser.user,
      role: randomUser.role,
      ip: `192.168.1.${Math.floor(Math.random() * 254) + 1}`,
      time: dateStr,
      details: randomEvent.details,
      category: randomEvent.category as any,
      location: randomUser.location,
      userAgent: 'Mozilla/5.0 (Geotech WebApp Core; System Engine v1.0)'
    };

    const updated = [newLog, ...logs];
    saveLogs(updated);
    setCurrentPage(1);
  };

  const clearAllLogs = () => {
    if (confirm(language === 'so' ? 'Ma hubtaa inaad tirtirto dhammaan diiwaanka logs?' : 'Are you sure you want to clear all system logs?')) {
      saveLogs([]);
    }
  };

  const resetDefaultLogs = () => {
    saveLogs(DEFAULT_LOGS);
    setCurrentPage(1);
  };

  const exportLogsAsJSON = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(logs, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `geomds_system_logs_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleSort = (field: 'id' | 'time' | 'type' | 'event' | 'user') => {
    if (sortBy === field) {
      setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  // Filter logs logic
  const filteredLogs = useMemo(() => {
    return logs.filter(log => {
      const matchesSearch = 
        log.event.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.details.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.ip.includes(searchTerm) ||
        log.id.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesType = selectedType === 'All' || log.type === selectedType;
      const matchesCategory = selectedCategory === 'All' || log.category === selectedCategory;

      return matchesSearch && matchesType && matchesCategory;
    });
  }, [logs, searchTerm, selectedType, selectedCategory]);

  // Sort logs logic
  const sortedLogs = useMemo(() => {
    const activeLogs = [...filteredLogs];
    return activeLogs.sort((a, b) => {
      let aVal = a[sortBy];
      let bVal = b[sortBy];

      // Custom ordering priorities for types
      if (sortBy === 'type') {
        const severityMap = { 'Critical': 3, 'Warning': 2, 'Info': 1 };
        aVal = severityMap[a.type] || 0;
        bVal = severityMap[b.type] || 0;
      }

      if (aVal < bVal) return sortOrder === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });
  }, [filteredLogs, sortBy, sortOrder]);

  // Counts
  const counts = useMemo(() => {
    return {
      total: logs.length,
      critical: logs.filter(l => l.type === 'Critical').length,
      warning: logs.filter(l => l.type === 'Warning').length,
      info: logs.filter(l => l.type === 'Info').length,
      security: logs.filter(l => l.category === 'Security' || l.category === 'Auth').length
    };
  }, [logs]);

  // Paginated elements
  const totalPages = Math.ceil(sortedLogs.length / itemsPerPage) || 1;
  const paginatedLogs = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return sortedLogs.slice(start, start + itemsPerPage);
  }, [sortedLogs, currentPage]);

  const typeStyles = {
    Critical: 'bg-red-500/10 text-red-400 border-red-500/20 shadow-[0_0_15px_rgba(239,68,68,0.07)]',
    Warning: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
    Info: 'bg-[#00b0ff]/10 text-[#00b0ff] border-[#00b0ff]/20'
  };

  const categoryIcons = {
    Auth: <Laptop className="w-3.5 h-3.5 text-indigo-400" />,
    Document: <FileCode className="w-3.5 h-3.5 text-emerald-400" />,
    Database: <Database className="w-3.5 h-3.5 text-[#00b0ff]" />,
    Security: <ShieldAlert className="w-3.5 h-3.5 text-rose-500" />,
    API: <Server className="w-3.5 h-3.5 text-amber-400" />
  };

  return (
    <div className="space-y-6">
      {/* Mini Activity Dashboard Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-sidebar-accent/10 border border-border p-4 rounded-xl flex items-center justify-between">
          <div>
            <p className="text-xl font-mono font-bold text-white">{counts.total}</p>
            <p className="text-[10px] text-muted-foreground uppercase font-semibold tracking-wider">
              {language === 'so' ? 'Dhammaan Diiwaannada' : 'Total System Logs'}
            </p>
          </div>
          <div className="w-10 h-10 rounded-lg bg-sidebar-accent border border-border flex items-center justify-center">
            <Terminal className="w-5 h-5 text-gray-400" />
          </div>
        </div>

        <div className="bg-red-950/20 border border-red-900/30 p-4 rounded-xl flex items-center justify-between">
          <div>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
              <p className="text-xl font-mono font-bold text-red-400">{counts.critical}</p>
            </div>
            <p className="text-[10px] text-red-500 uppercase font-semibold tracking-wider">
              {language === 'so' ? 'Khatar Aad U Sarreysa' : 'Critical Issues'}
            </p>
          </div>
          <div className="w-10 h-10 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center justify-center">
            <ShieldAlert className="w-5 h-5 text-red-500" />
          </div>
        </div>

        <div className="bg-amber-950/20 border border-amber-900/30 p-4 rounded-xl flex items-center justify-between">
          <div>
            <p className="text-xl font-mono font-bold text-amber-500">{counts.warning}</p>
            <p className="text-[10px] text-amber-500 uppercase font-semibold tracking-wider">
              {language === 'so' ? 'Digniino' : 'Warnings'}
            </p>
          </div>
          <div className="w-10 h-10 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
            <AlertTriangle className="w-5 h-5 text-amber-500" />
          </div>
        </div>

        <div className="bg-indigo-950/20 border border-indigo-900/30 p-4 rounded-xl flex items-center justify-between">
          <div>
            <p className="text-xl font-mono font-bold text-[#00b0ff]">{counts.info}</p>
            <p className="text-[10px] text-[#00b0ff] uppercase font-semibold tracking-wider">
              {language === 'so' ? 'Dhaqdhaqaaq Guud' : 'Info Activities'}
            </p>
          </div>
          <div className="w-10 h-10 rounded-lg bg-[#00b0ff]/10 border border-[#00b0ff]/20 flex items-center justify-center">
            <Info className="w-5 h-5 text-[#00b0ff]" />
          </div>
        </div>
      </div>

      {/* Control Tools Bar */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 p-5 bg-sidebar-accent/10 border border-border rounded-xl">
        <div className="flex flex-wrap items-center gap-3 flex-1">
          {/* Search bar */}
          <div className="relative flex-1 min-w-[240px] max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input 
              type="text"
              placeholder={language === 'so' ? 'Ka raadi macluumaadka diiwaanka...' : 'Filter by client, IP, category, ID, event...'}
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full bg-[#13262f] border border-border pl-10 pr-4 py-2 text-xs rounded-lg text-white focus:border-primary focus:outline-none transition-all"
            />
            {searchTerm && (
              <button 
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 rounded-full hover:bg-muted text-muted-foreground hover:text-white"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>

          {/* Type dropdown */}
          <div className="flex items-center gap-2">
            <span className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground">Type:</span>
            <select
              value={selectedType}
              onChange={(e) => {
                setSelectedType(e.target.value);
                setCurrentPage(1);
              }}
              className="bg-[#13262f] border border-border text-xs text-semibold text-white rounded-lg px-2.5 py-1.5 focus:border-primary focus:outline-none cursor-pointer"
            >
              <option value="All">{language === 'so' ? 'Dhammaan' : 'All Severities'}</option>
              <option value="Info">Info</option>
              <option value="Warning">Warning</option>
              <option value="Critical">Critical</option>
            </select>
          </div>

          {/* Category dropdown */}
          <div className="flex items-center gap-2">
            <span className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground">Category:</span>
            <select
              value={selectedCategory}
              onChange={(e) => {
                setSelectedCategory(e.target.value);
                setCurrentPage(1);
              }}
              className="bg-[#13262f] border border-border text-xs text-semibold text-white rounded-lg px-2.5 py-1.5 focus:border-primary focus:outline-none cursor-pointer"
            >
              <option value="All">{language === 'so' ? 'Dhammaan Qaybaha' : 'All Categories'}</option>
              <option value="Auth">Auth (Amniga)</option>
              <option value="Document">Document (Faylka)</option>
              <option value="Database">Database (Kaydka)</option>
              <option value="Security">Security (Difaaca)</option>
              <option value="API">API Engine</option>
            </select>
          </div>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Simulate Action Triggers */}
          <button 
            onClick={triggerMockLog}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#00b0ff]/10 hover:bg-[#00b0ff]/20 text-[#00b0ff] border border-[#00b0ff]/20 text-[10px] font-bold uppercase tracking-wider transition-all"
            title="Inject a random background geo-server telemetry transaction alert into table memory"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            {language === 'so' ? 'Kici Telemetry' : 'Simulate Log'}
          </button>

          {/* Export button */}
          <button 
            onClick={exportLogsAsJSON}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-sidebar hover:bg-[#13262f] text-white border border-border text-[10px] font-bold uppercase tracking-wider transition-all"
          >
            <Download className="w-3.5 h-3.5" />
            Export JSON
          </button>

          {/* Trash cleaner */}
          <button 
            onClick={clearAllLogs}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 border border-rose-500/10 text-[10px] font-bold uppercase tracking-wider transition-all"
            title="Clean entire view records list"
          >
            <Trash2 className="w-3.5 h-3.5" />
            {language === 'so' ? 'Tirtir' : 'Clear List'}
          </button>

          {logs.length < DEFAULT_LOGS.length && (
            <button 
              onClick={resetDefaultLogs}
              className="p-1 px-2.5 rounded-lg border border-primary/20 text-primary bg-primary/10 hover:bg-primary/20 text-[10px] font-bold uppercase tracking-widest transition-all"
            >
              Reset
            </button>
          )}
        </div>
      </div>

      {/* Main Sortable & Filterable Data Table */}
      <div className="border border-border rounded-xl bg-sidebar/20 overflow-hidden relative">
        <div className="overflow-x-auto min-w-full">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#101f26]/60 border-b border-border">
                <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-muted-foreground/80">
                  <button onClick={() => handleSort('id')} className="flex items-center gap-1.5 hover:text-white transition-colors">
                    ID {sortBy === 'id' && (sortOrder === 'asc' ? '▲' : '▼')}
                    <ArrowUpDown className="w-3 h-3 opacity-60" />
                  </button>
                </th>
                <th className="px-5 py-3 text-[10px] font-bold uppercase tracking-wider text-muted-foreground/80">
                  <button onClick={() => handleSort('time')} className="flex items-center gap-1.5 hover:text-white transition-colors">
                    {language === 'so' ? 'Taariikh / Saacad' : 'Timestamp'} {sortBy === 'time' && (sortOrder === 'asc' ? '▲' : '▼')}
                    <ArrowUpDown className="w-3 h-3 opacity-60" />
                  </button>
                </th>
                <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-muted-foreground/80">
                  <button onClick={() => handleSort('type')} className="flex items-center gap-1.5 hover:text-white transition-colors">
                    Severity {sortBy === 'type' && (sortOrder === 'asc' ? '▲' : '▼')}
                    <ArrowUpDown className="w-3 h-3 opacity-60" />
                  </button>
                </th>
                <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-muted-foreground/80">
                  Category
                </th>
                <th className="px-5 py-3 text-[10px] font-bold uppercase tracking-wider text-muted-foreground/80">
                  <button onClick={() => handleSort('event')} className="flex items-center gap-1.5 hover:text-white transition-colors">
                    {language === 'so' ? 'Hawlgalka' : 'Action / Event Name'} {sortBy === 'event' && (sortOrder === 'asc' ? '▲' : '▼')}
                    <ArrowUpDown className="w-3 h-3 opacity-60" />
                  </button>
                </th>
                <th className="px-5 py-3 text-[10px] font-bold uppercase tracking-wider text-muted-foreground/80">
                  <button onClick={() => handleSort('user')} className="flex items-center gap-1.5 hover:text-white transition-colors">
                    {language === 'so' ? 'Isticmaalaha' : 'User Context'} {sortBy === 'user' && (sortOrder === 'asc' ? '▲' : '▼')}
                    <ArrowUpDown className="w-3 h-3 opacity-60" />
                  </button>
                </th>
                <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-muted-foreground/80 text-right">
                  {language === 'so' ? 'Faahfaahin' : 'Inspector'}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/25">
              {paginatedLogs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-muted-foreground">
                    <div className="flex flex-col items-center justify-center space-y-2">
                      <Terminal className="w-8 h-8 text-muted-foreground/45" />
                      <p className="text-sm font-semibold text-white">No Matching System Logs Found</p>
                      <p className="text-xs text-muted-foreground/75">Try relaxing your search terms or severity filters.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedLogs.map((log) => (
                  <tr 
                    key={log.id} 
                    onClick={() => setSelectedLog(log)}
                    className="hover:bg-sidebar-accent/15 transition-colors cursor-pointer group"
                  >
                    {/* Log ID */}
                    <td className="px-4 py-3.5 font-mono text-xs font-bold text-muted-foreground/90 group-hover:text-primary transition-colors">
                      {log.id}
                    </td>

                    {/* Timestamp */}
                    <td className="px-5 py-3.5 text-xs text-muted-foreground/85 font-mono">
                      {log.time}
                    </td>

                    {/* Severity Badging */}
                    <td className="px-4 py-3.5">
                      <span className={`px-2 py-0.5 rounded text-[9px] font-extrabold uppercase tracking-wide border inline-flex items-center gap-1 ${typeStyles[log.type]}`}>
                        <span className={`w-1 h-1 rounded-full ${
                          log.type === 'Critical' ? 'bg-red-400' : log.type === 'Warning' ? 'bg-amber-400' : 'bg-[#00b0ff]'
                        }`} />
                        {log.type}
                      </span>
                    </td>

                    {/* Category Column */}
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-1.5 text-xs text-white/90">
                        {categoryIcons[log.category] || null}
                        <span className="text-[11px] font-semibold">{log.category}</span>
                      </div>
                    </td>

                    {/* Event Name */}
                    <td className="px-5 py-3.5 max-w-[220px] truncate">
                      <div className="text-xs font-bold text-white group-hover:text-primary transition-colors truncate">
                        {log.event}
                      </div>
                      <div className="text-[10px] text-muted-foreground truncate font-medium mt-0.5 leading-normal">
                        {log.details}
                      </div>
                    </td>

                    {/* User Context & Environment Details */}
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2">
                        <div className="w-5.5 h-5.5 rounded-full bg-sidebar-accent/85 border border-[#1e3440] flex items-center justify-center text-[8px] font-black text-primary uppercase">
                          {log.user === 'System Process' ? 'SY' : log.user[0]}
                        </div>
                        <div className="flex flex-col">
                          <span className="text-xs font-semibold text-white/90 leading-tight">
                            {log.user === 'System Process' ? 'System daemon' : log.user.split('@')[0]}
                          </span>
                          <span className="text-[9px] text-[#00b0ff] font-mono leading-none flex items-center gap-1">
                            {log.ip}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Actions Inspector Click */}
                    <td className="px-4 py-3.5 text-right">
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedLog(log);
                        }}
                        className="p-1 px-2.5 text-[10px] font-bold text-[#00b0ff] hover:text-white bg-[#00b0ff]/5 hover:bg-[#00b0ff]/20 border border-[#00b0ff]/15 rounded-lg transition-all"
                      >
                        <Eye className="w-3.5 h-3.5 inline mr-1" />
                        Inspect
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Footer Paginations */}
        {sortedLogs.length > 0 && (
          <div className="px-4 py-3 bg-[#101f26]/40 border-t border-border flex items-center justify-between">
            <span className="text-xs text-muted-foreground">
              {language === 'so' 
                ? `Ku dhowaad ${sortedLogs.length} diiwaan | Bogga ${currentPage} ee ${totalPages}`
                : `Showing ${Math.min(sortedLogs.length, itemsPerPage)} of ${sortedLogs.length} logs | Page ${currentPage} of ${totalPages}`
              }
            </span>
            <div className="flex items-center gap-1">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                className="p-1.5 rounded bg-sidebar hover:bg-sidebar-accent border border-border text-white disabled:opacity-40 disabled:cursor-not-allowed transition-all"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                className="p-1.5 rounded bg-sidebar hover:bg-sidebar-accent border border-border text-white disabled:opacity-40 disabled:cursor-not-allowed transition-all"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Advanced Telemetry Telemetry Log Detail Drawer / Modal */}
      {selectedLog && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
            onClick={() => setSelectedLog(null)}
          />
          <div className="relative bg-[#0d1a21] border border-border rounded-xl shadow-2xl w-full max-w-xl overflow-hidden animate-in zoom-in-95 duration-150">
            {/* Header */}
            <div className={`p-4 border-b border-border flex justify-between items-center bg-gradient-to-r from-sidebar-accent/5 to-sidebar/20`}>
              <div className="flex items-center gap-2">
                <span className={`px-2 py-0.5 rounded text-[9px] font-extrabold uppercase tracking-wide border flex items-center gap-1 ${typeStyles[selectedLog.type]}`}>
                  <span className={`w-1 h-1 rounded-full ${
                    selectedLog.type === 'Critical' ? 'bg-red-400' : selectedLog.type === 'Warning' ? 'bg-amber-400' : 'bg-[#00b0ff]'
                  }`} />
                  {selectedLog.type}
                </span>
                <h3 className="text-sm font-mono font-bold text-white uppercase tracking-wider">
                  Log Audit Inspector - {selectedLog.id}
                </h3>
              </div>
              <button 
                onClick={() => setSelectedLog(null)}
                className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-white transition-all"
              >
                <X className="w-4.5 h-4.5" />
              </button>
            </div>

            {/* Content Body */}
            <div className="p-6 space-y-5">
              {/* Event title and details */}
              <div className="bg-[#12232d] border border-[#1e3440] p-4 rounded-xl">
                <h4 className="text-xs font-bold uppercase tracking-widest text-primary mb-1">
                  Event / Incident Name
                </h4>
                <p className="text-sm font-bold text-white tracking-tight leading-relaxed">
                  {selectedLog.event}
                </p>
                <p className="text-xs text-muted-foreground leading-normal mt-2">
                  {selectedLog.details}
                </p>
              </div>

              {/* User and Location context */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-sidebar/40 border border-border p-3.5 rounded-xl space-y-1">
                  <div className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                    <User className="w-3.5 h-3.5 text-[#00b0ff]" />
                    <span>Identity Context</span>
                  </div>
                  <p className="text-xs font-bold text-white truncate/tight pt-1">
                    {selectedLog.user}
                  </p>
                  <span className="inline-block text-[9px] bg-primary/10 border border-primary/20 px-2 py-0.5 rounded text-primary uppercase font-extrabold tracking-wider">
                    {selectedLog.role}
                  </span>
                </div>

                <div className="bg-sidebar/40 border border-border p-3.5 rounded-xl space-y-1">
                  <div className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                    <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Location Context</span>
                  </div>
                  <p className="text-xs font-bold text-white pt-1">
                    {selectedLog.location}
                  </p>
                  <p className="text-[10px] text-muted-foreground font-mono leading-none">
                    Geolocation metadata
                  </p>
                </div>
              </div>

              {/* Network and environment */}
              <div className="bg-[#101f26]/50 border border-border p-4 rounded-xl space-y-3">
                <div className="flex justify-between items-center pb-2 border-b border-border/20 text-xs text-muted-foreground font-semibold">
                  <span className="flex items-center gap-1">
                    <Network className="w-3.5 h-3.5 text-white/70" /> Source Network IP
                  </span>
                  <span className="font-mono text-white tracking-tight">{selectedLog.ip}</span>
                </div>

                <div className="flex justify-between items-center pb-2 border-b border-border/20 text-xs text-muted-foreground font-semibold">
                  <span>Category System Domain</span>
                  <span className="font-bold text-primary uppercase text-[10px] bg-primary/5 border border-primary/25 px-2 py-0.5 rounded">
                    {selectedLog.category}
                  </span>
                </div>

                <div className="flex justify-between items-center pb-2 border-b border-border/20 text-xs text-muted-foreground font-semibold">
                  <span>Unix GMT Timestamp</span>
                  <span className="font-mono text-white/95">{selectedLog.time}</span>
                </div>

                <div className="space-y-1 pt-1">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground block">
                    Agent Signature Platform
                  </span>
                  <p className="text-[10px] font-mono text-muted-foreground/90 bg-muted/40 p-2 rounded-lg leading-relaxed break-all">
                    {selectedLog.userAgent}
                  </p>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 bg-[#101f26]/30 border-t border-border flex justify-end gap-2.5">
              <button 
                onClick={() => {
                  const serializedLog = JSON.stringify(selectedLog, null, 2);
                  const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(serializedLog);
                  const anchor = document.createElement('a');
                  anchor.setAttribute("href", dataUri);
                  anchor.setAttribute("download", `geomds_${selectedLog.id}.json`);
                  anchor.click();
                }}
                className="px-4 py-2 bg-sidebar border border-border rounded-xl text-xs font-bold text-white uppercase tracking-widest hover:bg-[#13262f] transition-all"
              >
                Export JSON Log
              </button>
              <button 
                onClick={() => setSelectedLog(null)}
                className="px-4 py-2 bg-primary text-primary-foreground rounded-xl text-xs font-bold uppercase tracking-widest hover:opacity-90 transition-all"
              >
                Dismiss Audit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
