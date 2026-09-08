import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { addDays, endOfDay, startOfDay } from 'date-fns';
import { useTranslation } from 'react-i18next';
import AppDateRangePickerFooter from 'components/shared/elements/AppDateRangePicker/AppDateRangePickerFooter/AppDateRangePickerFooter';
import * as S from 'components/shared/elements/AppDateRangePicker/AppDateRangePickerStyles';
import DatePicker, { type DateObject } from 'react-multi-date-picker';
import { calendarLocale } from 'components/shared/elements/AppDateRangePicker/calendarLocale';

interface AppDateRangePickerProps {
  /**
   * The range the input SHOWS. Optional since ST-10 (#1844): a facet whose window is genuinely unset must show an
   * EMPTY input, not a plausible-looking range it is not applying — a control that displays a filter it does not
   * hold is a lie the user has no way to check. Of the two shipped callers, both driven by `CalendarFilter`:
   * Activity always carries begin/endDate in its query, so that surface is unchanged; Alerts leaves the period
   * unset by default and therefore now passes NONE, which is what stops its box displaying a last-week range it
   * was never filtering by — the published manual has always said the Alerts default is all-time.
   */
  defaultRange?: { beginDate: Date; endDate: Date };
  label: string;
  /** shown while {@link defaultRange} is unset — say what picking a range would do */
  placeholder?: string;
  /**
   * Where the calendar opens, in react-multi-date-picker's terms. Left undefined the library picks, which is right
   * for a control near the top of a page and WRONG in a filter rail: measured at 1280x720, a two-month calendar
   * opening upward from a control ~350px down the sidebar overflows the viewport top and takes the month header
   * and its navigation arrows with it. A sidebar caller should open sideways, where the room is.
   */
  calendarPosition?: string;
  setCurrentRange?: (rangeStart: Date, rangeEnd: Date) => void;
  /**
   * The footer's quick-range links. Defaults to the shipped four (3 Day / 1 Week / 2 Week / 1 Month), so existing
   * callers are unchanged; pass `[]` to hide the row on a surface that offers its own presets elsewhere (ST-10's
   * Last-viewed facet puts them in the filter rail instead, where the other facets keep theirs).
   */
  ranges?: { label: string; value: Date[] }[];
}

const AppDateRangePicker: React.FC<AppDateRangePickerProps> = ({
  defaultRange,
  label,
  placeholder,
  calendarPosition,
  setCurrentRange,
  ranges: rangesProp,
}) => {
  const { t, i18n } = useTranslation();
  const datePickerRef = useRef<any>();

  const [isRangeCorrect, setIsRangeCorrect] = useState(true);
  const [{ rangeStart, rangeEnd }, setRange] = useState<{
    rangeStart?: Date;
    rangeEnd?: Date;
  }>({ rangeStart: defaultRange?.beginDate, rangeEnd: defaultRange?.endDate });

  useEffect(() => {
    setRange({ rangeStart: defaultRange?.beginDate, rangeEnd: defaultRange?.endDate });
  }, [defaultRange]);

  // The four shipped quick ranges. Their labels were English string literals until ST-10 (#1844) — the calendar
  // itself was English too — so every non-English deployment read them untranslated; both are fixed here, which
  // also fixes the Activity and Alerts Period filters that share this control.
  const ranges = rangesProp ?? [
    {
      label: t('3 Day'),
      value: [startOfDay(addDays(new Date(), -2)), endOfDay(new Date())],
    },
    {
      label: t('1 Week'),
      value: [startOfDay(addDays(new Date(), -6)), endOfDay(new Date())],
    },
    {
      label: t('2 Week'),
      value: [startOfDay(addDays(new Date(), -13)), endOfDay(new Date())],
    },
    {
      label: t('1 Month'),
      value: [startOfDay(addDays(new Date(), -30)), endOfDay(new Date())],
    },
  ];

  // The calendar's own month + weekday names, in the active language (see calendarLocale for why the catalog key
  // cannot be handed to Intl directly).
  const locale = useMemo(() => calendarLocale(i18n.language), [i18n.language]);

  const handleSetRange = useCallback(([beginDate, endDate]: Date[]) => {
    setIsRangeCorrect(true);
    if (!endDate) setIsRangeCorrect(false);
    setRange({
      rangeStart: beginDate && startOfDay(beginDate),
      rangeEnd: endDate && endOfDay(endDate),
    });
  }, []);

  interface DisableSelectedDateParams {
    date: DateObject;
    selectedDate: DateObject | DateObject[];
  }

  const disableSelectedDate = useCallback(
    ({ date, selectedDate }: DisableSelectedDateParams) => {
      const isArray = Array.isArray(selectedDate);
      // `selectedDate` is EMPTY while no range is set (the optional-defaultRange path), so the index read must be
      // guarded: an undefined `.unix` here throws inside the calendar's render and, with no error boundary in this
      // app, blanks the whole page.
      if (isArray && selectedDate[0] && selectedDate[0].unix === date.unix)
        return { disabled: true };

      return {};
    },
    []
  );

  const handleClickDone = useCallback(() => {
    if (setCurrentRange && rangeStart && rangeEnd) {
      setCurrentRange(rangeStart, rangeEnd);
    }
    datePickerRef.current?.closeCalendar();
  }, [setCurrentRange, datePickerRef, rangeStart, rangeEnd]);

  const appDateRangePickerFooter = (
    <AppDateRangePickerFooter
      position='bottom'
      onClickDoneBtn={handleClickDone}
      ranges={ranges}
      setRange={handleSetRange}
      isRangeCorrect={isRangeCorrect}
    />
  );

  return (
    <>
      <S.DateRangePickerLabel>{label}</S.DateRangePickerLabel>
      <DatePicker
        format='D MMM'
        locale={locale as never}
        calendarPosition={calendarPosition}
        range
        portal
        arrow={false}
        showOtherDays
        offsetY={4}
        numberOfMonths={2}
        mapDays={disableSelectedDate}
        // The placeholder rides the RENDER element, not the DatePicker: with a custom `render`, the library clones
        // it with only its own props (value / openCalendar / handleValueChange / locale / separator), so a
        // `placeholder` handed to DatePicker never reaches the input. Verified by reading the rendered DOM.
        render={<S.AppDateRangeInputIcon placeholder={placeholder} />}
        onChange={([begin, end]: DateObject[]) => {
          handleSetRange([begin?.toDate(), end?.toDate()]);
        }}
        value={rangeStart && rangeEnd ? [rangeStart, rangeEnd] : []}
        plugins={[appDateRangePickerFooter]}
        ref={datePickerRef}
      />
    </>
  );
};

export default AppDateRangePicker;
