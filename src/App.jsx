import { useAuth } from 'blustai-react-core';
import {RouterProvider} from 'blustai-react-router';
import {getDefaultTheme} from "blustai-react-ui";
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { Toaster } from 'react-hot-toast';
import router from './routes';
import { useMediaQuery } from '@mui/material';
import CssBaseline from '@mui/material/CssBaseline';
import './App.css'
import { useMemo } from 'react';

function App() {
  const { themeMode } = useAuth();
  const prefer_scheme = useMediaQuery('(prefers-color-scheme: dark)') ? 'dark' : 'light';
  const _themeMode = ['dark', 'light'].includes(themeMode) ? themeMode : prefer_scheme;
  const theme = useMemo(
    () =>
      createTheme({
        ...getDefaultTheme(_themeMode),
        typography: {
          "fontFamily": `"Poppins", system-ui, -apple-system, Segoe UI, Roboto, Ubuntu, Cantarell, Noto Sans, sans-serif, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol'`,   
        },
      }),
    [_themeMode],
  );


  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Toaster position="top-center" />
      <RouterProvider router={router} /> 
    </ThemeProvider>
  )
}

export default App
