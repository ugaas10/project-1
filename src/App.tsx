import React, { useState, useEffect, useRef } from 'react';
import { 
  LayoutDashboard, 
  FolderOpen, 
  Workflow, 
  Menu, 
  X, 
  Search, 
  Bell, 
  User,
  RefreshCw,
  ChevronRight,
  Plus,
  Command,
  Upload,
  FileText,
  MoreVertical,
  Download,
  Settings as SettingsIcon,
  Shield,
  Trash2,
  Tag as TagIcon,
  Briefcase,
  Cloud,
  CheckSquare,
  Sparkles,
  Map,
  Files as FilesIcon,
  FileCheck,
  Clock,
  ExternalLink,
  MessageSquare,
  Calendar,
  LogOut,
  Eye,
  QrCode,
  Info,
  Edit2,
  Share2,
  Globe
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// New Components
import { ThemeToggle } from './components/ThemeToggle';
import { LanguageToggle } from './components/LanguageToggle';
import { CommandPalette } from './components/CommandPalette';
import { StorageCard } from './components/StorageCard';
import { RecentActivity } from './components/RecentActivity';
import { ToastProvider, useToast } from './components/Toast';
import { HeaderActions } from './components/HeaderActions';
import { FilterBar } from './components/FilterBar';
import { ShortcutsHelp } from './components/ShortcutsHelp';
import { SortingDropdown } from './components/SortingDropdown';
import { ConfirmationModal } from './components/ConfirmationModal';
import { BulkActionToolbar } from './components/BulkActionToolbar';
import { TagSystem } from './components/TagSystem';

// Supabase core database link
import { supabase } from './lib/supabase';

import { DocumentPreviewModal } from './components/DocumentPreviewModal';
import { QRScanner } from './components/QRScanner';
import { BatchRenameModal } from './components/BatchRenameModal';
import { BatchTagModal } from './components/BatchTagModal';
import { HighStakesDeleteAllModal } from './components/HighStakesDeleteAllModal';
import { BulkShareModal } from './components/BulkShareModal';
import { VersionHistory } from './components/VersionHistory';
import { LanguageProvider, useLanguage } from './lib/i18n';
import { VoiceAssistant } from './components/VoiceAssistant';
import { LoginView } from './components/LoginView';

import { useOfflineCache } from './hooks/useOfflineCache';
import { checkCompliance } from './utils/compliance';
import { exportDocumentSummaryPDF } from './lib/pdfExport';
import { Logo } from './components/Logo';
import { ProjectProgressRing } from './components/ProjectProgressRing';
import { ProjectsView } from './components/ProjectsView';
import { QuickCreateProjectModal } from './components/QuickCreateProjectModal';
import { DocumentsView } from './components/DocumentsView';
import { StorageView } from './components/StorageView';
import { SearchView } from './components/SearchView';
import { ApprovalsView } from './components/ApprovalsView';
import { AICaawiyeView } from './components/AICaawiyeView';
import { UploadModal } from './components/UploadModal';
import { SettingsView } from './components/SettingsView';
import { AdminView } from './components/AdminView';
import { AnalyticsView } from './components/AnalyticsView';
import { TimelineView } from './components/TimelineView';
import { WebAppsView } from './components/WebAppsView';

interface Document {
  id: string;
  name: string;
  size: string;
  date: string;
  tags: string[];
  type: string;
  status?: string;
  uploadedBy?: 'Member' | 'Admin' | 'System';
  uploaderName?: string;
  Owner?: string;
  ComplianceCode?: string;
  VersionHistory?: string;
  url?: string;
}

const initialDocs: Document[] = [
  {
    id: 'init-1',
    name: 'Mogadishu_Highway_A42_Centerline.dwg',
    size: '12.4 MB',
    date: '2026-05-25',
    tags: ['Naqshado', 'CAD', 'Mogadishu', 'Highway'],
    type: 'dwg',
    status: 'Approved',
    uploadedBy: 'Member',
    uploaderName: 'Eng. Ahmed Ali',
    Owner: 'Mogadishu Municipality',
    ComplianceCode: 'MOG-HW-042',
    VersionHistory: 'v1.2 (Active)'
  },
  {
    id: 'init-2',
    name: 'Hargeisa_Commercial_Complex_Drainage.pdf',
    size: '4.8 MB',
    date: '2026-04-15',
    tags: ['Reports', 'PDF', 'Hargeisa', 'Drainage'],
    type: 'pdf',
    status: 'Approved',
    uploadedBy: 'Member',
    uploaderName: 'Eng. Sarah J.',
    Owner: 'Hargeisa Land Dept',
    ComplianceCode: 'HRG-DR-889',
    VersionHistory: 'v2.0 (Active)'
  },
  {
    id: 'init-3',
    name: 'Kismayo_River_Demarcation_Final.dxf',
    size: '8.1 MB',
    date: '2026-05-20',
    tags: ['Naqshado', 'CAD', 'Kismayo', 'Riverside'],
    type: 'dxf',
    status: 'Approved',
    uploadedBy: 'Member',
    uploaderName: 'Eng. Hassan M.',
    Owner: 'Kismayo Ministry of Works',
    ComplianceCode: 'KIS-RD-112',
    VersionHistory: 'v1.0 (Draft)'
  },
  {
    id: 'init-4',
    name: 'Berbera_Port_Zoning_Subdivision.pdf',
    size: '15.2 MB',
    date: '2026-03-10',
    tags: ['Reports', 'PDF', 'Berbera', 'Zoning'],
    type: 'pdf',
    status: 'Approved',
    uploadedBy: 'Admin',
    uploaderName: 'Admin Maamule',
    Owner: 'Berbera Port Authority',
    ComplianceCode: 'BER-PZ-903',
    VersionHistory: 'v1.1 (Active)'
  },
  {
    id: 'init-5',
    name: 'Somalia_Soil_Topography_Survey_2026.pdf',
    size: '22.1 MB',
    date: '2026-05-01',
    tags: ['Reports', 'Maps', 'Topography'],
    type: 'pdf',
    status: 'Approved',
    uploadedBy: 'System',
    uploaderName: 'Drone GIS Auto-Scanner',
    Owner: 'Federal Land Agency',
    ComplianceCode: 'SOM-ST-455',
    VersionHistory: 'v1.0 (Active)'
  },
  {
    id: 'init-6',
    name: 'Mogadishu_District_Cadastral_Map.dwg',
    size: '18.7 MB',
    date: '2026-05-12',
    tags: ['Naqshado', 'CAD', 'Maps'],
    type: 'dwg',
    status: 'Approved',
    uploadedBy: 'Admin',
    uploaderName: 'Eng. Mohamed Abduqaadir',
    Owner: 'Somali GIS Authority',
    ComplianceCode: 'MOG-CD-231',
    VersionHistory: 'v3.2 (Active)'
  },
  {
    id: 'init-7',
    name: 'Engineering_Compliance_Checklist.pdf',
    size: '1.2 MB',
    date: '2026-02-18',
    tags: ['Cadeymo', 'PDF', 'Compliance'],
    type: 'pdf',
    status: 'Approved',
    uploadedBy: 'System',
    uploaderName: 'Auto-Compliance Parser',
    Owner: 'Federal Land Agency',
    ComplianceCode: 'ENG-CC-101',
    VersionHistory: 'v1.0 (Active)'
  }
];

const initialProjects = [
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
    color: '#06b6d4',
    desc: 'Complete topographical survey for the new highway extension project. Includes centerline layout and drainage study.',
    coords: '2.0469°N, 45.3182°E',
    users: 3,
    pending: 3
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
    color: '#34d399',
    desc: 'Boundary survey and subdivision planning for the new commercial development zone. Includes site grading details.',
    coords: '9.5600°N, 44.0650°E',
    users: 2,
    pending: 1
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
    daysRemaining: 145,
    engineer: 'Eng. Hassan M.',
    milestones: [
      { label: 'Registry', status: 'active', width: '50%' },
      { label: 'Mapping', status: 'todo', width: '50%' },
    ],
    docs: 18,
    date: '2026-05-20',
    bg: 'bg-amber-500/5',
    color: '#fbbf24',
    desc: 'Detailed cadastral survey for riverside property demarcation and flood zone analysis.',
    coords: '-0.3582°N, 42.5454°E',
    users: 3,
    pending: 0
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
    daysRemaining: 0,
    engineer: 'Eng. Aisha K.',
    milestones: [
      { label: 'Survey', status: 'done', width: '100%' },
    ],
    docs: 45,
    date: '2026-03-10',
    bg: 'bg-emerald-500/5',
    color: '#10b981',
    desc: 'Comprehensive cadastral mapping and industrial zoning subdivision for new trade terminal expansion.',
    coords: '10.4396°N, 45.0135°E',
    users: 4,
    pending: 0
  }
];

function AppContent() {
  const [currentUser, setCurrentUser] = useState<{ email: string; role: string; name: string } | null>(() => {
    const saved = localStorage.getItem('geomds_user');
    return saved ? JSON.parse(saved) : null;
  });

  const [projects, setProjects] = useOfflineCache<any[]>('geodms_projects_data', initialProjects);
  const [isQuickCreateOpen, setIsQuickCreateOpen] = useState(false);

  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [activeFilter, setActiveFilter] = useState('recent');
  const [currentSort, setCurrentSort] = useState('date');
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [bulkActionType, setBulkActionType] = useState<'archive' | 'delete'>('archive');
  const [isHighStakesDeleteAllOpen, setIsHighStakesDeleteAllOpen] = useState(false);
  const [isBatchRenameOpen, setIsBatchRenameOpen] = useState(false);
  const [isBatchTagOpen, setIsBatchTagOpen] = useState(false);
  const [isBatchShareOpen, setIsBatchShareOpen] = useState(false);
  const [sharedWorkspace, setSharedWorkspace] = useState<{ docIds: string[]; expiry: number } | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isCorridorQRScannerOpen, setIsCorridorQRScannerOpen] = useState(false);
  const [projectsViewMode, setProjectsViewMode] = useState<'List' | 'Map'>('List');
  const [activeFileCategory, setActiveFileCategory] = useState('Naqshado');
  const [fileSearch, setFileSearch] = useState('');
  const [dashboardDocSearch, setDashboardDocSearch] = useState('');
  const [dashboardDocTypeFilter, setDashboardDocTypeFilter] = useState('All');
  const [dashboardUploaderFilter, setDashboardUploaderFilter] = useState<'Human' | 'All' | 'System'>('Human');
  const [activities, setActivities] = useState<any[]>([
    { id: 1, type: 'upload', user: 'Admin', file: 'Q1_Financials_Final.pdf', time: '2 mins ago', icon: Upload, color: 'text-primary' },
    { id: 2, type: 'review', user: 'Sarah Wilson', file: 'Employee_Contract_V2.docx', time: '1 hour ago', icon: FileText, color: 'text-accent-foreground', status: 'Approved' },
    { id: 3, type: 'workflow', user: 'System', file: 'Workflow: Invoice #4502', time: '4 hours ago', icon: RefreshCw, color: 'text-success', status: 'Approved' },
  ]);
  
  // Document Management States
  const [documents, setDocuments] = useOfflineCache<Document[]>('geodms_documents', initialDocs);
  const [selectedDocs, setSelectedDocs] = useState<string[]>([]);
  const [docsSubTab, setDocsSubTab] = useState<'active' | 'deleted'>('active');
  const [previewDoc, setPreviewDoc] = useState<Document | null>(null);
  const [editingDocId, setEditingDocId] = useState<string | null>(null);
  const [editingDocName, setEditingDocName] = useState<string>('');
  const [verificationResults, setVerificationResults] = useState<Record<string, { status: 'valid' | 'expired' | 'invalid'; message: string; checkedAt: string }>>({});
  const [isVerifying, setIsVerifying] = useState(false);

  // Clear document selections when subtab changes
  useEffect(() => {
    setSelectedDocs([]);
  }, [docsSubTab]);

  // Real-time synchronization of projects and documents with Firebase Firestore
  useEffect(() => {
    if (!currentUser) return;

    const initializeDatabaseIfNeeded = async () => {
      try {
        const { data: statusSnap, error: statusErr } = await supabase.from('system_config').select('*').eq('id', 'status').single();
        
        if (statusErr && statusErr.code === 'PGRST116') {
          console.log("Database status doc not found. Seeding initial projects and documents...");
          for (const prj of initialProjects) {
            await supabase.from('projects').insert({ ...prj, id: String(prj.id) });
          }
          for (const d of initialDocs) {
            await supabase.from('documents').insert(d);
          }
          await supabase.from('system_config').insert({ id: 'status', seeded: true });
          console.log("Database seeded successfully.");
        }
      } catch (err) {
        console.error("Failed to check status or seed database: ", err);
      }
    };

    initializeDatabaseIfNeeded();

    const fetchProjects = async () => {
      const { data } = await supabase.from('projects').select('*');
      if (data) setProjects(data);
    };

    const fetchDocs = async () => {
      const { data } = await supabase.from('documents').select('*');
      if (data) setDocuments(data as Document[]);
    };

    fetchProjects();
    fetchDocs();

    const projectsChannel = supabase.channel('public:projects')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'projects' }, () => {
        fetchProjects();
      }).subscribe();

    const docsChannel = supabase.channel('public:documents')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'documents' }, () => {
        fetchDocs();
      }).subscribe();

    return () => {
      supabase.removeChannel(projectsChannel);
      supabase.removeChannel(docsChannel);
    };
  }, [currentUser]);


  const handleBatchVerify = () => {
    if (selectedDocs.length === 0) {
      showToast(t('language') === 'so' ? 'Fadlan dooro ugu yaraan hal dukumiinti' : 'Please select at least one document', 'info');
      return;
    }

    setIsVerifying(true);
    showToast(
      t('language') === 'so' 
        ? `Hubinta xeerka u hoggaansanaanta ${selectedDocs.length} dukuminti...` 
        : `Verifying compliance codes for ${selectedDocs.length} document(s)...`, 
      'info'
    );

    setTimeout(() => {
      const results: Record<string, { status: 'valid' | 'expired' | 'invalid'; message: string; checkedAt: string }> = { ...verificationResults };
      let validCount = 0;
      let expiredCount = 0;
      let invalidCount = 0;

      selectedDocs.forEach(id => {
        const doc = documents.find(d => d.id === id);
        if (doc) {
          const check = checkCompliance({
            id: doc.id,
            name: doc.name,
            date: doc.date,
            tags: doc.tags,
            type: doc.type,
            status: doc.status,
            ComplianceCode: doc.ComplianceCode
          });
          results[id] = check;

          if (check.status === 'valid') validCount++;
          else if (check.status === 'expired') expiredCount++;
          else if (check.status === 'invalid') invalidCount++;
        }
      });

      setVerificationResults(results);
      setIsVerifying(false);

      // Create a nice localized notification
      const summaryTitle = t('language') === 'so' 
        ? `Hubinta Dufcadda U Hoggaansanaanta` 
        : `Batch Compliance Audit Complete`;
      
      const summaryMsg = t('language') === 'so'
        ? `La hubiyay ${selectedDocs.length}: ${validCount} Sharciga ah, ${expiredCount} Dhacay, ${invalidCount} Aan shaqayn`
        : `Audited ${selectedDocs.length} items: ${validCount} Valid, ${expiredCount} Expired, ${invalidCount} Invalid`;

      showToast(summaryMsg, invalidCount > 0 ? 'error' : expiredCount > 0 ? 'warning' : 'success');

      // Post notification to system log
      setNotifications(prev => [
        {
          id: `verify-note-${Date.now()}`,
          title: summaryTitle,
          user: summaryMsg,
          time: 'Just now',
          type: invalidCount > 0 ? 'error' : expiredCount > 0 ? 'pending' : 'approved',
          read: false
        },
        ...prev
      ]);
    }, 1200);
  };

  const handleBatchRestore = () => {
    if (selectedDocs.length === 0) return;
    showToast(t('language') === 'so' ? `Soo celinta dufcadda ${selectedDocs.length} dukuminti...` : `Restoring ${selectedDocs.length} document(s)...`, 'info');
    if (currentUser) {
      selectedDocs.forEach((docId) => {
        supabase.from('documents').update({ isDeleted: false }).eq('id', docId).then(({ error }) => {
          if (error) console.error("Supabase restore error: ", error);
        });
      });
    }
    setSelectedDocs([]);
    showToast(t('language') === 'so' ? `${selectedDocs.length} dukuminti si guul leh loo soo celiyay` : `${selectedDocs.length} document(s) restored successfully`, 'success');
  };

  const handleDeleteAllDocuments = async () => {
    try {
      const targetDocs = documents.filter(d => docsSubTab === 'active' ? !d.isDeleted : d.isDeleted);
      if (targetDocs.length === 0) {
        showToast(
          t('language') === 'so' 
            ? 'Ma jiraan wax dukumiinti ah oo la tirtiri karo!' 
            : 'No documents found to delete!', 
          'info'
        );
        return;
      }

      showToast(
        t('language') === 'so' 
          ? 'Tirtirista dhammaan dukumiintiyada...' 
          : 'Clearing all documents...', 
        'info'
      );

      for (const d of targetDocs) {
        if (docsSubTab === 'active') {
          await supabase.from('documents').update({ isDeleted: true }).eq('id', d.id);
        } else {
          await supabase.from('documents').delete().eq('id', d.id);
        }
      }

      setSelectedDocs([]);
      showToast(
        t('language') === 'so'
          ? (docsSubTab === 'active' 
              ? 'Dhammaan dukumiintiyada firfircoon waa la kaydiyay' 
              : 'Dhammaan dukumiintiyada la kaydiyay si joogto ah ayaa loo tirtiray')
          : (docsSubTab === 'active'
              ? 'All active documents archived successfully'
              : 'All archived documents permanently deleted'),
        'success'
      );
    } catch (err) {
      console.error('Error in delete all operation:', err);
      showToast('Operation failed', 'error');
    }
  };

  // Automatically filter legacy numeric IDs
  useEffect(() => {
    const hasLegacyMock = documents.some(d => ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11'].includes(d.id));
    if (hasLegacyMock) {
      setDocuments(prev => prev.filter(d => !['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11'].includes(d.id)));
    }
  }, [documents.length, setDocuments]);
  
  const { showToast } = useToast();
  const { t } = useLanguage();

  // Temporary Secure Share Link URL parser
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const sharedDocsParam = params.get('shared_docs');
    const tokenParam = params.get('token');

    if (sharedDocsParam && tokenParam) {
      const expiry = parseInt(tokenParam, 10);
      if (!isNaN(expiry)) {
        if (Date.now() < expiry) {
          const docIds = sharedDocsParam.split(',');
          setSharedWorkspace({ docIds, expiry });
          // Switch to documents tab to see shared files
          setActiveTab('docs');
          showToast(`🤝 Secure Shared Workspace active! Loaded ${docIds.length} shared document(s).`, 'success');
        } else {
          showToast('⚠️ The temporary secure share link has expired!', 'error');
          // Clean up URL without reloading
          window.history.replaceState({}, document.title, window.location.pathname);
        }
      }
    }
  }, [showToast]);

  // Interactive Notifications state and actions
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState([
    { id: '1', title: 'Document Review Requested', user: 'Ahmed K. submitted "Cross_Section_CS-001..."', time: '10m ago', type: 'pending', read: false },
    { id: '2', title: 'Document Approved', user: 'Your document "Highway_A42_Centerline..."', time: '1h ago', type: 'approved', read: false },
    { id: '3', title: 'New Comment', user: 'Fatima H. commented on "Drainage_Mapping_Report"', time: '2h ago', type: 'info', read: true },
    { id: '4', title: 'Document Needs Revision', user: '"Subdivision_Plan_V2.pdf" was rejected.', time: '1d ago', type: 'error', read: true },
  ]);
  const notificationsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notificationsRef.current && !notificationsRef.current.contains(event.target as Node)) {
        setIsNotificationsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleMarkAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    showToast(t('language') === 'so' ? 'Dhammaan ogeysiisyada waa la aqriyay' : 'All notifications marked as read', 'success');
  };

  const handleMarkAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    const note = notifications.find(n => n.id === id);
    if (note && !note.read) {
      showToast(t('language') === 'so' ? `Ogeysiis la aqriyay: ${note.title}` : `Marked read: ${note.title}`, 'success');
    }
  };

  const handleClearNotification = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setNotifications(prev => prev.filter(n => n.id !== id));
    showToast(t('language') === 'so' ? 'Ogeysiis waa la tirtiray' : 'Notification cleared', 'info');
  };

  const handleClearAll = () => {
    setNotifications([]);
    showToast(t('language') === 'so' ? 'Dhammaan ogeysiisyada waa la eberyeeyay' : 'Cleared all notifications', 'info');
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'approved': return FileCheck;
      case 'pending': return Bell;
      case 'error': return X;
      default: return MessageSquare;
    }
  };

  const isUserAdmin = currentUser?.role === 'Maamulaha';
  interface NavItem {
    id: string;
    label: string;
    icon: any;
    badge?: number;
  }
  const navItems: NavItem[] = [
    { id: 'dashboard', label: t('dashboard'), icon: LayoutDashboard },
    { id: 'projects', label: t('projects'), icon: Briefcase },
    { id: 'map', label: t('mapView'), icon: Map },
    { id: 'docs', label: t('documents'), icon: FileText },
    { id: 'files', label: t('files'), icon: FolderOpen },
    { id: 'storage', label: t('storage'), icon: Cloud },
    { id: 'search', label: t('search'), icon: Search },
    { id: 'approvals', label: t('approvals'), icon: CheckSquare },
    { id: 'analytics', label: t('analytics'), icon: LayoutDashboard },
    { id: 'timeline', label: t('timeline'), icon: Calendar },
    { id: 'ai', label: t('aiAssistant'), icon: Sparkles },
    { id: 'webapps', label: t('webapps'), icon: Globe },
    { id: 'settings', label: t('settings'), icon: SettingsIcon },
    ...(isUserAdmin ? [{ id: 'admin', label: t('admin'), icon: Shield }] : []),
  ];

  const handleVoiceCommand = (command: string, args?: string) => {
    switch (command) {
      case 'dashboard':
      case 'projects':
      case 'docs':
      case 'files':
      case 'storage':
      case 'search':
      case 'approvals':
      case 'analytics':
      case 'timeline':
      case 'ai':
      case 'webapps':
      case 'settings':
      case 'admin':
        setActiveTab(command);
        if (command === 'projects') setProjectsViewMode('List');
        break;
      case 'map':
        setActiveTab('projects');
        setProjectsViewMode('Map');
        break;
      case 'upload':
        setIsUploadModalOpen(true);
        break;
      case 'search_term':
        if (args) {
          setActiveTab('search');
          // We might need to expose setFileSearch or use a global search state if we want to pre-fill
          // For now, let's just trigger a toast acknowledging the search
          showToast(`Searching for: ${args}`, 'info');
          // If Searchview has its own internal state, we'd need to sync it.
          // In App.tsx, fileSearch is used.
          setFileSearch(args);
        }
        break;
      default:
        showToast('Command received but not implemented', 'info');
    }
  };

  // Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsCommandPaletteOpen(prev => !prev);
      }
      if (e.key.toLowerCase() === 'n' && !(e.target instanceof HTMLInputElement) && !(e.target instanceof HTMLTextAreaElement)) {
        showToast('Quick Upload triggered (N)', 'info');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showToast]);

  const toggleSelectAll = () => {
    const visibleDocs = documents.filter(d => docsSubTab === 'active' ? !d.isDeleted : d.isDeleted);
    const visibleIds = visibleDocs.map(d => d.id);
    const allVisibleSelected = visibleIds.length > 0 && visibleIds.every(id => selectedDocs.includes(id));

    if (allVisibleSelected) {
      setSelectedDocs(prev => prev.filter(id => !visibleIds.includes(id)));
    } else {
      setSelectedDocs(prev => [...new Set([...prev, ...visibleIds])]);
    }
  };

  const toggleSelectDoc = (id: string) => {
    setSelectedDocs(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const handleAddTag = (id: string, tag: string) => {
    setDocuments(prev => prev.map(d => 
      d.id === id ? { ...d, tags: [...new Set([...d.tags, tag])] } : d
    ));
    showToast(`Tag "${tag}" added`, 'success');
  };

  const handleRemoveTag = (id: string, tag: string) => {
    setDocuments(prev => prev.map(d => 
      d.id === id ? { ...d, tags: d.tags.filter(t => t !== tag) } : d
    ));
    showToast(`Tag removed`, 'info');
  };

  // File Category Data dynamic mapping based on user-uploaded documents
  const getCategoryFiles = (label: string) => {
    // Sort documents chronologically by extraction timestamp first
    const getDocTimestamp = (doc: Document) => {
      if (doc.id.startsWith('upload-') || doc.id.startsWith('doc-')) {
        const parts = doc.id.split('-');
        if (parts[1]) {
          const ts = parseInt(parts[1], 10);
          if (!isNaN(ts)) return ts;
        }
      }
      const d = new Date(doc.date).getTime();
      return isNaN(d) ? 0 : d;
    };

    const sortedDocuments = [...documents].sort((a, b) => getDocTimestamp(b) - getDocTimestamp(a));

    return sortedDocuments.filter(d => {
      const typeLower = d.type.toLowerCase();
      const nameLower = d.name.toLowerCase();
      const tagsUpper = d.tags.map(t => t.toUpperCase());
      
      switch (label) {
        case 'Naqshado':
          return tagsUpper.some(t => ['ENGINEERING', 'CAD', 'DESIGN', 'NAQSHADO', 'DROPPED', 'UPLOADED'].includes(t)) || 
                 ['dwg', 'dxf', 'cad', 'png', 'jpg', 'jpeg'].includes(typeLower);
        case 'Reports':
          return tagsUpper.some(t => ['SURVEY', 'AUDIT', 'REPORTS', 'PDF'].includes(t)) || 
                 ['pdf'].includes(typeLower) || 
                 nameLower.includes('report') || 
                 nameLower.includes('warbixin');
        case 'Warbixino':
          return tagsUpper.some(t => ['HR', 'MARKETING', 'STRATEGY', 'WARBIXINO', 'DOC', 'DOCX', 'PPT', 'PPTX'].includes(t)) || 
                 ['doc', 'docx', 'ppt', 'pptx', 'xls', 'xlsx', 'txt'].includes(typeLower);
        case 'Cadeymo':
          return tagsUpper.some(t => ['FINANCE', 'BILLING', 'CADEYMO', 'CERTIFICATE', 'SECURITY'].includes(t)) || 
                 tagsUpper.includes('CERTIFICATE');
        case 'Duplicate':
          return tagsUpper.some(t => ['DUPLICATE', 'BACKUP'].includes(t));
        case 'Hishiisyo':
          return tagsUpper.some(t => ['LEGAL', 'CONTRACT', 'AGREEMENT', 'HISHIISYO'].includes(t));
        case 'Maps':
          return tagsUpper.some(t => ['MAP', 'MAPS', 'TOPOGRAPHY', 'HYDROLOGY', 'GEOMETRY'].includes(t));
        default:
          return false;
      }
    }).map(d => ({
      id: d.id,
      name: d.name,
      size: d.size,
      date: d.date,
      icon: d.type === 'pdf' ? FileText :
            ['dwg', 'dxf', 'cad'].includes(d.type.toLowerCase()) ? Map : FilesIcon
    }));
  };

  const categoryData = [
    { label: 'Naqshado', icon: FolderOpen, desc: 'Dukumiintiyada nashqadeynta iyo qorsheynta', files: getCategoryFiles('Naqshado') },
    { label: 'Reports', icon: FilesIcon, desc: 'Engineering and survey reports', files: getCategoryFiles('Reports') },
    { label: 'Warbixino', icon: MessageSquare, desc: 'Project updates and briefings', files: getCategoryFiles('Warbixino') },
    { label: 'Cadeymo', icon: FileCheck, desc: 'Certificates and verification docs', files: getCategoryFiles('Cadeymo') },
    { label: 'Duplicate', icon: FilesIcon, desc: 'Backup and redundant copies', files: getCategoryFiles('Duplicate') },
    { label: 'Hishiisyo', icon: FileText, desc: 'Contracts and legal agreements', files: getCategoryFiles('Hishiisyo') },
    { label: 'Maps', icon: Map, desc: 'Spatial and topographical maps', files: getCategoryFiles('Maps') },
  ];

  const currentCategory = categoryData.find(c => c.label === activeFileCategory) || categoryData[0];
  const filteredCategoryFiles = currentCategory.files.filter(f => 
    f.name.toLowerCase().includes(fileSearch.toLowerCase())
  );

  if (!currentUser) {
    return (
      <LoginView
        onLoginSuccess={(user) => {
          setCurrentUser(user);
          localStorage.setItem('geomds_user', JSON.stringify(user));
        }}
      />
    );
  }

  return (
    <div className="flex h-screen w-full bg-background overflow-hidden relative text-foreground">
      {/* Grid Pattern Mesh Background */}
      <div className="absolute inset-0 bg-grid-pattern opacity-20 pointer-events-none" />
      
      <ShortcutsHelp />

      <ConfirmationModal 
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={() => {
          if (selectedDocs.length > 0) {
            if (currentUser) {
              if (bulkActionType === 'archive') {
                selectedDocs.forEach((docId) => {
                  supabase.from('documents').update({ isDeleted: true }).eq('id', docId).catch(err => {
                    console.error("Firestore soft-delete error: ", err);
                  });
                });
                showToast(t('language') === 'so' ? `${selectedDocs.length} dukuminti waa la kaydiyay` : `${selectedDocs.length} document(s) archived successfully`, 'success');
              } else {
                selectedDocs.forEach((docId) => {
                  supabase.from('documents').delete().eq('id', docId).catch(err => {
                    console.error("Firestore permanent delete error: ", err);
                  });
                });
                showToast(t('language') === 'so' ? `${selectedDocs.length} dukuminti si joogto ah ayaa loo tirtiray` : `${selectedDocs.length} document(s) permanently deleted`, 'success');
              }
            }
            setSelectedDocs([]);
          } else {
            showToast('Item deleted successfully', 'success')
          }
          setIsDeleteModalOpen(false);
        }}
        title={
          bulkActionType === 'archive'
            ? (t('language') === 'so' ? `Kaydi ${selectedDocs.length > 0 ? `${selectedDocs.length} Dukuminti` : 'Dukumintiga'}?` : `Archive ${selectedDocs.length > 0 ? `${selectedDocs.length} Documents` : 'Document'}?`)
            : (t('language') === 'so' ? `Si Joogto ah u Tirtir ${selectedDocs.length > 0 ? `${selectedDocs.length} Dukuminti` : 'Dukumintiga'}?` : `Permanently Delete ${selectedDocs.length > 0 ? `${selectedDocs.length} Documents` : 'Document'}?`)
        }
        message={
          bulkActionType === 'archive'
            ? (t('language') === 'so' ? "Walxaha la xushay waxaa loo rari doonaa Khasnadda Dukumiintiyada Tirtiray. Waad soo celin kartaa mar kasta." : "This action will move the selected items to the Deleted Documents Archive. You can view or restore them at any time.")
            : (t('language') === 'so' ? "Tallaabadan dib looma celin karo. Walxaha la xushay si joogto ah ayaa looga saari doonaa kaydka dhijitaalka ah." : "This action cannot be undone. The selected items will be permanently removed from the digital archive and database.")
        }
        confirmLabel={
          bulkActionType === 'archive'
            ? (t('language') === 'so' ? "Kaydi Dukumintiyada" : "Move to Archive")
            : (t('language') === 'so' ? "Si Joogto ah u Tirtir" : "Delete Permanently")
        }
        type={bulkActionType === 'archive' ? "info" : "danger"}
      />

      <DocumentPreviewModal 
        isOpen={!!previewDoc}
        onClose={() => setPreviewDoc(null)}
        documentName={previewDoc?.name || ''}
        docId={previewDoc?.id}
        document={previewDoc}
        setDocuments={setDocuments}
      />

      <BulkActionToolbar 
        selectedCount={selectedDocs.length}
        onClear={() => setSelectedDocs([])}
        onArchive={docsSubTab === 'active' ? () => { setBulkActionType('archive'); setIsDeleteModalOpen(true); } : undefined}
        onDelete={() => { setBulkActionType('delete'); setIsDeleteModalOpen(true); }}
        onMove={() => showToast('Moving items...', 'info')}
        onDownload={() => showToast('Compressing items for download...', 'success')}
        onRename={() => setIsBatchRenameOpen(true)}
        onTag={() => setIsBatchTagOpen(true)}
        onVerify={handleBatchVerify}
        onRestore={docsSubTab === 'deleted' ? handleBatchRestore : undefined}
        onDeleteAll={() => setIsHighStakesDeleteAllOpen(true)}
        onShare={() => setIsBatchShareOpen(true)}
        isUserAdmin={currentUser?.role === 'Maamulaha'}
      />

      <HighStakesDeleteAllModal
        isOpen={isHighStakesDeleteAllOpen}
        onClose={() => setIsHighStakesDeleteAllOpen(false)}
        onConfirm={handleDeleteAllDocuments}
        subTab={docsSubTab}
        totalCount={documents.filter(d => docsSubTab === 'active' ? !d.isDeleted : d.isDeleted).length}
      />

      <BatchRenameModal 
        isOpen={isBatchRenameOpen}
        onClose={() => setIsBatchRenameOpen(false)}
        selectedCount={selectedDocs.length}
        onConfirm={(pattern) => {
          setDocuments(prev => {
            let index = 1;
            return prev.map(d => {
              if (selectedDocs.includes(d.id)) {
                // Determine file extension
                const parts = d.name.split('.');
                const ext = parts.length > 1 ? parts.pop() : '';
                
                // Construct new filename using pattern
                let newName = pattern;
                newName = newName.replace('[Project]', 'MogadishuHwy');
                newName = newName.replace('[Date]', new Date().toISOString().split('T')[0]);
                newName = newName.replace('[Index]', String(index++).padStart(3, '0'));
                newName = newName.replace('[Type]', ext || d.type || 'PDF');
                
                // If it doesn't have an extension, append the original extension
                if (ext && !newName.toLowerCase().endsWith('.' + ext.toLowerCase())) {
                  newName = `${newName}.${ext}`;
                }
                
                return { ...d, name: newName };
              }
              return d;
            });
          });
          showToast(`Applying pattern: ${pattern} to ${selectedDocs.length} documents.`, 'success');
          setSelectedDocs([]);
        }}
      />

      <BatchTagModal 
        isOpen={isBatchTagOpen}
        onClose={() => setIsBatchTagOpen(false)}
        selectedCount={selectedDocs.length}
        onConfirm={(tags) => {
          showToast(`Applied ${tags.length} tags to ${selectedDocs.length} items`, 'success');
          setSelectedDocs([]);
        }}
      />

      <BulkShareModal 
        isOpen={isBatchShareOpen}
        onClose={() => setIsBatchShareOpen(false)}
        selectedDocuments={documents.filter(d => selectedDocs.includes(d.id))}
        showToast={showToast}
      />

      <UploadModal 
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onSuccess={(details) => {
          setActivities(prev => [
            {
              id: Date.now(),
              type: 'upload',
              user: currentUser?.name || 'Mohamed A.',
              file: details.fileName,
              time: 'Just now',
              icon: Sparkles,
              color: 'text-primary',
              status: 'Optimized'
            },
            ...prev
          ]);

          if (details.uploadedFiles && details.uploadedFiles.length > 0) {
            const newDocs: Document[] = details.uploadedFiles.map((file, idx) => ({
              id: `upload-${Date.now()}-${idx}`,
              name: file.name,
              size: file.size,
              date: new Date().toISOString().split('T')[0],
              tags: ['Uploaded', file.type.toUpperCase(), 'Secured'],
              type: file.type,
              status: 'Approved',
              uploadedBy: currentUser?.role === 'Maamulaha' ? 'Admin' : 'Member',
              uploaderName: currentUser?.name || 'Injineer Maamul',
              Owner: currentUser?.name || 'Mogadishu Municipality',
              ComplianceCode: `MOG-CP-${Math.floor(100 + Math.random() * 900)}`,
              VersionHistory: 'v1.0 (Active)',
              url: (file as any).url
            }));
            setDocuments(prev => [...newDocs, ...prev]);
            if (currentUser) {
              newDocs.forEach((docElem) => {
                supabase.from('documents').upsert(docElem).then(({ error }) => {
                  if (error) console.error("Supabase error saving mapped element:", error);
                });
              });
            }
            showToast(`${newDocs.length} document(s) added to dashboard & archive`, 'success');
          }
        }}
      />

      <AnimatePresence>
        {isCorridorQRScannerOpen && (
          <QRScanner
            onScan={(decodedText) => {
              const trimmedText = decodedText.trim();
              
              // Normalize URL inputs: Extract query parameter like 'code' or 'doc' if it is a complete URL scan
              let targetCode = trimmedText;
              try {
                if (trimmedText.startsWith('http://') || trimmedText.startsWith('https://')) {
                  const urlObj = new URL(trimmedText);
                  const codeParam = urlObj.searchParams.get('code');
                  if (codeParam) {
                    targetCode = codeParam;
                  } else {
                    const docParam = urlObj.searchParams.get('doc');
                    if (docParam) {
                      targetCode = docParam;
                    }
                  }
                }
              } catch (e) {
                // Ignore URL parsing errors and fallback to literal string matching
              }

              // Search for matching document name, id or code in system index
              const foundDoc = documents.find(d => 
                d.name.toLowerCase().includes(targetCode.toLowerCase()) || 
                d.id.toString() === targetCode ||
                (d.ComplianceCode && d.ComplianceCode.toLowerCase() === targetCode.toLowerCase())
              );
              
              if (foundDoc) {
                setPreviewDoc(foundDoc);
                showToast(
                  t('language') === 'so' 
                    ? `Dukumiinti la helay oo la xaqiijiyay! Muujinta faahfaahinta audit: ${foundDoc.name}` 
                    : `Physical document located & verified! Displaying audit profile for: ${foundDoc.name}`, 
                  'success'
                );
              } else {
                showToast(
                  t('language') === 'so' 
                    ? `Ma jiro dukumiinti u dhigma koodhka iskaan-gareeyay: ${trimmedText}` 
                    : `No record matching scanned code "${trimmedText}" found in the registry.`, 
                  'danger'
                );
              }

              // Append verified scan log to recent activities
              setActivities(prev => [
                {
                  id: `qr-scanned-${Date.now()}`,
                  type: 'scan',
                  user: currentUser?.name || 'Admin',
                  file: foundDoc ? foundDoc.name : trimmedText,
                  time: 'Just now',
                  icon: QrCode,
                  color: 'text-purple-400',
                  status: foundDoc ? 'Verified' : 'Unregistered'
                },
                ...prev
              ]);

              setIsCorridorQRScannerOpen(false);
            }}
            onClose={() => setIsCorridorQRScannerOpen(false)}
          />
        )}
      </AnimatePresence>

      <QuickCreateProjectModal 
        isOpen={isQuickCreateOpen}
        onClose={() => setIsQuickCreateOpen(false)}
        currentUser={currentUser}
        onProjectCreate={(newPrj) => {
          setProjects(prev => [newPrj, ...prev]);
          if (currentUser) {
            supabase.from('projects').upsert({ ...newPrj, id: String(newPrj.id) }).then(({ error }) => {
              if (error) console.error("Supabase project sync failed: ", error);
            });
          }
          setActiveTab('projects');
        }}
      />

      <CommandPalette 
        isOpen={isCommandPaletteOpen} 
        onClose={() => setIsCommandPaletteOpen(false)} 
        onSelect={(id) => {
          if (['dashboard', 'docs', 'workflow'].includes(id)) {
            setActiveTab(id);
            showToast(`Switched to ${id}`, 'info');
          } else {
            showToast(`Opening ${id}...`, 'success');
          }
        }}
      />

      {/* Sidebar - Desktop */}
      <motion.aside 
        initial={false}
        animate={{ width: isSidebarOpen ? 280 : 80 }}
        className="hidden md:flex flex-col bg-sidebar border-r border-sidebar-border z-20 relative transition-all duration-300 ease-in-out"
      >
        <div className="p-6 border-b border-sidebar-border bg-sidebar-accent/10">
          <AnimatePresence mode="wait">
            {isSidebarOpen ? (
              <motion.div 
                key="logo-full"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="flex justify-center"
              >
                <Logo variant="full" className="scale-75 origin-top" />
              </motion.div>
            ) : (
              <motion.div 
                key="logo-icon"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex justify-center"
              >
                <Logo variant="icon" />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <nav className="flex-1 px-3 py-6 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            
            return (
              <button
                key={item.id}
                onClick={() => {
                  if (item.id === 'map') {
                    setActiveTab('projects');
                    setProjectsViewMode('Map');
                  } else {
                    setActiveTab(item.id);
                    if (item.id === 'projects') setProjectsViewMode('List');
                  }
                  showToast(`Navigated to ${item.label}`, 'info');
                }}
                className={`
                  w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group
                  ${isActive 
                    ? 'bg-primary/10 text-primary border border-primary/20 shadow-[0_0_15px_rgba(6,182,212,0.1)]' 
                    : 'text-sidebar-foreground/60 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground'
                  }
                `}
              >
                <Icon className={`w-5 h-5 flex-shrink-0 transition-transform group-hover:scale-110 ${isActive ? 'text-primary' : ''}`} />
                {isSidebarOpen && (
                  <span className={`text-[13px] font-semibold whitespace-nowrap overflow-hidden text-ellipsis ${isActive ? 'text-primary' : ''}`}>
                    {item.label}
                  </span>
                )}
                {item.badge && isSidebarOpen && (
                  <span className="ml-auto bg-amber-500 text-amber-950 text-[10px] font-bold px-1.5 py-0.5 rounded-md">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        <div className="p-4 border-t border-sidebar-border bg-sidebar-accent/5 space-y-2">
          <button 
            onClick={() => {
              setCurrentUser(null);
              localStorage.removeItem('geomds_user');
              showToast(t('language') === 'so' ? 'Waa laguu soo saaray!' : 'Logged out successfully!', 'info');
            }}
            className="w-full flex items-center gap-3 p-2 px-3 rounded-lg text-rose-500 hover:bg-rose-500/10 hover:text-rose-400 transition-colors group"
            title={t('language') === 'so' ? 'Ka Bax' : 'Sign Out'}
          >
            <LogOut className="w-5 h-5 flex-shrink-0 transition-transform group-hover:translate-x-0.5" />
            {isSidebarOpen && (
              <span className="text-[13px] font-semibold">
                {t('language') === 'so' ? 'Ka Bax' : 'Sign Out'}
              </span>
            )}
          </button>
          
          <button 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="w-full flex items-center justify-center p-2 rounded-lg hover:bg-sidebar-accent text-sidebar-foreground transition-colors"
          >
            {isSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </motion.aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col relative z-10 overflow-hidden">
        {/* Header */}
        <header className="h-16 border-b border-border bg-sidebar/50 backdrop-blur-md flex items-center justify-between px-6 sticky top-0 bg-grid-pattern">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsMobileMenuOpen(true)}
              className="md:hidden p-2 rounded-lg hover:bg-muted text-foreground"
            >
              <Menu className="w-6 h-6" />
            </button>
            <div className="relative group hidden sm:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
              <input 
                type="text" 
                readOnly
                onClick={() => setIsCommandPaletteOpen(true)}
                placeholder={t('searchPlaceholder')} 
                className="bg-sidebar-accent/30 border border-border rounded-lg pl-10 pr-4 py-1.5 min-w-[300px] outline-none hover:border-primary/50 cursor-pointer transition-all text-xs"
              />
            </div>
            {!isUserAdmin && (
              <span className="bg-amber-500/10 text-amber-500 border border-amber-500/25 px-3 py-1.5 rounded-xl text-[10.5px] font-bold uppercase tracking-wider hidden md:inline-flex items-center gap-1.5 shadow-[0_0_15px_rgba(245,158,11,0.08)]">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                {t('language') === 'so' ? 'Doorka: Akhri-Kaliya (Upload Loo Ogolyahay)' : 'Role: Read-Only (Upload Permitted)'}
              </span>
            )}
          </div>

          <div className="flex items-center gap-4">
            {selectedDocs.length > 0 && activeTab === 'docs' && (
              <button
                onClick={handleBatchVerify}
                disabled={isVerifying}
                className="flex items-center gap-2 bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/35 text-emerald-400 font-extrabold uppercase tracking-wider text-[10px] px-3.5 py-1.5 rounded-lg shadow-[0_0_25px_rgba(16,185,129,0.15)] transition-all duration-200 active:scale-95 flex-shrink-0"
              >
                {isVerifying ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <FileCheck className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
                )}
                <span>
                  {t('language') === 'so' ? 'Hubi Dufcadda' : 'Batch Verify'} ({selectedDocs.length})
                </span>
              </button>
            )}
            <div className="hidden lg:flex items-center gap-4">
              <VoiceAssistant onCommand={handleVoiceCommand} />
              <LanguageToggle />
              <ThemeToggle />
            </div>
            <div className="relative animate-fade-in" ref={notificationsRef}>
              <button 
                className="p-2 rounded-lg hover:bg-muted text-foreground relative transition-all duration-200 active:scale-95" 
                onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                aria-label="Toggle notifications"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-primary text-[9px] font-black text-black flex items-center justify-center border-2 border-sidebar animate-pulse">
                    {unreadCount}
                  </span>
                )}
              </button>
              
              <AnimatePresence>
                {isNotificationsOpen && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 10 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 mt-2 w-80 sm:w-96 rounded-xl border border-border bg-card/95 backdrop-blur-md shadow-2xl z-50 overflow-hidden"
                  >
                    {/* Header */}
                    <div className="p-4 border-b border-border flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Bell className="w-4 h-4 text-primary animate-pulse" />
                        <h3 className="text-xs font-bold uppercase tracking-wider text-white">
                          {t('language') === 'so' ? 'Ogeysiisyada' : 'Notifications'}
                        </h3>
                        {unreadCount > 0 && (
                          <span className="bg-primary/20 text-primary text-[10px] font-bold px-2 py-0.5 rounded">
                            {unreadCount} new
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        {notifications.length > 0 && (
                          <button 
                            onClick={handleMarkAllRead}
                            className="text-[10px] font-bold uppercase tracking-wider text-primary hover:underline hover:text-primary-light transition-all"
                          >
                            {t('markAllRead')}
                          </button>
                        )}
                        <button 
                          onClick={() => setIsNotificationsOpen(false)}
                          className="p-1 rounded hover:bg-muted text-muted-foreground"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Notification list */}
                    <div className="max-h-[350px] overflow-y-auto divide-y divide-border/30">
                      {notifications.length === 0 ? (
                        <div className="p-8 text-center flex flex-col items-center justify-center">
                          <Bell className="w-8 h-8 text-muted-foreground/30 mb-2 animate-pulse" />
                          <p className="text-xs text-muted-foreground font-medium">
                            {t('language') === 'so' ? 'Ma jiraan ogeysiisyo cusub' : 'No new notifications'}
                          </p>
                        </div>
                      ) : (
                        notifications.map((note) => {
                          const IconComponent = getNotificationIcon(note.type);
                          return (
                            <div 
                              key={note.id} 
                              onClick={() => handleMarkAsRead(note.id)}
                              className={`flex items-start gap-3 p-3.5 hover:bg-muted/40 transition-colors cursor-pointer group relative ${!note.read ? 'bg-primary/5' : ''}`}
                            >
                              <div className={`mt-0.5 p-1.5 rounded-lg shrink-0
                                ${note.type === 'approved' ? 'bg-emerald-500/10 text-emerald-400' : 
                                  note.type === 'pending' ? 'bg-amber-500/10 text-amber-500' : 
                                  note.type === 'error' ? 'bg-rose-500/10 text-rose-400' : 'bg-primary/10 text-primary'}
                              `}>
                                <IconComponent className="w-3.5 h-3.5" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between gap-2">
                                  <h4 className={`text-[11px] font-bold text-white/90 truncate ${!note.read ? 'text-primary' : ''}`}>
                                    {note.title}
                                  </h4>
                                  <span className="text-[9px] font-mono text-muted-foreground shrink-0">{note.time}</span>
                                </div>
                                <p className="text-[11px] text-muted-foreground line-clamp-2 mt-0.5 leading-relaxed">{note.user}</p>
                              </div>
                              
                              <div className="flex flex-col items-center gap-2 self-stretch justify-between pl-1">
                                {!note.read ? (
                                  <div className="w-1.5 h-1.5 rounded-full bg-primary shadow-[0_0_6px_rgba(6,182,212,0.6)]" />
                                ) : (
                                  <div className="w-1.5 h-1.5" />
                                )}
                                <button 
                                  onClick={(e) => handleClearNotification(note.id, e)}
                                  className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-rose-500/10 hover:text-rose-400 text-muted-foreground transition-all duration-150"
                                  title="Clear notification"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </button>
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>

                    {/* Footer */}
                    {notifications.length > 0 && (
                      <div className="p-2 border-t border-border bg-sidebar-accent/20 flex justify-between gap-2">
                        <button 
                          onClick={handleClearAll}
                          className="w-full py-1.5 text-[10px] text-center font-bold uppercase tracking-widest hover:text-rose-400 text-muted-foreground hover:bg-rose-500/5 rounded transition-all"
                        >
                          {t('language') === 'so' ? 'Eberyeey dhammaan' : 'Clear All'}
                        </button>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            
            <div className="flex items-center gap-3 pl-3 border-l border-border">
              <div className="text-right hidden sm:block">
                <p className="text-[13px] font-bold text-foreground tracking-tight">{currentUser.name}</p>
                <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">
                  {currentUser.role === 'Maamulaha' 
                    ? (t('language') === 'so' ? 'Maamulaha Guud' : 'System Admin')
                    : (t('language') === 'so' ? 'Injineer / Aan Firfircooneyn (Kaliya Upload)' : 'Engineer / Read-Only (Upload Only)')}
                </p>
              </div>
              <button 
                onClick={() => setActiveTab('settings')}
                className="relative overflow-hidden group"
              >
                <div className="w-9 h-9 rounded-lg bg-primary/20 flex items-center justify-center border border-primary/30 group-hover:border-primary transition-all text-xs font-black text-primary uppercase">
                  {currentUser.name[0]}
                </div>
              </button>
            </div>
          </div>
        </header>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-8 bg-grid-pattern bg-fixed">
          <div className="max-w-7xl mx-auto">
            {sharedWorkspace && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="mb-6 p-4 rounded-2xl border border-cyan-500/30 bg-cyan-500/5 backdrop-blur-md flex flex-col sm:flex-row items-center justify-between gap-4 shadow-[0_0_30px_rgba(6,182,212,0.05)]"
              >
                <div className="flex items-center gap-3">
                  <div className="rounded-xl bg-cyan-500/10 p-2 text-cyan-400 border border-cyan-500/20 animate-pulse flex items-center justify-center">
                    <Share2 className="h-5 w-5" />
                  </div>
                  <div className="text-center sm:text-left">
                    <h4 className="text-sm font-bold text-cyan-400">Secure Shared Workspace Active</h4>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      You are securely viewing <span className="text-white font-bold">{sharedWorkspace.docIds.length}</span> shared document(s).
                      Link expires on <span className="text-white font-mono font-bold">{new Date(sharedWorkspace.expiry).toLocaleString()}</span>.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setSharedWorkspace(null);
                    window.history.replaceState({}, document.title, window.location.pathname);
                    showToast('Returned to your personal workspace', 'info');
                  }}
                  className="px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-black font-extrabold uppercase tracking-wider text-[10px] rounded-xl transition-all shadow-md shadow-cyan-500/10 hover:shadow-cyan-500/20 active:scale-95 cursor-pointer flex-shrink-0"
                >
                  View All Files
                </button>
              </motion.div>
            )}
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.3, ease: 'easeOut' }}
              >
                {/* Dashboard Header Section */}
                {activeTab === 'dashboard' && (
                  <div className="space-y-8">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                      <div>
                        <h2 className="text-2xl font-bold tracking-tight text-foreground">{t('dashboard')}</h2>
                        <p className="text-[13px] text-muted-foreground mt-1">{t('welcomeBack')}, {currentUser?.name || 'Eng. Mohamed'}</p>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        <button 
                          onClick={() => setIsUploadModalOpen(true)}
                          className="bg-primary text-primary-foreground px-4 py-2.5 rounded-lg font-bold uppercase tracking-wider text-[11px] flex items-center gap-2 hover:opacity-90 active:scale-95 transition-all shadow-[0_0_20px_rgba(6,182,212,0.2)]"
                        >
                          <Upload className="w-4 h-4" />
                          {t('uploadDocument')}
                        </button>
                        <button 
                          onClick={() => setIsQuickCreateOpen(true)}
                          className="bg-secondary text-secondary-foreground border border-border px-4 py-2.5 rounded-lg font-bold uppercase tracking-wider text-[11px] flex items-center gap-2 hover:bg-muted transition-all"
                        >
                          <Plus className="w-4 h-4" />
                          {t('newProject')}
                        </button>
                      </div>
                    </div>

                    {/* Stat Cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                      {[
                        { label: t('totalProjects'), value: projects.length.toString(), change: '+2 this month', icon: Briefcase, color: 'text-primary', bg: 'bg-primary/5', tab: 'projects' },
                        { label: t('documents'), value: documents.length.toString(), change: '+12 this week', icon: FilesIcon, color: 'text-cyan-400', bg: 'bg-cyan-500/5', tab: 'docs' },
                        { label: t('efficiencyRatio'), value: '92.4%', change: 'Approved vs Total', icon: Sparkles, color: 'text-indigo-400', bg: 'bg-indigo-500/5', tab: 'analytics' },
                        { label: t('systemHealth'), value: 'Optimal', change: 'All nodes active', icon: CheckSquare, color: 'text-emerald-400', bg: 'bg-emerald-500/5', tab: 'settings' },
                      ].map((stat) => (
                        <div 
                          key={stat.label} 
                          onClick={() => {
                            if (stat.tab) {
                              setActiveTab(stat.tab);
                              showToast(`Navigated to ${stat.label}`, 'info');
                            }
                          }}
                          className={`p-4 rounded-xl bg-card border border-border/50 shadow-lg group transition-all duration-200 ${
                            stat.tab 
                              ? 'cursor-pointer hover:border-primary/40 hover:bg-card/80 active:scale-[0.98]' 
                              : 'cursor-default'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-3 text-muted-foreground/50">
                            <span className="text-[11px] font-bold uppercase tracking-widest">{stat.label}</span>
                            <div className={`${stat.bg} p-2 rounded-lg`}>
                              <stat.icon className={`w-4 h-4 ${stat.color}`} />
                            </div>
                          </div>
                          <div className="flex items-end justify-between">
                            <span className="text-3xl font-bold font-mono text-foreground leading-none">{stat.value}</span>
                          </div>
                          <div className="mt-3 flex items-center gap-1.5">
                            <span className={`text-[10px] font-bold ${stat.color} uppercase tracking-tighter`}>{stat.change}</span>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                      {/* Active Projects */}
                      <div className="lg:col-span-2 space-y-6">
                        <div className="flex items-center justify-between">
                          <h3 className="text-sm font-bold uppercase tracking-widest text-foreground/70">{t('activeProjects')}</h3>
                          <button 
                            onClick={() => { setActiveTab('projects'); setProjectsViewMode('List'); }}
                            className="text-[11px] font-bold uppercase tracking-widest text-primary hover:underline"
                          >
                            {t('viewAll')}
                          </button>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                          {projects.filter(p => p.status === 'active' || p.status === 'pending').slice(0, 4).map((project) => (
                            <div 
                              key={project.id} 
                              onClick={() => {
                                setActiveTab('projects');
                                setProjectsViewMode('List');
                              }}
                              className="p-5 rounded-xl bg-card border border-border/50 hover:border-primary/20 transition-all cursor-pointer group"
                            >
                              <div className="flex items-start justify-between mb-3">
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-1">
                                    <h4 className="text-[15px] font-bold text-foreground group-hover:text-primary transition-colors">{project.name}</h4>
                                    <span className="bg-emerald-500/10 text-emerald-400 text-[9px] font-bold px-1.5 py-0.5 rounded-full border border-emerald-500/20">{project.status}</span>
                                  </div>
                                  <p className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                                    <Map className="w-3 h-3" /> {project.location}
                                  </p>
                                </div>
                                <div className="ml-4 p-1 bg-sidebar-accent/30 rounded-lg">
                                  <ProjectProgressRing progress={project.progress} size={40} strokeWidth={4} color={project.color || '#06b6d0'} />
                                </div>
                              </div>
                              <p className="text-[12px] text-muted-foreground leading-relaxed line-clamp-2 mb-4 italic opacity-70">
                                {project.desc || "No description available. Initialize survey layers to commence work."}
                              </p>
                              <div className="flex items-center gap-4 mb-4">
                                <span className="flex items-center gap-1.5 text-[10px] font-bold text-white/60">
                                  <FileText className="w-3.5 h-3.5" /> {project.docs || 0} docs
                                </span>
                                <span className="flex items-center gap-1.5 text-[10px] font-bold text-white/60">
                                  <User className="w-3.5 h-3.5" /> {project.users || 1}
                                </span>
                                {(project.pending || 0) > 0 && (
                                  <span className="bg-amber-500/10 text-amber-500 text-[10px] font-bold px-2 py-0.5 rounded border border-amber-500/20">
                                    {project.pending} pending
                                  </span>
                                )}
                              </div>
                              <div className="text-[9px] font-mono text-muted-foreground/40 font-bold tracking-tighter">
                                {project.coords || `${project.lat.toFixed(4)}°N, ${project.lng.toFixed(4)}°E`}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Side Section: Notifications & Recent Uploads */}
                      <div className="space-y-8">
                        <div>
                          <div className="flex items-center justify-between mb-4">
                            <h3 className="text-sm font-bold uppercase tracking-widest text-foreground/70">{t('notifications')}</h3>
                            {notifications.length > 0 && (
                              <button 
                                onClick={handleMarkAllRead} 
                                className="text-[10px] font-bold uppercase tracking-widest text-primary hover:underline hover:text-primary-light transition-all"
                              >
                                {t('markAllRead')}
                              </button>
                            )}
                          </div>
                          <div className="space-y-3">
                            {notifications.length === 0 ? (
                              <div className="p-6 text-center rounded-lg border border-border/30 bg-card/20 flex flex-col items-center">
                                <Bell className="w-6 h-6 text-muted-foreground/30 mb-2 animate-pulse" />
                                <span className="text-xs text-muted-foreground font-medium">
                                  {t('language') === 'so' ? 'Ma jiraan ogeysiisyo cusub' : 'No new notifications'}
                                </span>
                              </div>
                            ) : (
                              notifications.map((note) => {
                                const IconComponent = getNotificationIcon(note.type);
                                return (
                                  <div 
                                    key={note.id} 
                                    onClick={() => {
                                      handleMarkAsRead(note.id);
                                      if (note.type === 'pending' || note.title.toLowerCase().includes('review')) {
                                        setActiveTab('approvals');
                                        showToast(t('language') === 'so' ? 'Loo gudbiya Anshaxinta / Reviews' : 'Navigating to Reviews', 'info');
                                      }
                                    }}
                                    className="flex items-start gap-3 p-3 rounded-lg bg-card/40 border border-border/30 hover:bg-card/60 transition-colors cursor-pointer group"
                                  >
                                    <div className={`mt-1 p-2 rounded-lg shrink-0
                                      ${note.type === 'approved' ? 'bg-emerald-500/10 text-emerald-400' : 
                                        note.type === 'pending' ? 'bg-amber-500/10 text-amber-500' : 
                                        note.type === 'error' ? 'bg-rose-500/10 text-rose-400' : 'bg-primary/10 text-primary'}
                                    `}>
                                      <IconComponent className="w-3.5 h-3.5" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <h4 className={`text-[12px] font-bold text-white opacity-90 truncate ${!note.read ? 'text-primary' : ''}`}>
                                        {note.title}
                                      </h4>
                                      <p className="text-[11px] text-muted-foreground truncate">{note.user}</p>
                                    </div>
                                    <div className="flex flex-col items-end gap-2 shrink-0">
                                      <span className="text-[9px] font-mono text-muted-foreground">{note.time}</span>
                                      {!note.read ? (
                                        <div className="w-1.5 h-1.5 rounded-full bg-primary shadow-[0_0_6px_rgba(6,182,212,0.6)] group-hover:bg-primary/40 transition-colors" />
                                      ) : (
                                        <div className="w-1.5 h-1.5" />
                                      )}
                                    </div>
                                  </div>
                                );
                              })
                            )}
                          </div>
                        </div>

                        <RecentActivity 
                          activities={activities} 
                          onPreview={(fileName) => {
                            const foundDoc = documents.find(d => d.name === fileName);
                            if (foundDoc) {
                              setPreviewDoc(foundDoc);
                            } else {
                              setPreviewDoc({
                                id: `activity-doc-${Date.now()}`,
                                name: fileName,
                                size: '1.4 MB',
                                date: 'Recent',
                                tags: ['Activity'],
                                type: fileName.split('.').pop() || 'pdf'
                              });
                            }
                          }}
                          onQRScan={(decodedText) => {
                            const trimmedText = decodedText.trim();
                            // Search for matching document name, id or code in system index
                            const foundDoc = documents.find(d => 
                              d.name.toLowerCase().includes(trimmedText.toLowerCase()) || 
                              d.id.toString() === trimmedText ||
                              (d.ComplianceCode && d.ComplianceCode.toLowerCase() === trimmedText.toLowerCase())
                            );
                            
                            if (foundDoc) {
                              setPreviewDoc(foundDoc);
                              showToast(t('language') === 'so' ? `Dukumiinti la helay: ${foundDoc.name}` : `Document located: ${foundDoc.name}`, 'success');
                            } else {
                              showToast(t('language') === 'so' ? `Lagu guulaystay iskaanka: ${trimmedText}` : `Scanned successfully: ${trimmedText}`, 'success');
                            }

                            // Inject this actions as verified scan log in the recent activities state
                            setActivities(prev => [
                              {
                                id: `qr-scanned-${Date.now()}`,
                                type: 'scan',
                                user: currentUser?.name || 'Admin',
                                file: foundDoc ? foundDoc.name : trimmedText,
                                time: 'Just now',
                                icon: QrCode,
                                color: 'text-purple-400',
                                status: 'Verified'
                              },
                              ...prev
                            ]);
                          }}
                        />
                      </div>
                    </div>

                    {/* Integrated All Uploaded Documents Section - Dhamaan Dukumiintiyada la soo Galiyay */}
                    <div className="p-6 rounded-2xl bg-card border border-border/50 shadow-xl overflow-hidden relative group animate-in fade-in slide-in-from-bottom-5 duration-300">
                      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-40 pointer-events-none" />
                      
                      <div className="relative z-10 flex flex-col xl:flex-row xl:items-center justify-between gap-6 border-b border-border/30 pb-6">
                        <div>
                          <div className="flex items-center gap-2">
                            <div className="p-2 bg-primary/10 rounded-xl">
                              <FilesIcon className="w-5 h-5 text-primary animate-pulse" />
                            </div>
                            <h3 className="text-lg font-bold tracking-tight text-white flex items-center gap-2">
                              {t('language') === 'so' ? 'Dhamaan Dukumiintiyada la soo Galiyay' : 'All Uploaded Documents Corridor'}
                              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-primary/20 text-primary border border-primary/20">
                                {documents.length}
                              </span>
                            </h3>
                          </div>
                          <p className="text-xs text-muted-foreground mt-1.5 max-w-2xl leading-relaxed">
                            {t('language') === 'so' 
                              ? 'Ka eeg, ka baadh, oo halkan si fudud uga maaree dhammaan faylasha farsamada, naqshadaha CAD (dwg/dxf), iyo warbixinnada aad soo gelisay.' 
                              : 'Browse, search, and manage all technical drawing sheets, spatial CAD layers, and compliance reports uploaded to your secure server.'}
                          </p>
                        </div>

                        <div className="flex flex-wrap items-center gap-3">
                          {/* Search inputs */}
                          <div className="relative w-full sm:w-64">
                            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/60" />
                            <input
                              type="text"
                              value={dashboardDocSearch}
                              onChange={(e) => setDashboardDocSearch(e.target.value)}
                              placeholder={t('language') === 'so' ? 'Ka raadi magaca ama tag-ga...' : 'Search by file name or tags...'}
                              className="w-full bg-sidebar/60 hover:bg-sidebar/80 focus:bg-sidebar border border-border/60 focus:border-primary/50 rounded-full pl-10 pr-9 py-1.5 text-xs text-white placeholder-muted-foreground/50 transition-all outline-none"
                            />
                            {dashboardDocSearch && (
                              <button
                                type="button"
                                onClick={() => setDashboardDocSearch('')}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground/60 hover:text-white transition-colors"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>

                          <button
                            onClick={() => {
                              // Filter the content based on current user selections to match what is visible on-screen
                              const filtered = documents.filter(doc => {
                                if (dashboardDocSearch) {
                                  const q = dashboardDocSearch.toLowerCase();
                                  if (!doc.name.toLowerCase().includes(q) && !doc.tags.some(t => t.toLowerCase().includes(q))) return false;
                                }
                                if (dashboardDocTypeFilter !== 'All') {
                                  if (dashboardDocTypeFilter === 'PDF' && doc.type.toLowerCase() !== 'pdf') return false;
                                  if (dashboardDocTypeFilter === 'CAD' && !['dwg', 'dxf', 'cad'].includes(doc.type.toLowerCase())) return false;
                                  if (dashboardDocTypeFilter === 'Other' && ['pdf', 'dwg', 'dxf', 'cad'].includes(doc.type.toLowerCase())) return false;
                                }
                                return true;
                              });
                              exportDocumentSummaryPDF(filtered, t('language') as 'so' | 'en');
                              showToast(t('language') === 'so' ? 'Diiwaanka guud ee faylasha la shaandheeyay ayaa la soo dejiyay!' : 'Successfully generated audit listing report PDF!', 'success');
                            }}
                            className="bg-emerald-500/10 hover:bg-emerald-500 hover:text-white text-emerald-400 hover:border-emerald-500/10 border border-emerald-500/30 px-4 py-1.5 rounded-full font-bold uppercase tracking-widest text-[10px] flex items-center gap-1.5 transition-all cursor-pointer active:scale-[0.98] shadow-md"
                            title={t('language') === 'so' ? 'Kala soo bax Liiska Audit PDF' : 'Download Audit Listing PDF'}
                          >
                            <Download className="w-3.5 h-3.5" />
                            <span>{t('language') === 'so' ? 'Liiska Audit-ka' : 'Download Summary'}</span>
                          </button>

                          <button
                            onClick={() => setIsCorridorQRScannerOpen(true)}
                            className="bg-purple-500/10 hover:bg-purple-500 hover:text-white text-purple-400 hover:border-purple-500/10 border border-purple-500/30 px-4 py-1.5 rounded-full font-bold uppercase tracking-widest text-[10px] flex items-center gap-1.5 transition-all cursor-pointer active:scale-[0.98] shadow-md"
                            title={t('language') === 'so' ? 'Ku xaqiiji warbixinta QR-ka' : 'Verify document via physical QR scan'}
                          >
                            <QrCode className="w-3.5 h-3.5" />
                            <span>{t('language') === 'so' ? 'Hubi QR Code' : 'Verify Document'}</span>
                          </button>

                          <button
                            onClick={() => setIsUploadModalOpen(true)}
                            className="bg-primary/10 hover:bg-primary hover:text-primary-foreground text-primary border border-primary/30 px-4 py-1.5 rounded-full font-bold uppercase tracking-widest text-[10px] flex items-center gap-1.5 transition-all cursor-pointer active:scale-95"
                          >
                            <Upload className="w-3.5 h-3.5" />
                            <span>{t('language') === 'so' ? 'Soo Geli Fayl' : 'Upload File'}</span>
                          </button>
                        </div>
                      </div>

                      {/* Type Filters & Result Metrics */}
                      <div className="relative z-10 flex flex-wrap items-center justify-between gap-4 py-4">
                        <div className="flex flex-wrap items-center gap-2">
                          {[
                            { id: 'All', label: t('language') === 'so' ? 'Dhammaan Noocyada' : 'All Types' },
                            { id: 'PDF', label: 'PDF Documents' },
                            { id: 'CAD', label: t('language') === 'so' ? 'Nashqadaha CAD (dwg/dxf)' : 'CAD Layouts (dwg/dxf)' },
                            { id: 'Other', label: t('language') === 'so' ? 'Kuwa Kale' : 'Other Elements' }
                          ].map((tab) => (
                            <button
                              key={tab.id}
                              onClick={() => setDashboardDocTypeFilter(tab.id)}
                              className={`px-3 py-1 rounded-full border text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer ${
                                dashboardDocTypeFilter === tab.id
                                  ? 'bg-primary border-primary/20 text-white shadow-md'
                                  : 'border-border text-muted-foreground hover:border-primary/40 hover:text-white'
                              }`}
                            >
                              {tab.label}
                            </button>
                          ))}
                        </div>

                        <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">
                          {t('language') === 'so' 
                            ? `La shaandheeyay: ${documents.filter(doc => {
                                if (dashboardDocSearch) {
                                  const q = dashboardDocSearch.toLowerCase();
                                  if (!doc.name.toLowerCase().includes(q) && !doc.tags.some(t => t.toLowerCase().includes(q))) return false;
                                }
                                if (dashboardDocTypeFilter !== 'All') {
                                  if (dashboardDocTypeFilter === 'PDF' && doc.type.toLowerCase() !== 'pdf') return false;
                                  if (dashboardDocTypeFilter === 'CAD' && !['dwg', 'dxf', 'cad'].includes(doc.type.toLowerCase())) return false;
                                  if (dashboardDocTypeFilter === 'Other' && ['pdf', 'dwg', 'dxf', 'cad'].includes(doc.type.toLowerCase())) return false;
                                }
                                return true;
                              }).length} eber oo helmay`
                            : `Filtered: ${documents.filter(doc => {
                                if (dashboardDocSearch) {
                                  const q = dashboardDocSearch.toLowerCase();
                                  if (!doc.name.toLowerCase().includes(q) && !doc.tags.some(t => t.toLowerCase().includes(q))) return false;
                                }
                                if (dashboardDocTypeFilter !== 'All') {
                                  if (dashboardDocTypeFilter === 'PDF' && doc.type.toLowerCase() !== 'pdf') return false;
                                  if (dashboardDocTypeFilter === 'CAD' && !['dwg', 'dxf', 'cad'].includes(doc.type.toLowerCase())) return false;
                                  if (dashboardDocTypeFilter === 'Other' && ['pdf', 'dwg', 'dxf', 'cad'].includes(doc.type.toLowerCase())) return false;
                                }
                                return true;
                              }).length} indexed assets`
                          }
                        </div>
                      </div>

                      {/* Documents Directory Core list */}
                      <div className="relative z-10">
                        {(() => {
                          const listDocs = documents.filter(doc => {
                            if (dashboardDocSearch) {
                              const q = dashboardDocSearch.toLowerCase();
                              if (!doc.name.toLowerCase().includes(q) && !doc.tags.some(t => t.toLowerCase().includes(q))) return false;
                            }
                            if (dashboardDocTypeFilter !== 'All') {
                              if (dashboardDocTypeFilter === 'PDF' && doc.type.toLowerCase() !== 'pdf') return false;
                              if (dashboardDocTypeFilter === 'CAD' && !['dwg', 'dxf', 'cad'].includes(doc.type.toLowerCase())) return false;
                              if (dashboardDocTypeFilter === 'Other' && ['pdf', 'dwg', 'dxf', 'cad'].includes(doc.type.toLowerCase())) return false;
                            }
                            return true;
                          });

                          if (listDocs.length === 0) {
                            return (
                              <div className="flex flex-col items-center justify-center p-12 py-16 border border-dashed border-border/30 rounded-xl bg-sidebar/20 text-center animate-in fade-in duration-300">
                                <div className="p-3 bg-muted/20 text-muted-foreground/80 rounded-full mb-3">
                                  <FileText className="w-5 h-5" />
                                </div>
                                <p className="text-xs font-bold text-white uppercase tracking-widest">
                                  {t('language') === 'so' ? 'Natiijo laguma helin sifeeyahaaga' : 'No documents match your query'}
                                </p>
                                <p className="text-[11px] text-muted-foreground mt-1 max-w-xs leading-relaxed">
                                  {t('language') === 'so'
                                    ? 'Ma jiraan dukumiinti soogaaray nidaamka oo xambaarsan xarfaha ama nooca aad dooratay.'
                                    : 'Try widening your keywords or clearing the search box to browse all server archives.'}
                                </p>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setDashboardDocSearch('');
                                    setDashboardDocTypeFilter('All');
                                  }}
                                  className="mt-4 px-4 py-1.5 hover:bg-muted border border-border/60 text-[10px] font-black uppercase tracking-widest rounded-full transition-all text-white cursor-pointer"
                                >
                                  {t('language') === 'so' ? 'Tirtir Shaandheeyayaasha' : 'Reset filters'}
                                </button>
                              </div>
                            );
                          }

                          return (
                            <div className="overflow-x-auto">
                              <table className="w-full text-left border-collapse">
                                <thead>
                                  <tr className="border-b border-border/30 text-[9px] font-bold uppercase tracking-[0.2em] text-muted-foreground/60 pb-3">
                                    <th className="py-3 px-4">{t('language') === 'so' ? 'Magaca Dukumiintiga' : 'Document Details'}</th>
                                    <th className="py-3 px-4 hidden md:table-cell">{t('language') === 'so' ? 'Mulkiilaha' : 'Owner'}</th>
                                    <th className="py-3 px-4 hidden lg:table-cell relative group/compliance-header cursor-help">
                                      <div className="flex items-center gap-1.5 hover:text-white transition-all">
                                        <span>{t('language') === 'so' ? 'Koodhka Waafaqsanaanta' : 'Compliance Code'}</span>
                                        <Info className="w-3.5 h-3.5 text-primary animate-pulse" />
                                      </div>
                                      
                                      {/* Legend Info Tooltip Popover */}
                                      <div className="absolute left-4 top-10 hidden group-hover/compliance-header:block z-30 w-64 p-3.5 bg-[#0e121bf2] border border-border/80 rounded-xl shadow-[0_8px_32px_rgba(0,0,0,0.5)] text-left normal-case tracking-normal">
                                        <div className="space-y-2 pointer-events-none">
                                          <div className="text-[10px] font-black uppercase text-primary tracking-widest font-mono">
                                            {t('language') === 'so' ? 'Sharaxaadda Xaaladda' : 'REGISTRY COMPLIANCE LEGEND'}
                                          </div>
                                          <p className="text-[10px] text-zinc-350 font-sans leading-relaxed">
                                            {t('language') === 'so' 
                                              ? 'Hab-maamuuska waafaqsanaanta sharciga ee UTM Zone 38N dalka Soomaaliya.' 
                                              : 'Color-coded status indicating validation against the 2026 UTM Zone 38N Somali Geodetic standards.'}
                                          </p>
                                          
                                          <div className="border-t border-border/30 pt-2 space-y-1.5 font-sans">
                                            <div className="flex items-center gap-2">
                                              <span className="w-2 h-2 rounded-full bg-emerald-400" />
                                              <div>
                                                <span className="text-[9.5px] font-bold text-emerald-400 font-mono block uppercase leading-none">ACTIVE / COMPLIANT</span>
                                                <span className="text-[9px] text-zinc-400">{t('language') === 'so' ? 'Dukumiinti buuxiyey shuruudaha qorshaha' : 'Fully certified and validated'}</span>
                                              </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                              <span className="w-2 h-2 rounded-full bg-rose-400" />
                                              <div>
                                                <span className="text-[9.5px] font-bold text-rose-400 font-mono block uppercase leading-none">EXPIRED / AUDIT REQ</span>
                                                <span className="text-[9px] text-zinc-400">{t('language') === 'so' ? 'Wuu dhacay (PZ/DR/EXP), u baahan dib-u-eegid' : 'Outdated codes (contains PZ / DR / EXP)'}</span>
                                              </div>
                                            </div>
                                          </div>
                                        </div>
                                      </div>
                                    </th>
                                    <th className="py-3 px-4 hidden lg:table-cell">{t('language') === 'so' ? 'Nooca' : 'Version'}</th>
                                    <th className="py-3 px-4 hidden md:table-cell">{t('language') === 'so' ? 'Noocyada/Tags' : 'Categories / Tags'}</th>
                                    <th className="py-3 px-4 hidden lg:table-cell">{t('language') === 'so' ? 'Xajmiga' : 'File Size'}</th>
                                    <th className="py-3 px-4 hidden sm:table-cell">{t('language') === 'so' ? 'Taariikhda' : 'Recorded Date'}</th>
                                    <th className="py-3 px-4 text-center">{t('language') === 'so' ? 'Xaaladda' : 'Status'}</th>
                                    <th className="py-3 px-4 text-right">{t('language') === 'so' ? 'Maareyn' : 'Actions'}</th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-border/30">
                                  {listDocs.map((doc) => {
                                    const ext = doc.type.toLowerCase();
                                    const isCad = ['dwg', 'dxf', 'cad'].includes(ext);
                                    const isPdf = ext === 'pdf';
                                    
                                    return (
                                      <tr 
                                        key={doc.id} 
                                        className="hover:bg-sidebar-accent/15 group/row transition-all duration-150 align-middle"
                                      >
                                        {/* Icon & Name */}
                                        <td className="py-3.5 px-4 font-medium text-white max-w-xs sm:max-w-md truncate">
                                          <div className="flex items-center gap-3">
                                            <div className={`p-2 rounded-lg ${
                                              isPdf ? 'bg-rose-500/10 text-rose-400' :
                                              isCad ? 'bg-cyan-500/10 text-cyan-400' : 'bg-primary/10 text-primary'
                                            }`}>
                                              <FileText className="w-4 h-4" />
                                            </div>
                                            <div className="truncate">
                                              {editingDocId === doc.id ? (
                                                <div className="flex items-center gap-1.5 py-1">
                                                  <input
                                                    type="text"
                                                    value={editingDocName}
                                                    onChange={(e) => setEditingDocName(e.target.value)}
                                                    onKeyDown={(e) => {
                                                      if (e.key === 'Enter') {
                                                        if (editingDocName.trim()) {
                                                          setDocuments(prev => prev.map(d => d.id === doc.id ? { ...d, name: editingDocName.trim() } : d));
                                                          showToast(t('language') === 'so' ? 'Magaca faylka waa la bedelay' : 'File name updated successfully', 'success');
                                                          setEditingDocId(null);
                                                        }
                                                      } else if (e.key === 'Escape') {
                                                        setEditingDocId(null);
                                                      }
                                                    }}
                                                    onClick={(e) => e.stopPropagation()}
                                                    autoFocus
                                                    className="bg-sidebar border border-primary/50 px-2 py-1 rounded text-xs text-white outline-none focus:border-primary w-48 font-bold"
                                                  />
                                                  <button
                                                    onClick={(e) => {
                                                      e.stopPropagation();
                                                      if (editingDocName.trim()) {
                                                        setDocuments(prev => prev.map(d => d.id === doc.id ? { ...d, name: editingDocName.trim() } : d));
                                                        showToast(t('language') === 'so' ? 'Magaca faylka waa la bedelay' : 'File name updated successfully', 'success');
                                                        setEditingDocId(null);
                                                      }
                                                    }}
                                                    className="p-1 rounded bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 cursor-pointer flex items-center justify-center border border-emerald-500/20 shrink-0"
                                                    title="Save"
                                                  >
                                                    <CheckSquare className="w-3.5 h-3.5" />
                                                  </button>
                                                  <button
                                                    onClick={(e) => {
                                                      e.stopPropagation();
                                                      setEditingDocId(null);
                                                    }}
                                                    className="p-1 rounded bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 cursor-pointer flex items-center justify-center border border-rose-500/20 shrink-0"
                                                    title="Cancel"
                                                  >
                                                    <X className="w-3.5 h-3.5" />
                                                  </button>
                                                </div>
                                              ) : (
                                                <span 
                                                  onClick={() => setPreviewDoc(doc)}
                                                  className="text-xs font-bold text-white group-hover/row:text-primary transition-colors cursor-pointer block truncate hover:underline"
                                                  title={doc.name}
                                                >
                                                  {doc.name}
                                                </span>
                                              )}
                                              <div className="flex items-center gap-1 mt-0.5 text-[9px] font-mono text-muted-foreground/80">
                                                <span className={`px-1 py-0.2 rounded uppercase font-extrabold text-[7px] leading-none ${
                                                  doc.uploadedBy === 'Admin' ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20' :
                                                  doc.uploadedBy === 'Member' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' :
                                                  'bg-amber-500/10 text-amber-500 border border-amber-500/20'
                                                }`}>
                                                  {doc.uploadedBy || 'Member'}
                                                </span>
                                                <span>•</span>
                                                <span className="font-semibold">{doc.uploaderName || currentUser?.name || 'Mohamed Abdulkadir Hussain Maamule'}</span>
                                              </div>
                                            </div>
                                          </div>
                                        </td>

                                        {/* Owner */}
                                        <td className="py-3.5 px-4 hidden md:table-cell text-xs text-muted-foreground font-medium">
                                          {doc.Owner || 'Mogadishu Municipality'}
                                        </td>

                                        {/* Compliance Code */}
                                        <td className="py-3.5 px-4 hidden lg:table-cell text-xs font-mono">
                                          {(() => {
                                            const code = doc.ComplianceCode || 'MOG-HW-042';
                                            const docName = doc.name || '';
                                            const isExpiredComp = code.toUpperCase().includes('DR') || code.toUpperCase().includes('PZ') || code.toUpperCase().includes('EXP') || docName.toLowerCase().includes('drainage') || docName.toLowerCase().includes('zoning');
                                            return (
                                              <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md border text-[10.5px] font-bold leading-none ${
                                                isExpiredComp 
                                                  ? 'bg-rose-500/5 text-rose-400 border-rose-500/10' 
                                                  : 'bg-emerald-500/5 text-emerald-400 border-emerald-500/10'
                                              }`}>
                                                <span className={`w-1.5 h-1.5 rounded-full ${isExpiredComp ? 'bg-rose-400 animate-pulse' : 'bg-emerald-400'}`} />
                                                {code}
                                              </span>
                                            );
                                          })()}
                                        </td>

                                        {/* Version */}
                                        <td className="py-3.5 px-4 hidden lg:table-cell text-xs font-mono text-cyan-400">
                                          {doc.VersionHistory || 'v1.0 (Active)'}
                                        </td>

                                        {/* Tags badges */}
                                        <td className="py-3.5 px-4 hidden md:table-cell">
                                          <div className="flex flex-wrap gap-1">
                                            {doc.tags.slice(0, 3).map((tag, tIndex) => (
                                              <span 
                                                key={tIndex} 
                                                className="px-2 py-0.5 rounded bg-muted/40 border border-border/20 text-[9px] text-muted-foreground uppercase font-semibold"
                                              >
                                                {tag}
                                              </span>
                                            ))}
                                            {doc.tags.length > 3 && (
                                              <span className="px-1.5 py-0.5 rounded bg-muted/10 text-[9px] text-muted-foreground/60 font-mono">
                                                +{doc.tags.length - 3}
                                              </span>
                                            )}
                                          </div>
                                        </td>

                                        {/* File Size */}
                                        <td className="py-3.5 px-4 hidden lg:table-cell text-xs font-mono text-muted-foreground/75">
                                          {doc.size || '1.2 MB'}
                                        </td>

                                        {/* Upload Date */}
                                        <td className="py-3.5 px-4 hidden sm:table-cell text-xs font-mono text-muted-foreground/75">
                                          {doc.date}
                                        </td>

                                        {/* Approval Status */}
                                        <td className="py-3.5 px-4 text-center">
                                          <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[9px] font-black uppercase border leading-none ${
                                            doc.status === 'Approved' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 shadow-[0_0_10px_rgba(16,185,129,0.05)]' :
                                            doc.status === 'Pending' ? 'bg-amber-500/10 text-amber-500 border-amber-500/20 animate-pulse' :
                                            'bg-rose-500/10 text-rose-400 border-rose-500/20'
                                          }`}>
                                            <span className={`w-1 h-1 rounded-full ${doc.status === 'Approved' ? 'bg-emerald-400' : doc.status === 'Pending' ? 'bg-amber-400 animate-ping' : 'bg-rose-400'}`} />
                                            {doc.status || 'Approved'}
                                          </span>
                                        </td>

                                        {/* Precise buttons */}
                                        <td className="py-3.5 px-4 text-right">
                                          <div className="flex items-center justify-end gap-1.5">
                                            <button
                                              onClick={() => setPreviewDoc(doc)}
                                              title={t('language') === 'so' ? 'Arag / Preview' : 'Preview Document'}
                                              className="p-1.5 rounded bg-sidebar hover:bg-muted text-muted-foreground hover:text-white transition-all cursor-pointer"
                                            >
                                              <Eye className="w-3.5 h-3.5" />
                                            </button>

                                            <button
                                              onClick={() => {
                                                setEditingDocId(doc.id);
                                                setEditingDocName(doc.name);
                                              }}
                                              title={t('language') === 'so' ? 'Bedel Magaca' : 'Rename File'}
                                              className="p-1.5 rounded bg-sidebar hover:bg-muted text-muted-foreground hover:text-white transition-all cursor-pointer"
                                            >
                                              <Edit2 className="w-3.5 h-3.5" />
                                            </button>
                                            
                                            <button
                                              onClick={() => {
                                                showToast(`${doc.name} ${t('language') === 'so' ? 'waa la soo dajinayaa...' : 'downloading...'}`, 'success');
                                              }}
                                              title={t('language') === 'so' ? 'La soo Deg' : 'Download File'}
                                              className="p-1.5 rounded bg-sidebar hover:bg-muted text-muted-foreground hover:text-white transition-all cursor-pointer"
                                            >
                                              <Download className="w-3.5 h-3.5" />
                                            </button>

                                            <button
                                              onClick={() => {
                                                setSelectedDocs([doc.id]);
                                                setIsDeleteModalOpen(true);
                                              }}
                                              title={t('language') === 'so' ? 'Tirtir' : 'Remove Document'}
                                              className="p-1.5 rounded bg-sidebar hover:bg-rose-500/10 text-muted-foreground hover:text-rose-400 transition-all cursor-pointer"
                                            >
                                              <Trash2 className="w-3.5 h-3.5" />
                                            </button>
                                          </div>
                                        </td>
                                      </tr>
                                    );
                                  })}
                                </tbody>
                              </table>
                            </div>
                          );
                        })()}
                      </div>
                    </div>

                    {/* Floating Quick Create Button */}
                    <div className="fixed bottom-8 right-8 z-[1001] flex flex-col items-end">
                      <motion.button
                        initial={{ scale: 0, opacity: 0, y: 30 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setIsQuickCreateOpen(true)}
                        className="bg-primary hover:bg-opacity-95 text-primary-foreground font-black uppercase text-[11px] tracking-widest px-6 py-4 rounded-full shadow-[0_4px_30px_rgba(6,182,212,0.45)] flex items-center gap-2 group transition-all"
                        style={{ border: "1px solid rgba(255, 255, 255, 0.15)" }}
                        title="Quick Create Project Shell"
                      >
                        <Sparkles className="w-4 h-4 text-primary-foreground group-hover:rotate-12 transition-transform" />
                        <span>Quick Create Shell</span>
                      </motion.button>
                    </div>
                  </div>
                )}

                {/* Files View Section */}
                {activeTab === 'files' && (
                  <div 
                    onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                    onDragLeave={() => setIsDragging(false)}
                    onDrop={(e) => { e.preventDefault(); setIsDragging(false); }}
                    className={`space-y-8 relative transition-all duration-300 ${isDragging ? 'ring-4 ring-primary ring-opacity-50 ring-offset-4 ring-offset-background bg-primary/5 scale-[1.01] rounded-2xl p-4' : ''}`}
                  >
                    <AnimatePresence>
                      {isDragging && (
                        <motion.div 
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-primary/20 backdrop-blur-sm rounded-2xl pointer-events-none"
                        >
                          <div className="w-20 h-20 rounded-full bg-primary flex items-center justify-center shadow-[0_0_40px_rgba(6,182,212,0.6)] animate-bounce">
                            <Upload className="w-10 h-10 text-white" />
                          </div>
                          <p className="mt-4 text-xl font-bold text-white uppercase tracking-widest drop-shadow-lg">Drop to secure upload</p>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                      <div>
                        <h2 className="text-2xl font-bold tracking-tight text-foreground">Files</h2>
                        <p className="text-[13px] text-muted-foreground mt-1">Organize and manage files by category</p>
                      </div>
                      <button 
                        onClick={() => setIsUploadModalOpen(true)}
                        className="bg-primary text-primary-foreground px-4 py-2.5 rounded-lg font-bold uppercase tracking-wider text-[11px] flex items-center gap-2"
                      >
                        <Upload className="w-4 h-4" />
                        Upload File
                      </button>
                    </div>

                    <div className="relative group sm:max-w-md">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <input 
                        type="text" 
                        value={fileSearch}
                        onChange={(e) => setFileSearch(e.target.value)}
                        placeholder="Search files..." 
                        className="bg-card border border-border rounded-lg pl-10 pr-4 py-2 w-full outline-none focus:border-primary/50 transition-all text-xs"
                      />
                    </div>

                    {/* File Categories */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      {categoryData.map((cat) => (
                        <button 
                          key={cat.label}
                          onClick={() => setActiveFileCategory(cat.label)}
                          className={`
                            p-4 rounded-xl border flex items-center justify-between transition-all group
                            ${activeFileCategory === cat.label 
                              ? 'bg-primary border-primary/20 text-white shadow-[0_4px_20px_rgba(6,182,212,0.3)]' 
                              : 'bg-card border-border hover:border-primary/30 text-muted-foreground hover:text-white'
                            }
                          `}
                        >
                          <div className="flex items-center gap-3">
                            <i className={`p-2 rounded-lg ${activeFileCategory === cat.label ? 'bg-white/10' : 'bg-sidebar-accent'}`}>
                              <cat.icon className="w-4 h-4" />
                            </i>
                            <span className="text-[13px] font-bold tracking-tight">{cat.label}</span>
                          </div>
                          <span className={`${activeFileCategory === cat.label ? 'bg-white/20' : 'bg-muted'} text-[10px] font-bold px-2 py-0.5 rounded-full`}>
                            {cat.files.length}
                          </span>
                        </button>
                      ))}
                    </div>

                    {/* Category Detail */}
                    <div className="bg-card border border-border/50 rounded-2xl overflow-hidden shadow-2xl">
                      <div className="p-5 border-b border-border bg-sidebar-accent/10 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center border border-primary/30">
                            {(() => {
                              const CategoryIcon = currentCategory.icon;
                              return <CategoryIcon className="w-5 h-5 text-primary" />;
                            })()}
                          </div>
                          <div>
                            <h3 className="text-[15px] font-bold text-white">{currentCategory.label}</h3>
                            <p className="text-[11px] text-muted-foreground uppercase font-bold tracking-widest mt-0.5">
                              {currentCategory.desc}
                            </p>
                          </div>
                        </div>
                        <button 
                          onClick={() => setIsUploadModalOpen(true)}
                          className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-border hover:bg-muted text-[11px] font-bold uppercase tracking-wider text-muted-foreground transition-all"
                        >
                          <Plus className="w-3.5 h-3.5" /> Add File
                        </button>
                      </div>
                      
                      <div className="min-h-[300px] flex flex-col items-center justify-center p-12 text-center bg-grid-pattern/50">
                        {filteredCategoryFiles.length > 0 ? (
                            <div className="w-full space-y-4">
                              {filteredCategoryFiles.map((file, idx) => (
                                <div 
                                  key={idx} 
                                  onClick={() => {
                                    const foundDoc = documents.find(d => d.name === file.name);
                                    if (foundDoc) {
                                      setPreviewDoc(foundDoc);
                                    } else {
                                      setPreviewDoc({
                                        id: `file-preview-${idx}`,
                                        name: file.name,
                                        size: file.size,
                                        date: file.date,
                                        tags: [currentCategory.label],
                                        type: file.name.split('.').pop() || 'pdf'
                                      });
                                    }
                                  }}
                                  className="flex items-center justify-between p-4 rounded-xl bg-sidebar/30 border border-border/50 hover:border-primary/30 transition-all cursor-pointer group"
                                >
                                  <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-lg bg-sidebar-accent flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                                      <file.icon className="w-5 h-5 text-primary" />
                                    </div>
                                    <div className="text-left">
                                      <h4 className="text-sm font-bold text-white group-hover:text-primary transition-colors">{file.name}</h4>
                                      <div className="flex items-center gap-2 mt-1">
                                        <span className="text-[10px] text-muted-foreground font-mono">{file.size}</span>
                                        <span className="text-[10px] text-muted-foreground">•</span>
                                        <span className="text-[10px] text-muted-foreground font-mono">{file.date}</span>
                                      </div>
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                                    <button 
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        // Trigger preview since download link isn't configured, or direct them to open the document
                                        const foundDoc = documents.find(d => d.name === file.name);
                                        if (foundDoc) {
                                          setPreviewDoc(foundDoc);
                                        }
                                      }}
                                      className="p-2 rounded-lg hover:bg-muted text-muted-foreground"
                                      title={t('language') === 'so' ? 'Arag Faylka' : 'View File'}
                                    >
                                      <Download className="w-4 h-4" />
                                    </button>
                                    <button 
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setSelectedDocs([file.id]);
                                        setBulkActionType('delete');
                                        setIsDeleteModalOpen(true);
                                      }}
                                      className="p-2 rounded-lg hover:bg-rose-500/10 text-rose-400 hover:text-rose-500 transition-colors"
                                      title={t('language') === 'so' ? 'Tirtir Faylka' : 'Delete File'}
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <>
                              <div className="w-20 h-20 rounded-full bg-muted/50 flex items-center justify-center mb-6 border-2 border-dashed border-border group-hover:scale-110 transition-transform">
                                <FolderOpen className="w-10 h-10 text-muted-foreground/30" />
                              </div>
                              <h4 className="text-lg font-bold text-white/80">No files found</h4>
                              <p className="text-[13px] text-muted-foreground mt-2 max-w-xs mx-auto leading-relaxed">
                                Upload files to this category to get started with your digital archiving.
                              </p>
                              <button 
                                onClick={() => setIsUploadModalOpen(true)}
                                className="mt-8 bg-secondary text-secondary-foreground border border-border px-6 py-2.5 rounded-xl font-bold uppercase tracking-widest text-[11px] flex items-center gap-2 hover:bg-muted active:scale-95 transition-all"
                              >
                                <Upload className="w-4 h-4" />
                                Upload File
                              </button>
                            </>
                          )}
                      </div>
                    </div>

                  </div>
                )}

                {activeTab === 'projects' && (
                  <ProjectsView 
                    viewMode={projectsViewMode} 
                    onViewModeChange={setProjectsViewMode} 
                    isUserAdmin={isUserAdmin}
                    projects={projects}
                    setProjects={setProjects}
                  />
                )}
                {activeTab === 'docs' && (
                  <DocumentsView 
                    documents={sharedWorkspace ? documents.filter(d => sharedWorkspace.docIds.includes(d.id)) : documents}
                    setDocuments={setDocuments}
                    selectedDocs={selectedDocs}
                    toggleSelectDoc={toggleSelectDoc}
                    toggleSelectAll={toggleSelectAll}
                    onUploadTrigger={() => setIsUploadModalOpen(true)}
                    currentUser={currentUser}
                    onPreview={(docName, id) => {
                      const fullDoc = documents.find(d => d.id === id);
                      setPreviewDoc(fullDoc || { id, name: docName, size: '', date: '', tags: [], type: '' });
                    }}
                    verificationResults={verificationResults}
                    onBatchVerify={handleBatchVerify}
                    isVerifying={isVerifying}
                    docsSubTab={docsSubTab}
                    setDocsSubTab={setDocsSubTab}
                  />
                )}
                {activeTab === 'storage' && <StorageView />}
                {activeTab === 'search' && (
                  <SearchView 
                    initialQuery={fileSearch} 
                    documents={sharedWorkspace ? documents.filter(d => sharedWorkspace.docIds.includes(d.id)) : documents}
                    onPreview={(docName, id) => {
                      const foundDoc = documents.find(d => d.id === id);
                      setPreviewDoc(foundDoc || { id, name: docName, size: '', date: '', tags: [], type: '' });
                    }}
                  />
                )}
                {activeTab === 'approvals' && <ApprovalsView />}
                {activeTab === 'analytics' && <AnalyticsView />}
                {activeTab === 'timeline' && <TimelineView />}
                {activeTab === 'ai' && <AICaawiyeView />}
                {activeTab === 'webapps' && (
                  <WebAppsView 
                    currentUser={currentUser} 
                    showToast={showToast} 
                  />
                )}
                {activeTab === 'settings' && (
                  <SettingsView 
                    currentUser={currentUser!}
                    onUserUpdate={(updatedUser) => {
                      setCurrentUser(updatedUser);
                      localStorage.setItem('geomds_user', JSON.stringify(updatedUser));
                    }}
                  />
                )}
                {activeTab === 'admin' && isUserAdmin && <AdminView />}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </main>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 md:hidden"
            />
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 left-0 bottom-0 w-[280px] bg-sidebar border-r border-sidebar-border z-50 md:hidden flex flex-col"
            >
              <div className="p-6 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded bg-primary flex items-center justify-center">
                    <FolderOpen className="w-5 h-5 text-primary-foreground" />
                  </div>
                  <span className="font-bold text-xl tracking-tight text-glow">GeoDMS</span>
                </div>
                <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 rounded-lg hover:bg-sidebar-accent">
                  <X className="w-6 h-6" />
                </button>
              </div>

              <nav className="flex-1 px-4 py-4 space-y-2">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;
                  
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        if (item.id === 'map') {
                          setActiveTab('projects');
                          setProjectsViewMode('Map');
                        } else {
                          setActiveTab(item.id);
                          if (item.id === 'projects') setProjectsViewMode('List');
                        }
                        setIsMobileMenuOpen(false);
                        showToast(`Navigated to ${item.label}`, 'info');
                      }}
                      className={`
                        w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all
                        ${isActive 
                          ? 'bg-primary/10 text-primary border border-primary/20' 
                          : 'text-sidebar-foreground hover:bg-sidebar-accent'
                        }
                      `}
                    >
                      <Icon className="w-6 h-6" />
                      <span className="font-semibold text-lg">{item.label}</span>
                    </button>
                  );
                })}
              </nav>

              <div className="p-4 border-t border-sidebar-border bg-sidebar-accent/5">
                <button 
                  onClick={() => {
                    setCurrentUser(null);
                    localStorage.removeItem('geomds_user');
                    setIsMobileMenuOpen(false);
                    showToast(t('language') === 'so' ? 'Waa laguu soo saaray!' : 'Logged out successfully!', 'info');
                  }}
                  className="w-full flex items-center gap-3 p-3 rounded-lg text-rose-500 hover:bg-rose-500/10 hover:text-rose-400 transition-colors group"
                >
                  <LogOut className="w-6 h-6 flex-shrink-0" />
                  <span className="font-semibold text-lg">{t('language') === 'so' ? 'Ka Bax' : 'Sign Out'}</span>
                </button>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function App() {
  return (
    <LanguageProvider>
      <ToastProvider>
        <AppContent />
      </ToastProvider>
    </LanguageProvider>
  );
}

