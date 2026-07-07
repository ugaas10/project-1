import React from 'react';
import { Languages } from 'lucide-react';
import { motion } from 'motion/react';
import { useLanguage } from '../lib/i18n';

export function LanguageToggle() {
  const { language, setLanguage } = useLanguage();

  const options = [
    { id: 'so', label: 'Soomaali' },
    { id: 'en', label: 'English' }
  ];

  return (
    <div className="flex bg-sidebar-accent/30 p-1 rounded-xl border border-border/50">
      {options.map((opt) => (
        <button
          key={opt.id}
          onClick={() => setLanguage(opt.id as 'so' | 'en')}
          className={`
            relative flex items-center gap-2 px-4 py-2 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all
            ${language === opt.id ? 'text-primary' : 'text-muted-foreground hover:text-white'}
          `}
        >
          {language === opt.id && (
            <motion.div
              layoutId="active-language"
              className="absolute inset-0 bg-primary/10 border border-primary/20 rounded-lg shadow-[0_0_15px_rgba(6,182,212,0.1)]"
              transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
            />
          )}
          {opt.id === 'so' ? (
             <span className="relative z-10 w-4 h-4 flex items-center justify-center text-[8px] bg-sky-500 text-white rounded-full">🇸🇴</span>
          ) : (
             <span className="relative z-10 w-4 h-4 flex items-center justify-center text-[8px] bg-blue-600 text-white rounded-full">🇺🇸</span>
          )}
          <span className="relative z-10">{opt.label}</span>
        </button>
      ))}
    </div>
  );
}
