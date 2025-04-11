import React, { createContext, useState, useContext, useEffect } from 'react';

// Defina temas padrão mais simples
const themes = {
  light: {
    background: '#ffffff',
    backgroundSecondary: '#f8fafc',
    textPrimary: '#1e293b',
    textSecondary: '#64748b',
    accent: '#3b82f6',
    accentHover: '#2563eb'
  },
  dark: {
    background: '#0f172a',
    backgroundSecondary: '#1e293b',
    textPrimary: '#f1f5f9',
    textSecondary: '#cbd5e1',
    accent: '#3b82f6',
    accentHover: '#60a5fa'
  }
};

// Criar contexto
const ThemeContext = createContext();

// Hook personalizado para usar o tema
export const useTheme = () => useContext(ThemeContext);

// Provider do tema
export const ThemeProvider = ({ children }) => {
  // Verificar preferência salva ou usar o tema do sistema
  const getInitialTheme = () => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme && ['light', 'dark'].includes(savedTheme)) {
      return savedTheme;
    }
    
    // Usar preferência do sistema
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  };

  const [themeName, setThemeName] = useState(getInitialTheme);
  const theme = themes[themeName];

  // Alternar entre temas
  const toggleTheme = () => {
    setThemeName(prevTheme => {
      const newTheme = prevTheme === 'light' ? 'dark' : 'light';
      localStorage.setItem('theme', newTheme);
      return newTheme;
    });
  };

  // Aplicar classe CSS ao body quando o tema muda
  useEffect(() => {
    document.body.className = themeName;
  }, [themeName]);

  return (
    <ThemeContext.Provider value={{ ...theme, themeName, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export default ThemeContext;