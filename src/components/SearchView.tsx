import { Search as SearchIcon, Filter, Clock, Tag as TagIcon, X, FileText, ChevronRight, History, Mic, MicOff, QrCode } from 'lucide-react';
import { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useVoiceInput } from '../hooks/useVoiceInput';
import { QRScanner } from './QRScanner';
import { useToast } from './Toast';

const recentSearches = [
  'A42 Survey Centerline',
  'Employee Contract sarah',
  'CAD Blueprint Site B',
  'Compliance ISO Irish',
];

import { Document } from './DocumentsView';

interface SearchViewProps {
  initialQuery?: string;
  documents?: Document[];
  onPreview?: (name: string, id: string) => void;
}

export function SearchView({ initialQuery = '', documents = [], onPreview }: SearchViewProps) {
  const [query, setQuery] = useState(initialQuery);
  const [isQRScannerOpen, setIsQRScannerOpen] = useState(false);
  const { showToast } = useToast();

  useEffect(() => {
    setQuery(initialQuery);
  }, [initialQuery]);

  const handleVoiceResult = useCallback((text: string) => {
    setQuery(text);
  }, []);

  const handleQRScan = useCallback((text: string) => {
    setQuery(text);
    showToast(`QR Code Scanned: ${text}`, 'success');
  }, [showToast]);

  const { isListening, startListening } = useVoiceInput(handleVoiceResult);
  
  return (
    <div className="max-w-4xl mx-auto space-y-12 animate-in fade-in slide-in-from-top-4 duration-500">
      <AnimatePresence>
        {isQRScannerOpen && (
          <QRScanner onScan={handleQRScan} onClose={() => setIsQRScannerOpen(false)} />
        )}
      </AnimatePresence>
      <div className="space-y-6">
        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tight text-white">Advanced Archive Search</h2>
          <p className="text-muted-foreground mt-2">Index covering over 4,281 encrypted documents.</p>
        </div>

        <div className="relative group">
          <div className="absolute inset-0 bg-primary/20 blur-[40px] rounded-full opacity-0 group-focus-within:opacity-100 transition-opacity" />
          <div className="relative flex items-center gap-2 p-2 bg-card border-2 border-border/50 rounded-2xl group-focus-within:border-primary/50 transition-all shadow-2xl">
            <SearchIcon className="w-5 h-5 ml-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
            <input 
              type="text" 
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by name, tag, department, or coordinates..."
              className="flex-1 bg-transparent border-none outline-none text-lg px-2 text-white placeholder:text-muted-foreground/50"
            />
            <button 
              onClick={() => setIsQRScannerOpen(true)}
              className="p-3 text-muted-foreground hover:bg-sidebar-accent rounded-xl transition-all"
              title="QR Scan Label"
            >
              <QrCode className="w-5 h-5" />
            </button>
            <button 
              onClick={startListening}
              className={`p-3 rounded-xl transition-all ${isListening ? 'bg-rose-500/20 text-rose-500 animate-pulse' : 'hover:bg-sidebar-accent text-muted-foreground'}`}
              title={isListening ? 'Listening...' : 'Voice search'}
            >
              {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
            </button>
            <button className="bg-primary text-primary-foreground px-6 py-2.5 rounded-xl font-bold uppercase tracking-wider text-[11px] shadow-lg group-active:scale-95 transition-all">
              Search
            </button>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-3">
          <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/60 mr-2">Search Filters:</span>
          {['Documents', 'Projects', 'Tags', 'Coord Maps', 'Archive V1'].map((chip) => (
            <button key={chip} className="px-3 py-1.5 rounded-full border border-border hover:border-primary/50 hover:bg-primary/5 transition-all text-[11px] font-bold text-muted-foreground hover:text-primary">
              {chip}
            </button>
          ))}
        </div>
      </div>

      {query.trim() ? (
        <div className="space-y-6 text-left">
          <div className="flex items-center justify-between border-b border-border/30 pb-3">
            <h3 className="text-[11px] font-black uppercase tracking-[0.25em] text-primary">
              Real-time Search Results ({documents.filter(doc => 
                doc.name.toLowerCase().includes(query.toLowerCase()) ||
                doc.tags.some(tag => tag.toLowerCase().includes(query.toLowerCase())) ||
                doc.type.toLowerCase().includes(query.toLowerCase())
              ).length})
            </h3>
            <span className="text-[10px] font-mono text-muted-foreground">Index sync: Live</span>
          </div>
          
          {documents.filter(doc => 
            doc.name.toLowerCase().includes(query.toLowerCase()) ||
            doc.tags.some(tag => tag.toLowerCase().includes(query.toLowerCase())) ||
            doc.type.toLowerCase().includes(query.toLowerCase())
          ).length > 0 ? (
            <div className="space-y-3">
              {documents.filter(doc => 
                doc.name.toLowerCase().includes(query.toLowerCase()) ||
                doc.tags.some(tag => tag.toLowerCase().includes(query.toLowerCase())) ||
                doc.type.toLowerCase().includes(query.toLowerCase())
              ).map((doc) => (
                <div 
                  key={doc.id}
                  onClick={() => onPreview?.(doc.name, doc.id)}
                  className="flex items-center justify-between p-4 rounded-xl bg-card border border-border/50 hover:border-primary/30 transition-all cursor-pointer group"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 group-hover:bg-primary/20 transition-colors">
                      <FileText className="w-5 h-5 text-primary" />
                    </div>
                    <div className="text-left">
                      <h4 className="text-sm font-bold text-white group-hover:text-primary transition-colors truncate max-w-sm sm:max-w-md">
                        {doc.name}
                      </h4>
                      <div className="flex flex-wrap items-center gap-2 mt-1">
                        <span className="text-[10px] text-muted-foreground font-mono">{doc.size}</span>
                        <span className="text-[10px] text-muted-foreground">•</span>
                        <span className="text-[10px] text-muted-foreground font-mono">{doc.date}</span>
                        {doc.tags.slice(0, 3).map((tag, tIdx) => (
                          <span key={tIdx} className="px-1.5 py-0.5 bg-sidebar-accent text-[8px] uppercase tracking-tighter text-muted-foreground font-bold rounded">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground group-hover:text-primary transition-colors">View</span>
                    <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-all group-hover:translate-x-1" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-16 text-center rounded-2xl bg-card border border-border/30">
              <div className="w-16 h-16 bg-muted/20 border-2 border-dashed border-border rounded-full flex items-center justify-center mx-auto mb-4">
                <FileText className="w-8 h-8 text-muted-foreground/30" />
              </div>
              <h4 className="text-sm font-bold text-white/85">No matching documents found</h4>
              <p className="text-xs text-muted-foreground mt-2 max-w-xs mx-auto leading-relaxed">
                We couldn't find any CAD files or reports matching "{query}". Verify spelling or enter tags like "CAD", "PDF", "Mogadishu".
              </p>
            </div>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          <div className="space-y-6">
            <h3 className="text-[11px] font-bold uppercase tracking-[0.3em] text-primary flex items-center gap-2">
              <History className="w-4 h-4" />
              Recent Searches
            </h3>
            <div className="space-y-2">
              {recentSearches.map((search) => (
                <button 
                  key={search} 
                  onClick={() => setQuery(search)}
                  className="w-full flex items-center justify-between p-4 rounded-xl border border-border/50 hover:bg-muted/50 transition-all text-left group"
                >
                  <span className="text-sm font-medium text-white/80 group-hover:text-primary transition-colors">{search}</span>
                  <Clock className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-6">
            <h3 className="text-[11px] font-bold uppercase tracking-[0.3em] text-accent flex items-center gap-2">
              <TagIcon className="w-4 h-4" />
              Suggested Tags
            </h3>
            <div className="grid grid-cols-2 gap-3">
              {['Engineering', 'Legal', 'Audit', 'Topological', 'CAD', 'Mogadishu', 'Hargeisa', 'Somalia'].map((tag) => (
                <button 
                  key={tag} 
                  onClick={() => setQuery(tag)}
                  className="p-3 rounded-xl bg-card border border-border/50 hover:border-accent/50 transition-all text-[11px] font-bold uppercase tracking-widest text-muted-foreground hover:text-accent flex items-center gap-2 text-left"
                >
                  <div className="w-1.5 h-1.5 rounded-full bg-accent opacity-50" />
                  {tag}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
