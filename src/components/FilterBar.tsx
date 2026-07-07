import { Clock, Star, Users, Archive } from 'lucide-react';
import { motion } from 'motion/react';

const filters = [
  { id: 'recent', label: 'Recent', icon: Clock },
  { id: 'starred', label: 'Starred', icon: Star },
  { id: 'shared', label: 'Shared', icon: Users },
  { id: 'archive', label: 'Archive', icon: Archive },
];

interface FilterBarProps {
  activeFilter: string;
  onChange: (id: string) => void;
}

export function FilterBar({ activeFilter, onChange }: FilterBarProps) {
  return (
    <div className="flex items-center gap-1 p-1 bg-muted/50 border border-border rounded-xl w-fit">
      {filters.map((filter) => {
        const Icon = filter.icon;
        const isActive = activeFilter === filter.id;
        
        return (
          <button
            key={filter.id}
            onClick={() => onChange(filter.id)}
            className={`
              relative flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all
              ${isActive ? 'text-primary' : 'text-muted-foreground hover:text-foreground'}
            `}
          >
            {isActive && (
              <motion.div
                layoutId="active-filter"
                className="absolute inset-0 bg-card border border-border shadow-sm rounded-lg"
                transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
              />
            )}
            <Icon className={`w-4 h-4 relative z-10 ${isActive ? 'animate-pulse' : ''}`} />
            <span className="relative z-10 uppercase tracking-wider text-[11px]">{filter.label}</span>
          </button>
        );
      })}
    </div>
  );
}
