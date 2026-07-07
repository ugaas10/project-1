import { motion, AnimatePresence } from 'motion/react';
import { Download, Trash2, Move, Share2, X, Edit3, Tag, FileCheck, RotateCcw, Archive } from 'lucide-react';

interface BulkActionToolbarProps {
  selectedCount: number;
  onClear: () => void;
  onDelete?: () => void;
  onArchive?: () => void;
  onMove: () => void;
  onDownload: () => void;
  onRename: () => void;
  onTag: () => void;
  onVerify?: () => void;
  onRestore?: () => void;
  onDeleteAll?: () => void;
  onShare?: () => void;
  isUserAdmin?: boolean;
}

export function BulkActionToolbar({ selectedCount, onClear, onDelete, onArchive, onMove, onDownload, onRename, onTag, onVerify, onRestore, onDeleteAll, onShare, isUserAdmin: propIsAdmin }: BulkActionToolbarProps) {
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

  return (
    <AnimatePresence>
      {selectedCount > 0 && (
        <div
          id="bulk-action-toolbar"
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] bg-sidebar/95 backdrop-blur border border-sidebar-border shadow-2xl rounded-2xl p-2 w-[calc(100vw-32px)] sm:w-auto sm:min-w-[450px] max-w-5xl"
        >
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ type: 'spring', stiffness: 280, damping: 26 }}
            className="flex items-center gap-2 sm:gap-4 w-full"
          >
            <div className="px-2.5 sm:px-4 border-r border-sidebar-border flex flex-col items-start shrink-0">
              <span className="text-lg sm:text-xl font-bold font-mono tracking-tighter text-primary">{selectedCount}</span>
              <span className="text-[8px] sm:text-[9px] uppercase tracking-widest font-bold text-muted-foreground whitespace-nowrap">Selected</span>
            </div>

            <div className="flex-1 flex items-center gap-1 overflow-x-auto no-scrollbar scroll-smooth py-1 pr-1">
              {isUserAdmin ? (
                <>
                  <button 
                    id="bulk-rename-btn"
                    onClick={onRename}
                    className="px-4 py-2.5 rounded-xl hover:bg-sidebar-accent text-sidebar-foreground flex items-center gap-2 transition-all group"
                  >
                    <Edit3 className="w-4 h-4 group-hover:text-primary transition-colors" />
                    <span className="text-[10px] font-bold uppercase tracking-widest">Rename</span>
                  </button>

                  <button 
                    id="bulk-tag-btn"
                    onClick={onTag}
                    className="px-4 py-2.5 rounded-xl hover:bg-sidebar-accent text-sidebar-foreground flex items-center gap-2 transition-all group"
                  >
                    <Tag className="w-4 h-4 group-hover:text-primary transition-colors" />
                    <span className="text-[10px] font-bold uppercase tracking-widest">Tag</span>
                  </button>
                </>
              ) : null}
              
              <button 
                id="bulk-download-btn"
                onClick={onDownload}
                className="px-4 py-2.5 rounded-xl hover:bg-sidebar-accent text-sidebar-foreground flex items-center gap-2 transition-all group bg-sidebar-accent/10"
              >
                <Download className="w-4 h-4 text-emerald-400 group-hover:text-emerald-300 transition-colors" />
                <span className="text-[10px] font-bold uppercase tracking-widest">Download ZIP</span>
              </button>

              {onVerify && (
                <button 
                  id="bulk-verify-btn"
                  onClick={onVerify}
                  className="px-4 py-2.5 rounded-xl hover:bg-emerald-500/10 text-emerald-400 flex items-center gap-2 transition-all group border border-emerald-500/20 bg-emerald-500/5 shadow-[0_0_15px_rgba(16,185,129,0.05)]"
                >
                  <FileCheck className="w-4 h-4 text-emerald-400 group-hover:text-emerald-300 transition-colors animate-pulse" />
                  <span className="text-[10px] font-bold uppercase tracking-widest">Batch Verify</span>
                </button>
              )}
              
              {isUserAdmin ? (
                <button 
                  id="bulk-move-btn"
                  onClick={onMove}
                  className="px-4 py-2.5 rounded-xl hover:bg-sidebar-accent text-sidebar-foreground flex items-center gap-2 transition-all group"
                >
                  <Move className="w-4 h-4 group-hover:text-primary transition-colors" />
                  <span className="text-[10px] font-bold uppercase tracking-widest">Move Items</span>
                </button>
              ) : null}

              <button 
                onClick={onShare}
                className="px-4 py-2.5 rounded-xl hover:bg-sidebar-accent text-sidebar-foreground flex items-center gap-2 transition-all group"
              >
                <Share2 className="w-4 h-4 group-hover:text-primary transition-colors" />
                <span className="text-[10px] font-bold uppercase tracking-widest">Share</span>
              </button>

              {!isUserAdmin && (
                <span className="px-3 py-1 bg-amber-500/10 text-amber-500 border border-amber-500/25 rounded-lg text-[9px] font-bold uppercase tracking-wider">
                  Read-Only
                </span>
              )}

              {isUserAdmin ? (
                <>
                  {onRestore && (
                    <>
                      <div className="w-[1px] h-8 bg-sidebar-border mx-2" />
                      <button 
                        id="bulk-restore-btn"
                        onClick={onRestore}
                        className="px-4 py-2.5 rounded-xl hover:bg-emerald-500/10 text-emerald-400 flex items-center gap-2 transition-all group border border-emerald-500/20 bg-emerald-500/5 shadow-[0_0_15px_rgba(16,185,129,0.05)]"
                      >
                        <RotateCcw className="w-4 h-4 text-emerald-400 group-hover:text-emerald-300 transition-colors" />
                        <span className="text-[10px] font-bold uppercase tracking-widest">Restore</span>
                      </button>
                    </>
                  )}
                  {onArchive && (
                    <>
                      <div className="w-[1px] h-8 bg-sidebar-border mx-2" />
                      <button 
                        id="bulk-archive-btn"
                        onClick={onArchive}
                        className="px-4 py-2.5 rounded-xl hover:bg-primary/10 text-primary flex items-center gap-2 transition-all group"
                      >
                        <Archive className="w-4 h-4 group-hover:scale-110 transition-transform" />
                        <span className="text-[10px] font-bold uppercase tracking-widest">Archive</span>
                      </button>
                    </>
                  )}

                  {onDelete && (
                    <>
                      <div className="w-[1px] h-8 bg-sidebar-border mx-2" />
                      <button 
                        id="bulk-delete-btn"
                        onClick={onDelete}
                        className="px-4 py-2.5 rounded-xl hover:bg-destructive/10 text-destructive flex items-center gap-2 transition-all"
                      >
                        <Trash2 className="w-4 h-4" />
                        <span className="text-[10px] font-bold uppercase tracking-widest">Delete</span>
                      </button>
                    </>
                  )}

                  {onDeleteAll && (
                    <>
                      <div className="w-[1px] h-8 bg-sidebar-border mx-2" />
                      <button 
                        id="bulk-delete-all-btn"
                        onClick={onDeleteAll}
                        className="px-4 py-2.5 rounded-xl border border-rose-500/30 bg-rose-500/5 hover:bg-rose-500/15 text-rose-400 flex items-center gap-2 transition-all group shadow-[0_0_15px_rgba(244,63,94,0.05)]"
                        title="Delete All Documents"
                      >
                        <Trash2 className="w-4 h-4 text-rose-500 group-hover:scale-110 transition-transform animate-pulse" />
                        <span className="text-[10px] font-bold uppercase tracking-widest">Delete All</span>
                      </button>
                    </>
                  )}
                </>
              ) : null}
            </div>

            <button 
              onClick={onClear}
              className="p-3 hover:bg-sidebar-accent rounded-xl text-muted-foreground transition-colors mr-1"
              title="Clear Selection"
            >
              <X className="w-5 h-5" />
            </button>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
