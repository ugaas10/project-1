import { motion, AnimatePresence } from 'motion/react';
import { Search, Command, File, Folder, Workflow as WorkflowIcon, X } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (id: string) => void;
}

const recentFiles = [
  { id: 'f1', name: 'Annual Report 2025.pdf', type: 'file' },
  { id: 'f2', name: 'Legal/Contracts/NewHire.docx', type: 'file' },
  { id: 'f3', name: 'Dashboard', type: 'nav' },
  { id: 'f4', name: 'Document Management', type: 'nav' },
  { id: 'f5', name: 'Workflows', type: 'nav' },
];

export function CommandPalette({ isOpen, onClose, onSelect }: CommandPaletteProps) {
  const [search, setSearch] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus();
    }
  }, [isOpen]);

  const filtered = recentFiles.filter(item => 
    item.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-background/80 backdrop-blur-sm z-[100]"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            className="fixed top-[15%] left-1/2 -translate-x-1/2 w-full max-w-xl bg-card border border-border shadow-2xl rounded-xl z-[101] overflow-hidden"
          >
            <div className="flex items-center px-4 py-3 border-b border-border">
              <Search className="w-5 h-5 text-muted-foreground mr-3" />
              <input
                ref={inputRef}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search anything... (e.g. 'Report', 'Workflow')"
                className="bg-transparent border-none outline-none flex-1 text-foreground placeholder:text-muted-foreground font-medium"
              />
              <div className="flex items-center gap-1 px-2 py-1 bg-muted rounded border border-border">
                <span className="text-[10px] font-bold text-muted-foreground px-1">ESC</span>
              </div>
            </div>

            <div className="max-h-[60vh] overflow-y-auto p-2">
              {filtered.length > 0 ? (
                <div className="space-y-1">
                  {filtered.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => {
                        onSelect(item.id);
                        onClose();
                      }}
                      className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-muted text-foreground transition-colors group"
                    >
                      {item.type === 'nav' ? (
                        <Command className="w-4 h-4 text-primary" />
                      ) : (
                        <File className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                      )}
                      <span className="flex-1 text-left text-sm font-medium">{item.name}</span>
                      {item.type === 'nav' && (
                        <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">Navigation</span>
                      )}
                    </button>
                  ))}
                </div>
              ) : (
                <div className="py-12 text-center text-muted-foreground">
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-muted mb-4">
                    <Search className="w-6 h-6 opacity-20" />
                  </div>
                  <p className="text-sm">No results found for "{search}"</p>
                </div>
              )}
            </div>

            <div className="px-4 py-3 border-t border-border bg-muted/30 flex items-center justify-between text-[11px] text-muted-foreground font-medium">
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1">
                  <kbd className="px-1 py-0.5 bg-muted rounded border border-border">↑↓</kbd> to navigate
                </span>
                <span className="flex items-center gap-1">
                  <kbd className="px-1 py-0.5 bg-muted rounded border border-border">↵</kbd> to select
                </span>
              </div>
              <span className="flex items-center gap-1">
                <kbd className="px-1 py-0.5 bg-muted rounded border border-border">⌘ K</kbd> to toggle
              </span>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
