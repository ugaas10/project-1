import { Cloud, HardDrive, Server, Shield, Activity, ArrowUpRight, BarChart3, Database } from 'lucide-react';
import { motion } from 'motion/react';
import { StorageCard } from './StorageCard';

const servers = [
  { name: 'Primary Node (Somalia)', status: 'online', load: '12%', region: 'Africa-East', icon: Server },
  { name: 'Backup Archive (Ireland)', status: 'online', load: '5%', region: 'EU-West-1', icon: Database },
  { name: 'AI Processing Hub', status: 'maintenance', load: '0%', region: 'Global-Grid', icon: Activity },
];

export function StorageView() {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
          <Cloud className="w-6 h-6 text-primary" />
          Cloud Infrastructure
        </h2>
        <p className="text-sm text-muted-foreground mt-1">Monitor server health and secure storage allocation.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1">
          <StorageCard usedGb={84.2} totalGb={256} />
        </div>
        
        <div className="lg:col-span-2 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-5 rounded-2xl bg-card border border-border/50 flex flex-col justify-between group cursor-default">
              <div className="flex items-center justify-between mb-4">
                <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400">
                  <Shield className="w-5 h-5" />
                </div>
                <ArrowUpRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white uppercase tracking-tight">Security Protocol</h4>
                <p className="text-2xl font-bold font-mono mt-1">AES-256</p>
                <p className="text-[10px] font-bold text-success uppercase tracking-widest mt-1">Active Compliance</p>
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-card border border-border/50 flex flex-col justify-between group cursor-default">
              <div className="flex items-center justify-between mb-4">
                <div className="p-2.5 rounded-xl bg-primary/10 text-primary">
                  <BarChart3 className="w-5 h-5" />
                </div>
                <ArrowUpRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white uppercase tracking-tight">Daily Bandwidth</h4>
                <p className="text-2xl font-bold font-mono mt-1">1.2 TB</p>
                <p className="text-[10px] font-bold text-primary uppercase tracking-widest mt-1">Optimized Load</p>
              </div>
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-card border border-border/50">
            <h3 className="text-[11px] font-bold uppercase tracking-[0.2em] text-muted-foreground mb-4">Network Status Nodes</h3>
            <div className="space-y-3">
              {servers.map((server) => (
                <div key={server.name} className="flex items-center justify-between p-3 rounded-xl hover:bg-muted/30 transition-colors border border-transparent hover:border-border">
                  <div className="flex items-center gap-4">
                    <div className={`p-2 rounded-lg ${server.status === 'online' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-500'}`}>
                      <server.icon className="w-4 h-4" />
                    </div>
                    <div>
                      <h5 className="text-[13px] font-bold text-white">{server.name}</h5>
                      <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-tight">{server.region}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-2 text-[10px] font-bold uppercase">
                      <span className={`w-1.5 h-1.5 rounded-full ${server.status === 'online' ? 'bg-emerald-500' : 'bg-amber-500'} animate-pulse`} />
                      <span className={server.status === 'online' ? 'text-emerald-400' : 'text-amber-500'}>{server.status}</span>
                    </div>
                    <p className="text-[10px] font-mono text-muted-foreground mt-0.5">Load: {server.load}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
