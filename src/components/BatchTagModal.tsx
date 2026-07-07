import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Tag as TagIcon, Plus, CheckCircle2 } from 'lucide-react';

interface BatchTagModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedCount: number;
  onConfirm: (tags: string[]) => void;
}

export function BatchTagModal({ isOpen, onClose, selectedCount, onConfirm }: BatchTagModalProps) {
  const [tags, setTags] = useState<string[]>(['Engineering', 'Survey']);
  const [newTag, setNewTag] = useState('');

  const addTag = () => {
    if (newTag && !tags.includes(newTag)) {
      setTags([...tags, newTag]);
      setNewTag('');
    }
  };

  const removeTag = (tag: string) => {
    setTags(tags.filter(t => t !== tag));
  };

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
        className="bg-card border border-border rounded-2xl shadow-2xl w-full max-w-md relative z-[5001] overflow-hidden"
      >
        <div className="p-6 border-b border-border flex items-center justify-between">
          <div>
            <h3 className="text-xl font-bold text-white tracking-tight">Batch Tag Documents</h3>
            <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest mt-1">
              Adding to <span className="text-primary">{selectedCount}</span> selected items
            </p>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-muted text-muted-foreground transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-8 space-y-8">
          <div className="space-y-4">
            <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">New Document Tag</label>
            <div className="flex gap-2">
               <input 
                  type="text" 
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && addTag()}
                  placeholder="e.g. Topology"
                  className="flex-1 bg-sidebar border border-border rounded-xl px-4 py-3 text-white outline-none focus:border-primary/50 text-sm"
               />
               <button 
                  onClick={addTag}
                  className="bg-sidebar border border-border p-3 rounded-xl hover:bg-muted text-primary transition-all"
               >
                  <Plus className="w-5 h-5" />
               </button>
            </div>
          </div>

          <div className="space-y-3">
             <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Tags to be Applied</label>
             <div className="flex flex-wrap gap-2">
                {tags.map(tag => (
                   <div key={tag} className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-primary/10 border border-primary/20 text-primary group">
                      <TagIcon className="w-3.5 h-3.5" />
                      <span className="text-[11px] font-bold uppercase tracking-tighter">{tag}</span>
                      <button 
                        onClick={() => removeTag(tag)}
                        className="p-1 hover:bg-primary/20 rounded-md opacity-0 group-hover:opacity-100 transition-all"
                      >
                         <X className="w-3 h-3" />
                      </button>
                   </div>
                ))}
                {tags.length === 0 && (
                   <p className="text-xs text-muted-foreground italic">No tags selected for addition.</p>
                )}
             </div>
          </div>

          <button 
            disabled={tags.length === 0}
            onClick={() => {
              onConfirm(tags);
              onClose();
            }}
            className="w-full bg-primary text-primary-foreground py-4 rounded-xl font-bold uppercase tracking-[0.3em] text-xs shadow-lg hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-30 disabled:cursor-not-allowed group"
          >
             <span className="flex items-center justify-center gap-2">
               <CheckCircle2 className="w-4 h-4" /> 
               Apply Selection
             </span>
          </button>
        </div>
      </motion.div>
    </div>
  );
}
