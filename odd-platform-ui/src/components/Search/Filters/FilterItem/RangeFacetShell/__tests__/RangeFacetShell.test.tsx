import React from 'react';
import { beforeAll, describe, expect, it, vi } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ThemeProvider as MuiThemeProvider } from '@mui/material/styles';
import theme from 'theme/mui.theme';
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { render } from 'lib/tests/testHelpers';
import en from 'locales/translations/en.json';
import RangeFacetShell from '../RangeFacetShell';

/**
 * ST-10 (#1844) — the chrome shared by every range facet, extracted from the numeric one so the datetime facets can
 * reuse it around a different body.
 *
 * This exists because the extraction's other oracle cannot see the states that matter. `PopularityFilter.test.tsx`
 * passing unchanged proves the numeric facet still behaves; it asserts nothing about what the SHELL does when it is
 * given no body or no chip, and a shell that rendered those unconditionally would put a clickable preset under a
 * disabled control — a state any deployment with one occupied band reaches.
 */
beforeAll(() => {
  i18n.use(initReactI18next).init({
    lng: 'en',
    fallbackLng: 'en',
    resources: { en: { translation: en } },
    interpolation: { escapeValue: false },
  });
});

const qa = (container: HTMLElement, hook: string) =>
  container.querySelector(`[data-qa="filter-demo-${hook}"]`);

const renderShell = (props: Partial<React.ComponentProps<typeof RangeFacetShell>> = {}) =>
  render(
    <MuiThemeProvider theme={theme}>
      <RangeFacetShell
        name='Demo'
        filterId='demo'
        chipText=''
        onClear={() => {}}
        {...props}
      />
    </MuiThemeProvider>
  );

describe('RangeFacetShell (ST-10 / #1844)', () => {
  it('renders the heading, the qualifier and the inline-help icon', () => {
    const { container } = renderShell({
      qualifier: 'Assets you have opened',
      help: 'Some explanation.',
      children: <div data-testid='body' />,
    });
    expect(screen.getByText('Demo')).toBeVisible();
    expect(screen.getByText('Assets you have opened')).toBeVisible();
    expect(qa(container, 'info')).not.toBeNull();
    expect(screen.getByTestId('body')).toBeVisible();
  });

  it('renders NEITHER a body NOR a preset row when the caller passes none — the disabled/one-stop state', () => {
    // The caller gates both (its guard has two conditions, only one of which is `disabledReason`). If the shell
    // rendered presets on its own, a clickable link would sit under a control that cannot be used.
    const { container } = renderShell({ disabledReason: 'Nothing to slide over' });
    expect(screen.getByText('Nothing to slide over')).toBeVisible();
    expect(qa(container, 'disabled')).not.toBeNull();
    expect(qa(container, 'preset')).toBeNull();
    expect(screen.queryByTestId('body')).toBeNull();
  });

  it('shows no chip when chipText is empty, and a clearable one when it is not', async () => {
    const user = userEvent.setup();
    const { container: noSelection } = renderShell({ chipText: '' });
    expect(qa(noSelection, 'chip')).toBeNull();

    const onClear = vi.fn();
    const { container } = renderShell({ chipText: 'Last viewed: any time', onClear });
    expect(qa(container, 'chip')).not.toBeNull();
    expect(screen.getByText('Last viewed: any time')).toBeVisible();
    await user.click(screen.getByRole('button', { name: 'Demo: Last viewed: any time' }));
    expect(onClear).toHaveBeenCalledTimes(1);
  });

  it('renders each preset as a button that commits through its own callback', async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    renderShell({
      children: <div />,
      presets: [{ label: 'Today', onSelect }],
    });
    await user.click(screen.getByRole('button', { name: 'Today' }));
    expect(onSelect).toHaveBeenCalledTimes(1);
  });
});
