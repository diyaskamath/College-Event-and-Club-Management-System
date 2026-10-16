import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import api from '../api/client';

const ThemeContext = createContext(null);

const DEFAULT_THEME_VARS = {
  '--theme-primary': '#881337', // Amrita Maroon
  '--theme-primary-hover': '#9F1239',
  '--theme-accent': '#D97706', // Warm Amber
  '--theme-bg': '#F8FAFC',
  '--theme-surface': '#FFFFFF',
  '--theme-text': '#0F172A',
  '--theme-hero-from': '#881337',
  '--theme-hero-to': '#4C0519',
  '--theme-glow': 'rgba(136, 19, 55, 0.15)',
};

export function ThemeProvider({ children }) {
  const [activeTheme, setActiveTheme] = useState(null);
  const [loading, setLoading] = useState(true);

  const applyThemeVariables = useCallback((theme) => {
    const root = document.documentElement;
    if (!theme || !theme.config || !theme.config.colors) {
      Object.entries(DEFAULT_THEME_VARS).forEach(([k, v]) => root.style.setProperty(k, v));
      document.body.dataset.theme = 'default';
      return;
    }

    const { colors } = theme.config;
    root.style.setProperty('--theme-primary', colors.primary || DEFAULT_THEME_VARS['--theme-primary']);
    root.style.setProperty('--theme-primary-hover', colors.primary ? `${colors.primary}EE` : DEFAULT_THEME_VARS['--theme-primary-hover']);
    root.style.setProperty('--theme-accent', colors.accent || DEFAULT_THEME_VARS['--theme-accent']);
    root.style.setProperty('--theme-bg', colors.background || DEFAULT_THEME_VARS['--theme-bg']);
    root.style.setProperty('--theme-surface', colors.surface || DEFAULT_THEME_VARS['--theme-surface']);
    root.style.setProperty('--theme-text', colors.text || DEFAULT_THEME_VARS['--theme-text']);
    root.style.setProperty('--theme-hero-from', colors.heroFrom || DEFAULT_THEME_VARS['--theme-hero-from']);
    root.style.setProperty('--theme-hero-to', colors.heroTo || DEFAULT_THEME_VARS['--theme-hero-to']);
    root.style.setProperty('--theme-glow', theme.config.glow ? `rgba(245, 179, 1, ${theme.config.glow * 0.3})` : DEFAULT_THEME_VARS['--theme-glow']);
    
    document.body.dataset.theme = theme.slug || 'festival';
  }, []);

  const fetchActiveTheme = useCallback(async () => {
    try {
      const data = await api.get('/themes/active');
      if (data && data.active && data.theme) {
        setActiveTheme(data.theme);
        applyThemeVariables(data.theme);
      } else {
        setActiveTheme(null);
        applyThemeVariables(null);
      }
    } catch {
      setActiveTheme(null);
      applyThemeVariables(null);
    } finally {
      setLoading(false);
    }
  }, [applyThemeVariables]);

  useEffect(() => {
    fetchActiveTheme();
  }, [fetchActiveTheme]);

  return (
    <ThemeContext.Provider value={{ activeTheme, isFestival: !!activeTheme, refreshTheme: fetchActiveTheme, loading }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
};
