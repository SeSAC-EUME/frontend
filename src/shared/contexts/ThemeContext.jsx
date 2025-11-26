import { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export const ThemeProvider = ({ children }) => {
  const [theme, setThemeState] = useState(() => {
    // localStorage에서 테마 로드, 없으면 'ocean' 기본값
    const savedTheme = localStorage.getItem('eume_theme');
    if (!savedTheme) {
      localStorage.setItem('eume_theme', 'ocean');
      return 'ocean';
    }
    return savedTheme;
  });

  // 테마 변경 시 body 클래스와 localStorage 동시 업데이트
  useEffect(() => {
    document.body.className = `theme-${theme}`;
    localStorage.setItem('eume_theme', theme);
  }, [theme]);

  const setTheme = (newTheme) => {
    setThemeState(newTheme);
  };

  const value = {
    theme,
    setTheme,
  };

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};
