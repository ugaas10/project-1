import { useState, useRef, useEffect } from 'react';
import { ChevronDown, SortAsc, Calendar, HardDrive, Type } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface SortingDropdownProps {
  currentSort: string;
  onSortChange: (sort: string) => void;
}

export function SortingDropdown({ currentSort, onSortChange }: SortingDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const options = [
    { id: 'date', label: 'Date Modified', icon: Calendar },
    { id: 'name', label: 'Name', icon: Type },
    { id: 'size', label: 'Size', icon: HardDrive },
  ];

  const currentOption = options.find(o => o.id === currentSort) || options[0];

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 rounded-lg border border-border bg-card/50 hover:bg-muted transition-all"
      >
        <SortAsc className="w-4 h-4 text-primary" />
        <span className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground hidden sm:block">Sort by:</span>
        <span className="text-sm font-semibold">{currentOption.label}</span>
        <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="absolute right-0 mt-2 w-48 bg-card border border-border rounded-xl shadow-2xl z-50 overflow-hidden"
          >
            <div className="p-2 space-y-1">
              {options.map((option) => (
                <button
                  key={option.id}
                  onClick={() => {
                    onSortChange(option.id);
                    setIsOpen(false);
                  }}
                  className={`
                    w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors group
                    ${currentSort === option.id ? 'bg-primary/10 text-primary' : 'hover:bg-muted text-foreground'}
                  `}
                >
                  <option.icon className={`w-4 h-4 ${currentSort === option.id ? 'text-primary' : 'text-muted-foreground group-hover:text-primary transition-colors'}`} />
                  <span className="text-sm font-medium">{option.label}</span>
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
