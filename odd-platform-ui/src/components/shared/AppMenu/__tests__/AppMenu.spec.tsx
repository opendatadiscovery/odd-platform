import React from 'react';
import { screen, within } from '@testing-library/react';
import { render } from 'lib/testHelpers';
import AppMenu, { AppMenuProps } from '../AppMenu';
import AppMenuItem from '../../AppMenuItem/AppMenuItem';

describe('AppMenu', () => {
  const setupComponent = (props?: Partial<AppMenuProps>) =>
    render(
      <AppMenu open {...props}>
        <AppMenuItem />
        <AppMenuItem />
      </AppMenu>
    );

  it('AppMenu and children render correctly ', () => {
    setupComponent();
    const appMenu = screen.getByLabelText('AppMenu');
    expect(appMenu).toBeInTheDocument();
    expect(within(appMenu).getAllByLabelText('AppMenuItem')).toBeTruthy();
  });

  it('AppMenu and children do not render ', () => {
    setupComponent({ open: false });
    expect(screen.queryByLabelText('AppMenu')).toBeNull();
    expect(screen.queryByLabelText('AppMenuItem')).toBeNull();
  });

  it('AppMenu renders styles with props correctly', () => {
    setupComponent({ maxWidth: 40, maxHeight: 40, minWidth: 40 });
    const appMenu = screen.getByLabelText('AppMenu');
    expect(appMenu).toHaveStyle({
      maxWidth: '40px',
      maxHeight: '40px',
      minWidth: '40px',
    });
  });

  it('AppMenu renders styles without props correctly', () => {
    setupComponent();
    const appMenu = screen.getByLabelText('AppMenu');
    expect(appMenu).toHaveStyle({
      maxWidth: 'none',
      maxHeight: 'none',
      minWidth: 0,
    });
  });
});
