import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter } from 'react-router-dom';
import { Provider } from 'react-redux';

import {
  StyledEngineProvider,
  Theme,
  ThemeProvider as MuiThemeProvider,
} from '@mui/material/styles';
import { StyleSheetManager, ThemeProvider } from 'styled-components';

import AdapterDateFns from '@mui/lab/AdapterDateFns';
import LocalizationProvider from '@mui/lab/LocalizationProvider';

import { CssBaseline } from '@mui/material';
import { store } from 'redux/store';
import * as serviceWorker from './serviceWorker';
import theme from './theme/mui.theme';

import AppContainer from './components/AppContainer';

declare module 'styled-components' {
  // eslint-disable-next-line @typescript-eslint/no-empty-interface
  interface DefaultTheme extends Theme {}
}

ReactDOM.render(
  <Provider store={store}>
    <StyledEngineProvider injectFirst>
      <MuiThemeProvider theme={theme}>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <BrowserRouter>
              <StyleSheetManager disableVendorPrefixes>
                <AppContainer />
              </StyleSheetManager>
            </BrowserRouter>
          </LocalizationProvider>
        </ThemeProvider>
      </MuiThemeProvider>
    </StyledEngineProvider>
  </Provider>,
  document.getElementById('root')
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
