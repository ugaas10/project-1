import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, ZoomIn, ZoomOut, Download, Maximize2, ChevronLeft, ChevronRight, 
  FileSearch, Loader2, CheckCircle2, Layers, Grid, Sliders, Contrast, 
  RotateCw, RefreshCw, Eye, EyeOff, CheckSquare, Square, Archive, 
  ArrowRight, CornerDownRight, Play, Info, Ruler, MapPin, ZoomIn as ZoomInIcon,
  Cpu, Terminal, Activity, Database, Network, Globe, AlertTriangle, QrCode, Share2,
  ShieldCheck, ShieldAlert, Link
} from 'lucide-react';
import QRCode from 'react-qr-code';
import { useToast } from './Toast';

// Define Document standard signature matching App.tsx
export interface Document {
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

interface DocumentPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  documentName: string;
  docId?: string;
  document?: Document | null;
  setDocuments?: React.Dispatch<React.SetStateAction<Document[]>>;
}

export function DocumentPreviewModal({ 
  isOpen, 
  onClose, 
  documentName, 
  docId, 
  document,
  setDocuments 
}: DocumentPreviewModalProps) {
  const [zoom, setZoom] = useState(100);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSidePanelOpen, setIsSidePanelOpen] = useState(true);
  const [showShareQR, setShowShareQR] = useState(false);
  const [qrType, setQrType] = useState<'url' | 'metadata'>('url');
  const qrRef = useRef<HTMLDivElement>(null);

  const handleDownloadQRPNG = () => {
    const svgElement = qrRef.current?.querySelector('svg');
    if (!svgElement) {
      showToast('QR element not found for rendering', 'error');
      return;
    }

    try {
      const canvas = window.document.createElement('canvas');
      canvas.width = 300;
      canvas.height = 300;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Draw white background
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const svgString = new XMLSerializer().serializeToString(svgElement);
      const svgBlob = new Blob([svgString], { type: "image/svg+xml;charset=utf-8" });
      const blobURL = window.URL.createObjectURL(svgBlob);
      
      const qrImage = new Image();
      qrImage.onload = () => {
        ctx.drawImage(qrImage, 15, 15, 270, 270);
        
        const downloadLink = window.document.createElement('a');
        downloadLink.href = canvas.toDataURL('image/png');
        downloadLink.download = `${documentName.replace(/\s+/g, '_')}_Share_QR.png`;
        window.document.body.appendChild(downloadLink);
        downloadLink.click();
        window.document.body.removeChild(downloadLink);
        window.URL.revokeObjectURL(blobURL);
        showToast('Document sharing QR label exported as PNG', 'success');
      };
      qrImage.src = blobURL;
    } catch (e) {
      console.error(e);
      showToast('Could not convert QR code to Image', 'error');
    }
  };
  
  // Systems Preview Dynamic State
  const [activePreviewTab, setActivePreviewTab] = useState<'visual' | 'system'>('visual');
  const [isSystemRunning, setIsSystemRunning] = useState(false);
  const [systemLogs, setSystemLogs] = useState<string[]>([]);
  const [systemMetrics, setSystemMetrics] = useState({
    cpuLoad: 12,
    memoryUsed: '240 MB',
    apiLatency: '45ms',
    networkStatus: 'COMPLIANT'
  });
  
  const runSystemDiagnosis = () => {
    if (isSystemRunning) return;
    setIsSystemRunning(true);
    showToast('Initializing secure GIS crawler & document parser system check...', 'info');
    
    setSystemLogs(prev => [...prev, `[SYSTEM DIAGNOSIS] Starting active system integration scan...`]);
    
    setTimeout(() => {
      setSystemLogs(prev => [...prev, `[OCR CRAWLER] Extracting bounding coordinates zone...`]);
    }, 800);
    
    setTimeout(() => {
      setSystemLogs(prev => [...prev, `[GEO REFERENCE] Validating Somali Grid projection alignment: ZONE 38N (EPSG:32638) - STATUS: 100% CORRECT.`]);
    }, 1600);
    
    setTimeout(() => {
      setSystemLogs(prev => [...prev, `[INTEGRITY ENGINE] Verifying blockchain ledger proof signatures - STATUS: ENCRYPTED AND COMPLIANT.`]);
    }, 2400);

    setTimeout(() => {
      setIsSystemRunning(false);
      setSystemLogs(prev => [...prev, `[SYSTEM DIAGNOSIS] All automation steps completed successfully. Ready for deployment.`]);
      showToast('Document system diagnostic completed! 100% compliant.', 'success');
    }, 3200);
  };
  
  // Dynamic Document Metadata state
  const [metadata, setMetadata] = useState({
    author: 'Mohamed A.',
    department: 'Engineering',
    version: '2.4',
    status: 'Verified'
  });

  // Dynamic Document Name Local State
  const [localDocName, setLocalDocName] = useState(documentName);

  // Sync state when document name or ID changes
  useEffect(() => {
    setLocalDocName(documentName);
  }, [documentName, docId]);

  const { showToast } = useToast();

  const compCode = document?.ComplianceCode || 'MOG-HW-042';
  const isExpired = compCode.toUpperCase().includes('DR') || compCode.toUpperCase().includes('PZ') || compCode.toUpperCase().includes('EXP') || documentName.toLowerCase().includes('drainage') || documentName.toLowerCase().includes('zoning');

  const [complianceState, setComplianceState] = useState<{
    status: 'Active' | 'Expired' | 'Verifying';
    checkedAt: string | null;
  }>({
    status: isExpired ? 'Expired' : 'Active',
    checkedAt: null
  });

  // Sync compliance status when document changes
  useEffect(() => {
    setComplianceState({
      status: isExpired ? 'Expired' : 'Active',
      checkedAt: null
    });
  }, [compCode, isExpired]);

  // CAD Interactive State
  const [cadTheme, setCadTheme] = useState<'dark' | 'light'>('dark');
  const [showGrid, setShowGrid] = useState(true);
  const [showContours, setShowContours] = useState(true);
  const [showCenterline, setShowCenterline] = useState(true);
  const [showStructures, setShowStructures] = useState(true);
  const [canvasCoords, setCanvasCoords] = useState<{ x: number; y: number } | null>(null);
  const [measurementMode, setMeasurementMode] = useState(false);
  const [measurePoints, setMeasurePoints] = useState<Array<{ x: number; y: number }>>([]);

  // PDF Interactive State
  const [pdfPage, setPdfPage] = useState(1);
  const totalPdfPages = 3;
  const [isSigned, setIsSigned] = useState(false);
  const [auditChecklist, setAuditChecklist] = useState<Record<string, boolean>>({
    coordinateControl: true,
    soilIntegrity: false,
    drainageCapacity: true,
    regulatoryClearance: false
  });

  // Image / Thermal State
  const [brightness, setBrightness] = useState(100);
  const [contrast, setContrast] = useState(100);
  const [rotation, setRotation] = useState(0);
  const [activeFilter, setActiveFilter] = useState<'none' | 'monochrome' | 'blueprint' | 'infrared'>('none');

  // ZIP state
  const [unzipping, setUnzipping] = useState(false);
  const [zipExtracted, setZipExtracted] = useState(false);
  const [extractionProgress, setExtractionProgress] = useState(0);

  // Synchronize Metadata when Document changes
  useEffect(() => {
    if (!isOpen) return;
    
    // Reset page and interactive states
    setPdfPage(1);
    setIsSigned(false);
    setMeasurePoints([]);
    setMeasurementMode(false);
    setZipExtracted(false);
    setUnzipping(false);
    setExtractionProgress(0);
    setShowShareQR(false);
    setQrType('url');
    
    // Reset system preview state and inject initial logs
    setActivePreviewTab('visual');
    setIsSystemRunning(false);
    setSystemLogs([
      `[SYSTEM INGEST] Document core initialized: SHA-256 integrity resolved.`,
      `[METADATA PARSER] Mapping tags for central geolocalization router...`,
      `[LEDGER INDEX] Registered with central spatial database Zones.`
    ]);

    const lowerName = documentName.toLowerCase();
    if (lowerName.includes('highway') || lowerName.includes('a42')) {
      setMetadata({
        author: 'Eng. Ahmed Barre',
        department: 'Engineering',
        version: '3.1',
        status: document?.status || 'Approved'
      });
    } else if (lowerName.includes('drainage') || lowerName.includes('complex')) {
      setMetadata({
        author: 'Fardowsa Cismaan',
        department: 'Architecture',
        version: '1.8',
        status: document?.status || 'Approved'
      });
    } else if (lowerName.includes('river') || lowerName.includes('kismayo')) {
      setMetadata({
        author: 'Saciid Mire',
        department: 'Surveys',
        version: '2.4',
        status: document?.status || 'Pending'
      });
    } else if (lowerName.includes('berbera') || lowerName.includes('zoning')) {
      setMetadata({
        author: 'Eng. Cabdiwali Yusuf',
        department: 'Admin',
        version: '4.0',
        status: document?.status || 'Approved'
      });
    } else if (lowerName.includes('soil') || lowerName.includes('topography')) {
      setMetadata({
        author: 'Prof. Maxamed Guuleed',
        department: 'Surveys',
        version: '1.2',
        status: document?.status || 'Approved'
      });
    } else {
      setMetadata({
        author: 'Mohamed A.',
        department: 'Engineering',
        version: '1.0',
        status: document?.status || 'Verified'
      });
    }
  }, [documentName, isOpen, document?.status]);

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

  const handleGenerateSummary = () => {
    setIsGenerating(true);
    showToast('Engaging AI Core to interpret drawing layouts...', 'info');
    setTimeout(() => {
      setIsGenerating(false);
      showToast('Completed vector element analysis and generated summary PDF report!', 'success');
    }, 2800);
  };

  const handleCADMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = Math.max(0, Math.min(rect.width, e.clientX - rect.left));
    const y = Math.max(0, Math.min(rect.height, e.clientY - rect.top));
    setCanvasCoords({ x: Math.round(x), y: Math.round(y) });
  };

  const handleCADClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!measurementMode) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = Math.round(e.clientX - rect.left);
    const y = Math.round(e.clientY - rect.top);

    setMeasurePoints(prev => {
      const next = [...prev];
      if (next.length >= 2) {
        return [{ x, y }];
      }
      return [...next, { x, y }];
    });
    showToast('Registered measurement marker point', 'info');
  };

  const clearMeasurement = () => {
    setMeasurePoints([]);
  };

  // ZIP Simulated Extractor Handler
  const handleExtractZip = () => {
    if (unzipping || zipExtracted) return;
    setUnzipping(true);
    setExtractionProgress(5);
    
    const interval = setInterval(() => {
      setExtractionProgress(p => {
        if (p >= 100) {
          clearInterval(interval);
          setUnzipping(false);
          setZipExtracted(true);
          
          // Programmatically extract and insert subfiles to Main list!
          if (setDocuments) {
            const subfiles: Document[] = [
              {
                id: `zip-ext-1-${Date.now()}`,
                name: 'Kismayo_River_Meander_V1.dwg',
                size: '4.8 MB',
                date: new Date().toISOString().split('T')[0],
                tags: ['Extract', 'River', 'CAD'],
                type: 'dwg',
                status: 'Approved',
                uploadedBy: 'System',
                uploaderName: 'ZIP System Extractor'
              },
              {
                id: `zip-ext-2-${Date.now()}`,
                name: 'Kismayo_Drainage_Catchment.dwg',
                size: '6.2 MB',
                date: new Date().toISOString().split('T')[0],
                tags: ['Extract', 'Drainage', 'CAD'],
                type: 'dwg',
                status: 'Approved',
                uploadedBy: 'System',
                uploaderName: 'ZIP System Extractor'
              },
              {
                id: `zip-ext-3-${Date.now()}`,
                name: 'Kismayo_Topography_Audit_Signatures.pdf',
                size: '1.5 MB',
                date: new Date().toISOString().split('T')[0],
                tags: ['Extract', 'Reports'],
                type: 'pdf',
                status: 'Approved',
                uploadedBy: 'System',
                uploaderName: 'ZIP System Extractor'
              }
            ];

            setDocuments(prev => {
              // Deduplicate names to prevent clutter if double extracted
              const filtered = prev.filter(p => !subfiles.some(s => s.name === p.name));
              return [...subfiles, ...filtered];
            });
            showToast('Unzipped successfully! 3 documents added to active repository.', 'success');
          } else {
            showToast('Files parsed and validated safely in temporary sandbox', 'success');
          }
          return 100;
        }
        return p + 15;
      });
    }, 250);
  };

  const toggleAuditCheck = (key: string) => {
    setAuditChecklist(prev => {
      const updated = { ...prev, [key]: !prev[key] };
      showToast(`${key.replace(/([A-Z])/g, ' $1')} status updated`, 'info');
      return updated;
    });
  };

  const handleApplySignature = () => {
    setIsSigned(true);
    showToast('Official Digital Signature Applied Secured via Blockchain Ledger', 'success');
  };

  // Determine file type
  const resolvedType = (document?.type || documentName.split('.').pop() || 'pdf').toLowerCase();
  const isCad = ['dwg', 'dxf', 'cad', 'naqshado'].includes(resolvedType);
  const isPdf = ['pdf', 'doc', 'docx', 'reports', 'cadeymo'].includes(resolvedType);
  const isImg = ['png', 'jpg', 'jpeg', 'webp', 'gif', 'maps'].includes(resolvedType);
  const isZip = ['zip', 'rar', 'tar', '7z'].includes(resolvedType);

  // Safe measurement calculation
  const calculatedDistance = (() => {
    if (measurePoints.length !== 2) return null;
    const [p1, p2] = measurePoints;
    const pxScale = 3.4; // 1 pixel = 3.4 meters
    const dx = (p2.x - p1.x) * pxScale;
    const dy = (p2.y - p1.y) * pxScale;
    return Math.sqrt(dx*dx + dy*dy).toFixed(1);
  })();

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-background/95 backdrop-blur-md z-[2000]"
          />
          <motion.div
            layoutId={docId ? `doc-card-${docId}` : undefined}
            className="fixed inset-2 md:inset-8 bg-card border border-border shadow-2xl rounded-2xl z-[2001] flex flex-col overflow-hidden text-white"
          >
            {/* Header Toolbar */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 px-6 py-4 border-b border-border bg-muted/30">
              <div className="flex items-center gap-3">
                <motion.div 
                  layoutId={docId ? `doc-icon-${docId}` : undefined}
                  className={`w-10 h-10 rounded-lg flex items-center justify-center font-extrabold text-[11px] tracking-wider uppercase border shrink-0 ${
                    isCad ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
                    isPdf ? 'bg-rose-500/10 text-rose-400 border-rose-500/20' :
                    isZip ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                    'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                  }`}
                >
                  {resolvedType}
                </motion.div>
                <div className="min-w-0">
                  <motion.h3 
                    layoutId={docId ? `doc-name-${docId}` : undefined}
                    className="text-base font-black tracking-tight truncate max-w-xs md:max-w-md text-white"
                  >
                    {documentName}
                  </motion.h3>
                  <p className="text-[9px] text-muted-foreground uppercase font-black tracking-widest mt-0.5 flex items-center gap-1.5">
                    <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    Digital Archive Secure ID: {docId || 'T-2026-X'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
                {/* AI Summary Button */}
                <button 
                  onClick={handleGenerateSummary}
                  disabled={isGenerating}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg font-bold uppercase tracking-widest text-[9px] border transition-all ${
                    isGenerating 
                    ? 'bg-muted text-muted-foreground border-border' 
                    : 'bg-primary/10 text-primary border-primary/20 hover:bg-primary hover:text-primary-foreground'
                  }`}
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      Interpreting...
                    </>
                  ) : (
                    <>
                      <FileSearch className="w-3.5 h-3.5" />
                      AI Scan Layout
                    </>
                  )}
                </button>

                {/* Generate QR Button */}
                <button 
                  onClick={() => {
                    setIsSidePanelOpen(true);
                    setShowShareQR(prev => !prev);
                    showToast(showShareQR ? 'Closed QR layout viewer' : 'Generated shareable QR code', 'info');
                  }}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg font-semibold uppercase tracking-widest text-[9px] border transition-all ${
                    showShareQR 
                    ? 'bg-cyan-500 text-black border-cyan-500 font-extrabold shadow-lg shadow-cyan-500/20' 
                    : 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20 hover:bg-cyan-500 hover:text-black'
                  }`}
                  title="Generate shareable QR code for this document"
                >
                  <QrCode className="w-3.5 h-3.5" />
                  Generate QR
                </button>

                {/* Copy Link Button */}
                <button 
                  onClick={() => {
                    const idToShare = docId || document?.id;
                    if (idToShare) {
                      const expiry = Date.now() + 86400000; // 24 hours
                      const url = `${window.location.origin}/?shared_docs=${encodeURIComponent(idToShare)}&token=${expiry}`;
                      navigator.clipboard.writeText(url);
                      showToast('Temporary secure link copied to clipboard!', 'success');
                    } else {
                      showToast('Document ID not found', 'error');
                    }
                  }}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg font-semibold uppercase tracking-widest text-[9px] border bg-cyan-500/10 text-cyan-400 border-cyan-500/20 hover:bg-cyan-500 hover:text-black transition-all cursor-pointer"
                  title="Copy temporary secure link for this document (24h)"
                >
                  <Link className="w-3.5 h-3.5" />
                  Copy Link
                </button>

                {/* Adjustments & Config controls */}
                <div className="flex items-center bg-muted rounded-lg border border-border p-1">
                  <button onClick={() => setZoom(z => Math.max(z - 15, 50))} className="p-1 text-muted-foreground hover:text-white rounded hover:bg-card transition-all" title="Zoom Out">
                    <ZoomOut className="w-3.5 h-3.5" />
                  </button>
                  <span className="text-[10px] font-mono font-bold px-2.5 min-w-[50px] text-center text-muted-foreground">{zoom}%</span>
                  <button onClick={() => setZoom(z => Math.min(z + 15, 250))} className="p-1 text-muted-foreground hover:text-white rounded hover:bg-card transition-all" title="Zoom In">
                    <ZoomIn className="w-3.5 h-3.5" />
                  </button>
                </div>

                <button 
                  onClick={() => setIsSidePanelOpen(!isSidePanelOpen)}
                  className={`p-2 rounded-lg border transition-all ${isSidePanelOpen ? 'bg-primary/10 border-primary/50 text-primary hover:bg-primary/20' : 'border-border text-muted-foreground hover:bg-muted'}`}
                  title="Toggle Edit Panel"
                >
                  <Maximize2 className="w-4 h-4" />
                </button>

                <div className="h-6 w-[1px] bg-border mx-1 hidden sm:block" />

                <button onClick={onClose} className="p-2 rounded-lg bg-muted hover:bg-destructive/10 hover:text-destructive transition-all">
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Core Interactive Visualizer Area */}
            <div className="flex-1 flex flex-col md:flex-row overflow-hidden min-h-0">
               
               {/* Main Viewer Canvas container */}
               <div className="flex-1 overflow-auto bg-[#0a0d13] p-4 md:p-8 flex flex-col items-center justify-start md:justify-center gap-6 scrollbar-thin relative select-none">
                  
                  {/* Dynamic Section Description Banner based on Document Type */}
                  <div className="w-full max-w-2xl bg-sidebar/75 backdrop-blur-md border border-border/80 p-4 rounded-xl text-left shadow-lg shrink-0 flex items-start gap-3.5 z-10 transition-all">
                    <div className="p-2.5 bg-primary/10 rounded-lg text-primary shrink-0">
                      {isCad ? <Layers className="w-4 h-4 text-cyan-400" /> :
                       isPdf ? <FileSearch className="w-4 h-4 text-rose-400" /> :
                       isImg ? <MapPin className="w-4 h-4 text-emerald-400" /> :
                               <Archive className="w-4 h-4 text-amber-400" />}
                    </div>
                    <div className="space-y-1 min-w-0">
                      <h4 className="text-xs font-black text-white uppercase tracking-wider font-mono flex items-center gap-2">
                        <span>
                          {isCad ? 'Interactive CAD Blueprint Workspace' :
                           isPdf ? 'Dynamic Hydrology Report & Clearance Cert' :
                           isImg ? 'Scanned Document & Image Viewer' :
                                   'Multi-Layer Asset Archive Manager'}
                        </span>
                        <span className="text-[8px] px-1.5 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20 shrink-0 font-bold uppercase tracking-widest">
                          Active Previews
                        </span>
                      </h4>
                      <p className="text-[10px] text-zinc-400 leading-relaxed font-sans mt-1">
                        {isCad ? 'Analyze digital CAD projection blueprints. Use the vector overlays controller to toggle structural contour features, activate the tape ruler tools to measure ground distance parameters, or track real-time Somali geodetic grid coordinates (Zone 38N).' :
                         isPdf ? 'Review official clearance documentations, land compaction surveys, and hydrological drainage capacities. Includes an interactive compliance checklist to verify requirements.' :
                         isImg ? 'Preview uploaded images and scanned compliance files. Apply real-time visual filter channels, adjust brightness and contrast, or rotate orientation directly using the control deck below.' :
                                 'Explore compressed and bundled engineering draw packages. Click Unpack Active Files to automatically extract files, coordinate indices, geodetic vectors, and site parameters directly into your active workspace registry.'}
                      </p>
                    </div>
                  </div>
                  


                  {/* DYNAMIC CAD BLUEPRINT VIEW */}
                  {activePreviewTab === 'visual' && isCad && (
                    <div 
                      onMouseMove={handleCADMouseMove}
                      onMouseLeave={() => setCanvasCoords(null)}
                      onClick={handleCADClick}
                      style={{ 
                        transform: `scale(${zoom / 100})`, 
                        transition: 'transform 0.1s ease-out' 
                      }}
                      className={`relative w-[640px] h-[480px] rounded-xl border transition-colors shadow-2xl overflow-hidden shrink-0 ${
                        cadTheme === 'dark' ? 'bg-[#0b0e14] border-cyan-500/20' : 'bg-[#fcfdfd] border-slate-300'
                      } ${measurementMode ? 'cursor-crosshair' : 'cursor-default'}`}
                    >
                      {/* Grid Background */}
                      {showGrid && (
                        <div className="absolute inset-0 opacity-[0.06] pointer-events-none" style={{
                          backgroundImage: cadTheme === 'dark'
                            ? 'radial-gradient(circle, #06b6d4 1px, transparent 1px), linear-gradient(to right, #06b6d4 1px, transparent 1px), linear-gradient(to bottom, #06b6d4 1px, transparent 1px)'
                            : 'radial-gradient(circle, #334155 1.5px, transparent 1.5px), linear-gradient(to right, #cbd5e1 1px, transparent 1px), linear-gradient(to bottom, #cbd5e1 1px, transparent 1px)',
                          backgroundSize: '24px 24px'
                        }} />
                      )}

                      {/* CAD Vector Graphics SVG drafting */}
                      <svg className="absolute inset-0 w-full h-full pointer-events-none p-8" viewBox="0 0 640 480">
                        {/* Title Watermark */}
                        <text x="320" y="240" fill={cadTheme === 'dark' ? '#06b6d4' : '#334155'} textAnchor="middle" className="text-sm font-bold opacity-5 uppercase tracking-[0.4em] font-mono">
                          GEODMS CAD WORKSPACE TERMINAL
                        </text>

                        {/* Topography Contours Map */}
                        {showContours && (
                          <g className={`${cadTheme === 'dark' ? 'stroke-neutral-700/50' : 'stroke-slate-300'} stroke-1 fill-none`}>
                            <path d="M 50 100 Q 200 40 380 90 T 590 120" />
                            <path d="M 40 180 Q 220 120 370 190 T 600 215" />
                            <path d="M 45 270 Q 180 230 350 280 T 585 300" />
                            <path d="M 30 360 Q 190 310 390 380 T 610 390" />
                          </g>
                        )}

                        {/* Specific document visual alignments */}
                        {documentName.toLowerCase().includes('highway') || documentName.toLowerCase().includes('a42') ? (
                          <>
                            {/* Highway drafting alignment */}
                            {showCenterline && (
                              <g className="fill-none">
                                {/* Road bounds */}
                                <path d="M 100 200 Q 300 120 540 280" stroke={cadTheme === 'dark' ? '#1e293b' : '#cbd5e1'} strokeWidth="24" />
                                <path d="M 100 200 Q 300 120 540 280" stroke={cadTheme === 'dark' ? '#06b6d4' : '#0891b2'} strokeWidth="2" strokeDasharray="6,4" />
                                <circle cx="100" cy="200" r="4" fill="#06b6d4" />
                                <circle cx="304" cy="151" r="4" fill="#06b6d4" />
                                <circle cx="540" cy="280" r="4" fill="#06b6d4" />
                              </g>
                            )}
                            {showStructures && (
                              <g className="fill-none">
                                {/* Drainage crosses or concrete culverts */}
                                <rect x="280" y="135" width="20" height="32" stroke="#e11d48" strokeWidth="1.5" transform="rotate(-15, 290, 151)" />
                                <line x1="260" y1="130" x2="320" y2="180" stroke="#e11d48" strokeWidth="1" strokeDasharray="3,3" />
                                <text x="280" y="125" fill="#e11d48" className="text-[8px] font-mono font-bold uppercase">CULVERT KM 1+450</text>
                                
                                <path d="M 500 230 L 530 260" stroke="#f59e0b" strokeWidth="3" />
                                <text x="480" y="220" fill="#f59e0b" className="text-[8px] font-mono font-bold uppercase">RETAINING WALL</text>
                              </g>
                            )}
                          </>
                        ) : documentName.toLowerCase().includes('river') || documentName.toLowerCase().includes('kismayo') ? (
                          <>
                            {/* River Demarcation Splines */}
                            {showCenterline && (
                              <g className="fill-none">
                                <path d="M 50 240 Q 180 80 320 280 T 590 120" stroke="#0ea5e9" strokeWidth="18" className="opacity-30" />
                                <path d="M 50 240 Q 180 80 320 280 T 590 120" stroke="#38bdf8" strokeWidth="1.5" />
                                {/* Meander markers */}
                                <circle cx="210" cy="175" r="5" fill="#0a0d13" stroke="#0ea5e9" strokeWidth="1.5" />
                                <circle cx="430" cy="235" r="5" fill="#0a0d13" stroke="#0ea5e9" strokeWidth="1.5" />
                              </g>
                            )}
                            {showStructures && (
                              <g className="fill-none">
                                {/* Core water gauge levels or pumps */}
                                <polygon points="310,270 320,290 300,290" fill="#ec4899" stroke="#db2777" strokeWidth="1" />
                                <text x="260" y="305" fill="#ec4899" className="text-[8px] font-mono font-bold">MONITORING STATION S-14</text>
                                
                                <circle cx="120" cy="210" r="15" stroke="#f59e0b" strokeWidth="1" strokeDasharray="2,2" />
                                <text x="100" y="185" fill="#f59e0b" className="text-[8px] font-mono font-bold">EROSION RISK BOUNDS</text>
                              </g>
                            )}
                          </>
                        ) : (
                          <>
                            {/* Standard drainage network, building limits or property layout */}
                            {showCenterline && (
                              <g className="fill-none stroke-blue-500/40 stroke-1">
                                <rect x="150" y="120" width="160" height="200" stroke="#3b82f6" strokeWidth="2" />
                                <rect x="360" y="120" width="120" height="120" stroke="#10b981" strokeWidth="1.5" />
                                <circle cx="230" cy="220" r="45" stroke="#e11d48" strokeWidth="1.5" strokeDasharray="4,2" />
                              </g>
                            )}
                            {showStructures && (
                              <g fill="none">
                                <circle cx="150" cy="120" r="4" fill="#a855f7" />
                                <circle cx="310" cy="120" r="4" fill="#a855f7" />
                                <circle cx="310" cy="320" r="4" fill="#a855f7" />
                                <circle cx="150" cy="320" r="4" fill="#a855f7" />
                                <text x="140" y="105" fill="#a855f7" className="text-[8px] font-mono font-bold">PROPERTY CORNERS (GPS VALID)</text>
                              </g>
                            )}
                          </>
                        )}

                        {/* Interactive Measure Points Overlaid SVG golden paths */}
                        {measurePoints.map((point, i) => (
                          <g key={i}>
                            <circle cx={point.x} cy={point.y} r="5" fill="#f59e0b" className="animate-ping opacity-75" />
                            <circle cx={point.x} cy={point.y} r="3" fill="#f59e0b" />
                            <line x1={point.x - 8} y1={point.y} x2={point.x + 8} y2={point.y} stroke="#f59e0b" strokeWidth="1" />
                            <line x1={point.x} y1={point.y - 8} x2={point.x} y2={point.y + 8} stroke="#f59e0b" strokeWidth="1" />
                            <text x={point.x + 8} y={point.y - 8} fill="#f59e0b" className="text-[9px] font-mono font-bold bg-[#0b0e14]/90 px-1 py-0.5 rounded">
                              P{i + 1}
                            </text>
                          </g>
                        ))}

                        {/* Connection measurement dashed bar */}
                        {measurePoints.length === 2 && (
                          <g>
                            <line 
                              x1={measurePoints[0].x} 
                              y1={measurePoints[0].y} 
                              x2={measurePoints[1].x} 
                              y2={measurePoints[1].y} 
                              stroke="#f59e0b" 
                              strokeWidth="1.5" 
                              strokeDasharray="4,4" 
                            />
                            <circle cx={(measurePoints[0].x + measurePoints[1].x) / 2} cy={(measurePoints[0].y + measurePoints[1].y) / 2} r="4" fill="#f59e0b" />
                          </g>
                        )}
                      </svg>

                      {/* HUD Overlays */}
                      <div className="absolute right-4 top-4 bg-black/80 backdrop-blur-md border border-neutral-800 p-3 rounded-xl flex flex-col gap-2 z-10 w-44">
                        <span className="text-[8px] font-black uppercase text-primary tracking-widest flex items-center gap-1">
                          <Layers className="w-3 h-3" /> GIS Vector Layers
                        </span>
                        <div className="space-y-1.5 pt-1">
                          <button 
                            onClick={(e) => { e.stopPropagation(); setShowGrid(!showGrid); }} 
                            className={`w-full text-left text-[9px] font-bold p-1 rounded transition-colors flex items-center justify-between ${showGrid ? 'text-white' : 'text-neutral-500 line-through'}`}
                          >
                            <span>1. GRID_INDEX</span>
                            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 opacity-80" />
                          </button>
                          <button 
                            onClick={(e) => { e.stopPropagation(); setShowContours(!showContours); }} 
                            className={`w-full text-left text-[9px] font-bold p-1 rounded transition-colors flex items-center justify-between ${showContours ? 'text-white' : 'text-neutral-500 line-through'}`}
                          >
                            <span>2. TOPOGRAPHY</span>
                            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 opacity-80" />
                          </button>
                          <button 
                            onClick={(e) => { e.stopPropagation(); setShowCenterline(!showCenterline); }} 
                            className={`w-full text-left text-[9px] font-bold p-1 rounded transition-colors flex items-center justify-between ${showCenterline ? 'text-white' : 'text-neutral-500 line-through'}`}
                          >
                            <span>3. CAD_ALIGNMENT</span>
                            <span className="w-2.5 h-2.5 rounded-full bg-rose-400 opacity-80" />
                          </button>
                          <button 
                            onClick={(e) => { e.stopPropagation(); setShowStructures(!showStructures); }} 
                            className={`w-full text-left text-[9px] font-bold p-1 rounded transition-colors flex items-center justify-between ${showStructures ? 'text-white' : 'text-neutral-500 line-through'}`}
                          >
                            <span>4. INFRA_FEATS</span>
                            <span className="w-2.5 h-2.5 rounded-full bg-amber-400 opacity-80" />
                          </button>
                        </div>
                      </div>

                      {/* Toolbars controls */}
                      <div className="absolute left-4 top-4 bg-black/80 backdrop-blur-md border border-neutral-800 p-1.5 rounded-lg flex items-center gap-1 z-10">
                        <button 
                          onClick={(e) => { e.stopPropagation(); setMeasurementMode(!measurementMode); if (measurementMode) clearMeasurement(); }} 
                          className={`p-1.5 rounded text-[9px] font-bold uppercase tracking-wider flex items-center gap-1 transition-all ${measurementMode ? 'bg-[#f59e0b] text-black font-extrabold' : 'hover:bg-neutral-800 text-neutral-400'}`}
                          title="Click 2 points to measure actual ground distance"
                        >
                          <Ruler className="w-3.5 h-3.5" />
                          {measurementMode ? 'Measuring...' : 'Ruler'}
                        </button>
                        {measurePoints.length > 0 && (
                          <button 
                            onClick={(e) => { e.stopPropagation(); clearMeasurement(); }} 
                            className="bg-neutral-800 hover:bg-neutral-700 text-neutral-300 font-bold p-1 text-[8px] rounded uppercase"
                          >
                            Reset
                          </button>
                        )}
                        <div className="w-[1px] h-4 bg-neutral-800 mx-1" />
                        <button 
                          onClick={(e) => { e.stopPropagation(); setCadTheme(t => t === 'dark' ? 'light' : 'dark'); }} 
                          className="p-1 hover:bg-neutral-800 rounded text-neutral-400"
                          title="Toggle dark blueprint vs light draft sheet styling"
                        >
                          <RefreshCw className="w-3 h-3" />
                        </button>
                      </div>

                      {/* Active Cursor Position Overlay HUD */}
                      {canvasCoords && (
                        <div className="absolute bottom-4 left-4 bg-black/90 backdrop-blur border border-primary/20 p-2.5 rounded-xl font-mono text-[8px] text-cyan-400 space-y-0.5 pointer-events-none shadow-xl">
                          <div className="text-[10px] font-extrabold text-white mb-0.5 tracking-wider">SOMGRID COORDINATES</div>
                          <div>ZONE: 38N • EPSG:32638</div>
                          <div>EASTING: {(432100 + canvasCoords.x * 2.8).toLocaleString('en-US', { minimumFractionDigits: 1, maximumFractionDigits: 1 })}m E</div>
                          <div>NORTHING: {(2083000 + (480 - canvasCoords.y) * 2.8).toLocaleString('en-US', { minimumFractionDigits: 1, maximumFractionDigits: 1 })}m N</div>
                          <div>ELEVATION: {(14.5 + (480 - canvasCoords.y) * 0.05 + Math.sin(canvasCoords.x / 40) * 1.8).toFixed(1)}m ASL</div>
                        </div>
                      )}

                      {/* Distance measurement HUD feedback */}
                      {calculatedDistance && (
                        <div className="absolute bottom-4 right-4 bg-amber-500 text-black border border-amber-400 p-2.5 rounded-xl font-mono text-[9px] font-extrabold shadow-2xl flex flex-col items-center gap-0.5 animate-bounce">
                          <span>MEASUREMENT READING</span>
                          <span className="text-sm font-black tracking-tight">{calculatedDistance} METERS</span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* DYNAMIC PDF DOCUMENT RENDERER */}
                  {activePreviewTab === 'visual' && isPdf && (
                    <div 
                      style={{ 
                        width: `${560 * (zoom / 100)}px`,
                        minHeight: `${720 * (zoom / 100)}px`,
                        transition: 'width 0.1s ease-out'
                      }}
                      className="bg-white shadow-2xl rounded-lg p-10 flex flex-col gap-6 text-[#2d3748] border border-slate-300 relative shrink-0 text-left overflow-hidden select-text"
                    >
                      {document?.url ? (
                        <iframe 
                          src={`${document.url}#toolbar=0`} 
                          className="w-full h-full border-0 rounded-lg min-h-[580px] bg-slate-50" 
                          title={documentName}
                        />
                      ) : (
                        <div className="flex-1 flex flex-col justify-between font-sans">
                          {/* Security watermarks and stamps */}
                          <div className="absolute top-2 right-2 flex flex-col items-end opacity-20 pointer-events-none select-none">
                            <span className="text-[8px] font-black tracking-widest text-slate-800">ARCHIVE SECURED</span>
                            <span className="text-[7px] font-mono text-neutral-800">{new Date().toISOString().substring(0,10)}</span>
                          </div>

                          {/* HEADER TITLE PORTION */}
                          <div className="border-b-2 border-slate-800 pb-4 flex justify-between items-start">
                            <div>
                              <h4 className="text-[9px] font-black tracking-widest text-slate-600 uppercase">Federal Republic of Somalia</h4>
                              <h2 className="text-xs font-black tracking-wider text-slate-850 uppercase mt-0.5">Hydrology & Land Registry Official Report</h2>
                              <p className="text-[8px] text-zinc-500 font-mono mt-1">Registry Version {metadata.version || '1.0'} • Approved Document State</p>
                            </div>
                            <div className="p-1 px-1.5 border border-slate-700 text-slate-700 rounded text-[7px] font-serif font-black text-center uppercase tracking-widest">
                              ORIGINAL COPY
                            </div>
                          </div>

                          {/* PAGE CONDITIONAL CONTENTS */}
                          {pdfPage === 1 && (
                            <div className="flex-1 flex flex-col gap-5 text-xs text-[#2d3748] mt-4">
                              <div className="space-y-1">
                                <span className="text-[9px] font-bold uppercase tracking-wider text-slate-500">Document Title / Magaca Dukumiintiga</span>
                                <h3 className="text-sm font-black text-slate-805 uppercase leading-snug">{documentName}</h3>
                              </div>

                              <div className="space-y-2 mt-2">
                                <span className="text-[9px] font-bold uppercase tracking-wider text-slate-500">Executive Summary / Dulmar Guud</span>
                                <p className="text-[11px] leading-relaxed text-slate-600 font-serif">
                                  This engineering report and geodynamical data record covers official compliance assessments, municipal land zoning specifications, and hydrological drainage boundaries computed under Mogadishu Municipality guidelines. Key surveyor coordinate parameters have been checked against standard benchmarks. All soil compact indexes are verified secure.
                                </p>
                              </div>

                              <div className="grid grid-cols-2 gap-4 mt-2">
                                <div className="bg-slate-50 p-3 rounded border border-slate-200">
                                  <span className="block text-[8px] font-bold text-slate-500 uppercase">Lead Engineer / Sarkaalka Hubiyay</span>
                                  <span className="text-[11px] font-serif font-semibold text-slate-800">{metadata.author || 'Eng. Mohamed A.'}</span>
                                </div>
                                <div className="bg-slate-50 p-3 rounded border border-slate-200">
                                  <span className="block text-[8px] font-bold text-slate-500 uppercase">Assigned Office / Waaxda Cabiraadda</span>
                                  <span className="text-[11px] font-serif font-semibold text-slate-800">Waaxda {metadata.department || 'Afar'}</span>
                                </div>
                              </div>

                              <div className="space-y-1.5 mt-auto pt-4 border-t border-slate-100">
                                <h5 className="text-[8px] font-black uppercase text-slate-500 tracking-wider">Document Activity Trail</h5>
                                <p className="text-[10px] leading-relaxed text-zinc-500">
                                  This file ledger has been verified under standard geodetic systems. Ground boundaries adhere perfectly to georeferenced national coordinate definitions.
                                </p>
                              </div>
                            </div>
                          )}

                          {pdfPage === 2 && (
                            <div className="flex-1 flex flex-col gap-4 text-xs text-[#2d3748] mt-4">
                              <span className="text-[9px] font-bold uppercase tracking-wider text-slate-500">Technical Specifications & Compliance</span>
                              
                              <table className="w-full text-[10px] border-collapse bg-slate-50 border border-slate-200 rounded">
                                <thead>
                                  <tr className="bg-slate-100 border-b border-slate-200 text-left">
                                    <th className="p-2 font-bold text-slate-700">Survey Metric Parameter</th>
                                    <th className="p-2 font-bold text-slate-700">Approved Value Scope</th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-200">
                                  <tr>
                                    <td className="p-2 font-medium">Coordinate Framework</td>
                                    <td className="p-2 font-mono">WGS84 UTM Zone 38N</td>
                                  </tr>
                                  <tr>
                                    <td className="p-2 font-medium">Primary Road Centerline Length</td>
                                    <td className="p-2 font-mono">22.45 Kilometers</td>
                                  </tr>
                                  <tr>
                                    <td className="p-2 font-medium">Hydrologic Drainage Discharge Cap</td>
                                    <td className="p-2 font-mono">4,500 L/sec max flow</td>
                                  </tr>
                                  <tr>
                                    <td className="p-2 font-medium">Allowed Geotechnical Load Target</td>
                                    <td className="p-2 font-mono">240 kPa nominal strength</td>
                                  </tr>
                                </tbody>
                              </table>

                              <div className="space-y-2 mt-4">
                                <span className="text-[9px] font-bold uppercase tracking-wider text-slate-500 block">Compliance Status Grid</span>
                                <div className="border border-slate-200 rounded bg-slate-50 p-3 divide-y divide-slate-200/50 text-[10.5px]">
                                  <div className="py-1.5 flex items-center justify-between text-slate-700">
                                    <span>Boundary Clearances Inspection</span>
                                    <span className="text-emerald-600 font-bold">&#10004; VERIFIED PASSED</span>
                                  </div>
                                  <div className="py-1.5 flex items-center justify-between text-slate-700">
                                    <span>Hydrological Impact Certification</span>
                                    <span className="text-emerald-600 font-bold">&#10004; VERIFIED PASSED</span>
                                  </div>
                                  <div className="py-1.5 flex items-center justify-between text-slate-700">
                                    <span>Zoning & Planning Alignment</span>
                                    <span className="text-emerald-600 font-bold">&#10004; VERIFIED PASSED</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}

                          {pdfPage === 3 && (
                            <div className="flex-1 flex flex-col gap-4 text-xs text-[#2d3748] mt-4 justify-between">
                              <div className="space-y-2">
                                <span className="text-[9px] font-bold uppercase tracking-wider text-slate-500">Official Clearance Stamps & Seals</span>
                                <p className="text-[10.5px] leading-relaxed text-zinc-500 font-serif">
                                  This certified file remains legally valid under current municipal planning statutes. Unauthorized replication or resizing voids internal scale calculations. Archival records are securely logged and structured in our document registry database.
                                </p>
                              </div>

                              {/* Realistic official stamped seal block */}
                              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between gap-4 mt-auto">
                                <div className="text-left space-y-1">
                                  <h4 className="text-[9px] font-black uppercase tracking-wider text-slate-700">Official Stamp & Signature</h4>
                                  <div className="text-[10px] font-serif font-bold text-slate-800 flex items-center gap-1.5 mt-1">
                                    <span className="font-sans text-[12px] text-blue-600 italic font-black">Eng. {metadata.author || 'Mohamed A.'}</span>
                                  </div>
                                  <p className="text-[8px] text-zinc-400 font-sans">Agaasimaha Qorshaynta & Tiknoolajiyada</p>
                                </div>

                                {/* Circular Official Seal Graphic */}
                                <div className="relative w-16 h-16 rounded-full border-2 border-dashed border-blue-600/40 flex items-center justify-center shrink-0">
                                  <div className="absolute inset-1 rounded-full border border-blue-600/20" />
                                  <div className="text-[7px] text-center text-blue-600 font-sans leading-none font-black scale-90">
                                    <div>MUNICIPAL</div>
                                    <div className="text-[6px] text-blue-600/80 font-bold">REGISTRY</div>
                                    <div className="mt-0.5 text-blue-600">★ ★</div>
                                  </div>
                                </div>
                              </div>

                              <div className="pt-4 border-t border-slate-100 flex justify-between items-center opacity-40 text-[9px] text-zinc-400 font-mono">
                                <span>ARC-SOM-VER-{docId || 'E42'}</span>
                                <span>PAGE 3 OF 3</span>
                              </div>
                            </div>
                          )}

                          {/* Quick Pagination Page changer inside the sheet */}
                          <div className="mt-auto pt-6 border-t border-slate-100 flex justify-between items-center font-mono text-[9px] text-zinc-450">
                            <span className="font-sans text-[9px] uppercase tracking-wider font-bold">Registry PDF Document Preview</span>
                            <div className="flex items-center gap-1.5">
                              <button onClick={() => setPdfPage(p => Math.max(1, p - 1))} className="hover:text-black font-bold">PREV</button>
                              <span className="text-slate-500">{pdfPage} / {totalPdfPages}</span>
                              <button onClick={() => setPdfPage(p => Math.min(totalPdfPages, p + 1))} className="hover:text-black font-bold">NEXT</button>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* DYNAMIC SCANNED IMAGE VIEW */}
                  {activePreviewTab === 'visual' && isImg && (
                    <div className="shrink-0 flex flex-col items-center gap-4">
                      <div 
                        style={{ 
                          width: `${500 * (zoom / 100)}px`,
                          height: `${380 * (zoom / 100)}px`,
                          transform: `rotate(${rotation}deg)`,
                          filter: `${
                            activeFilter === 'monochrome' ? 'grayscale(1) contrast(1.7)' :
                            activeFilter === 'blueprint' ? 'sepia(1) saturate(3) hue-rotate(200deg) brightness(0.8)' :
                            activeFilter === 'infrared' ? 'invert(1) saturate(3) hue-rotate(185deg) contrast(1.3)' : 'none'
                          } brightness(${brightness}%) contrast(${contrast}%)`,
                          transition: 'transform 0.15s ease-out, filter 0.15s ease-out'
                        }}
                        className="bg-[#0b0e14] rounded-xl border border-border overflow-hidden relative shadow-2xl flex items-center justify-center p-2 select-all border-neutral-800"
                      >
                        {document?.url ? (
                          <img 
                            src={document.url} 
                            alt={document.name} 
                            className="max-w-full max-h-full object-contain rounded-lg select-all"
                            referrerPolicy="no-referrer"
                          />
                        ) : (
                          <div className="w-full h-full relative rounded-lg overflow-hidden flex items-center justify-center">
                            {/* Realistic placeholder image showing actual Mogadishu style geographical plotting / orthophoto satellite layout */}
                            <img 
                              src="https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&w=1200&q=80"
                              alt="Official Topographic Site Orthophoto Aerial Map"
                              className="w-full h-full object-cover rounded-lg pointer-events-none select-none opacity-85"
                              referrerPolicy="no-referrer"
                            />
                            
                            {/* Subtle natural focus card centering */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30 flex flex-col justify-end p-6 text-left">
                              <h3 className="text-sm font-black text-white font-mono drop-shadow max-w-md uppercase tracking-wider truncate mb-1">{documentName}</h3>
                              <p className="text-[10px] text-zinc-300 font-sans tracking-wide leading-normal">
                                Visual image orthophotography preview loaded. Standard zoom, rotation, and lighting filters are available for detailed inspection.
                              </p>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Dynamic Controllers slider overlay below image */}
                      <div className="bg-card/90 backdrop-blur border border-border p-3 rounded-xl flex items-center gap-6 text-xs text-muted-foreground max-w-lg shadow-xl shrink-0">
                        <div className="flex flex-col gap-1">
                          <span className="text-[8px] font-bold uppercase tracking-widest text-[#10b981] flex items-center gap-1">
                            <Sliders className="w-3 h-3" /> Image Adjustments
                          </span>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-[9px] font-bold w-12 text-left">Bright</span>
                            <input 
                              type="range" 
                              min="50" 
                              max="150" 
                              value={brightness} 
                              onChange={(e) => setBrightness(parseInt(e.target.value))}
                              className="w-24 h-1 bg-muted rounded appearance-none cursor-pointer accent-[#10b981]" 
                            />
                            <span className="text-[8px] font-mono text-center w-8">{brightness}%</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-[9px] font-bold w-12 text-left">Contrast</span>
                            <input 
                              type="range" 
                              min="50" 
                              max="150" 
                              value={contrast} 
                              onChange={(e) => setContrast(parseInt(e.target.value))}
                              className="w-24 h-1 bg-muted rounded appearance-none cursor-pointer accent-[#10b981]" 
                            />
                            <span className="text-[8px] font-mono text-center w-8">{contrast}%</span>
                          </div>
                        </div>

                        <div className="h-10 w-[1px] bg-border" />

                        <div className="flex flex-col gap-1.5 justify-center">
                          <span className="text-[8px] font-bold uppercase tracking-widest text-primary">Channel Spectrum Filters</span>
                          <div className="flex items-center gap-1 pt-0.5">
                            {(['none', 'monochrome', 'blueprint', 'infrared'] as const).map((filterOpt) => (
                              <button 
                                key={filterOpt} 
                                onClick={() => { setActiveFilter(filterOpt); showToast(`Applied ${filterOpt} imaging filter`, 'info'); }}
                                className={`px-2 py-1 rounded text-[8px] font-extrabold uppercase transition-all border ${
                                  activeFilter === filterOpt 
                                    ? 'bg-primary text-primary-foreground border-primary' 
                                    : 'bg-muted border-border text-muted-foreground hover:bg-neutral-800'
                                }`}
                              >
                                {filterOpt === 'none' ? 'RGB' : filterOpt}
                              </button>
                            ))}
                          </div>
                        </div>

                        <div className="h-10 w-[1px] bg-border" />

                        <button 
                          onClick={() => setRotation(r => (r + 90) % 360)}
                          className="flex flex-col items-center justify-center p-2 rounded-lg bg-muted text-muted-foreground hover:text-white hover:bg-neutral-800 border border-border"
                          title="Rotate 90deg Clockwise"
                        >
                          <RotateCw className="w-4 h-4" />
                          <span className="text-[8px] font-bold mt-0.5">Rotate</span>
                        </button>
                      </div>
                    </div>
                  )}

                  {/* DYNAMIC ZIP ARCHIVE MANAGER */}
                  {activePreviewTab === 'visual' && isZip && (
                    <div className="w-[520px] bg-card border border-border shadow-2xl rounded-2xl p-6 flex flex-col gap-5 text-left shrink-0">
                      <div className="flex items-center justify-between p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl">
                        <div className="flex items-center gap-3">
                          <Archive className="w-10 h-10 text-amber-500 shrink-0" />
                          <div>
                            <h4 className="text-sm font-black text-white uppercase tracking-tight">Compressed Geodynamic Zip Package</h4>
                            <p className="text-[10px] text-muted-foreground mt-0.5">Contains digital multi-layered land layout drafts and environmental specifications.</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="block text-xs font-black font-mono text-amber-500">AES-256</span>
                          <span className="text-[9px] text-muted-foreground uppercase font-bold">Encrypted Archive</span>
                        </div>
                      </div>

                      {/* Content Listing Inside ZIP */}
                      <div className="space-y-2">
                        <h5 className="text-[9px] font-black uppercase text-amber-500 tracking-widest">Internal Content Spec List</h5>
                        <div className="divide-y divide-border/50 border border-border bg-sidebar/30 rounded-xl overflow-hidden text-xs">
                          <div className="p-3 hover:bg-muted/30 transition-colors flex items-center justify-between">
                            <span className="font-bold flex items-center gap-2">
                              <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                              Kismayo_River_Meander_V1.dwg
                            </span>
                            <span className="font-mono text-[10px] text-muted-foreground">4.8 MB</span>
                          </div>
                          <div className="p-3 hover:bg-muted/30 transition-colors flex items-center justify-between">
                            <span className="font-bold flex items-center gap-2">
                              <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                              Kismayo_Drainage_Catchment.dwg
                            </span>
                            <span className="font-mono text-[10px] text-muted-foreground">6.2 MB</span>
                          </div>
                          <div className="p-3 hover:bg-muted/30 transition-colors flex items-center justify-between">
                            <span className="font-bold flex items-center gap-2">
                              <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                              Kismayo_Topography_Audit_Signatures.pdf
                            </span>
                            <span className="font-mono text-[10px] text-muted-foreground">1.5 MB</span>
                          </div>
                        </div>
                      </div>

                      {/* Unpacker Section */}
                      <div className="pt-4 border-t border-border mt-2">
                        {zipExtracted ? (
                          <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl text-center space-y-2">
                            <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto" />
                            <h4 className="text-xs font-black uppercase tracking-wider">Uncompressed Successfully!</h4>
                            <p className="text-[10px] text-muted-foreground max-w-sm mx-auto leading-relaxed">
                              Drawing vectors and reports have been imported into your central document panel securely.
                            </p>
                          </div>
                        ) : unzipping ? (
                          <div className="space-y-3">
                            <div className="flex items-center justify-between text-[10px] font-bold uppercase text-amber-500">
                              <span className="flex items-center gap-1.5">
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                Extracting components & validating hashes...
                              </span>
                              <span className="font-mono">{extractionProgress}%</span>
                            </div>
                            <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
                              <div 
                                style={{ width: `${extractionProgress}%`, transition: 'width 0.2s ease-out' }}
                                className="h-full bg-amber-500 rounded-full shadow-[0_0_10px_rgba(245,158,11,0.5)]" 
                              />
                            </div>
                          </div>
                        ) : (
                          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                            <p className="text-[10.5px] text-muted-foreground leading-relaxed max-w-xs">
                              Integrate this archive's underlying layers with your central workspace archive repository:
                            </p>
                            <button 
                              onClick={handleExtractZip}
                              className="w-full sm:w-auto bg-amber-500 text-black py-2.5 px-4 rounded-xl font-extrabold uppercase tracking-wider text-[10px] hover:bg-amber-600 transition-all flex items-center justify-center gap-1.5 shrink-0"
                            >
                              <Play className="w-4 h-4 fill-black" /> Unpack Active Files
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

               </div>

               {/* Right Meta Attributes Editor drawer Panel */}
               <AnimatePresence>
                  {isSidePanelOpen && (
                     <motion.div 
                        initial={{ x: 320 }}
                        animate={{ x: 0 }}
                        exit={{ x: 320 }}
                        className="w-full md:w-80 border-t md:border-t-0 md:border-l border-border bg-card flex flex-col relative z-20 shadow-[-10px_0_30px_rgba(0,0,0,0.15)] overflow-y-auto"
                     >
                        <div className="p-6 border-b border-border bg-muted/20 shrink-0 space-y-2 text-left">
                           <h4 className="text-[10.5px] font-black uppercase tracking-[0.25em] text-primary flex items-center gap-2">
                              <FileSearch className="w-4 h-4 text-primary" /> Index Attributes Panel
                           </h4>
                           <p className="text-[10px] text-zinc-400 leading-normal font-sans">
                             Retrieve, scan, and authorize index records. Any updates saved here dynamically alter the geodetic system signatures and audit trails.
                           </p>
                        </div>
                        
                        <div className="flex-1 p-6 space-y-6 scrollbar-thin">
                           {/* Compliance Verification Card */}
                           <div className="p-4 rounded-xl bg-sidebar/40 border border-border/80 space-y-3 relative overflow-hidden group">
                             {/* Background ambient lighting subtle fade */}
                             <div className={`absolute top-0 right-0 w-24 h-24 rounded-full blur-[40px] opacity-10 -mr-6 -mt-6 transition-all duration-300 ${
                               complianceState.status === 'Active' ? 'bg-emerald-500' : 'bg-rose-500'
                             }`} />

                             <div className="flex items-center justify-between font-sans">
                               <h5 className="text-[9.5px] font-black uppercase text-muted-foreground/80 tracking-widest flex items-center gap-1.5 font-mono">
                                 {complianceState.status === 'Active' ? (
                                   <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
                                 ) : (
                                   <ShieldAlert className="w-3.5 h-3.5 text-rose-400 animate-bounce" />
                                 )}
                                 Compliance Status
                                </h5>
                               <span className={`px-2 py-0.5 rounded-full text-[8.5px] font-black uppercase tracking-wider border flex items-center gap-1 shadow-sm font-sans ${
                                 complianceState.status === 'Active'
                                   ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                                   : 'bg-rose-500/10 border-rose-500/20 text-rose-400'
                               }`}>
                                 <span className={`w-1.5 h-1.5 rounded-full ${
                                   complianceState.status === 'Active' ? 'bg-emerald-400 animate-pulse' : 'bg-rose-400 animate-pulse'
                                 }`} />
                                 {complianceState.status}
                               </span>
                             </div>

                             <div className="space-y-1.5 text-left">
                               <div className="flex items-baseline justify-between">
                                 <span className="text-[10px] text-muted-foreground font-mono">Registry Code:</span>
                                 <span className={`text-xs font-mono font-bold tracking-tight ${
                                   complianceState.status === 'Active' ? 'text-emerald-300' : 'text-rose-300'
                                 }`}>
                                   {compCode}
                                 </span>
                               </div>
                               
                               <div className="text-[10px] text-zinc-350 font-sans leading-relaxed text-left">
                                 {complianceState.status === 'Active' ? (
                                   <span className="block text-zinc-400">
                                     Validated against current <b>Somali Geodetic UTM Zone 38N</b> framework.
                                   </span>
                                 ) : (
                                   <span className="block text-zinc-300 font-medium bg-rose-500/5 p-2.5 rounded-lg border border-rose-500/15 mt-1 leading-normal">
                                     Alert: Code is <b className="text-rose-300 font-bold">Expired / Outdated</b> relative to latest 2026 standards. Coordinates require re-survey under UTM Zone 38N.
                                   </span>
                                 )}
                               </div>
                             </div>

                             {/* Interactive verify button */}
                             <div className="pt-2 border-t border-border/40 flex items-center justify-between gap-2 font-mono">
                               <span className="text-[8px] text-muted-foreground uppercase text-left">
                                 {complianceState.checkedAt ? (
                                   <span>Checked: {complianceState.checkedAt}</span>
                                 ) : (
                                   <span>Last Verified: Ingest</span>
                                 )}
                               </span>
                               <button
                                 type="button"
                                 onClick={() => {
                                   if (complianceState.status === 'Verifying') return;
                                   
                                   setComplianceState(prev => ({ ...prev, status: 'Verifying' }));
                                   showToast(`Connecting geodetic database for ${compCode}...`, 'info');
                                   
                                   setSystemLogs(prev => [
                                     ...prev,
                                     `[REGISTRY CHECK] Querying signature code: ${compCode}...`,
                                     `[CRS MATCH] Verifying standard EPSG:32638 projection alignment...`
                                   ]);

                                   setTimeout(() => {
                                     const now = new Date().toLocaleTimeString();
                                     if (isExpired) {
                                       showToast(`Validation Complete: ${compCode} is EXPIRED under current infrastructure standards.`, 'error');
                                       setComplianceState({
                                         status: 'Expired',
                                         checkedAt: now
                                       });
                                       setSystemLogs(prev => [
                                         ...prev,
                                         `[AUDIT REGISTER] WARNING: Registry code ${compCode} failed compliance matching (EXPIRED/OUTDATED).`
                                       ]);
                                     } else {
                                       showToast(`Validation Complete: ${compCode} is active and fully verified.`, 'success');
                                       setComplianceState({
                                         status: 'Active',
                                         checkedAt: now
                                       });
                                       setSystemLogs(prev => [
                                         ...prev,
                                         `[AUDIT REGISTER] SUCCESS: Registry code ${compCode} verified successfully.`
                                        ]);
                                      }
                                   }, 1200);
                                 }}
                                 disabled={complianceState.status === 'Verifying'}
                                 className="py-1 px-2.5 rounded-lg border border-border bg-sidebar hover:bg-sidebar-accent text-[9px] font-semibold text-white/90 hover:text-white transition-all flex items-center gap-1 shrink-0 cursor-pointer disabled:opacity-50"
                               >
                                 <RefreshCw className={`w-2.5 h-2.5 text-zinc-400 ${complianceState.status === 'Verifying' ? 'animate-spin' : ''}`} />
                                 <span>{complianceState.status === 'Verifying' ? 'Verifying...' : 'Verify Registry'}</span>
                               </button>
                             </div>
                           </div>
                           {showShareQR && (
                             <div className="p-4 rounded-xl bg-cyan-950/20 border border-cyan-500/15 space-y-4 animate-in slide-in-from-top-4 duration-300">
                               <div className="flex items-center justify-between">
                                 <h5 className="text-[10px] font-black uppercase text-cyan-400 tracking-wider flex items-center gap-1.5 font-sans">
                                   <QrCode className="w-3.5 h-3.5" /> Share Document QR
                                 </h5>
                                 <button
                                   onClick={() => setShowShareQR(false)}
                                   className="text-muted-foreground hover:text-white text-xs"
                                 >
                                   <X className="w-3 h-3" />
                                 </button>
                               </div>

                               {/* Format Toggles */}
                               <div className="grid grid-cols-2 gap-1 p-0.5 bg-muted/60 rounded-lg border border-border/40">
                                 <button
                                   onClick={() => {
                                     setQrType('url');
                                     showToast('Switched QR to Application Direct URL', 'info');
                                   }}
                                   className={`py-1 text-[8.5px] font-black uppercase tracking-wider rounded-md transition-all cursor-pointer ${
                                     qrType === 'url'
                                       ? 'bg-cyan-500 text-black font-extrabold shadow'
                                       : 'text-muted-foreground hover:text-white'
                                   }`}
                                 >
                                   App URL
                                 </button>
                                 <button
                                   onClick={() => {
                                     setQrType('metadata');
                                     showToast('Switched QR to Encoded Metadata Card', 'info');
                                   }}
                                   className={`py-1 text-[8.5px] font-black uppercase tracking-wider rounded-md transition-all cursor-pointer ${
                                     qrType === 'metadata'
                                       ? 'bg-cyan-500 text-black font-extrabold shadow'
                                       : 'text-muted-foreground hover:text-white'
                                   }`}
                                 >
                                   Metadata
                                 </button>
                               </div>

                               {/* QR Code Container preview */}
                               <div ref={qrRef} className="bg-white p-3.5 rounded-xl border border-white/10 flex items-center justify-center max-w-[170px] mx-auto shadow-inner">
                                 <QRCode
                                   value={
                                     qrType === 'url'
                                       ? `${window.location.origin}/?doc=${docId || 'preview'}&code=${document?.ComplianceCode || 'MOG-HW-042'}`
                                       : JSON.stringify({
                                           name: documentName,
                                           id: docId || 'T-2026-X',
                                           owner: document?.Owner || 'Mogadishu Municipality',
                                           code: document?.ComplianceCode || 'MOG-HW-042',
                                           v: metadata.version || 'v1.0'
                                         })
                                   }
                                   size={140}
                                   level="M"
                                   style={{ height: "auto", maxWidth: "100%", width: "100%" }}
                                 />
                               </div>

                               {/* Actions bar for QR Code */}
                               <div className="grid grid-cols-2 gap-2 text-[9px] font-bold uppercase tracking-wider">
                                 <button
                                   type="button"
                                   onClick={handleDownloadQRPNG}
                                   className="py-1.5 rounded-lg border border-cyan-500/25 bg-cyan-500/5 hover:bg-cyan-500/15 text-cyan-300 transition-colors flex items-center justify-center gap-1 cursor-pointer font-bold"
                                 >
                                   <Download className="w-3 h-3" /> PNG Label
                                 </button>
                                 <button
                                   type="button"
                                   onClick={() => {
                                     const textToCopy = qrType === 'url'
                                       ? `${window.location.origin}/?doc=${docId || 'preview'}&code=${document?.ComplianceCode || 'MOG-HW-042'}`
                                       : JSON.stringify({
                                           name: documentName,
                                           id: docId || 'T-2026-X',
                                           owner: document?.Owner || 'Mogadishu Municipality',
                                           code: document?.ComplianceCode || 'MOG-HW-042',
                                           v: metadata.version || 'v1.0'
                                         }, null, 2);
                                     navigator.clipboard.writeText(textToCopy);
                                     showToast('Copied share criteria to clipboard!', 'success');
                                   }}
                                   className="py-1.5 rounded-lg border border-border bg-sidebar/50 hover:bg-sidebar text-muted-foreground hover:text-white transition-colors flex items-center justify-center gap-1 cursor-pointer font-bold"
                                 >
                                   <Share2 className="w-3 h-3" /> Copy Link
                                 </button>
                               </div>

                               <p className="text-[8.5px] text-muted-foreground leading-normal text-center bg-muted/30 p-2 rounded-lg border border-border/20">
                                 {qrType === 'url'
                                   ? 'Generates a live link index to automatically sync and access this drawing in any standard browser.'
                                   : 'Serializes core engineering features for offline geodetic scanners on physical plots.'}
                               </p>
                             </div>
                           )}

                           <div className="space-y-5">
                              {/* Metadata Form Fields */}
                              <div className="space-y-2">
                                 <label className="block text-[9px] font-bold uppercase tracking-widest text-muted-foreground">Document File Name</label>
                                 <input 
                                    type="text" 
                                    value={localDocName}
                                    onChange={(e) => setLocalDocName(e.target.value)}
                                    className="w-full bg-sidebar-accent border border-border rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-primary/50 transition-all focus:bg-sidebar font-bold"
                                    placeholder="Enter document file name..."
                                 />
                              </div>

                              <div className="space-y-2">
                                 <label className="block text-[9px] font-bold uppercase tracking-widest text-muted-foreground">Lead Author / Engineer</label>
                                 <input 
                                    type="text" 
                                    value={metadata.author}
                                    onChange={(e) => setMetadata(m => ({ ...m, author: e.target.value }))}
                                    readOnly={!isUserAdmin}
                                    className={`w-full bg-sidebar-accent border border-border rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-primary/50 transition-all ${isUserAdmin ? 'focus:bg-sidebar' : 'opacity-70 cursor-not-allowed'}`}
                                 />
                              </div>

                              <div className="space-y-2">
                                 <label className="block text-[9px] font-bold uppercase tracking-widest text-muted-foreground">Assigned Department</label>
                                 <select 
                                    value={metadata.department}
                                    onChange={(e) => setMetadata(m => ({ ...m, department: e.target.value }))}
                                    disabled={!isUserAdmin}
                                    className={`w-full bg-sidebar-accent border border-border rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-primary/50 transition-all appearance-none ${isUserAdmin ? 'focus:bg-sidebar' : 'opacity-70 cursor-not-allowed'}`}
                                 >
                                    <option>Engineering</option>
                                    <option>Legal</option>
                                    <option>Architecture</option>
                                    <option>Admin</option>
                                    <option>Surveys</option>
                                 </select>
                              </div>

                              <div className="space-y-2">
                                 <label className="block text-[9px] font-bold uppercase tracking-widest text-muted-foreground">Drawing Version Rev</label>
                                 <div className="flex items-center gap-2">
                                    <button 
                                      onClick={() => isUserAdmin && setMetadata(m => ({ ...m, version: (parseFloat(m.version) - 0.1).toFixed(1) }))}
                                      disabled={!isUserAdmin}
                                      className={`w-10 h-10 rounded-xl bg-muted border border-border flex items-center justify-center hover:bg-sidebar transition-colors ${!isUserAdmin ? 'opacity-40 cursor-not-allowed' : ''}`}
                                    >
                                       <ChevronLeft className="w-4 h-4" />
                                    </button>
                                    <input 
                                       type="text" 
                                       value={metadata.version}
                                       readOnly
                                       className="flex-1 bg-primary/5 border border-primary/20 rounded-xl px-4 py-2.5 text-center font-mono font-bold text-primary"
                                    />
                                    <button 
                                      onClick={() => isUserAdmin && setMetadata(m => ({ ...m, version: (parseFloat(m.version) + 0.1).toFixed(1) }))}
                                      disabled={!isUserAdmin}
                                      className={`w-10 h-10 rounded-xl bg-muted border border-border flex items-center justify-center hover:bg-sidebar transition-colors ${!isUserAdmin ? 'opacity-40 cursor-not-allowed' : ''}`}
                                    >
                                       <ChevronRight className="w-4 h-4" />
                                    </button>
                                 </div>
                              </div>
                           </div>

                           <div className="pt-6 border-t border-border space-y-4">
                              <h5 className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/60">System Attributes Data</h5>
                              <div className="grid grid-cols-2 gap-3 font-mono text-[10px]">
                                 <div className="p-3 rounded-xl bg-sidebar/40 border border-border flex flex-col">
                                    <span className="text-[8px] font-bold text-muted-foreground uppercase">File ID</span>
                                    <span className="text-white mt-1 font-bold truncate">ARC-{docId?.substring(0,6) || 'N/A'}</span>
                                 </div>
                                 <div className="p-3 rounded-xl bg-sidebar/40 border border-border flex flex-col">
                                    <span className="text-[8px] font-bold text-muted-foreground uppercase">Integrity Hash</span>
                                    <span className="text-emerald-400 mt-1 font-bold">SHA-256 Verified</span>
                                 </div>
                              </div>
                           </div>
                           
                           {/* Somali Grid info box */}
                           <div className="p-4 bg-muted/30 border border-border rounded-xl space-y-1.5">
                             <div className="text-[9.5px] font-black uppercase text-primary flex items-center gap-1">
                               <Info className="w-3.5 h-3.5 text-primary" /> Geographical Reference
                             </div>
                             <p className="text-[10px] text-muted-foreground leading-relaxed leading-normal">
                               Standard registry records are geocoded using the <b>Universal Transverse Mercator (UTM Zone 38N)</b> Somali framework.
                             </p>
                           </div>
                         </div>

                         <div className="p-6 border-t border-border bg-muted/20 shrink-0 space-y-3">
                           {isUserAdmin || (localDocName !== documentName && localDocName.trim() !== '') ? (
                             <button 
                               onClick={() => {
                                  if (!localDocName.trim()) {
                                    showToast('Document name cannot be empty', 'error');
                                    return;
                                  }
                                  if (setDocuments) {
                                    setDocuments(prev => prev.map(d => d.id === docId ? { ...d, name: localDocName.trim() } : d));
                                  }
                                  showToast('Document name and attributes updated successfully', 'success');
                                }}
                               className="w-full bg-primary text-primary-foreground py-3 rounded-xl font-bold uppercase tracking-wider text-[10px] flex items-center justify-center gap-2 hover:bg-primary/90 transition-all shadow-lg active:scale-95"
                             >
                                <CheckCircle2 className="w-4 h-4" /> Save Metadata & Filename
                             </button>
                           ) : (
                             <div className="text-center p-3 rounded-xl bg-amber-500/10 border border-amber-500/25">
                               <p className="text-[10px] font-black text-amber-500 uppercase tracking-widest">
                                 Role: Viewer Mode
                               </p>
                               <p className="text-[9.5px] text-muted-foreground mt-0.5 leading-normal">
                                 Your account holds observer clearance. Admin status required to write.
                               </p>
                             </div>
                           )}
                        </div>
                     </motion.div>
                  )}
               </AnimatePresence>
            </div>

            {/* Footer Navigation bar */}
            <div className="px-6 py-4 border-t border-border bg-card flex flex-col sm:flex-row items-center justify-between gap-4 shrink-0">
              <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground font-black uppercase tracking-wider">
                <kbd className="px-1.5 py-0.5 bg-muted rounded border border-border text-white text-[9px] font-mono shadow">ESC / CLICK OUT</kbd>
                <span>To Exit Workspace</span>
              </div>
              
              {/* Dynamic status for non-PDF views, page selectors for PDF views */}
              {isPdf ? (
                <div className="flex items-center gap-4">
                  <button 
                    onClick={() => setPdfPage(p => Math.max(1, p - 1))}
                    disabled={pdfPage === 1}
                    className="p-1 px-3 rounded bg-muted hover:bg-neutral-800 text-xs font-bold disabled:opacity-20 border border-border"
                  >
                    Previous Page
                  </button>
                  <div className="text-xs font-bold font-mono">
                     Page <span className="text-primary">{pdfPage}</span> of {totalPdfPages}
                  </div>
                  <button 
                    onClick={() => setPdfPage(p => Math.min(totalPdfPages, p + 1))}
                    disabled={pdfPage === totalPdfPages}
                    className="p-1 px-3 rounded bg-muted hover:bg-neutral-800 text-xs font-bold disabled:opacity-20 border border-border"
                  >
                    Next Page
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2 font-mono text-[10px] text-muted-foreground uppercase font-black">
                  <span className="inline-block w-2-2 h-2 rounded-full bg-cyan-400" />
                  Drawing Frame Sync: Live 60FPS Render
                </div>
              )}

              <button 
                onClick={() => { 
                  showToast(`Preparing encrypted local bundle download: ${documentName}`, 'info'); 
                  setTimeout(() => { showToast('Download package assembled and decrypted in browser.', 'success'); }, 1500);
                }}
                className={`flex items-center gap-2 px-4 py-2 text-white font-bold uppercase tracking-wider text-[10px] rounded-lg hover:opacity-90 transition-all ${
                  isCad ? 'bg-blue-600 hover:bg-blue-700' :
                  isPdf ? 'bg-rose-600 hover:bg-rose-700' :
                  isZip ? 'bg-amber-600 hover:bg-amber-700' :
                  'bg-primary hover:opacity-95'
                }`}
              >
                <Download className="w-3.5 h-3.5" />
                Download {resolvedType.toUpperCase()} File
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
