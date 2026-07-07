import { CheckSquare, Clock, User, FileText, ChevronRight, X, Check, Filter } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useState, useEffect } from 'react';
import { useToast } from './Toast';
import { useLanguage } from '../lib/i18n';
import { supabase, handleSupabaseError, OperationType } from '../lib/supabase';

export function ApprovalsView() {
  const [queue, setQueue] = useState<any[]>([]);
  const { showToast } = useToast();
  const { language } = useLanguage();

  useEffect(() => {
    const fetchApprovals = async () => {
      try {
        const { data, error } = await supabase.from('approvals').select('*');
        if (error) throw error;
        setQueue(data ? data.map(d => ({ id: d.id, ...(d.data as any) })) : []);
      } catch (err) {
        handleSupabaseError(err, OperationType.LIST, 'approvals');
      }
    };
    
    fetchApprovals();
    
    const channel = supabase.channel('public:approvals')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'approvals' }, () => {
        fetchApprovals();
      }).subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  const handleAction = async (id: string, approved: boolean, docName: string) => {
    try {
      await supabase.from('approvals').delete().eq('id', id);
      const title = approved
        ? (language === 'so' ? `Dukumiintiga "${docName}" waa la ansaxiyay!` : `Document "${docName}" approved successfully!`)
        : (language === 'so' ? `Dukumiintiga "${docName}" waa la diiday!` : `Document "${docName}" has been rejected.`);
      showToast(title, approved ? 'success' : 'danger');
    } catch (err) {
      console.error("Firestore approval action error:", err);
      showToast('Operation failed', 'error');
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <CheckSquare className="w-6 h-6 text-amber-500" />
            Decision Queue
          </h2>
          <p className="text-sm text-muted-foreground mt-1">Pending sign-offs and workflow approvals for active projects.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right mr-4 hidden sm:block">
            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Managerial Inbox</p>
            <p className="text-sm font-bold text-white">{queue.length} Awaiting Actions</p>
          </div>
          <button className="p-2.5 rounded-xl border border-border hover:bg-muted transition-all text-muted-foreground">
            <Filter className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="bg-card border border-border/50 rounded-2xl overflow-hidden shadow-2xl">
        <div className="px-6 py-3 bg-muted/20 border-b border-border flex items-center justify-between text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
          <span>Document Details</span>
          <div className="flex items-center gap-32">
            <span className="hidden md:block w-32">Site Project</span>
            <span className="hidden lg:block w-32">Urgency</span>
            <span className="w-32 text-right">Actions</span>
          </div>
        </div>

        <div className="divide-y divide-border/50">
          <AnimatePresence mode="popLayout">
            {queue.map((item) => (
              <motion.div 
                key={item.id}
                layout
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="group px-6 py-5 flex items-center justify-between hover:bg-sidebar-accent/30 transition-all"
              >
                <div className="flex items-center gap-4 flex-1">
                  <div className={`p-2.5 rounded-xl ${
                    item.urgency === 'high' ? 'bg-rose-500/10 text-rose-500' : 
                    item.urgency === 'medium' ? 'bg-amber-500/10 text-amber-500' : 
                    'bg-primary/10 text-primary'
                  }`}>
                    <FileText className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-[15px] font-bold text-white group-hover:text-primary transition-colors truncate">{item.doc}</h4>
                    <div className="flex items-center gap-3 mt-1 text-[11px] text-muted-foreground">
                      <span className="flex items-center gap-1"><User className="w-3 h-3" /> {item.user}</span>
                      <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {item.date}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-32 text-right">
                  <span className="hidden md:block w-32 text-xs font-bold text-white/70 italic truncate">
                    {item.project}
                  </span>
                  <div className="hidden lg:block w-32">
                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase border ${
                      item.urgency === 'high' ? 'bg-rose-500/10 text-rose-500 border-rose-500/20' : 
                      item.urgency === 'medium' ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' : 
                      'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
                    }`}>
                      {item.urgency}
                    </span>
                  </div>
                  <div className="w-32 flex items-center justify-end gap-2">
                    <button 
                      onClick={() => handleAction(item.id, true, item.doc)}
                      className="p-2 rounded-lg bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500 hover:text-white transition-all shadow-lg active:scale-[0.98]"
                      title="Approve"
                    >
                      <Check className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => handleAction(item.id, false, item.doc)}
                      className="p-2 rounded-lg bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white transition-all shadow-lg active:scale-[0.98]"
                      title="Reject"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {queue.length === 0 && (
          <div className="py-24 flex flex-col items-center justify-center text-center p-8">
            <div className="w-20 h-20 rounded-full bg-emerald-500/10 flex items-center justify-center mb-6 border border-emerald-500/20">
              <Check className="w-10 h-10 text-emerald-500" />
            </div>
            <h3 className="text-xl font-bold text-white">Queue Cleared</h3>
            <p className="text-muted-foreground max-w-xs mt-2 text-sm leading-relaxed">
              All pending project documents have been successfully reviewed and processed.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
