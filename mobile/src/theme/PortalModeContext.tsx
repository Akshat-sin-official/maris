import React, { createContext, useContext, useState } from 'react';
import { theme, lightTheme } from './theme';

export type PortalMode = 'CITIZEN' | 'OFFICER';

interface PortalModeContextType {
  mode: PortalMode;
  setMode: (mode: PortalMode) => void;
  activeTheme: typeof theme;
}

const PortalModeContext = createContext<PortalModeContextType>({
  mode: 'CITIZEN',
  setMode: () => {},
  activeTheme: lightTheme,
});

export const PortalModeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [mode, setMode] = useState<PortalMode>('CITIZEN');

  const activeTheme = mode === 'CITIZEN' ? lightTheme : theme;

  return (
    <PortalModeContext.Provider value={{ mode, setMode, activeTheme }}>
      {children}
    </PortalModeContext.Provider>
  );
};

export const usePortalMode = () => useContext(PortalModeContext);
