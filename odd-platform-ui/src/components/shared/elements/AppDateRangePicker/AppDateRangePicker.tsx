import React from 'react';
import { addDays, endOfDay, startOfDay } from 'date-fns';
import DatePicker, { type DateObject } from 'react-multi-date-picker';
import AppDateRangePickerFooter from 'components/shared/elements/AppDateRangePicker/AppDateRangePickerFooter/AppDateRangePickerFooter';
import * as S from 'components/shared/elements/AppDateRangePicker/AppDateRangePickerStyles';

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
  const datePickerRef = React.useRef<any>();

  const [isRangeCorrect, setIsRangeCorrect] = React.useState(true);
  const [{ rangeStart, rangeEnd }, setRange] = React.useState({
    rangeStart: defaultRange.beginDate,
    rangeEnd: defaultRange.endDate,
  });

  React.useEffect(() => {
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

  const handleSetRange = React.useCallback(([beginDate, endDate]: Date[]) => {
    setIsRangeCorrect(true);
    if (!endDate) setIsRangeCorrect(false);
    setRange({ rangeStart: startOfDay(beginDate), rangeEnd: startOfDay(endDate) });
  }, []);

  type DisableSelectedDateParams = {
    date: DateObject;
    selectedDate: DateObject | DateObject[];
  };

  const disableSelectedDate = React.useCallback(
    ({ date, selectedDate }: DisableSelectedDateParams) => {
      const isArray = Array.isArray(selectedDate);
      if (isArray && selectedDate[0].unix === date.unix) return { disabled: true };

      return {};
    },
    []
  );

  const handleClickDone = React.useCallback(() => {
    if (setCurrentRange) {
      setCurrentRange(rangeStart, rangeEnd);
    }
    datePickerRef.current?.closeCalendar();
  }, [setCurrentRange, datePickerRef, rangeStart, rangeEnd]);

  return (
    <>
      <S.DateRangePickerLabel>{label}</S.DateRangePickerLabel>
      <DatePicker
        format='D MMM'
        range
        portal
        arrow={false}
        showOtherDays
        multiple
        offsetY={4}
        numberOfMonths={2}
        mapDays={disableSelectedDate}
        render={<S.AppDateRangeInputIcon />}
        onChange={([begin, end]: DateObject[]) => {
          handleSetRange([begin?.toDate(), end?.toDate()]);
        }}
        value={[rangeStart, rangeEnd]}
        plugins={[
          <AppDateRangePickerFooter
            position='bottom'
            onClickDoneBtn={handleClickDone}
            ranges={ranges}
            setRange={handleSetRange}
            isRangeCorrect={isRangeCorrect}
          />,
        ]}
        ref={datePickerRef}
      />
    </>
  );
};

export default AppDateRangePicker;
