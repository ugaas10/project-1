import { useState } from 'react';
import { Keyboard, X, Command } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const shortcuts = [
  { keys: ['Ctrl', 'K'], description: 'Search Palette' },
  { keys: ['N'], description: 'Quick Upload' },
];

export function ShortcutsHelp() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="fixed bottom-6 left-6 z-50">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="mb-4 bg-card border border-border rounded-2xl shadow-2xl p-4 w-60 overflow-hidden"
          >
            <div className="flex items-center justify-between mb-4 border-b border-border pb-2">
              <div className="flex items-center gap-2">
                <Keyboard className="w-4 h-4 text-primary" />
                <span className="text-xs font-bold uppercase tracking-widest">Shortcuts</span>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="p-1 rounded-full hover:bg-muted text-muted-foreground"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
            <div className="space-y-3">
              {shortcuts.map((s) => (
                <div key={s.description} className="flex items-center justify-between">
                  <span className="text-[11px] text-muted-foreground font-medium uppercase tracking-tight">{s.description}</span>
                  <div className="flex items-center gap-1">
                    {s.keys.map((k) => (
                      <kbd key={k} className="px-1.5 py-0.5 bg-muted rounded border border-border text-[9px] font-bold shadow-sm">
                        {k === 'Ctrl' ? <Command className="w-2 h-2" /> : k}
                      </kbd>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`
          p-3 rounded-full border border-border shadow-lg transition-all active:scale-95
          ${isOpen ? 'bg-primary text-primary-foreground border-primary glow-border' : 'bg-card text-foreground hover:bg-muted'}
        `}
      >
        <Keyboard className="w-5 h-5" />
      </button>
    </div>
  );
}
