import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  PieChart, 
  Pie, 
  Cell,
  LineChart,
  Line
} from 'recharts';
import { motion } from 'motion/react';
import { 
  TrendingUp, 
  Users, 
  Briefcase, 
  FileText, 
  ArrowUpRight, 
  PieChart as PieChartIcon,
  Activity,
  Calendar
} from 'lucide-react';
import { useLanguage } from '../lib/i18n';

const projectStatusData = [
  { name: 'Active', value: 3, color: '#06b6d4' },
  { name: 'Completed', value: 1, color: '#10b981' },
  { name: 'Pending', value: 1, color: '#fbbf24' },
];

const timelineData = [
  { month: 'Jan', projects: 1, docs: 12 },
  { month: 'Feb', projects: 2, docs: 25 },
  { month: 'Mar', projects: 2, docs: 18 },
  { month: 'Apr', projects: 3, docs: 42 },
  { month: 'May', projects: 4, docs: 35 },
];

const budgetData = [
  { name: 'Surveying', spent: 15000, budget: 20000 },
  { name: 'Legal', spent: 5000, budget: 10000 },
  { name: 'Equipment', spent: 12000, budget: 15000 },
  { name: 'Admin', spent: 3000, budget: 5000 },
];

export function AnalyticsView() {
  const { t } = useLanguage();

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2 uppercase font-sans">
            <Activity className="w-6 h-6 text-primary" />
            System Analytics Hub
          </h2>
          <p className="text-sm text-muted-foreground mt-1">Advanced data visualization for project metrics and system health.</p>
        </div>
        <div className="flex items-center gap-3">
           <div className="bg-card border border-border rounded-xl px-4 py-2 flex items-center gap-3">
             <Calendar className="w-4 h-4 text-muted-foreground" />
             <span className="text-xs font-bold text-white uppercase tracking-widest">Last 30 Days</span>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {/* Project Pipeline Chart */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card p-6 rounded-2xl border border-border/50 shadow-xl"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-sm font-bold uppercase tracking-widest text-foreground/70">Project Pipeline</h3>
            <PieChartIcon className="w-4 h-4 text-primary" />
          </div>
          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={projectStatusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {projectStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#18181b', border: '1px solid #27272a', borderRadius: '8px' }}
                  itemStyle={{ color: '#fff' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center gap-6 mt-4">
            {projectStatusData.map((entry) => (
              <div key={entry.name} className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
                <span className="text-[10px] font-bold text-muted-foreground uppercase">{entry.name}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Activity Timeline Chart */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="lg:col-span-2 bg-card p-6 rounded-2xl border border-border/50 shadow-xl"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-sm font-bold uppercase tracking-widest text-foreground/70">Historical Growth</h3>
            <TrendingUp className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={timelineData}>
                <defs>
                  <linearGradient id="colorDocs" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                <XAxis 
                  dataKey="month" 
                  stroke="#71717a" 
                  fontSize={10} 
                  tickLine={false} 
                  axisLine={false} 
                />
                <YAxis 
                  stroke="#71717a" 
                  fontSize={10} 
                  tickLine={false} 
                  axisLine={false} 
                />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#18181b', border: '1px solid #27272a', borderRadius: '8px' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="docs" 
                  stroke="#06b6d4" 
                  strokeWidth={3}
                  fillOpacity={1} 
                  fill="url(#colorDocs)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Budget Allocation */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-card p-6 rounded-2xl border border-border/50 shadow-xl"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-sm font-bold uppercase tracking-widest text-foreground/70">Resource Utilization</h3>
            <Briefcase className="w-4 h-4 text-amber-500" />
          </div>
          <div className="space-y-6">
            {budgetData.map((item) => (
              <div key={item.name} className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-white">{item.name}</span>
                  <span className="text-[10px] font-mono text-muted-foreground">${item.spent} / ${item.budget}</span>
                </div>
                <div className="h-1.5 w-full bg-sidebar rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${(item.spent / item.budget) * 100}%` }}
                    className="h-full bg-primary"
                  />
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* System Activity Table Snippet */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="lg:col-span-2 bg-card p-6 rounded-2xl border border-border/50 shadow-xl"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-sm font-bold uppercase tracking-widest text-foreground/70">Top Performing Nodes</h3>
            <ArrowUpRight className="w-4 h-4 text-muted-foreground" />
          </div>
          <div className="space-y-4">
            {[
              { site: 'Highway A42', lead: 'Ahmed Ali', efficiency: '94%', trend: 'up' },
              { site: 'Commercial Complex', lead: 'Sarah J.', efficiency: '78%', trend: 'down' },
              { site: 'Riverside Mapping', lead: 'Hassan M.', efficiency: '86%', trend: 'up' },
              { site: 'Berbera Industrial', lead: 'Aisha K.', efficiency: '99%', trend: 'up' },
            ].map((node) => (
              <div key={node.site} className="flex items-center justify-between p-3 rounded-xl bg-sidebar/30 border border-border/20">
                <div className="flex items-center gap-4">
                  <div className="w-2 h-2 rounded-full bg-primary" />
                  <div>
                    <span className="text-xs font-bold text-white">{node.site}</span>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-widest mt-0.5">{node.lead}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                   <span className="text-xs font-black text-white">{node.efficiency}</span>
                   <div className={`p-1.5 rounded-lg ${node.trend === 'up' ? 'text-emerald-400 bg-emerald-500/10' : 'text-rose-400 bg-rose-500/10'}`}>
                      <TrendingUp className={`w-3.5 h-3.5 ${node.trend === 'down' ? 'rotate-180' : ''}`} />
                   </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Footer Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Avg Latency', value: '42ms', icon: Activity },
          { label: 'Uptime', value: '99.98%', icon: TrendingUp },
          { label: 'Users Active', value: '12', icon: Users },
          { label: 'Storage Sync', value: 'Instant', icon: RefreshCw },
        ].map((m) => (
          <div key={m.label} className="p-4 rounded-xl bg-sidebar/20 border border-border/30 flex items-center gap-3">
             <div className="p-2 rounded-lg bg-primary/10">
                <m.icon className="w-4 h-4 text-primary" />
             </div>
             <div>
                <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">{m.label}</p>
                <p className="text-sm font-black text-white">{m.value}</p>
             </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function RefreshCw(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
      <path d="M21 3v5h-5" />
      <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
      <path d="M3 21v-5h5" />
    </svg>
  );
}
