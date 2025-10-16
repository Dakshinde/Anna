// frontend/src/theme.js
import React, { useState, useMemo, createContext, useContext } from 'react';
import { createTheme } from '@mui/material/styles';

export const ThemeContext = createContext({
  toggleColorMode: () => {},
});

export const useThemeContext = () => useContext(ThemeContext);

export const ThemeProviderWrapper = ({ children }) => {
  const [mode, setMode] = useState('light');

  const colorMode = useMemo(
    () => ({
      toggleColorMode: () => {
        setMode((prevMode) => (prevMode === 'light' ? 'dark' : 'light'));
      },
    }),
    [],
  );

  const theme = useMemo(() => {
    const lightTheme = {
      palette: {
        mode: 'light',
        primary: { main: '#2E7D32' },
        background: {
          default: '#f5f7fa',
          paper: 'rgba(255, 255, 255, 0.9)',
        },
        heroGradient: 'linear-gradient(135deg, #e8f5e9 0%, #e0f2f1 50%, #e1f5fe 100%)',
        text: { primary: '#222', secondary: '#546e7a' }
      },
      typography: { fontFamily: 'Roboto, sans-serif' },
    };

    const darkTheme = {
      palette: {
        mode: 'dark',
        primary: { main: '#66bb6a' },
        background: {
          default: '#121212',
          paper: 'rgba(30, 30, 30, 0.9)',
        },
        heroGradient: 'linear-gradient(135deg, #1a2321 0%, #172424 50%, #171f2b 100%)',
        text: { primary: '#e0e0e0', secondary: '#a0a0a0' }
      },
      typography: { fontFamily: 'Roboto, sans-serif' },
    };
    
    return createTheme(mode === 'light' ? lightTheme : darkTheme);
  }, [mode]);

  return (
    <ThemeContext.Provider value={colorMode}>
        {children(theme)} 
    </ThemeContext.Provider>
  );
};