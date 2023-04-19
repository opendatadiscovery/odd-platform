import { act, fireEvent, render, renderHook, screen } from '@testing-library/react';
import type { ByRoleOptions, RenderOptions } from '@testing-library/react';
import React, { type PropsWithChildren, type ReactElement } from 'react';
import { ThemeProvider } from 'styled-components';
import theme from 'theme/mui.theme';
import { MemoryRouter, type MemoryRouterProps, Route, Routes } from 'react-router-dom';
import {
  QueryClient,
  QueryClientProvider,
  type UseQueryResult,
} from '@tanstack/react-query';
import { Provider } from 'react-redux';
import type { AnyAction, Store } from '@reduxjs/toolkit';
import { configureStore } from '@reduxjs/toolkit';
import type { RootState } from 'redux/interfaces';
import rootReducer from 'redux/slices';

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

export const clickByRole = async (role: string, opts?: ByRoleOptions) => {
  const button = screen.getByRole(role, opts);
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
export const getByRole = (role: string) => screen.getByRole(role);
export const queryByRole = (role: string) => screen.queryByRole(role);
export const getByTestId = (testID: string) => screen.getByTestId(testID);
export const queryByTestId = (testID: string) => screen.queryByTestId(testID);
export const getAllByTestId = (testID: string) => screen.getAllByTestId(testID);
export const getByTextContent = (text: string) =>
  screen.getByText((content: string, node: Element | null) => {
    if (!node) return false;

    const hasText = (el: Element) => el.textContent === text;
    const elementHasText = hasText(node);
    const childrenWithoutText = Array.from(node.children).every(child => !hasText(child));
    return elementHasText && childrenWithoutText;
  });

interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  preloadedState?: Partial<RootState>;
  store?: Store<Partial<RootState>, AnyAction>;
  initialEntries?: MemoryRouterProps['initialEntries'];
}

interface WithRouteProps {
  children: React.ReactNode;
  path: string;
}

export const WithRoute: React.FC<WithRouteProps> = ({ children, path }) => (
  <Routes>
    <Route path={path} element={children} />
  </Routes>
);

export const TestQueryClientProvider: React.FC<PropsWithChildren<unknown>> = ({
  children,
}) => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
};

const customRender = (
  ui: ReactElement,
  {
    preloadedState,
    initialEntries,
    store = configureStore<RootState>({
      reducer: rootReducer,
      preloadedState,
    }),
    ...renderOptions
  }: CustomRenderOptions = {}
) => {
  const AllProviders: React.FC<PropsWithChildren<unknown>> = ({ children }) => (
    <TestQueryClientProvider>
      <ThemeProvider theme={theme}>
        <Provider store={store}>
          <MemoryRouter initialEntries={initialEntries}>
            <div>{children}</div>
          </MemoryRouter>
        </Provider>
      </ThemeProvider>
    </TestQueryClientProvider>
  );
  return render(ui, { wrapper: AllProviders, ...renderOptions });
};

const customRenderHook = (hook: () => UseQueryResult<unknown, unknown>) =>
  renderHook(hook, { wrapper: TestQueryClientProvider });

export { customRender as render, customRenderHook as renderQueryHook };
