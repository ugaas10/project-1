import React, { useEffect, useState } from 'react';
import { Sun, Moon, Monitor } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export function ThemeToggle() {
  const [theme, setTheme] = useState<'light' | 'dark' | 'system'>(() => {
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | 'system';
      return savedTheme || 'dark';
    }
    return 'dark';
  });

  useEffect(() => {
    const root = window.document.documentElement;
    
    const applyTheme = (targetTheme: 'light' | 'dark') => {
      root.classList.remove('light', 'dark');
      root.classList.add(targetTheme);
      root.style.colorScheme = targetTheme;
    };

    if (theme === 'system') {
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      applyTheme(systemTheme);
      localStorage.removeItem('theme');
    } else {
      applyTheme(theme);
      localStorage.setItem('theme', theme);
    }
  }, [theme]);

  // Listen for system theme changes
  useEffect(() => {
    if (theme !== 'system') return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => {
      const systemTheme = mediaQuery.matches ? 'dark' : 'light';
      const root = window.document.documentElement;
      root.classList.remove('light', 'dark');
      root.classList.add(systemTheme);
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [theme]);

  const themes = [
    { id: 'light', icon: Sun, label: 'Iftiin' },
    { id: 'dark', icon: Moon, label: 'Mugdi' },
    { id: 'system', icon: Monitor, label: 'Sida PC' }
  ];

  return (
    <div className="flex bg-sidebar-accent/30 p-1 rounded-xl border border-border/50">
      {themes.map((t) => (
        <button
          key={t.id}
          onClick={() => setTheme(t.id as any)}
          className={`
            relative flex items-center gap-2 px-3 py-2 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all
            ${theme === t.id ? 'text-primary' : 'text-muted-foreground hover:text-white'}
          `}
        >
          {theme === t.id && (
            <motion.div
              layoutId="active-theme"
              className="absolute inset-0 bg-primary/10 border border-primary/20 rounded-lg shadow-[0_0_15px_rgba(6,182,212,0.1)]"
              transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
            />
          )}
          <t.icon className="w-3.5 h-3.5 relative z-10" />
          <span className="relative z-10">{t.label}</span>
        </button>
      ))}
    </div>
  );
}
