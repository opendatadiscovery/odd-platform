import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { act, screen } from '@testing-library/react';
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
 * The remedy is that a caller CANNOT get this wrong any more — `AppTooltip` supplies the shared card body to a
 * plain-string informational title itself. These cases hold the exact boundary of that remedy in place, because
 * the first cut of it overshot in both directions: it wrapped the two `type='dark'` string sites too (a light card
 * inside the dark chip), and it capped the popper at 360px for EVERY light tooltip, which clamped the callers whose
 * element titles carry their own width (SearchHighlights at 640px, the DataEntityDetailsPreview card at 400-800px).
 *
 * What jsdom cannot see: computed WIDTHS. It does not resolve the styled-components descendant rule on the popper,
 * so the width half of this contract — an element title keeps the width it declared, a string title wraps at the
 * body's 360px — is measured in a real browser instead (contributor/CTRIB-068.md in odd-team records the numbers).
 * What is pinned here is the STRUCTURE that produces those widths: who gets the body, and who is left alone.
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
  it('wraps a plain-string informational title in the shared card body', async () => {
    renderTip({ checkForOverflow: false });
    await userEvent.hover(screen.getByText('anchor'));

    const tip = await screen.findByRole('tooltip');
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

  it('a DARK informational string stays the compact dark chip — the light card body is never drawn inside it', async () => {
    // The two shipped dark sites: the "Logical type: X" hint on every dataset-structure field row and on a term's
    // linked columns. The body is a LIGHT card (padding, a light border, a shadow); inside the dark chip it doubled
    // the chip's height and painted a light border on a dark background. Measured 137x20px -> 176x43px before this
    // case existed.
    renderTip({ checkForOverflow: false, type: 'dark', title: 'Logical type: VARCHAR' });
    await userEvent.hover(screen.getByText('anchor'));

    const tip = await screen.findByRole('tooltip');
    expect(
      tip.querySelector('[data-qa="tooltip-body"]'),
      'the card body belongs to the light type only'
    ).toBeNull();
    expect(tip).toHaveTextContent('Logical type: VARCHAR');
  });
});

describe('AppTooltip — the two enter delays are forwarded, and only when a caller asks (ST-12 / #1846)', () => {
  // A tooltip whose OPENING costs a request (the search row's (?) "why it matched") must not open on a pointer
  // sweep. MUI keeps a module-global 800 ms hysteresis after any tooltip closes during which `enterNextDelay`
  // applies instead of `enterDelay`, so a caller has to set BOTH — and a caller that sets neither keeps MUI's
  // defaults (100 ms / 0 ms), so the other forty-odd call sites are untouched.
  it('with both delays set, a hover does not open before the delay and does open after it', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    try {
      renderTip({ checkForOverflow: false, enterDelay: 300, enterNextDelay: 300 });
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
      await user.hover(screen.getByText('anchor'));
      await act(async () => {
        vi.advanceTimersByTime(150);
      });
      expect(
        screen.queryByRole('tooltip'),
        'not yet — the delay has not elapsed'
      ).toBeNull();
      await act(async () => {
        vi.advanceTimersByTime(200);
      });
      expect(await screen.findByRole('tooltip')).toBeInTheDocument();
    } finally {
      vi.useRealTimers();
    }
  });

  it("without the delays, the default open is immediate after MUI's own 100 ms", async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    try {
      renderTip({ checkForOverflow: false });
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
      await user.hover(screen.getByText('anchor'));
      await act(async () => {
        vi.advanceTimersByTime(150);
      });
      expect(await screen.findByRole('tooltip')).toBeInTheDocument();
    } finally {
      vi.useRealTimers();
    }
  });
});
