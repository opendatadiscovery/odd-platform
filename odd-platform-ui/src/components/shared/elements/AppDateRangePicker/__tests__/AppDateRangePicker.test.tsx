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
import AppDateRangePicker from '../AppDateRangePicker';

/**
 * THE control's ONE JOB: let a user pick a range and hand it back.
 *
 * Everything that shipped around this component was asserted on what the input DISPLAYS — its value, its
 * placeholder, the language of its month names. Not one test ever clicked a day. So a change that made the
 * component unable to complete a selection passed a green suite, and the first person to find out was the
 * maintainer, on a merged main. These cases drive the calendar the way a user does.
 */

beforeAll(() => {
  i18n.use(initReactI18next).init({
    lng: 'en',
    fallbackLng: 'en',
    resources: { en: { translation: en } },
    interpolation: { escapeValue: false },
  });
});

const renderPicker = (
  props: Partial<React.ComponentProps<typeof AppDateRangePicker>> = {}
) => {
  const setCurrentRange = vi.fn();
  const utils = render(
    <MuiThemeProvider theme={theme}>
      <AppDateRangePicker
        label='Custom range'
        placeholder='Pick two dates'
        setCurrentRange={setCurrentRange}
        {...props}
      />
    </MuiThemeProvider>
  );
  return { ...utils, setCurrentRange };
};

const openCalendar = async (container: HTMLElement) => {
  const input = container.querySelector('input') as HTMLInputElement;
  await userEvent.click(input);
  return input;
};

/** click a day by its visible number inside the open calendar (first match = the earlier month) */
const clickDay = async (day: string) => {
  const cells = screen.getAllByText(day, { selector: '.rmdp-day span, span' });
  const target = cells.find(c => c.closest('.rmdp-day') && !c.closest('.rmdp-disabled'));
  await userEvent.click(target ?? cells[0]);
};

describe('AppDateRangePicker — picking a range actually works', () => {
  it('with NO range seeded, two clicks + Done hand back both dates (the Last-viewed / Alerts path)', async () => {
    const { container, setCurrentRange } = renderPicker();
    await openCalendar(container);

    await clickDay('6');
    // The first click must SURVIVE. If the component drops a half-made selection, the second click
    // starts over and the range can never be completed — which is exactly what a user hits.
    await clickDay('9');
    await userEvent.click(screen.getByText('Done'));

    expect(setCurrentRange).toHaveBeenCalledTimes(1);
    const [begin, end] = setCurrentRange.mock.calls[0];
    expect(begin).toBeInstanceOf(Date);
    expect(end).toBeInstanceOf(Date);
    expect(begin.getDate()).toBe(6);
    expect(end.getDate()).toBe(9);
    expect(begin.getTime()).toBeLessThan(end.getTime());
  });

  it('with a range already seeded, re-picking two days replaces it (the Activity path)', async () => {
    const { container, setCurrentRange } = renderPicker({
      defaultRange: { beginDate: new Date(2026, 8, 1), endDate: new Date(2026, 8, 8) },
    });
    await openCalendar(container);

    await clickDay('11');
    await clickDay('14');
    await userEvent.click(screen.getByText('Done'));

    expect(setCurrentRange).toHaveBeenCalledTimes(1);
    const [begin, end] = setCurrentRange.mock.calls[0];
    expect(begin.getDate()).toBe(11);
    expect(end.getDate()).toBe(14);
  });

  it('a half-made selection does NOT commit — Done with one day picked hands back nothing', async () => {
    const { container, setCurrentRange } = renderPicker();
    await openCalendar(container);

    await clickDay('6');
    await userEvent.click(screen.getByText('Done'));

    expect(setCurrentRange).not.toHaveBeenCalled();
  });
});
