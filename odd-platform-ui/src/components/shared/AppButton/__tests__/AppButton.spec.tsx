import React from 'react';
import { screen } from '@testing-library/react';
import { render } from 'lib/testHelpers';
import AppButton, { AppButtonProps } from '../AppButton';

describe('AppButton', () => {
  const setupComponent = (props?: Partial<AppButtonProps>) =>
    render(
      <AppButton color="primary" {...props}>
        AppButtonTest
      </AppButton>
    );

  it('AppButton renders correctly ', () => {
    setupComponent();
    const appButton = screen.getByLabelText('AppButton');
    expect(appButton).toBeInTheDocument();
  });

  it('AppButton should return right styles for color', () => {
    setupComponent({ color: 'secondary' });
    const appButton = screen.getByLabelText('AppButton');
    expect(appButton).toHaveStyle({
      backgroundColor: '#FFFFFF',
      color: '#0066CC',
    });
  });

  it('AppButton should return right styles for size large', () => {
    setupComponent({ size: 'large' });
    const appButton = screen.getByLabelText('AppButton');
    expect(appButton).toHaveStyle({ height: '32px' });
  });

  it('AppButton should return right styles for size small', () => {
    setupComponent({ size: 'small' });
    const appButton = screen.getByLabelText('AppButton');
    expect(appButton).toHaveStyle({ height: '20px' });
  });

  it('AppButton should be disabled ', () => {
    setupComponent({ disabled: true });
    const appButton = screen.getByLabelText('AppButton');
    expect(appButton).toBeDisabled();
  });
  it('AppButton should not be disabled ', () => {
    setupComponent({ disabled: false });
    const appButton = screen.getByLabelText('AppButton');
    expect(appButton).not.toBeDisabled();
  });
});
