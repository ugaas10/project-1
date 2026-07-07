import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Settings, MapPin, User, Save, Globe, Shield, Radio, Users, History, TrendingUp, Crown, Trash2, ChevronRight, RefreshCw, Loader2 } from 'lucide-react';
import { useToast } from './Toast';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface ProjectSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: any;
}

type TabType = 'Config' | 'Team' | 'Audit';

export function ProjectSettingsModal({ isOpen, onClose, project }: ProjectSettingsModalProps) {
  const [activeTab, setActiveTab] = useState<TabType>('Config');
  const [isSyncing, setIsSyncing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    lat: '',
    lng: '',
    engineer: '',
    health: ''
  });
  
  const [teamMembers, setTeamMembers] = useState([
    { id: 1, name: 'Eng. Ahmed Ali', role: 'Lead', avatar: 'AA' },
    { id: 2, name: 'Eng. Sarah J.', role: 'Surveyor', avatar: 'SJ' },
    { id: 3, name: 'Eng. Hassan M.', role: 'Analyst', avatar: 'HM' },
    { id: 4, name: 'Eng. Aisha K.', role: 'Surveyor', avatar: 'AK' },
  ]);

  const [auditLogs] = useState([
    { id: 1, action: 'Coordinate Update', user: 'Mohamed A.', date: '2024-12-29 10:45', details: 'lat: 2.04 -> 2.05' },
    { id: 2, action: 'Lead Assigned', user: 'System', date: '2024-12-28 09:12', details: 'Eng. Ahmed Ali promoted to Lead' },
    { id: 3, action: 'Health Status Change', user: 'Sarah J.', date: '2024-12-27 15:30', details: 'On Track -> Delayed' },
    { id: 4, action: 'Project Initialized', user: 'Admin', date: '2024-12-20 08:00', details: 'Initial setup complete' },
  ]);

  const { showToast } = useToast();

  useEffect(() => {
    if (project) {
      setFormData({
        name: project.name,
        lat: project.lat.toString(),
        lng: project.lng.toString(),
        engineer: project.engineer || 'Unassigned',
        health: project.health
      });
    }
  }, [project]);

  if (!isOpen || !project) return null;

  const budgetData = [
    { name: 'Spent', value: parseInt(project.budget?.replace(/[^0-9]/g, '') || '0') },
    { name: 'Remaining', value: 100000 - parseInt(project.budget?.replace(/[^0-9]/g, '') || '0') }
  ];

  const handleSync = async () => {
    if (isSyncing) return;
    
    setIsSyncing(true);
    showToast(`Initializing deep-sync for ${project.name}...`, 'info');
    
    // Simulate multi-stage sync
    await new Promise(resolve => setTimeout(resolve, 1500));
    showToast(`Scanning coordinates [${formData.lat}, ${formData.lng}] for remote archives...`, 'info');
    
    await new Promise(resolve => setTimeout(resolve, 2000));
    showToast(`Found 4 new spatial documents matching project footprint`, 'success');
    
    setIsSyncing(false);
  };

  const handleSave = () => {
    showToast(`Configuration updated for ${project.name}`, 'success');
    onClose();
  };

  const promoteToLead = (id: number) => {
    setTeamMembers(prev => prev.map(m => ({
      ...m,
      role: m.id === id ? 'Lead' : (m.role === 'Lead' ? 'Surveyor' : m.role)
    })));
    showToast(`Lead engineer role updated`, 'info');
  };

  const removeMember = (id: number) => {
    setTeamMembers(prev => prev.filter(m => m.id !== id));
    showToast(`Member removed from project team`, 'info');
  };

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
        className="bg-card border border-border rounded-2xl shadow-2xl w-full max-w-2xl relative z-[5001] overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="p-6 border-b border-border flex items-center justify-between bg-muted/20">
          <div className="flex items-center gap-3">
             <div className="p-2 bg-primary/10 rounded-lg">
                <Settings className="w-5 h-5 text-primary" />
             </div>
             <div>
                <h3 className="text-xl font-bold text-white tracking-tight">Project Management</h3>
                <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest mt-0.5">
                   {project.name} • Internal Operations
                </p>
             </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-muted text-muted-foreground transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex px-8 border-b border-border bg-sidebar/50">
          {[
            { id: 'Config', label: 'Configuration', icon: Settings },
            { id: 'Team', label: 'Team Members', icon: Users },
            { id: 'Audit', label: 'Change Log', icon: History },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as TabType)}
              className={`flex items-center gap-2 px-6 py-4 text-[10px] font-bold uppercase tracking-widest transition-all relative ${
                activeTab === tab.id ? 'text-primary' : 'text-muted-foreground hover:text-white'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
              {activeTab === tab.id && (
                <motion.div 
                  layoutId="active-settings-tab"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"
                />
              )}
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-8 scrollbar-thin">
          <AnimatePresence mode="wait">
            {activeTab === 'Config' && (
              <motion.div 
                key="config"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                className="space-y-8"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Spatial Section */}
                  <div className="space-y-6">
                    <h4 className="text-[10px] font-bold uppercase tracking-widest text-primary flex items-center gap-2">
                       <Globe className="w-3.5 h-3.5" /> Spatial Coordinates
                    </h4>
                    
                    <div className="space-y-4">
                       <div className="space-y-2">
                          <label className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground">Latitude Decimal</label>
                          <div className="relative group">
                             <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/30 group-focus-within:text-primary transition-colors" />
                             <input 
                                type="text"
                                value={formData.lat}
                                onChange={(e) => setFormData(f => ({ ...f, lat: e.target.value }))}
                                className="w-full bg-sidebar border border-border rounded-xl pl-10 pr-4 py-3 text-sm text-white font-mono outline-none focus:border-primary/50"
                             />
                          </div>
                       </div>
                       <div className="space-y-2">
                          <label className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground">Longitude Decimal</label>
                          <div className="relative group">
                             <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/30 group-focus-within:text-primary transition-colors" />
                             <input 
                                type="text"
                                value={formData.lng}
                                onChange={(e) => setFormData(f => ({ ...f, lng: e.target.value }))}
                                className="w-full bg-sidebar border border-border rounded-xl pl-10 pr-4 py-3 text-sm text-white font-mono outline-none focus:border-primary/50"
                             />
                          </div>
                       </div>
                    </div>

                    <div className="p-4 rounded-xl bg-primary/5 border border-primary/10 space-y-3">
                       <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 text-primary font-bold text-[9px] uppercase tracking-widest leading-none">
                             <Radio className="w-3 h-3 animate-pulse" /> Live Telemetry
                          </div>
                          <button 
                            disabled={isSyncing}
                            onClick={handleSync}
                            className="flex items-center gap-1.5 text-[9px] font-bold uppercase text-primary hover:text-white transition-colors disabled:opacity-50"
                          >
                             {isSyncing ? (
                               <Loader2 className="w-3 h-3 animate-spin" />
                             ) : (
                               <RefreshCw className="w-3 h-3" />
                             )}
                             Force Sync
                          </button>
                       </div>
                       <p className="text-[10px] text-muted-foreground leading-relaxed">Coordinates synchronize with GNSS hardware in real-time. Use sync to poll for remote updates.</p>
                    </div>
                  </div>

                  {/* Budget & Health Section */}
                  <div className="space-y-6">
                    <h4 className="text-[10px] font-bold uppercase tracking-widest text-primary flex items-center gap-2">
                       <TrendingUp className="w-3.5 h-3.5" /> Budget Analysis
                    </h4>

                    {/* Recharts Bar Chart */}
                    <div className="h-40 w-full bg-sidebar/30 rounded-xl border border-border/50 p-4">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={budgetData} layout="vertical" margin={{ left: 0, right: 20 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" horizontal={false} />
                          <XAxis type="number" hide />
                          <YAxis 
                            dataKey="name" 
                            type="category" 
                            axisLine={false} 
                            tickLine={false}
                            tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 'bold' }}
                            width={70}
                          />
                          <Tooltip 
                            cursor={{ fill: 'transparent' }}
                            contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #ffffff10', borderRadius: '12px', fontSize: '10px' }}
                            itemStyle={{ color: '#fff' }}
                          />
                          <Bar dataKey="value" radius={[0, 8, 8, 0]} barSize={24}>
                            {budgetData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={index === 0 ? '#06b6d4' : '#ffffff10'} />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>

                    <div className="space-y-4">
                       <div className="space-y-2">
                          <label className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground">Health Status Override</label>
                          <div className="grid grid-cols-2 gap-2">
                             {['On Track', 'Delayed'].map(h => (
                                <button 
                                   key={h}
                                   onClick={() => setFormData(f => ({ ...f, health: h }))}
                                   className={`py-3 rounded-xl border text-[10px] font-bold uppercase tracking-widest transition-all ${
                                      formData.health === h 
                                         ? 'bg-primary/20 border-primary text-primary shadow-[0_0_15px_rgba(6,182,212,0.2)]' 
                                         : 'bg-sidebar border-border text-muted-foreground hover:bg-muted'
                                   }`}
                                >
                                   {h}
                                </button>
                             ))}
                          </div>
                       </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'Team' && (
              <motion.div 
                key="team"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                className="space-y-6"
              >
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-[10px] font-bold uppercase tracking-widest text-primary flex items-center gap-2">
                    <Users className="w-3.5 h-3.5" /> Project Task Force
                  </h4>
                  <button className="text-[9px] font-bold uppercase tracking-widest text-primary hover:underline">+ Add Member</button>
                </div>

                <div className="grid grid-cols-1 gap-3">
                  {teamMembers.map(member => (
                    <div key={member.id} className="flex items-center justify-between p-4 rounded-xl bg-sidebar/50 border border-border group hover:border-primary/20 transition-all">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-xs font-bold text-primary group-hover:bg-primary group-hover:text-white transition-all">
                          {member.avatar}
                        </div>
                        <div>
                          <h5 className="text-sm font-bold text-white leading-none">{member.name}</h5>
                          <div className="flex items-center gap-2 mt-1.5">
                            <span className={`text-[8px] font-bold uppercase px-1.5 py-0.5 rounded ${
                              member.role === 'Lead' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' : 'bg-muted text-muted-foreground'
                            }`}>
                              {member.role}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {member.role !== 'Lead' && (
                          <button 
                            onClick={() => promoteToLead(member.id)}
                            className="p-2 rounded-lg bg-sidebar border border-border hover:bg-amber-500/10 hover:text-amber-400 text-muted-foreground transition-all"
                            title="Promote to Lead"
                          >
                            <Crown className="w-3.5 h-3.5" />
                          </button>
                        )}
                        <button 
                          onClick={() => removeMember(member.id)}
                          className="p-2 rounded-lg bg-sidebar border border-border hover:bg-rose-500/10 hover:text-rose-400 text-muted-foreground transition-all"
                          title="Remove from Team"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {activeTab === 'Audit' && (
              <motion.div 
                key="audit"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                className="space-y-6"
              >
                <h4 className="text-[10px] font-bold uppercase tracking-widest text-primary flex items-center gap-2 mb-4">
                  <History className="w-3.5 h-3.5" /> System Audit Trail
                </h4>

                <div className="space-y-4">
                  {auditLogs.map(log => (
                    <div key={log.id} className="relative pl-6 pb-6 last:pb-0 border-l border-border/50">
                      <div className="absolute left-[-5px] top-0 w-2 h-2 rounded-full bg-primary shadow-[0_0_8px_rgba(6,182,212,0.5)]" />
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 mb-1">
                        <h5 className="text-xs font-bold text-white">{log.action}</h5>
                        <span className="text-[10px] font-mono text-muted-foreground">{log.date}</span>
                      </div>
                      <div className="flex items-center gap-2 text-[10px] text-muted-foreground/60">
                        <User className="w-3 h-3" />
                        <span>Performed by {log.user}</span>
                      </div>
                      <div className="mt-2 p-2.5 rounded-lg bg-sidebar/30 border border-border/50 flex items-center justify-between">
                         <span className="text-[10px] font-medium text-white/50">{log.details}</span>
                         <ChevronRight className="w-3 h-3 text-muted-foreground/30" />
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-border flex gap-4 bg-muted/10">
           <button 
             onClick={onClose}
             className="flex-1 bg-sidebar border border-border text-white py-3.5 rounded-xl font-bold uppercase tracking-widest text-[10px] hover:bg-muted transition-all"
           >
              Cancel
           </button>
           <button 
             onClick={handleSave}
             className="flex-[2] bg-primary text-primary-foreground py-3.5 rounded-xl font-bold uppercase tracking-widest text-[10px] shadow-lg hover:opacity-90 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
           >
              <Save className="w-4 h-4" /> Save Operations
           </button>
        </div>
      </motion.div>
    </div>
  );
}
