import { HardDrive, PieChart, FileText, Image as ImageIcon, FileCode } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useState, useEffect } from 'react';

export function StorageCard({ usedGb = 64.5, totalGb = 128 }: { usedGb?: number; totalGb?: number }) {
  const [displayPercentage, setDisplayPercentage] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const percentage = (usedGb / totalGb) * 100;
  const radius = 36;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percentage / 100) * circumference;

  useEffect(() => {
    const timer = setTimeout(() => setDisplayPercentage(Math.round(percentage)), 500);
    return () => clearTimeout(timer);
  }, [percentage]);

  const breakdown = [
    { label: 'PDF Documents', value: '42.1 GB', icon: FileText, color: 'text-primary' },
    { label: 'Images / Scans', value: '18.4 GB', icon: ImageIcon, color: 'text-accent-foreground' },
    { label: 'System Files', value: '4.0 GB', icon: FileCode, color: 'text-muted-foreground' },
  ];

  return (
    <div 
      className="p-6 rounded-xl bg-card border border-border shadow-lg flex flex-col items-center justify-center space-y-6 relative overflow-hidden group cursor-help"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
        <HardDrive className="w-12 h-12" />
      </div>
      
      <div className="relative flex items-center justify-center">
        <svg className="w-32 h-32 transform -rotate-90">
          <circle
            cx="64"
            cy="64"
            r={radius}
            stroke="currentColor"
            strokeWidth="8"
            fill="transparent"
            className="text-muted/30"
          />
          <motion.circle
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            cx="64"
            cy="64"
            r={radius}
            stroke="currentColor"
            strokeWidth="8"
            strokeLinecap="round"
            fill="transparent"
            strokeDasharray={circumference}
            className="text-primary"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <motion.span 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-xl font-bold font-mono"
          >
            {displayPercentage}%
          </motion.span>
          <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Used</span>
        </div>
      </div>

      <div className="text-center">
        <h4 className="text-sm font-semibold mb-1 flex items-center justify-center gap-2">
          <PieChart className="w-4 h-4 text-primary" />
          Cloud Storage Usage
        </h4>
        <p className="text-xs text-muted-foreground font-mono">
          {usedGb.toFixed(1)} GB / {totalGb.toFixed(1)} GB
        </p>
      </div>

      <AnimatePresence>
        {isHovered && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            className="absolute inset-0 bg-card/95 backdrop-blur-sm z-10 p-6 flex flex-col justify-center gap-4"
          >
            <h5 className="text-[10px] font-bold uppercase tracking-widest text-primary border-b border-border pb-2">Space Breakdown</h5>
            <div className="space-y-3">
              {breakdown.map((item) => (
                <div key={item.label} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <item.icon className={`w-3 h-3 ${item.color}`} />
                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-tight">{item.label}</span>
                  </div>
                  <span className="text-[10px] font-mono font-bold">{item.value}</span>
                </div>
              ))}
            </div>
            <div className="mt-2 pt-2 border-t border-border flex items-center justify-between">
              <span className="text-[9px] font-bold text-muted-foreground uppercase">Available</span>
              <span className="text-[9px] font-mono font-bold text-success">{(totalGb - usedGb).toFixed(1)} GB</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <button className="w-full py-2 bg-secondary text-secondary-foreground rounded-lg text-xs font-bold uppercase tracking-wider hover:bg-secondary/80 transition-colors z-0">
        Manage Storage
      </button>
    </div>
  );
}
