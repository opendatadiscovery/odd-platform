import {
  act,
  fireEvent,
  render,
  RenderOptions,
  screen,
} from '@testing-library/react';
import React, { ReactElement } from 'react';
import { StaticRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { RootState } from 'redux/interfaces';
import { AnyAction, configureStore, Store } from '@reduxjs/toolkit';
import { ThemeProvider } from 'styled-components';
import theme from 'theme/mui.theme';
import rootReducer from 'redux/reducers';
import AdapterDateFns from '@mui/lab/AdapterDateFns';
import LocalizationProvider from '@mui/lab/LocalizationProvider';

export const provideTheme = (component: ReactElement): ReactElement => (
  <ThemeProvider theme={theme}>{component}</ThemeProvider>
);

export const flushPromises = () =>
  new Promise(jest.requireActual('timers').setImmediate);

export const clickByTestId = async (testId: string) => {
  const button = screen.getByTestId(testId);
  await act(async () => {
    await fireEvent.click(button);
  });
};

export const clickByText = async (testId: string) => {
  const button = screen.getByText(testId);
  await act(async () => {
    await fireEvent.click(button);
  });
};

export const hoverByTestId = async (testId: string) => {
  const element = screen.getByTestId(testId);
  await act(async () => {
    await fireEvent.mouseOver(element);
  });
};

export const removeHoverByTestId = async (testId: string) => {
  const element = screen.getByTestId(testId);
  await act(async () => {
    await fireEvent.mouseLeave(element);
  });
};

export const removeFocusByTestId = async (testId: string) => {
  const element = screen.getByTestId(testId);
  await act(async () => {
    await fireEvent.focusOut(element);
  });
};

export const setValueByTestId = async (testId: string, value: string) => {
  const input = screen.getByTestId(testId);
  await act(async () => {
    await fireEvent.change(input, { target: { value } });
  });
};

export const getByText = (text: string) => screen.getByText(text);
export const queryByText = (text: string) => screen.queryByText(text);
export const getByTestID = (testID: string) => screen.getByTestId(testID);
export const getAllByTestID = (testID: string) =>
  screen.getAllByTestId(testID);
export const getByLabelText = (text: string) =>
  screen.getByLabelText(text);

interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  preloadedState?: Partial<RootState>;
  store?: Store<Partial<RootState>, AnyAction>;
  pathname?: string;
}

const customRender = (
  ui: ReactElement,
  {
    preloadedState,
    store = configureStore<RootState>({
      reducer: rootReducer,
      preloadedState,
    }),
    pathname,
    ...renderOptions
  }: CustomRenderOptions = {}
) => {
  // overrides @testing-library/react render.
  const AllTheProviders: React.FC = ({ children }) => (
    <ThemeProvider theme={theme}>
      <Provider store={store}>
        <LocalizationProvider dateAdapter={AdapterDateFns}>
          <StaticRouter location={{ pathname }}>{children}</StaticRouter>
        </LocalizationProvider>
      </Provider>
    </ThemeProvider>
  );
  return render(ui, { wrapper: AllTheProviders, ...renderOptions });
};

export { customRender as render };
