import { createContext, useCallback, useContext, useEffect } from 'react';

export type Theme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  pauseTheme: () => void;
  resumeTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: 'light',
  toggleTheme: () => {},
  pauseTheme: () => {},
  resumeTheme: () => {},
});

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  useEffect(() => {
    document.documentElement.classList.remove('dark');
    localStorage.removeItem('theme');
  }, []);

  const noop = useCallback(() => {}, []);

  return (
    <ThemeContext.Provider value={{ theme: 'light', toggleTheme: noop, pauseTheme: noop, resumeTheme: noop }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
