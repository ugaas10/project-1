import { useState, useEffect, useCallback } from 'react';
import { Mic, MicOff, Command as CommandIcon, X, Check, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useLanguage } from '../lib/i18n';
import { useToast } from './Toast';

interface VoiceAssistantProps {
  onCommand: (command: string, args?: string) => void;
}

export function VoiceAssistant({ onCommand }: VoiceAssistantProps) {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [lastCommand, setLastCommand] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { t, language } = useLanguage();
  const { showToast } = useToast();

  useEffect(() => {
    // Check if SpeechRecognition is supported
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    let recognition: any = null;

    if (isListening) {
      recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = language === 'so' ? 'so-SO' : 'en-US';

      recognition.onstart = () => {
        setError(null);
      };

      recognition.onresult = (event: any) => {
        const current = event.resultIndex;
        const speechTranscript = event.results[current][0].transcript;
        setTranscript(speechTranscript);

        if (event.results[current].isFinal) {
          handleCommand(speechTranscript.toLowerCase());
          setIsListening(false);
        }
      };

      recognition.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        setError(event.error);
        setIsListening(false);
      };

      recognition.start();
    }

    return () => {
      if (recognition) {
        recognition.stop();
      }
    };
  }, [isListening, language]);

  const handleCommand = useCallback((text: string) => {
    // Normalize text
    const cleanText = text.trim();
    console.log('Voice Command Received:', cleanText);

    // Command mapping
    const commands: Record<string, { action: string, pattern: RegExp }> = {
      // English Commands
      dashboard: { action: 'dashboard', pattern: /open dashboard|go to dashboard/i },
      projects: { action: 'projects', pattern: /open projects|go to projects/i },
      map: { action: 'map', pattern: /open map|show map|map view/i },
      docs: { action: 'docs', pattern: /open documents|show documents/i },
      files: { action: 'files', pattern: /open files|show files/i },
      storage: { action: 'storage', pattern: /open storage|show storage/i },
      search: { action: 'search', pattern: /open search|go to search/i },
      approvals: { action: 'approvals', pattern: /open approvals|show approvals/i },
      ai: { action: 'ai', pattern: /open ai|talk to ai|ai assistant/i },
      settings: { action: 'settings', pattern: /open settings|go to settings/i },
      admin: { action: 'admin', pattern: /open admin|go to admin/i },
      upload: { action: 'upload', pattern: /upload new document|upload file/i },
      
      // Somali Commands
      so_dashboard: { action: 'dashboard', pattern: /fur dashboard|u tag dashboard/i },
      so_projects: { action: 'projects', pattern: /fur mashaariicda|mashaariicda/i },
      so_map: { action: 'map', pattern: /fur khariidadda|itusi khariidada/i },
      so_docs: { action: 'docs', pattern: /fur dukumiintiyada|dukumiintiyada/i },
      so_files: { action: 'files', pattern: /fur faylasha|faylasha/i },
      so_storage: { action: 'storage', pattern: /fur kaydka|kaydka daruurta/i },
      so_search: { action: 'search', pattern: /wax raadi|raadi/i },
      so_approvals: { action: 'approvals', pattern: /fur anshaxinta|anshaxinta/i },
      so_ai: { action: 'ai', pattern: /fur ai|caawiye/i },
      so_settings: { action: 'settings', pattern: /fur dejinta|dejinta/i },
      so_admin: { action: 'admin', pattern: /fur maamulka|maamulka/i },
      so_upload: { action: 'upload', pattern: /soo geli dukumiinti|soo ridi/i },
    };

    // Special case for "search for [term]" or "raadi [erey]"
    const searchMatchEn = cleanText.match(/search for (.+)/i);
    const searchMatchSo = cleanText.match(/raadi (.+)/i);
    
    if (searchMatchEn) {
       onCommand('search_term', searchMatchEn[1]);
       setLastCommand(cleanText);
       showToast(t('commandExecuted'), 'success');
       return;
    }
    
    if (searchMatchSo) {
       onCommand('search_term', searchMatchSo[1]);
       setLastCommand(cleanText);
       showToast(t('commandExecuted'), 'success');
       return;
    }

    for (const key in commands) {
      if (commands[key].pattern.test(cleanText)) {
        onCommand(commands[key].action);
        setLastCommand(cleanText);
        showToast(t('commandExecuted'), 'success');
        return;
      }
    }

    // If no command recognized
    showToast(t('commandNotRecognized'), 'error');
  }, [onCommand, t, showToast]);

  return (
    <div className="relative">
      <button
        onClick={() => setIsListening(!isListening)}
        className={`
          flex items-center gap-2 px-3 py-1.5 rounded-lg border transition-all text-xs font-bold uppercase tracking-widest
          ${isListening 
            ? 'bg-rose-500 border-rose-400 text-white shadow-[0_0_15px_rgba(244,63,94,0.3)] animate-pulse' 
            : 'bg-sidebar-accent/30 border-border/50 text-muted-foreground hover:text-white hover:border-primary/50'
          }
        `}
      >
        {isListening ? (
          <>
            <Mic className="w-4 h-4" />
            <span>{t('listening')}</span>
          </>
        ) : (
          <>
            <MicOff className="w-4 h-4" />
            <span>Voice</span>
          </>
        )}
      </button>

      <AnimatePresence>
        {isListening && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            className="absolute top-full right-0 mt-3 w-72 bg-card border border-border rounded-xl p-4 shadow-2xl z-50 overflow-hidden"
          >
             <div className="flex items-center justify-between mb-3 pb-3 border-b border-border/50">
                <div className="flex items-center gap-2 text-primary">
                   <CommandIcon className="w-4 h-4" />
                   <span className="text-[10px] font-bold uppercase tracking-widest">{t('voiceAssistant')}</span>
                </div>
                <div className="flex gap-1">
                   <div className="w-1 h-1 rounded-full bg-primary animate-ping" />
                   <div className="w-1 h-1 rounded-full bg-primary animate-ping delay-75" />
                   <div className="w-1 h-1 rounded-full bg-primary animate-ping delay-150" />
                </div>
             </div>

             <div className="space-y-4">
                <div className="min-h-[40px] flex items-center justify-center text-center italic text-muted-foreground text-[13px]">
                   {transcript || t('voiceCommandHelp')}
                </div>

                {error && (
                   <div className="flex items-center gap-2 p-2 rounded-lg bg-rose-500/10 text-rose-400 text-[11px]">
                      <AlertCircle className="w-3.5 h-3.5" />
                      <span>Error: {error}</span>
                   </div>
                )}

                <div className="pt-3 border-t border-border/50">
                   <p className="text-[10px] text-muted-foreground font-medium mb-2 uppercase tracking-tighter">Common Commands:</p>
                   <div className="flex flex-wrap gap-2">
                       {['Open Dashboard', 'Open Map', 'Search for...'].map(c => (
                          <span key={c} className="px-2 py-1 rounded bg-sidebar-accent/50 text-[10px] text-muted-foreground border border-border/30 italic">
                             "{c}"
                          </span>
                       ))}
                   </div>
                </div>
             </div>
             
             {/* Sound Waves Animation */}
             <div className="absolute bottom-0 left-0 right-0 h-1 flex items-end overflow-hidden">
                {Array.from({ length: 40 }).map((_, i) => (
                   <motion.div
                      key={i}
                      animate={{ height: transcript ? Math.random() * 4 : 1 }}
                      transition={{ duration: 0.1 }}
                      className="flex-1 bg-primary/30"
                   />
                ))}
             </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
