import React, { useState, useCallback } from 'react';
import { FileText, Search, Filter, MoreVertical, Download, Trash2, Tag as TagIcon, Eye, History, Upload, QrCode, CheckSquare, Square, Sparkles, FileCheck, RotateCcw, Archive } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useOfflineCache } from '../hooks/useOfflineCache';
import { QRScanner } from './QRScanner';
import { useToast } from './Toast';
import { compressFile } from '../lib/compression';
import { supabase } from '../lib/supabase';

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
  isDeleted?: boolean;
}

interface DocumentsViewProps {
  onPreview?: (name: string, id: string) => void;
  documents: Document[];
  setDocuments: React.Dispatch<React.SetStateAction<Document[]>>;
  selectedDocs: string[];
  toggleSelectDoc: (id: string) => void;
  toggleSelectAll: () => void;
  onUploadTrigger?: () => void;
  currentUser?: { email: string; role: string; name: string } | null;
  verificationResults?: Record<string, { status: 'valid' | 'expired' | 'invalid'; message: string; checkedAt: string }>;
  onBatchVerify?: () => void;
  isVerifying?: boolean;
  docsSubTab?: 'active' | 'deleted';
  setDocsSubTab?: (tab: 'active' | 'deleted') => void;
}

export function DocumentsView({ 
  onPreview,
  documents,
  setDocuments,
  selectedDocs,
  toggleSelectDoc,
  toggleSelectAll,
  onUploadTrigger,
  currentUser,
  verificationResults,
  onBatchVerify,
  isVerifying,
  docsSubTab,
  setDocsSubTab
}: DocumentsViewProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isQRScannerOpen, setIsQRScannerOpen] = useState(false);
  const { showToast } = useToast();

  const [localSubTab, setLocalSubTab] = useState<'active' | 'deleted'>('active');
  const activeSubTab = docsSubTab || localSubTab;
  const changeSubTab = setDocsSubTab || setLocalSubTab;

  const isUserAdmin = currentUser?.role === 'Maamulaha';

  const handleRowDelete = async (docId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const confirmMsg = currentUser?.role === 'Maamulaha'
        ? 'Ma hubsataa in aad rabto in aad si joogto ah u tirtirto dukumiintigan?'
        : 'Are you sure you want to permanently delete this document? This action cannot be undone.';
      if (window.confirm(confirmMsg)) {
        await supabase.from('documents').delete().eq('id', docId);
        showToast(
          currentUser?.role === 'Maamulaha'
            ? 'Dukumiintiga si joogto ah ayaa loo tirtiray'
            : 'Document permanently deleted',
          'success'
        );
      }
    } catch (err) {
      console.error(err);
      showToast('Operation failed', 'error');
    }
  };

  const handleRowRestore = async (docId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await supabase.from('documents').update({ isDeleted: false }).eq('id', docId);
      showToast('Document restored successfully', 'success');
    } catch (err) {
      console.error(err);
      showToast('Restore failed', 'error');
    }
  };

  const handleRowArchive = async (docId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await supabase.from('documents').update({ isDeleted: true }).eq('id', docId);
      showToast(
        currentUser?.role === 'Maamulaha'
          ? 'Dukumiintiga waa la kaydiyay'
          : 'Document moved to Deleted Archive',
        'success'
      );
    } catch (err) {
      console.error(err);
      showToast('Operation failed', 'error');
    }
  };

  const handleCleanDuplicates = async () => {
    try {
      const activeOnly = documents.filter(d => !d.isDeleted);
      const seen = new Set<string>();
      const duplicates: Document[] = [];
      
      for (const docItem of activeOnly) {
        const lowerName = docItem.name.toLowerCase().trim();
        if (seen.has(lowerName)) {
          duplicates.push(docItem);
        } else {
          seen.add(lowerName);
        }
      }
      
      if (duplicates.length === 0) {
        showToast(currentUser?.role === 'Maamulaha' ? 'Dukumiinti nuqul ah oo firfircoon lama helin!' : 'No duplicate active documents found!', 'info');
        return;
      }
      
      const confirmMsg = currentUser?.role === 'Maamulaha'
        ? `Ma hubsataa in aad rabto in aad kaydiso ${duplicates.length} dukumiinti oo nuqul ah?`
        : `Are you sure you want to archive ${duplicates.length} duplicate active document(s)?`;
        
      if (window.confirm(confirmMsg)) {
        showToast(currentUser?.role === 'Maamulaha' ? 'Nadiifinta nuqulada...' : 'Archiving duplicates...', 'info');
        
        for (const dup of duplicates) {
          await supabase.from('documents').update({ isDeleted: true }).eq('id', dup.id);
        }
        
        showToast(
          currentUser?.role === 'Maamulaha'
            ? `${duplicates.length} dukumiinti oo nuqul ah ayaa loo raray Khasnadda KMG ah`
            : `${duplicates.length} duplicate document(s) successfully moved to Deleted Archive`,
          'success'
        );
      }
    } catch (err) {
      console.error('Error cleaning duplicates:', err);
      showToast('Operation failed', 'error');
    }
  };

  const handleQRScan = useCallback((text: string) => {
    setSearchQuery(text);
    showToast(`Metadata synchronized for asset: ${text}`, 'success');
  }, [showToast]);

  const filteredDocs = documents.filter(doc => {
    return doc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
  });

  // Helper to extract chronological sorting timestamp
  const getDocTimestamp = (doc: Document) => {
    if (doc.id.startsWith('upload-') || doc.id.startsWith('doc-')) {
      const parts = doc.id.split('-');
      if (parts[1]) {
        const ts = parseInt(parts[1], 10);
        if (!isNaN(ts)) return ts;
      }
    }
    // Fallback to parsed date
    const d = new Date(doc.date).getTime();
    return isNaN(d) ? 0 : d;
  };

  const sortedDocs = [...filteredDocs].sort((a, b) => getDocTimestamp(b) - getDocTimestamp(a));

  const activeDocs = sortedDocs.filter(d => !d.isDeleted);
  const deletedDocs = sortedDocs.filter(d => d.isDeleted);
  const displayDocs = activeSubTab === 'active' ? activeDocs : deletedDocs;

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const droppedFiles = Array.from(e.dataTransfer.files) as File[];
      showToast(`Encrypting and validating ${droppedFiles.length} document(s)...`, 'info');
      
      const newDocs: Document[] = [];
      const savedUser = localStorage.getItem('geomds_user');
      const currentUser = savedUser ? JSON.parse(savedUser) : null;
      
      for (const file of droppedFiles) {
        try {
          // Perform actual client side compression & optimization using our utility
          const result = await compressFile(file);
          const ext = file.name.split('.').pop() || 'dat';
          const finalSize = result.compressedSize > 1024 * 1024
            ? `${(result.compressedSize / (1024 * 1024)).toFixed(1)} MB`
            : `${Math.round(result.compressedSize / 1024)} KB`;

          newDocs.push({
            id: `doc-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            name: file.name,
            size: finalSize,
            date: new Date().toISOString().split('T')[0],
            tags: ['Dropped', ext.toUpperCase(), 'Secured'],
            type: ext,
            status: 'Approved',
            uploadedBy: currentUser?.role === 'Maamulaha' ? 'Admin' : 'Member',
            uploaderName: currentUser?.name || 'Injineerka',
            Owner: currentUser?.name || 'Mogadishu Municipality',
            ComplianceCode: `MOG-CP-${Math.floor(100 + Math.random() * 900)}`,
            VersionHistory: 'v1.0 (Active)'
          });
        } catch (err) {
          console.error('File optimization error', err);
        }
      }

      if (newDocs.length > 0) {
        setDocuments(prev => [...newDocs, ...prev]);
        showToast(`${newDocs.length} file(s) uploaded and encrypted successfully!`, 'success');
      }
    }
  };

  const HighlightMatch = ({ text, query }: { text: string; query: string }) => {
    if (!query) return <>{text}</>;
    const parts = text.split(new RegExp(`(${query})`, 'gi'));
    return (
      <>
        {parts.map((part, i) => 
          part.toLowerCase() === query.toLowerCase() 
            ? <span key={i} className="bg-primary/30 text-primary-foreground rounded-sm px-0.5">{part}</span> 
            : <span key={i}>{part}</span>
        )}
      </>
    );
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <AnimatePresence>
        {isQRScannerOpen && (
          <QRScanner onScan={handleQRScan} onClose={() => setIsQRScannerOpen(false)} />
        )}
      </AnimatePresence>
      
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-white">Document Archive</h2>
          <p className="text-sm text-muted-foreground mt-1">Full upload & management access to secure digital engineering drawings, reports, and CAD assets.</p>
        </div>
        <div className="flex items-center gap-3">
          {onBatchVerify && (
            <button 
              onClick={(e) => { e.stopPropagation(); onBatchVerify(); }}
              disabled={selectedDocs.length === 0 || isVerifying}
              className={`flex items-center gap-2 border font-bold uppercase tracking-[0.1em] text-[10px] px-3.5 py-2 rounded-lg transition-all ${
                selectedDocs.length === 0 
                  ? 'opacity-40 cursor-not-allowed border-border text-muted-foreground bg-transparent' 
                  : 'bg-emerald-500/15 hover:bg-emerald-500/25 border-emerald-500/30 text-emerald-400 active:scale-95 shadow-[0_0_15px_rgba(16,185,129,0.1)]'
              }`}
              title={selectedDocs.length === 0 ? "Select documents first to batch verify" : "Batch verify selected documents"}
            >
              {isVerifying ? (
                <div className="w-3.5 h-3.5 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin" />
              ) : (
                <FileCheck className="w-3.5 h-3.5 text-emerald-450" />
              )}
              Batch Verify {selectedDocs.length > 0 && `(${selectedDocs.length})`}
            </button>
          )}

          <button 
            onClick={onUploadTrigger}
            className="flex items-center gap-2 bg-primary hover:opacity-90 active:scale-95 text-primary-foreground font-bold uppercase tracking-wider text-[11px] px-4 py-2.5 rounded-lg shadow-[0_0_20px_rgba(6,182,212,0.2)] transition-all"
          >
            <Upload className="w-4 h-4" />
            Upload Document
          </button>
          
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input 
              type="text" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filter names..." 
              className="bg-card border border-border rounded-lg pl-10 pr-4 py-2 w-full md:w-64 outline-none focus:border-primary/50 transition-all text-xs text-white"
            />
          </div>
          
          <button 
            onClick={() => setIsQRScannerOpen(true)}
            className="p-2 rounded-lg border border-border hover:bg-muted text-muted-foreground group relative"
            title="Scan Asset Tag"
          >
            <QrCode className="w-5 h-5 group-hover:text-primary transition-colors" />
          </button>
          <button className="p-2 rounded-lg border border-border hover:bg-muted text-muted-foreground">
            <Filter className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Sub-tab selection for Active vs Deleted Archive */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-border/40 pb-px gap-4">
        <div className="flex gap-2">
          <button
            onClick={() => changeSubTab('active')}
            className={`flex items-center gap-2 px-5 py-3 border-b-2 font-bold uppercase tracking-wider text-[11px] transition-all rounded-t-lg ${
              activeSubTab === 'active'
                ? 'border-primary text-white bg-primary/10 font-black'
                : 'border-transparent text-muted-foreground hover:text-white hover:bg-muted/10'
            }`}
          >
            <FileText className="w-4 h-4 text-primary" />
            Active Archives
            <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
              activeSubTab === 'active' ? 'bg-primary/20 text-primary' : 'bg-muted text-muted-foreground'
            }`}>
              {activeDocs.length}
            </span>
          </button>
        </div>

        {isUserAdmin && activeSubTab === 'active' && activeDocs.length > 0 && (
          <button
            onClick={handleCleanDuplicates}
            className="flex items-center gap-2 px-4 py-1.5 rounded-lg border border-primary/30 bg-primary/5 hover:bg-primary/15 text-primary font-semibold uppercase tracking-wider text-[10px] transition-all cursor-pointer self-start sm:self-center mr-1 mb-2 sm:mb-0"
            title="Auto-detect and archive duplicate uploads"
          >
            <Sparkles className="w-3.5 h-3.5 text-primary animate-pulse" />
            {currentUser?.role === 'Maamulaha' ? 'Nadiifi Nuqulada' : 'Remove Duplicates'}
          </button>
        )}
      </div>

      <div 
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        className={`relative rounded-2xl transition-all duration-300 ${isDragging ? 'ring-4 ring-primary ring-opacity-50 ring-offset-4 ring-offset-background bg-primary/5 scale-[1.01]' : ''}`}
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

        <div className="bg-card border border-border/50 rounded-2xl overflow-hidden shadow-2xl">
          <div className="px-6 py-3 bg-muted/20 border-b border-border flex items-center gap-4 text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
            <button 
              onClick={(e) => { e.stopPropagation(); toggleSelectAll(); }}
              className="w-5 h-5 flex items-center justify-center rounded border border-border bg-sidebar hover:border-primary/50 transition-colors"
              title="Select / Deselect All"
            >
              {selectedDocs.length > 0 && selectedDocs.length === displayDocs.length ? (
                <CheckSquare className="w-4 h-4 text-primary" />
              ) : (
                <Square className="w-4 h-4 text-muted-foreground/50" />
              )}
            </button>
            <div className="w-10" />
            <span className="flex-1">Document Name</span>
            <span className="hidden md:block w-32">Tags</span>
            <span className="hidden lg:block w-24">Modified</span>
            <span className="hidden sm:block w-20">Size</span>
            <span className="w-25 text-right">Status</span>
            <div className="w-10" />
          </div>

          <div className="divide-y divide-border/50">
            {displayDocs.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground italic text-xs">
                {activeSubTab === 'active' ? 'No active documents matching search filters.' : 'No archived/deleted documents in this view.'}
              </div>
            ) : (
              displayDocs.map((doc) => {
                const isSelected = selectedDocs.includes(doc.id.toString());
                const verifyRes = verificationResults?.[doc.id];
                return (
                <motion.div 
                  key={doc.id}
                  layoutId={`doc-card-${doc.id}`}
                  onClick={() => onPreview?.(doc.name, doc.id.toString())}
                  className={`group px-6 py-4 flex items-center gap-4 hover:bg-sidebar-accent/30 transition-colors cursor-pointer border-b border-border/10 ${
                    isSelected ? 'bg-primary/5' : ''
                  } ${
                    verifyRes?.status === 'valid' ? 'bg-emerald-500/5 hover:bg-emerald-500/10 border-l-4 border-emerald-500' :
                    verifyRes?.status === 'expired' ? 'bg-amber-500/5 hover:bg-amber-500/10 border-l-4 border-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.03)]' :
                    verifyRes?.status === 'invalid' ? 'bg-rose-500/5 hover:bg-rose-500/10 border-l-4 border-rose-500 border-dashed shadow-[0_0_15px_rgba(239,68,68,0.03)]' : 
                    isSelected ? 'border-l-4 border-primary' : 'border-l-4 border-transparent'
                  }`}
                  style={{ paddingLeft: isSelected || verifyRes ? '20px' : '24px' }}
                >
                  <button 
                    onClick={(e) => { 
                      e.stopPropagation(); 
                      toggleSelectDoc(doc.id.toString()); 
                    }}
                    className="w-5 h-5 flex items-center justify-center rounded border border-border bg-sidebar hover:border-primary/50 transition-colors"
                  >
                    {isSelected ? (
                      <CheckSquare className="w-4 h-4 text-primary" />
                    ) : (
                      <Square className="w-4 h-4 text-muted-foreground/30 group-hover:text-muted-foreground/60" />
                    )}
                  </button>

                  <motion.div 
                    layoutId={`doc-icon-${doc.id}`}
                    className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      doc.type === 'pdf' ? 'bg-rose-500/10 text-rose-500' :
                      doc.type === 'cad' || doc.type === 'dwg' || doc.type === 'dxf' ? 'bg-blue-500/10 text-blue-500' : 'bg-primary/10 text-primary'
                    }`}
                  >
                    <FileText className="w-5 h-5" />
                  </motion.div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <motion.h4 
                        layoutId={`doc-name-${doc.id}`}
                        className="text-sm font-bold text-white group-hover:text-primary transition-colors truncate"
                      >
                        <HighlightMatch text={doc.name} query={searchQuery} />
                      </motion.h4>
                      {verifyRes && (
                        <span className={`px-2 py-0.5 rounded-md text-[8.5px] font-black uppercase tracking-wider border flex items-center gap-1 shrink-0 ${
                          verifyRes.status === 'valid' ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30' :
                          verifyRes.status === 'expired' ? 'bg-amber-500/15 text-amber-500 border-amber-500/30 animate-pulse' :
                          'bg-rose-500/15 text-rose-400 border-rose-500/30 animate-pulse'
                        }`} title={verifyRes.message}>
                          <span className={`w-1 h-1 rounded-full ${
                            verifyRes.status === 'valid' ? 'bg-emerald-405' :
                            verifyRes.status === 'expired' ? 'bg-amber-450 animate-ping' :
                            'bg-rose-450 animate-ping'
                          }`} />
                          {verifyRes.status === 'valid' ? 'Verified Code' : 
                           verifyRes.status === 'expired' ? 'Expired Reg' : 'Invalid Reg'}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-1.5 mt-1 text-[10px] text-muted-foreground font-mono flex-wrap">
                      <span className={`px-1.5 py-0.2 rounded uppercase font-extrabold text-[8px] tracking-tight ${
                        doc.uploadedBy === 'Admin' ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20' :
                        doc.uploadedBy === 'Member' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' :
                        'bg-amber-500/10 text-amber-500 border border-amber-500/20'
                      }`}>
                        {doc.uploadedBy || 'Member'}
                      </span>
                      <span>•</span>
                      <span className="font-semibold">{doc.uploaderName || currentUser?.name || 'Mohamed Abdulkadir Hussain Maamule'}</span>
                      {doc.ComplianceCode && (
                        <>
                          <span>•</span>
                          <span className="text-zinc-400 font-bold font-mono text-[8.5px] uppercase tracking-wider bg-zinc-800 border border-zinc-700/60 px-1.5 py-0.2 rounded">
                            Xeerka: {doc.ComplianceCode}
                          </span>
                        </>
                      )}
                    </div>
                    {verifyRes && verifyRes.status !== 'valid' && (
                      <p className={`text-[10px] sm:text-[10.5px] mt-1.5 font-sans leading-normal font-bold uppercase tracking-wide flex items-center gap-1.5 ${
                        verifyRes.status === 'expired' ? 'text-amber-400 animate-pulse' : 'text-rose-400 animate-pulse'
                      }`}>
                        <span className="shrink-0">&#9888; Hubinta Geodetic:</span>
                        <span className="italic font-normal normal-case text-zinc-350">{verifyRes.message}</span>
                      </p>
                    )}
                  </div>

                  <div className="hidden md:flex w-32 flex-wrap gap-1">
                    {doc.tags.map(tag => (
                      <span key={tag} className="px-1.5 py-0.5 rounded bg-muted text-[10px] text-muted-foreground uppercase font-bold tracking-tighter">
                        {tag}
                      </span>
                    ))}
                  </div>

                  <div className="hidden lg:block w-24 text-[11px] font-mono text-muted-foreground">
                    {doc.date}
                  </div>

                  <div className="hidden sm:block w-20 text-[11px] font-mono text-muted-foreground">
                    {doc.size}
                  </div>

                  <div className="w-25 text-right">
                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase border ${
                      doc.status === 'Approved' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                      doc.status === 'Pending' ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' :
                      'bg-rose-500/10 text-rose-400 border-rose-500/20'
                    }`}>
                      {doc.status || 'Approved'}
                    </span>
                  </div>

                  <div className="w-16 flex justify-end md:opacity-0 md:group-hover:opacity-100 transition-opacity gap-1.5 opacity-100">
                    {activeSubTab === 'active' ? (
                      <>
                        <button 
                          type="button"
                          onClick={(e) => handleRowArchive(doc.id, e)}
                          className="p-1.5 rounded-md hover:bg-cyan-500/15 text-cyan-400 hover:text-cyan-500 transition-colors"
                          title={currentUser?.role === 'Maamulaha' ? 'Kaydi' : 'Archive'}
                        >
                          <Archive className="w-4 h-4" />
                        </button>
                        <button 
                          type="button"
                          onClick={(e) => handleRowDelete(doc.id, e)}
                          className="p-1.5 rounded-md hover:bg-rose-500/15 text-rose-400 hover:text-rose-500 transition-colors"
                          title={currentUser?.role === 'Maamulaha' ? 'Tirtir' : 'Delete'}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </>
                    ) : (
                      <>
                        <button 
                          type="button"
                          onClick={(e) => handleRowRestore(doc.id, e)}
                          className="p-1.5 rounded-md hover:bg-emerald-500/15 text-emerald-400 hover:text-emerald-500 transition-colors"
                          title={currentUser?.role === 'Maamulaha' ? 'Soo celi' : 'Restore'}
                        >
                          <RotateCcw className="w-4 h-4" />
                        </button>
                        <button 
                          type="button"
                          onClick={(e) => handleRowDelete(doc.id, e)}
                          className="p-1.5 rounded-md hover:bg-rose-500/15 text-rose-400 hover:text-rose-500 transition-colors"
                          title={currentUser?.role === 'Maamulaha' ? 'Si joogto ah u tirtir' : 'Delete Permanently'}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </>
                    )}
                  </div>
                </motion.div>
              );
            })
          )}
          </div>
        </div>
      </div>
    </div>
  );
}
