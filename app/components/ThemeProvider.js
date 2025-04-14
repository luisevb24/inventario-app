'use client';
import { createContext, useContext, useEffect, useState } from 'react';

// Create a context for theme state
const ThemeContext = createContext({
  theme: 'light',
  toggleTheme: () => {},
});

// Theme provider component
export function ThemeProvider({ children }) {
  // Initialize theme from localStorage if available, otherwise default to 'light'
  const [theme, setTheme] = useState('light');
  
  // Initialize theme on mount, handling SSR
  useEffect(() => {
    const storedTheme = localStorage.getItem('theme');
    
    // Check stored preference or system preference
    if (storedTheme) {
      setTheme(storedTheme);
    } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      setTheme('dark');
    }
  }, []);
  
  // Update class on theme change
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    
    // Store preference
    localStorage.setItem('theme', theme);
  }, [theme]);
  
  // Toggle theme function
  const toggleTheme = () => {
    setTheme(prevTheme => (prevTheme === 'light' ? 'dark' : 'light'));
  };
  
  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

// Custom hook to use the theme
export function useTheme() {
  return useContext(ThemeContext);
}