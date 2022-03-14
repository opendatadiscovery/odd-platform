import React from 'react';
import { screen } from '@testing-library/react';
import { render } from 'lib/testHelpers';
import AppMenuItem, { AppMenuItemProps } from '../AppMenuItem';

describe('AppMenuItem', () => {
  const setupComponent = (props?: Partial<AppMenuItemProps>) =>
    render(<AppMenuItem {...props}>AppMenuItemTestChildren</AppMenuItem>);

  it('AppMenuItem renders correctly ', () => {
    setupComponent();
    const appMenuItem = screen.getByLabelText('AppMenuItem');
    const appMenuItemText = screen.getByLabelText('AppMenuItemText');
    expect(appMenuItem).toBeInTheDocument();
    expect(appMenuItemText).toBeInTheDocument();
  });

  it('AppMenuItem renders children correctly ', () => {
    setupComponent();
    const appMenuItem = screen.getByLabelText('AppMenuItem');
    expect(appMenuItem).toBeInTheDocument();
    expect(appMenuItem).toHaveTextContent('AppMenuItemTestChildren');
  });

  it('AppMenuItem renders styles with props correctly', () => {
    setupComponent({ maxWidth: 40, minWidth: 40 });
    const appMenuItem = screen.getByLabelText('AppMenuItem');
    expect(appMenuItem).toHaveStyle({
      maxWidth: '40px',
      minWidth: '40px',
    });
  });

  it('AppMenuItem renders styles without props correctly', () => {
    setupComponent();
    const appMenuItem = screen.getByLabelText('AppMenuItem');
    expect(appMenuItem).toHaveStyle({
      maxWidth: 'none',
      minWidth: 0,
    });
  });
});
