import { motion } from 'motion/react';
import { 
  Calendar, 
  ChevronLeft, 
  ChevronRight, 
  Clock, 
  MapPin, 
  User,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { useLanguage } from '../lib/i18n';

interface Milestone {
  id: string;
  title: string;
  project: string;
  date: string;
  status: 'completed' | 'in-progress' | 'delayed';
  lead: string;
}

const milestones: Milestone[] = [
  { id: '1', title: 'Topographical Survey', project: 'Highway A42 Expansion', date: '2026-05-15', status: 'completed', lead: 'Ahmed Ali' },
  { id: '2', title: 'Legal Boundaries Finalization', project: 'Commercial Hub', date: '2026-05-28', status: 'in-progress', lead: 'Sarah J.' },
  { id: '3', title: 'Utility Mapping', project: 'Highway A42 Expansion', date: '2026-06-05', status: 'in-progress', lead: 'Ahmed Ali' },
  { id: '4', title: 'Soil Analysis', project: 'Industrial Park', date: '2026-06-12', status: 'delayed', lead: 'Hassan M.' },
  { id: '5', title: 'Final CAD Submission', project: 'Commercial Hub', date: '2026-06-20', status: 'in-progress', lead: 'Sarah J.' },
];

export function TimelineView() {
  const { t } = useLanguage();

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2 uppercase font-sans">
            <Clock className="w-6 h-6 text-primary" />
            Project Schedule & Timelines
          </h2>
          <p className="text-sm text-muted-foreground mt-1">Monitor project milestones and delivery phases across all active sites.</p>
        </div>
        
        <div className="flex items-center gap-2">
           <button className="p-2 rounded-xl bg-card border border-border hover:bg-sidebar transition-colors">
             <ChevronLeft className="w-5 h-5 text-white" />
           </button>
           <div className="px-4 py-2 rounded-xl bg-primary/10 border border-primary/20">
             <span className="text-sm font-bold text-primary uppercase tracking-widest">Q2 2026</span>
           </div>
           <button className="p-2 rounded-xl bg-card border border-border hover:bg-sidebar transition-colors">
             <ChevronRight className="w-5 h-5 text-white" />
           </button>
        </div>
      </div>

      <div className="relative">
        {/* Timeline Path */}
        <div className="absolute left-[19px] top-6 bottom-6 w-0.5 bg-border/50 hidden md:block" />

        <div className="space-y-12">
          {milestones.map((m, idx) => (
            <motion.div 
              key={m.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="relative flex flex-col md:flex-row gap-6 md:gap-12 pl-10 md:pl-0"
            >
              {/* Dot Indicator */}
              <div className="absolute left-[-1.5px] md:left-[10.5px] top-1 w-10 h-10 -translate-x-1/2 flex items-center justify-center">
                 <div className={`w-4 h-4 rounded-full border-4 border-background ${
                   m.status === 'completed' ? 'bg-emerald-500' : 
                   m.status === 'delayed' ? 'bg-rose-500' : 'bg-primary'
                 } z-10`} />
              </div>

              {/* Date Label (Desktop Only) */}
              <div className="hidden md:block w-32 pt-1 text-right">
                <span className="text-xs font-black text-white/50 uppercase tracking-tighter">{m.date}</span>
              </div>

              {/* Content Card */}
              <div className="flex-1">
                <div className="bg-card border border-border/50 rounded-2xl p-6 shadow-xl hover:border-primary/50 transition-all group">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h4 className="text-lg font-bold text-white group-hover:text-primary transition-colors">{m.title}</h4>
                        {m.status === 'completed' && <CheckCircle2 className="w-4 h-4 text-emerald-500" />}
                        {m.status === 'delayed' && <AlertCircle className="w-4 h-4 text-rose-500" />}
                      </div>
                      <div className="flex items-center gap-4 text-xs font-medium text-muted-foreground uppercase tracking-widest">
                        <span className="flex items-center gap-1">
                           <MapPin className="w-3 h-3" />
                           {m.project}
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-col items-start md:items-end gap-2">
                       <div className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                         m.status === 'completed' ? 'bg-emerald-500/10 text-emerald-400' :
                         m.status === 'delayed' ? 'bg-rose-500/10 text-rose-400' :
                         'bg-primary/10 text-primary'
                       }`}>
                         {m.status.replace('-', ' ')}
                       </div>
                       <div className="flex items-center gap-2 text-xs text-muted-foreground bg-sidebar/30 px-3 py-1.5 rounded-xl border border-border/20">
                          <User className="w-3.5 h-3.5" />
                          <span className="font-bold text-white/70">{m.lead}</span>
                       </div>
                    </div>
                  </div>

                  <div className="mt-6 pt-6 border-t border-border/30 flex items-center justify-between">
                     <div className="flex -space-x-2">
                        {[1, 2, 3].map(i => (
                          <div key={i} className="w-8 h-8 rounded-full border-2 border-card bg-sidebar flex items-center justify-center text-[10px] font-bold text-white">
                            {String.fromCharCode(64 + i)}
                          </div>
                        ))}
                     </div>
                     <button className="text-xs font-bold text-primary uppercase tracking-widest hover:underline">
                       View Details
                     </button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
