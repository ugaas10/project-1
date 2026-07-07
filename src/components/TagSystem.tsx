import { useState } from 'react';
import { Tag as TagIcon, X, Plus } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface TagSystemProps {
  tags: string[];
  onAdd: (tag: string) => void;
  onRemove: (tag: string) => void;
  onFilterClick?: (tag: string) => void;
}

export function TagSystem({ tags, onAdd, onRemove, onFilterClick }: TagSystemProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [newTag, setNewTag] = useState('');

  const handleAdd = () => {
    if (newTag.trim()) {
      onAdd(newTag.trim());
      setNewTag('');
      setIsAdding(false);
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      <AnimatePresence initial={false}>
        {tags.map((tag) => (
          <motion.span
            key={tag}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-primary/5 border border-primary/20 text-primary text-[10px] font-bold uppercase tracking-wider group cursor-pointer hover:bg-primary/10 transition-colors"
            onClick={() => onFilterClick?.(tag)}
          >
            <TagIcon className="w-3 h-3 opacity-50" />
            {tag}
            <button 
              onClick={(e) => {
                e.stopPropagation();
                onRemove(tag);
              }}
              className="ml-0.5 hover:text-destructive transition-colors opacity-0 group-hover:opacity-100"
            >
              <X className="w-3 h-3" />
            </button>
          </motion.span>
        ))}
      </AnimatePresence>

      <div className="relative">
        {isAdding ? (
          <motion.div 
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 140, opacity: 1 }}
            className="flex items-center"
          >
            <input
              autoFocus
              value={newTag}
              onChange={(e) => setNewTag(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
              onBlur={() => !newTag && setIsAdding(false)}
              className="bg-muted text-foreground border border-border rounded-full px-3 py-1 text-[10px] w-full outline-none focus:border-primary/50"
              placeholder="Tag name..."
            />
          </motion.div>
        ) : (
          <button
            onClick={() => setIsAdding(true)}
            className="inline-flex items-center gap-1 px-2 py-1 rounded-full border border-dashed border-border text-muted-foreground hover:border-primary hover:text-primary hover:bg-primary/5 transition-all text-[10px] font-bold uppercase tracking-wider"
          >
            <Plus className="w-3 h-3" />
            Add Tag
          </button>
        )}
      </div>
    </div>
  );
}
