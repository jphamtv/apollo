import { ReactNode, useEffect, useState } from 'react';
import { Theme, ThemeContext } from './themeContext';

interface ThemeProviderProps {
  children: ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  // Check for theme preference in localStorage first,
  // default to dark theme if not found
  const savedTheme = localStorage.getItem('theme') as Theme;
  const [theme, setTheme] = useState<Theme>(savedTheme || 'dark');

  // Apply theme to document on mount and when theme changes
  useEffect(() => {
    // Save to localStorage
    localStorage.setItem('theme', theme);

    // Apply to HTML element
    if (theme === 'light') {
      document.documentElement.setAttribute('data-theme', 'light');
    } else {
      document.documentElement.removeAttribute('data-theme');
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prevTheme => (prevTheme === 'dark' ? 'light' : 'dark'));
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}
