import { Sparkles, MessageSquare, Send, Bot, User, Cpu, Zap, Search, Mic, MicOff } from 'lucide-react';
import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useVoiceInput } from '../hooks/useVoiceInput';

const initialMessages = [
  { role: 'ai', content: 'Salaam, Eng. Mohamed. I am **AI Caawiye**, your dedicated engineering assistant. How can I help you today?' },
  { role: 'ai', content: 'I can analyze land surveys, extract metadata from CAD drawings, or find specific documents in your archive.' },
];

export function AICaawiyeView() {
  const [messages, setMessages] = useState(initialMessages);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const handleVoiceResult = useCallback((text: string) => {
    setInput(text);
  }, []);

  const { isListening, startListening } = useVoiceInput(handleVoiceResult);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const handleSend = async () => {
    if (!input.trim()) return;
    
    const userMsg = { role: 'user', content: input };
    setMessages(prev => [...prev, userMsg]);
    const currentHistory = [...messages, userMsg];
    setInput('');
    setIsTyping(true);

    try {
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          message: input,
          history: messages 
        }),
      });

      const data = await response.json();
      
      if (data.error) throw new Error(data.error);

      setMessages(prev => [...prev, { 
        role: 'ai', 
        content: data.content 
      }]);
    } catch (error: any) {
      console.error('Chat Error:', error);
      setMessages(prev => [...prev, { 
        role: 'ai', 
        content: `Waan ka xumahay, cilad ayaa dhacday: ${error.message}` 
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="h-[calc(100vh-160px)] flex flex-col max-w-5xl mx-auto border border-border/50 rounded-3xl bg-card shadow-2xl relative overflow-hidden animate-in fade-in zoom-in duration-500">
      <div className="absolute inset-0 bg-grid-pattern opacity-10 pointer-events-none" />
      
      {/* Header */}
      <div className="px-6 py-4 border-b border-border bg-sidebar-accent/30 flex items-center justify-between relative z-10 backdrop-blur-md">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-primary/20 flex items-center justify-center border border-primary/30 relative">
            <Sparkles className="w-6 h-6 text-primary shadow-[0_0_15px_rgba(6,182,212,0.5)]" />
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-500 border-2 border-card rounded-full" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white tracking-tight">AI Caawiye</h3>
            <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest flex items-center gap-1.5">
               Engineering Assistant • <span className="text-emerald-500">Active Node</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden md:flex items-center gap-6 px-4 py-2 rounded-xl bg-sidebar/50 border border-border">
             <div className="flex flex-col items-start px-2">
               <span className="text-[9px] uppercase tracking-widest font-bold text-muted-foreground">Model</span>
               <span className="text-[11px] font-bold text-primary">Gemini-Pro V2</span>
             </div>
             <div className="flex flex-col items-start px-2 border-l border-border">
               <span className="text-[9px] uppercase tracking-widest font-bold text-muted-foreground">Latency</span>
               <span className="text-[11px] font-bold text-emerald-400">42ms</span>
             </div>
          </div>
        </div>
      </div>

      {/* Chat Area */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-thin relative z-10"
      >
        {messages.map((msg, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`
              max-w-[80%] flex gap-4 p-4 rounded-2xl border
              ${msg.role === 'user' 
                ? 'bg-primary/10 border-primary/20 flex-row-reverse' 
                : 'bg-muted/40 border-border/50'}
            `}>
              <div className={`w-8 h-8 rounded-lg flex-shrink-0 flex items-center justify-center ${msg.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-primary/20 text-primary'}`}>
                {msg.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>
              <div className="space-y-1">
                 <p className="text-sm leading-relaxed text-white opacity-90">{msg.content}</p>
              </div>
            </div>
          </motion.div>
        ))}
        {isTyping && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
            <div className="bg-muted/40 border border-border/50 p-4 rounded-2xl flex gap-2">
               <div className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce delay-0" />
               <div className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce delay-150" />
               <div className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce delay-300" />
            </div>
          </motion.div>
        )}
      </div>

      {/* Input Area */}
      <div className="p-6 border-t border-border bg-sidebar-accent/20 relative z-10">
        <div className="flex items-center gap-3 bg-sidebar/50 border border-border p-2 rounded-2xl shadow-inner focus-within:border-primary/50 transition-all group">
          <button className="p-3 rounded-xl hover:bg-sidebar-accent text-muted-foreground">
             <Zap className="w-5 h-5 group-focus-within:text-amber-500 transition-colors" />
          </button>
          <input 
            type="text" 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Ask AI Caawiye to find projects or analyze data..."
            className="flex-1 bg-transparent border-none outline-none text-sm text-white"
          />
          <button 
            onClick={startListening}
            className={`p-3 rounded-xl transition-all ${isListening ? 'bg-rose-500/20 text-rose-500 animate-pulse' : 'hover:bg-sidebar-accent text-muted-foreground'}`}
            title={isListening ? 'Listening...' : 'Voice input'}
          >
            {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
          </button>
          <button 
            onClick={handleSend}
            disabled={!input.trim()}
            className="p-3 bg-primary text-primary-foreground rounded-xl shadow-lg hover:opacity-90 disabled:opacity-20 active:scale-95 transition-all"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
        <div className="mt-4 flex items-center justify-center gap-4 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/50">
           <span className="flex items-center gap-1"><Cpu className="w-3 h-3" /> Encrypted Pipeline</span>
           <span className="flex items-center gap-1"><Search className="w-3 h-3" /> Multi-Source Search Enabled</span>
        </div>
      </div>
    </div>
  );
}
