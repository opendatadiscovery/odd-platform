import { act, fireEvent, screen } from '@testing-library/react';

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

export const mouseDownByTestId = async (testId: string) => {
  const button = screen.getByTestId(testId);
  await act(async () => {
    await fireEvent.mouseDown(button);
  });
};

export const mouseUpByTestId = async (testId: string) => {
  const button = screen.getByTestId(testId);
  await act(async () => {
    await fireEvent.mouseUp(button);
  });
};

export const mouseMoveByTestId = async (
  testId: string,
  options?: Record<string, unknown>
) => {
  const button = screen.getByTestId(testId);
  await act(async () => {
    await fireEvent.mouseMove(button, options);
  });
};

export const doubleClickByText = async (text: string) => {
  const element = screen.getByText(text);
  await act(async () => {
    await fireEvent.doubleClick(element);
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
