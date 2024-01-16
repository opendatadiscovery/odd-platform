import React, { useCallback, useEffect, useRef, useState } from 'react';
import { addDays, endOfDay, startOfDay } from 'date-fns';
import AppDateRangePickerFooter from 'components/shared/elements/AppDateRangePicker/AppDateRangePickerFooter/AppDateRangePickerFooter';
import * as S from 'components/shared/elements/AppDateRangePicker/AppDateRangePickerStyles';
import DatePicker, { type DateObject } from 'react-multi-date-picker';

interface AppDateRangePickerProps {
  defaultRange: { beginDate: Date; endDate: Date };
  label: string;
  setCurrentRange?: (rangeStart: Date, rangeEnd: Date) => void;
}

const AppDateRangePicker: React.FC<AppDateRangePickerProps> = ({
  defaultRange,
  label,
  setCurrentRange,
}) => {
  const datePickerRef = useRef<any>();

  const [isRangeCorrect, setIsRangeCorrect] = useState(true);
  const [{ rangeStart, rangeEnd }, setRange] = useState({
    rangeStart: defaultRange.beginDate,
    rangeEnd: defaultRange.endDate,
  });

  useEffect(() => {
    setRange({ rangeStart: defaultRange.beginDate, rangeEnd: defaultRange.endDate });
  }, [defaultRange]);

  const ranges = [
    {
      label: '3 Day',
      value: [startOfDay(addDays(new Date(), -2)), endOfDay(new Date())],
    },
    {
      label: '1 Week',
      value: [startOfDay(addDays(new Date(), -6)), endOfDay(new Date())],
    },
    {
      label: '2 Week',
      value: [startOfDay(addDays(new Date(), -13)), endOfDay(new Date())],
    },
    {
      label: '1 Month',
      value: [startOfDay(addDays(new Date(), -30)), endOfDay(new Date())],
    },
  ];

  const handleSetRange = useCallback(([beginDate, endDate]: Date[]) => {
    setIsRangeCorrect(true);
    if (!endDate) setIsRangeCorrect(false);
    setRange({ rangeStart: startOfDay(beginDate), rangeEnd: endOfDay(endDate) });
  }, []);

  type DisableSelectedDateParams = {
    date: DateObject;
    selectedDate: DateObject | DateObject[];
  };

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
