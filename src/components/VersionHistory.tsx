import { useState, useRef, useEffect } from 'react';
import { History, RotateCcw, ChevronDown, Clock, User } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useToast } from './Toast';

interface Version {
  id: string;
  timestamp: string;
  user: string;
  size: string;
}

const mockVersions: Version[] = [
  { id: 'v2', timestamp: 'May 26, 2026 14:20', user: 'Admin', size: '4.2 MB' },
  { id: 'v1', timestamp: 'May 20, 2026 09:15', user: 'James Chen', size: '3.8 MB' },
];

export function VersionHistory() {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { showToast } = useToast();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`
          flex items-center gap-1.5 px-2 py-1 rounded border border-border text-[10px] font-bold uppercase tracking-tight transition-all
          ${isOpen ? 'bg-primary/10 text-primary border-primary/30' : 'hover:bg-muted text-muted-foreground'}
        `}
      >
        <History className="w-3 h-3" />
        V2
        <ChevronDown className={`w-3 h-3 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 5, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 5, scale: 0.95 }}
            className="absolute right-0 mt-2 w-72 bg-card border border-border rounded-xl shadow-2xl z-[50] overflow-hidden"
          >
            <div className="px-4 py-2 border-b border-border bg-muted/30">
              <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Version History</span>
            </div>
            <div className="p-2 space-y-1">
              <div className="px-3 py-2 rounded-lg bg-primary/5 border border-primary/20 flex flex-col gap-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-primary italic">Current Version</span>
                  <span className="text-[9px] font-mono opacity-50 px-1 bg-primary/10 rounded">LATEST</span>
                </div>
                <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                  <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> Today, 10:45 AM</span>
                  <span className="flex items-center gap-1"><User className="w-3 h-3" /> Admin</span>
                </div>
              </div>

              {mockVersions.map((v) => (
                <div key={v.id} className="group p-3 rounded-lg hover:bg-muted transition-colors border border-transparent hover:border-border">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold">Version {v.id.toUpperCase()}</span>
                    <button 
                      onClick={() => {
                        showToast(`Restoring Version ${v.id.toUpperCase()}...`, 'success');
                        setIsOpen(false);
                      }}
                      className="opacity-0 group-hover:opacity-100 flex items-center gap-1 px-2 py-1 rounded bg-secondary text-secondary-foreground text-[9px] font-bold uppercase tracking-wider hover:bg-primary hover:text-primary-foreground transition-all"
                    >
                      <RotateCcw className="w-2.5 h-2.5" />
                      Restore
                    </button>
                    <span className="group-hover:hidden text-[10px] text-muted-foreground font-mono">{v.size}</span>
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                    <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {v.timestamp}</span>
                    <span className="flex items-center gap-1"><User className="w-3 h-3" /> {v.user}</span>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
