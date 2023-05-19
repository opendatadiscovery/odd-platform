import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import {
  StyledEngineProvider,
  type Theme,
  ThemeProvider as MuiThemeProvider,
} from '@mui/material/styles';
import { StyleSheetManager, ThemeProvider } from 'styled-components';

import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers';

import { CssBaseline } from '@mui/material';
import { store } from 'redux/store';
import { showServerErrorToast } from 'lib/errorHandling';
import theme from './theme/mui.theme';

import App from './components/App';

declare module 'styled-components' {
  // eslint-disable-next-line @typescript-eslint/no-empty-interface
  interface DefaultTheme extends Theme {}
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      refetchOnWindowFocus: false,
      async onError(e) {
        await showServerErrorToast(e as Response);
      },
    },
    mutations: {
      async onError(e) {
        await showServerErrorToast(e as Response);
      },
    },
  },
});

const container = document.getElementById('root');
const root = createRoot(container!);

root.render(
  <QueryClientProvider client={queryClient}>
    <Provider store={store}>
      <StyledEngineProvider injectFirst>
        <MuiThemeProvider theme={theme}>
          <ThemeProvider theme={theme}>
            <CssBaseline />
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <BrowserRouter>
                <StyleSheetManager disableVendorPrefixes>
                  <App />
                </StyleSheetManager>
              </BrowserRouter>
            </LocalizationProvider>
          </ThemeProvider>
        </MuiThemeProvider>
      </StyledEngineProvider>
    </Provider>
  </QueryClientProvider>
);
