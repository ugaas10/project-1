import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Edit3, HelpCircle } from 'lucide-react';

interface BatchRenameModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedCount: number;
  onConfirm: (pattern: string) => void;
}

export function BatchRenameModal({ isOpen, onClose, selectedCount, onConfirm }: BatchRenameModalProps) {
  const [pattern, setPattern] = useState('[Project]_[Date]_[Index]');

  if (!isOpen) return null;

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
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="bg-card border border-border rounded-2xl shadow-2xl w-full max-w-lg relative z-[5001] overflow-hidden"
      >
        <div className="p-6 border-b border-border flex items-center justify-between">
          <div>
            <h3 className="text-xl font-bold text-white tracking-tight italic">Batch Rename Operations</h3>
            <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest mt-1">
              Applying pattern to <span className="text-primary">{selectedCount}</span> selected documents
            </p>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-muted text-muted-foreground transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-8 space-y-8">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Naming Pattern</label>
              <button className="text-primary hover:underline text-[10px] font-bold uppercase tracking-widest flex items-center gap-1">
                <HelpCircle className="w-3 h-3" /> Syntax Help
              </button>
            </div>
            
            <div className="relative group">
              <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-muted-foreground/50">
                <Edit3 className="w-4 h-4" />
              </div>
              <input 
                type="text" 
                value={pattern}
                onChange={(e) => setPattern(e.target.value)}
                autoFocus
                className="w-full bg-sidebar border border-border rounded-xl pl-12 pr-4 py-4 text-white outline-none focus:border-primary/50 text-sm font-mono"
                placeholder="e.g. Survey_2024_{n}"
              />
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {['[Project]', '[Date]', '[Index]', '[Type]'].map(tag => (
                <button 
                  key={tag}
                  onClick={() => setPattern(prev => prev + tag)}
                  className="px-3 py-2 rounded-lg border border-border bg-muted/20 text-[10px] font-bold text-muted-foreground hover:bg-muted hover:text-white transition-all"
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>

          <div className="p-4 rounded-xl bg-primary/5 border border-primary/10">
            <h4 className="text-[10px] font-bold uppercase tracking-widest text-primary mb-2">Live Preview</h4>
            <div className="space-y-1">
              <p className="text-xs font-mono text-white/50 truncate"> highway_survey.pdf → <span className="text-primary">HighwayA42_2026-05-27_001.pdf</span></p>
              <p className="text-xs font-mono text-white/50 truncate"> report_v2.docx → <span className="text-primary">HighwayA42_2026-05-27_002.docx</span></p>
            </div>
          </div>

          <button 
            onClick={() => {
              onConfirm(pattern);
              onClose();
            }}
            className="w-full bg-primary text-primary-foreground py-4 rounded-xl font-bold uppercase tracking-[0.3em] text-xs shadow-[0_0_30px_rgba(6,182,212,0.3)] hover:opacity-90 active:scale-[0.98] transition-all"
          >
            Apply Pattern Transformation
          </button>
        </div>
      </motion.div>
    </div>
  );
}
