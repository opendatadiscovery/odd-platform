import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { screen } from '@testing-library/react';
import { render } from 'lib/tests/testHelpers';
import userEvent from '@testing-library/user-event';
import { Link, useLocation } from 'react-router-dom';
import { ThemeProvider as MuiThemeProvider } from '@mui/material/styles';
import theme from 'theme/mui.theme';
import TooltipBadge from '../TooltipBadge';

/**
 * #1899 — the shared trigger of a tooltip badge (the search row's (?) and the polymorphic (i)): a keyboard stop
 * that names itself, and a click that stays at the badge instead of acting as a click on the row (PLT-091 defect 4).
 */
const LocationProbe = () => <span data-testid='location'>{useLocation().pathname}</span>;

describe('TooltipBadge', () => {
  it('is a self-labelled keyboard stop', () => {
    render(
      <MuiThemeProvider theme={theme}>
        <TooltipBadge label='Show details' testId='badge'>
          <svg />
        </TooltipBadge>
      </MuiThemeProvider>
    );
    const badge = screen.getByTestId('badge');
    expect(badge).toHaveAttribute('tabindex', '0');
    expect(badge).toHaveAttribute('role', 'img');
    expect(badge).toHaveAttribute('aria-label', 'Show details');
  });

  it('a click stays at the badge: the row handler is not reached and a wrapping link is not followed', async () => {
    const rowClick = vi.fn();
    render(
      <MuiThemeProvider theme={theme}>
        <LocationProbe />
        {/* the fixture stands in for a clickable list row (the search row is a styled Grid with onClick) */}
        {/* eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions */}
        <div onClick={rowClick} data-testid='row'>
          <Link to='/item'>
            <TooltipBadge label='Show details' testId='badge'>
              <svg />
            </TooltipBadge>
          </Link>
        </div>
      </MuiThemeProvider>,
      { initialEntries: ['/list'] }
    );
    const user = userEvent.setup();
    await user.click(screen.getByTestId('badge'));
    expect(rowClick).not.toHaveBeenCalled();
    expect(screen.getByTestId('location')).toHaveTextContent('/list');
    // the row itself still opens the item
    await user.click(screen.getByTestId('row'));
    expect(rowClick).toHaveBeenCalledTimes(1);
  });
});
