import React from 'react';
import { describe, expect, it } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ThemeProvider as MuiThemeProvider } from '@mui/material/styles';
import theme from 'theme/mui.theme';
import { render } from 'lib/tests/testHelpers';
import AppTooltip from '../AppTooltip';

/**
 * The guard for the shape that shipped to a merged main: an informational tooltip handed a bare string rendered
 * as ONE unwrapped, background-less row of text straight across the viewport and over the results table, because
 * the "light" popper carries `padding: 0` + `maxWidth: 'unset'` and expects the CONTENT to bring both.
 *
 * Fifteen call sites passed a bare string. The remedy is not "wrap them all" — it is that a caller CANNOT get
 * this wrong any more, which is what these cases hold in place.
 */

const LONG =
  'Narrows to the assets you have opened, and keeps only the ones inside the window you picked, which is a ' +
  'deliberately long sentence so that an unconstrained tooltip would run far past any sane width.';

const renderTip = (props: Partial<React.ComponentProps<typeof AppTooltip>>) =>
  render(
    <MuiThemeProvider theme={theme}>
      <AppTooltip title={LONG} {...props}>
        <span>anchor</span>
      </AppTooltip>
    </MuiThemeProvider>
  );

describe('AppTooltip — an informational tooltip can never render as a runaway line', () => {
  it('wraps a plain-string informational title in the shared card body, with a wrap width', async () => {
    renderTip({ checkForOverflow: false });
    await userEvent.hover(screen.getByText('anchor'));

    const tip = await screen.findByRole('tooltip');
    // STRUCTURE, not computed width: jsdom does not resolve styled-components' descendant selectors, so a
    // getComputedStyle assertion here would be testing jsdom. The width is measured in a real browser instead
    // (a 360px cap, verified against the 1264px runaway line that shipped). What this pins is that the string
    // reaches the shared card body at all — the half that was missing at fifteen call sites.
    expect(
      tip.querySelector('[data-qa="tooltip-body"]'),
      'a string title must be wrapped in the shared body, not passed through bare'
    ).not.toBeNull();
    expect(tip).toHaveTextContent('Narrows to the assets you have opened');
  });

  it('leaves a rich (element) title exactly as the caller built it — no double wrapping', async () => {
    renderTip({
      checkForOverflow: false,
      title: <span data-qa='own-body'>mine</span>,
    });
    await userEvent.hover(screen.getByText('anchor'));

    const tip = await screen.findByRole('tooltip');
    expect(tip.querySelector('[data-qa="own-body"]')).not.toBeNull();
    expect(
      tip.querySelector('[data-qa="tooltip-body"]'),
      'a caller that already built its own body is not re-wrapped'
    ).toBeNull();
  });

  it('an OVERFLOW tooltip (the short label echo) is untouched — it stays a bare compact string', async () => {
    renderTip({ checkForOverflow: true, title: 'CATALOG_RETURNS' });
    await userEvent.hover(screen.getByText('anchor'));

    const tip = await screen.findByRole('tooltip');
    expect(
      tip.querySelector('[data-qa="tooltip-body"]'),
      'no card body on a truncated-label echo — that idiom stays compact'
    ).toBeNull();
    expect(tip).toHaveTextContent('CATALOG_RETURNS');
  });
});
