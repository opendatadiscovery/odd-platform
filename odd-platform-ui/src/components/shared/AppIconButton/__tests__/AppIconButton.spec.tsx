import React from 'react';
import { screen } from '@testing-library/react';
import { render } from 'lib/testHelpers';
import AppIconButton, { AppIconButtonProps } from '../AppIconButton';
import MinusIcon from '../../Icons/MinusIcon';

describe('AppIconButton', () => {
  const icon = <MinusIcon />;
  const setupComponent = (props?: Partial<AppIconButtonProps>) =>
    render(<AppIconButton color="tertiary" icon={icon} {...props} />);

  it('AppIconButton renders correctly ', () => {
    setupComponent();
    const appIconButton = screen.getByLabelText('AppIconButton');
    expect(appIconButton).toBeInTheDocument();
  });

  // todo: $open ? 'border' : 'background' style will not work while there
  //  are no border colours for buttons in a palette

  // it('AppIconButton should return right styles for color if open', () => {
  //   setupComponent({ color: 'primaryLight', open: true });
  //   const appIconButton = screen.getByLabelText('AppIconButton');
  //   expect(appIconButton).toHaveStyle({
  //     backgroundColor: '',
  //     color: '#0066CC',
  //   });
  // });

  it('AppIconButton should return right styles for color if closed', () => {
    setupComponent({ color: 'primaryLight', open: false });
    const appIconButton = screen.getByLabelText('AppIconButton');
    expect(appIconButton).toHaveStyle({
      backgroundColor: '#E5F2FF',
      color: '#0066CC',
    });
  });

  it('AppIconButton should return right styles for size small', () => {
    setupComponent({ size: 'small' });
    const appIconButton = screen.getByLabelText('AppIconButton');
    expect(appIconButton).toHaveStyle({ padding: '3px' });
  });

  it('AppIconButton should return right styles for size medium', () => {
    setupComponent({ size: 'medium' });
    const appIconButton = screen.getByLabelText('AppIconButton');
    expect(appIconButton).toHaveStyle({ width: '24px' });
  });

  it('AppIconButton should return right styles for height', () => {
    setupComponent({ height: 30 });
    const appIconButton = screen.getByLabelText('AppIconButton');
    expect(appIconButton).toHaveStyle({ height: '30px' });
  });

  it('AppIconButton should be disabled ', () => {
    setupComponent({ disabled: true });
    const appIconButton = screen.getByLabelText('AppIconButton');
    expect(appIconButton).toBeDisabled();
  });
  it('AppIconButton should not be disabled ', () => {
    setupComponent({ disabled: false });
    const appIconButton = screen.getByLabelText('AppIconButton');
    expect(appIconButton).not.toBeDisabled();
  });
});
