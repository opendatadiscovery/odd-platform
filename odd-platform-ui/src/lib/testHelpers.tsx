import {
  act,
  fireEvent,
  render,
  renderHook,
  type RenderOptions,
  screen,
} from '@testing-library/react';
import React, { type PropsWithChildren, type ReactElement } from 'react';
import { ThemeProvider } from 'styled-components';
import theme from 'theme/mui.theme';
import { MemoryRouter, type MemoryRouterProps, Route, Routes } from 'react-router-dom';
import { QueryClient, QueryClientProvider, type UseQueryResult } from 'react-query';

export const flushPromises = () => new Promise(jest.requireActual('timers').setImmediate);

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
export const getAllByTestID = (testID: string) => screen.getAllByTestId(testID);

interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
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
  { initialEntries, ...renderOptions }: CustomRenderOptions = {}
) => {
  const AllProviders: React.FC<PropsWithChildren<unknown>> = ({ children }) => (
    <TestQueryClientProvider>
      <ThemeProvider theme={theme}>
        <MemoryRouter initialEntries={initialEntries}>
          <div>{children}</div>
        </MemoryRouter>
      </ThemeProvider>
    </TestQueryClientProvider>
  );
  return render(ui, { wrapper: AllProviders, ...renderOptions });
};

const customRenderHook = (hook: () => UseQueryResult<unknown, unknown>) =>
  renderHook(hook, { wrapper: TestQueryClientProvider });

export { customRender as render, customRenderHook as renderQueryHook };
