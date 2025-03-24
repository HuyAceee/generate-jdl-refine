import { RefineThemes } from '@refinedev/antd';
import { ConfigProvider, theme } from 'antd';
import { type PropsWithChildren, createContext, useEffect, useMemo, useState } from 'react';

interface ColorModeContextType {
  mode: string;
  setMode: (mode: string) => void;
}

export const ColorModeContext = createContext<ColorModeContextType>({} as ColorModeContextType);

export const ColorModeContextProvider: React.FC<PropsWithChildren> = ({ children }: any) => {
  const colorModeFromLocalStorage = localStorage.getItem('colorMode');
  const isSystemPreferenceDark = window?.matchMedia('(prefers-color-scheme: dark)').matches;

  const systemPreference = isSystemPreferenceDark ? 'dark' : 'light';
  const [mode, setMode] = useState(colorModeFromLocalStorage ?? systemPreference);

  useEffect(() => {
    window.localStorage.setItem('colorMode', mode);
  }, [mode]);

  const setColorMode = () => {
    if (mode === 'light') {
      setMode('dark');
    } else {
      setMode('light');
    }
  };

  const { darkAlgorithm, defaultAlgorithm } = theme;

  const value = useMemo(
    () => ({
      setMode: setColorMode,
      mode,
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [setMode, mode],
  );

  return (
    <ColorModeContext.Provider value={value}>
      <ConfigProvider
        // you can change the theme colors here. example: ...RefineThemes.Magenta,
        theme={{
          ...RefineThemes.Green,
          token: {
            colorPrimary: '#31B44A',
          },
          algorithm: mode === 'light' ? defaultAlgorithm : darkAlgorithm,
        }}
      >
        {children}
      </ConfigProvider>
    </ColorModeContext.Provider>
  );
};
