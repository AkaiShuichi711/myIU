import { createContext, useCallback, useContext, useEffect, useState } from 'react';

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
  const [theme, setTheme] = useState<Theme>(() => {
    const saved = localStorage.getItem('theme') as Theme | null;
    if (saved === 'dark' || saved === 'light') return saved;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });

  // When true, always force light — used by auth pages
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    const root = document.documentElement;
    if (paused || theme === 'light') {
      root.classList.remove('dark');
    } else {
      root.classList.add('dark');
    }
    if (!paused) localStorage.setItem('theme', theme);
  }, [theme, paused]);

  const toggleTheme = () => setTheme((t) => (t === 'light' ? 'dark' : 'light'));
  const pauseTheme  = useCallback(() => setPaused(true),  []);
  const resumeTheme = useCallback(() => setPaused(false), []);

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, pauseTheme, resumeTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
