import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { addDays, endOfDay, startOfDay } from 'date-fns';
import { useTranslation } from 'react-i18next';
import AppDateRangePickerFooter from 'components/shared/elements/AppDateRangePicker/AppDateRangePickerFooter/AppDateRangePickerFooter';
import * as S from 'components/shared/elements/AppDateRangePicker/AppDateRangePickerStyles';
import DatePicker, { type DateObject } from 'react-multi-date-picker';
import { calendarLocale } from 'components/shared/elements/AppDateRangePicker/calendarLocale';

interface AppDateRangePickerProps {
  defaultRange: { beginDate: Date; endDate: Date };
  label: string;
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
  setCurrentRange,
  ranges: rangesProp,
}) => {
  const { t, i18n } = useTranslation();
  const datePickerRef = useRef<any>();

  const [isRangeCorrect, setIsRangeCorrect] = useState(true);
  const [{ rangeStart, rangeEnd }, setRange] = useState({
    rangeStart: defaultRange.beginDate,
    rangeEnd: defaultRange.endDate,
  });

  useEffect(() => {
    setRange({ rangeStart: defaultRange.beginDate, rangeEnd: defaultRange.endDate });
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
    setRange({ rangeStart: startOfDay(beginDate), rangeEnd: endOfDay(endDate) });
  }, []);

  interface DisableSelectedDateParams {
    date: DateObject;
    selectedDate: DateObject | DateObject[];
  }

  const disableSelectedDate = useCallback(
    ({ date, selectedDate }: DisableSelectedDateParams) => {
      const isArray = Array.isArray(selectedDate);
      if (isArray && selectedDate[0].unix === date.unix) return { disabled: true };

      return {};
    },
    []
  );

  const handleClickDone = useCallback(() => {
    if (setCurrentRange) {
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
        range
        portal
        arrow={false}
        showOtherDays
        offsetY={4}
        numberOfMonths={2}
        mapDays={disableSelectedDate}
        render={<S.AppDateRangeInputIcon />}
        onChange={([begin, end]: DateObject[]) => {
          handleSetRange([begin?.toDate(), end?.toDate()]);
        }}
        value={[rangeStart, rangeEnd]}
        plugins={[appDateRangePickerFooter]}
        ref={datePickerRef}
      />
    </>
  );
};

export default AppDateRangePicker;
