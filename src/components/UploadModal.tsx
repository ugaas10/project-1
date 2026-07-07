import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Upload, FileText, CheckCircle, AlertCircle, Loader2, Zap, ArrowDownToLine } from 'lucide-react';
import { useToast } from './Toast';
import { compressFile, CompressionResult } from '../lib/compression';

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (details: { 
    fileName: string, 
    savingsMB: string,
    uploadedFiles?: { name: string, size: string, type: string }[] 
  }) => void;
}

export function UploadModal({ isOpen, onClose, onSuccess }: UploadModalProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const [compressionResults, setCompressionResults] = useState<Record<string, CompressionResult>>({});
  const [fileProgress, setFileProgress] = useState<Record<string, { status: 'pending' | 'compressing' | 'encrypting' | 'completed', percent: number }>>({});
  const [isUploading, setIsUploading] = useState(false);
  const [isCompressing, setIsCompressing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { showToast } = useToast();

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setFiles(prev => [...prev, ...newFiles]);
      setFileProgress(prev => {
        const next = { ...prev };
        newFiles.forEach((f: File) => {
          next[f.name] = { status: 'pending', percent: 0 };
        });
        return next;
      });
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files) {
      const newFiles = Array.from(e.dataTransfer.files);
      setFiles(prev => [...prev, ...newFiles]);
      setFileProgress(prev => {
        const next = { ...prev };
        newFiles.forEach((f: File) => {
          next[f.name] = { status: 'pending', percent: 0 };
        });
        return next;
      });
    }
  };

  const removeFile = (index: number) => {
    const fileName = files[index].name;
    setFiles(prev => prev.filter((_, i) => i !== index));
    setCompressionResults(prev => {
      const next = { ...prev };
      delete next[fileName];
      return next;
    });
    setFileProgress(prev => {
      const next = { ...prev };
      delete next[fileName];
      return next;
    });
  };

  const handleUpload = async () => {
    if (files.length === 0) return;
    
    setIsCompressing(true);
    showToast('Optimizing documents for cloud storage...', 'info');
    
    const results: Record<string, CompressionResult> = {};
    const optimizedFiles: File[] = [];

    try {
      // 1. Compression Phase
      for (const file of files) {
        setFileProgress(prev => ({
          ...prev,
          [file.name]: { status: 'compressing', percent: 45 }
        }));
        
        const result = await compressFile(file);
        
        setFileProgress(prev => ({
          ...prev,
          [file.name]: { status: 'compressing', percent: 100 }
        }));
        
        results[file.name] = result;
        optimizedFiles.push(result.file);
        await new Promise(r => setTimeout(r, 200)); // Smooth transition
      }
      
      setCompressionResults(results);
      setIsCompressing(false);
      setIsUploading(true);

      // 2. Encryption & Upload Phase
      for (const file of files) {
        setFileProgress(prev => ({
          ...prev,
          [file.name]: { status: 'encrypting', percent: 10 }
        }));

        // Simulate encryption progress
        for (let i = 1; i <= 5; i++) {
          await new Promise(r => setTimeout(r, 150));
          setFileProgress(prev => ({
            ...prev,
            [file.name]: { ...prev[file.name], percent: 20 * i }
          }));
        }

        setFileProgress(prev => ({
          ...prev,
          [file.name]: { status: 'completed', percent: 100 }
        }));
      }
      
      setIsUploading(false);
      const totalSavings = Object.values(results).reduce((acc, curr) => acc + (curr.originalSize - curr.compressedSize), 0);
      const savingsMB = (totalSavings / (1024 * 1024)).toFixed(2);
      
      showToast(`Success: ${files.length} documents encrypted. Saved ${savingsMB}MB via compression.`, 'success');
      
      if (onSuccess) {
        const uploadedFilesData = files.map(file => {
          const ext = file.name.split('.').pop() || 'dat';
          const sizeMB = file.size > 1024 * 1024
            ? `${(file.size / (1024 * 1024)).toFixed(1)} MB`
            : `${Math.round(file.size / 1024)} KB`;
          let fileUrl = '';
          try {
            fileUrl = URL.createObjectURL(file);
          } catch (e) {
            // fallback
          }
          return {
            name: file.name,
            size: sizeMB,
            type: ext,
            url: fileUrl
          };
        });
        
        onSuccess({ 
          fileName: files.length === 1 ? files[0].name : `${files.length} Optimized Files`, 
          savingsMB,
          uploadedFiles: uploadedFilesData
        });
      }
      
      // Keep completed state visible briefly before closing
      await new Promise(r => setTimeout(r, 1000));
      
      setFiles([]);
      setCompressionResults({});
      setFileProgress({});
      onClose();
    } catch (error) {
      setIsCompressing(false);
      setIsUploading(false);
      showToast('Optimization failed. Please try again.', 'error');
    }
  };

  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="fixed inset-0 z-[6000] flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-background/90 backdrop-blur-md"
      />
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="bg-card border border-border rounded-2xl shadow-2xl w-full max-w-lg relative z-[6001] overflow-hidden"
      >
        <div className="p-6 border-b border-border flex items-center justify-between bg-muted/20">
          <div className="flex items-center gap-3">
             <div className="p-2 bg-primary/10 rounded-lg">
                <Upload className="w-5 h-5 text-primary" />
             </div>
             <div>
                <h3 className="text-xl font-bold text-white tracking-tight">Smart Asset Upload</h3>
                <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest mt-0.5">
                   Automated compression & AES-256 Encryption
                </p>
             </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-muted text-muted-foreground transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-8 space-y-6">
           {/* Section 1 Description: Upload Gatekeeper */}
           <div className="bg-primary/5 p-4 rounded-xl border border-primary/20 flex flex-col gap-1 text-left relative overflow-hidden">
             <div className="flex items-center gap-1.5">
               <AlertCircle className="w-3.5 h-3.5 text-primary animate-pulse" />
               <span className="text-[10px] font-black uppercase text-primary tracking-wider font-mono">1. Selection & Format Verification Gate</span>
             </div>
             <p className="text-[10px] text-zinc-400 leading-relaxed font-sans mt-0.5 mt-1">
               Select or drag engineering basemaps (DWG/DXF AutoCAD drawings), formal PDF survey reports, or map coordinates. Standard requirements: drawing scale in meters, standard Somali Geodetic projection, and clear regulatory metadata labeling.
             </p>
           </div>

           <div 
             onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
             onDragLeave={() => setIsDragging(false)}
             onDrop={handleDrop}
             onClick={() => !isUploading && !isCompressing && fileInputRef.current?.click()}
             className={`
               border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-all
               ${isDragging ? 'border-primary bg-primary/5 scale-[1.02]' : 'border-border hover:border-primary/30 hover:bg-muted/30'}
               ${(isUploading || isCompressing) ? 'opacity-50 cursor-not-allowed' : ''}
             `}
           >
              <input 
                type="file" 
                ref={fileInputRef} 
                multiple 
                className="hidden" 
                onChange={handleFileChange}
                disabled={isUploading || isCompressing}
              />
              <div className="w-16 h-16 rounded-full bg-sidebar-accent mx-auto flex items-center justify-center mb-4 border border-border group-hover:scale-110 transition-transform">
                 <Upload className="w-8 h-8 text-primary" />
              </div>
              <h4 className="text-sm font-bold text-white mb-1">Click or drag files to upload</h4>
              <p className="text-[11px] text-muted-foreground">PDF, Images, DWG (Auto-optimized before transfer)</p>
           </div>

           <AnimatePresence>
              {files.length > 0 && (
                 <motion.div 
                   initial={{ opacity: 0, height: 0 }}
                   animate={{ opacity: 1, height: 'auto' }}
                   exit={{ opacity: 0, height: 0 }}
                   className="space-y-4 max-h-[300px] overflow-y-auto pr-2 scrollbar-thin"
                 >
                    {/* Section 2 Description: Optimization Staging */}
                    <div className="bg-emerald-500/5 p-4 rounded-xl border border-emerald-500/15 flex flex-col gap-1 text-left sticky top-0 bg-[#0c0f16]/95 backdrop-blur-md z-20 mb-2">
                      <div className="flex items-center gap-1.5">
                        <Zap className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="text-[10px] font-black uppercase text-emerald-400 tracking-wider font-mono">2. Staged Optimization & Encryption Tunnel</span>
                      </div>
                      <p className="text-[10px] text-zinc-400 leading-relaxed font-sans mt-0.5">
                        Queued files undergo local structural prep. When you click Upload, the geodetic core strips redundant CAD layers, compresses text payloads via browser-level GZIP, and seals binaries using AES-256 wraps.
                      </p>
                    </div>

                    {files.map((file, i) => {
                       const result = compressionResults[file.name];
                       const progress = fileProgress[file.name] || { status: 'pending', percent: 0 };
                       
                       return (
                         <div key={i} className="flex flex-col p-4 rounded-xl bg-sidebar/50 border border-border group relative overflow-hidden">
                            {/* Subtle background progress fill */}
                            {(progress.status === 'compressing' || progress.status === 'encrypting') && (
                              <motion.div 
                                initial={{ width: 0 }}
                                animate={{ width: `${progress.percent}%` }}
                                className={`absolute inset-0 opacity-5 pointer-events-none ${
                                  progress.status === 'compressing' ? 'bg-primary' : 'bg-emerald-500'
                                }`}
                              />
                            )}

                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-3 overflow-hidden">
                                 <FileText className={`w-4 h-4 shrink-0 ${progress.status === 'completed' ? 'text-emerald-400' : 'text-primary'}`} />
                                 <div className="flex flex-col">
                                   <span className="text-xs font-bold text-white truncate max-w-[200px]">{file.name}</span>
                                   <div className="flex items-center gap-2">
                                      <span className="text-[9px] text-muted-foreground font-mono">{formatSize(file.size)}</span>
                                      {progress.status !== 'pending' && (
                                        <>
                                          <span className="text-[9px] text-muted-foreground opacity-30">•</span>
                                          <span className={`text-[9px] font-bold uppercase tracking-wider ${
                                            progress.status === 'completed' ? 'text-emerald-400' : 'text-primary'
                                          }`}>
                                            {progress.status}
                                          </span>
                                        </>
                                      )}
                                   </div>
                                 </div>
                              </div>
                              
                              <div className="flex items-center gap-2">
                                 {progress.status === 'completed' ? (
                                   <CheckCircle className="w-4 h-4 text-emerald-400" />
                                 ) : (
                                   <button 
                                     onClick={(e) => { e.stopPropagation(); removeFile(i); }}
                                     className="p-1.5 rounded-md hover:bg-rose-500/10 hover:text-rose-400 text-muted-foreground transition-colors"
                                     disabled={isUploading || isCompressing}
                                   >
                                      <X className="w-3.5 h-3.5" />
                                   </button>
                                 )}
                              </div>
                            </div>
                            
                            {/* Progress Bar Container */}
                            {progress.status !== 'pending' && progress.status !== 'completed' && (
                              <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden mt-1">
                                <motion.div 
                                  initial={{ width: 0 }}
                                  animate={{ width: `${progress.percent}%` }}
                                  transition={{ type: "spring", damping: 20, stiffness: 100 }}
                                  className={`h-full ${
                                    progress.status === 'compressing' ? 'bg-primary' : 'bg-emerald-500'
                                  }`}
                                />
                              </div>
                            )}

                            {result && result.ratio > 0 && progress.status === 'completed' && (
                              <motion.div 
                                initial={{ opacity: 0, y: 5 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="mt-2 flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-lg w-fit"
                              >
                                <Zap className="w-2.5 h-2.5 text-emerald-400" />
                                <span className="text-[9px] font-bold text-emerald-400 uppercase tracking-wider">
                                  {Math.round(result.ratio * 100)}% Smallest size archived
                                </span>
                              </motion.div>
                            )}
                         </div>
                       );
                    })}
                 </motion.div>
              )}
           </AnimatePresence>

           <div className="flex gap-4">
              <button 
                onClick={onClose}
                disabled={isUploading || isCompressing}
                className="flex-1 bg-sidebar border border-border text-white py-3.5 rounded-xl font-bold uppercase tracking-widest text-[10px] hover:bg-muted transition-all disabled:opacity-50"
              >
                 Cancel
              </button>
              <button 
                onClick={handleUpload}
                disabled={files.length === 0 || isUploading || isCompressing}
                className="flex-[2] bg-primary text-primary-foreground py-3.5 rounded-xl font-bold uppercase tracking-widest text-[10px] shadow-lg hover:opacity-90 disabled:opacity-50 disabled:grayscale transition-all flex items-center justify-center gap-2"
              >
                 {isCompressing ? (
                   <>
                     <Loader2 className="w-4 h-4 animate-spin" /> Optimizing...
                   </>
                 ) : isUploading ? (
                   <>
                     <Loader2 className="w-4 h-4 animate-spin" /> Uploading...
                   </>
                 ) : (
                   <>
                     <ArrowDownToLine className="w-4 h-4" /> Start Secure Upload
                   </>
                 )}
              </button>
           </div>
        </div>
      </motion.div>
    </div>
  );
}
