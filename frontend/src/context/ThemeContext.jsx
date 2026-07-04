import { createContext, useContext, useEffect, useState } from 'react';

// Theme context stores the current color mode and toggle function.
const ThemeContext = createContext(null);

export const ThemeProvider = ({ children }) => {
  // Load theme preference from local storage, default to dark mode.
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('theme') || 'dark';
  });

  // Apply the theme to the document root and persist the choice.
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  // Switch between light and dark modes.
  const toggleTheme = () => setTheme((t) => (t === 'dark' ? 'light' : 'dark'));

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
