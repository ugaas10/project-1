import { FileText, User, RefreshCw, Upload, Clock, QrCode } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useState } from 'react';
import { QRScanner } from './QRScanner';

export interface Activity {
  id: number | string;
  type: string;
  user: string;
  file: string;
  time: string;
  icon: any;
  color: string;
  status?: string;
  desc?: string;
}

const defaultActivities: Activity[] = [
  { id: 1, type: 'upload', user: 'Admin', file: 'Q1_Financials_Final.pdf', time: '2 mins ago', icon: Upload, color: 'text-primary' },
  { id: 2, type: 'review', user: 'Sarah Wilson', file: 'Employee_Contract_V2.docx', time: '1 hour ago', icon: FileText, color: 'text-accent-foreground', status: 'Approved' },
  { id: 3, type: 'workflow', user: 'System', file: 'Workflow: Invoice #4502', time: '4 hours ago', icon: RefreshCw, color: 'text-success', status: 'Approved' },
  { id: 4, type: 'upload', user: 'James Chen', file: 'Site_Blueprint_A1.dwg', time: 'Yesterday', icon: Upload, color: 'text-primary' },
  { id: 5, type: 'workflow', user: 'Admin', file: 'Workflow: Policy Update', time: '1 day ago', icon: RefreshCw, color: 'text-pending', status: 'Pending' },
  { id: 6, type: 'delete', user: 'Admin', file: 'Old_Archive_2020.zip', time: '2 days ago', icon: Clock, color: 'text-destructive' },
];

export function RecentActivity({ 
  activities = defaultActivities,
  onPreview,
  onQRScan
}: { 
  activities?: Activity[];
  onPreview?: (fileName: string) => void;
  onQRScan?: (decodedText: string) => void;
}) {
  const [isScannerOpen, setIsScannerOpen] = useState(false);

  return (
    <div className="rounded-xl bg-card border border-border shadow-lg flex flex-col h-full">
      <div className="px-6 py-4 border-b border-border flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h3 className="font-bold tracking-tight">Recent Activity</h3>
          <button 
            type="button"
            onClick={() => setIsScannerOpen(true)}
            className="p-1 cursor-pointer hover:bg-muted text-primary hover:text-primary-foreground rounded-lg transition-colors border border-border/40"
            title="Scan Activity QR"
          >
            <QrCode className="w-3.5 h-3.5 text-primary" />
          </button>
        </div>
        <button className="text-xs font-bold uppercase tracking-wider text-primary hover:underline">View All</button>
      </div>

      <AnimatePresence>
        {isScannerOpen && (
          <QRScanner 
            onScan={(text) => {
              onQRScan?.(text);
              setIsScannerOpen(false);
            }} 
            onClose={() => setIsScannerOpen(false)} 
          />
        )}
      </AnimatePresence>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-4 max-h-[400px]">
        {activities.map((activity, index) => {
          const Icon = activity.icon;
          return (
            <motion.div
              key={activity.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              onClick={() => onPreview?.(activity.file)}
              className="flex items-start gap-4 p-3 rounded-lg hover:bg-muted/50 transition-colors group cursor-pointer"
            >
              <div className={`mt-1 w-8 h-8 rounded-full bg-muted flex items-center justify-center shrink-0`}>
                <Icon className={`w-4 h-4 ${activity.color}`} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-0.5">
                  <span className="text-sm font-semibold truncate group-hover:text-primary transition-colors">
                    {activity.file}
                  </span>
                  {activity.status && (
                    <span className={`
                      text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider border
                      ${activity.status === 'Approved' ? 'bg-success/10 text-success border-success/30' : 
                        activity.status === 'Pending' ? 'bg-pending/10 text-pending border-pending/30' : 
                        'bg-destructive/10 text-destructive border-destructive/30'}
                    `}>
                      {activity.status}
                    </span>
                  )}
                  <span className="text-[10px] text-muted-foreground whitespace-nowrap ml-2">
                    {activity.time}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
                  <User className="w-3 h-3" />
                  <span>{activity.user}</span>
                  <span className="mx-1">•</span>
                  <span className="capitalize">{activity.type}</span>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
