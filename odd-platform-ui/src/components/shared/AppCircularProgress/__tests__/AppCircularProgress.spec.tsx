import React from 'react';
import { screen } from '@testing-library/react';
import { render } from 'lib/testHelpers';
import AppCircularProgress, {
  AppCircularProgressProps,
} from '../AppCircularProgress';

describe('AppCircularProgress', () => {
  const setupComponent = (props?: Partial<AppCircularProgressProps>) =>
    render(
      <AppCircularProgress
        text=""
        size={1}
        progressBackground="light"
        {...props}
      />
    );

  it('AppCircularProgress renders correctly', () => {
    setupComponent();
    const appCircularProgress = screen.getByLabelText(
      'AppCircularProgress'
    );
    expect(appCircularProgress).toBeInTheDocument();
  });

  it('AppCircularProgress should return right title', () => {
    setupComponent({ text: 'AppCircularProgressTestText' });
    const appCircularProgress = screen.getByLabelText(
      'AppCircularProgress'
    );
    expect(appCircularProgress).toHaveTextContent(
      'AppCircularProgressTestText'
    );
  });

  it('AppCircularProgress should return right width and height for size prop', () => {
    setupComponent({ size: 400 });
    const appCircularProgressBack = screen.getByLabelText(
      'AppCircularProgressBack'
    );
    expect(appCircularProgressBack).toHaveStyle({
      height: '400px',
      width: '400px',
    });
  });

  it('AppCircularProgressBack should return light progressBackground color', () => {
    setupComponent({ progressBackground: 'light' });
    const appCircularProgressBack = screen.getByLabelText(
      'AppCircularProgressBack'
    );
    expect(appCircularProgressBack).toHaveStyle({
      color: '#FFFFFF',
    });
  });
  it('AppCircularProgressBack should return dark progressBackground color', () => {
    setupComponent({ progressBackground: 'dark' });
    const appCircularProgressBack = screen.getByLabelText(
      'AppCircularProgressBack'
    );
    expect(appCircularProgressBack).toHaveStyle({
      color: '#EBECF0',
    });
  });
  it('AppCircularProgress should return blue background color', () => {
    setupComponent({ background: 'blue' });
    const appCircularProgress = screen.getByLabelText(
      'AppCircularProgress'
    );
    expect(appCircularProgress).toHaveStyle({
      backgroundColor: '#E5F2FF',
    });
  });
  it('AppCircularProgress should return right styles for sx props', () => {
    setupComponent({ sx: { m: 0.5 } });
    const appCircularProgress = screen.getByLabelText(
      'AppCircularProgress'
    );
    expect(appCircularProgress).toHaveStyle({
      margin: '4px',
    });
  });
});
