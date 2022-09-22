import React from 'react';
import { addDays, endOfDay, startOfDay } from 'date-fns';
import DatePicker, { DateObject } from 'react-multi-date-picker';
import AppDateRangePickerFooter from './AppDateRangePickerFooter/AppDateRangePickerFooter';
import * as S from './AppDateRangePickerStyles';

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

  const [{ rangeStart, rangeEnd }, setRange] = React.useState({
    rangeStart: defaultRange.beginDate,
    rangeEnd: defaultRange.endDate,
  });

  React.useEffect(() => {
    setRange({
      rangeStart: defaultRange.beginDate,
      rangeEnd: defaultRange.endDate,
    });
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

  const handleSetRange = React.useCallback(
    ([beginDate, endDate]: Date[]) => {
      setRange({
        rangeStart: beginDate,
        rangeEnd: endDate,
      });
    },
    [setRange, setCurrentRange]
  );

  const disableSelectedDate = ({
    date,
    selectedDate,
  }: {
    date: DateObject;
    selectedDate: DateObject | DateObject[];
  }) => {
    const isArray = Array.isArray(selectedDate);
    if (isArray && selectedDate[0].unix === date.unix)
      return { disabled: true };

    return {};
  };

  return (
    <>
      <S.DateRangePickerLabel>{label}</S.DateRangePickerLabel>
      <DatePicker
        format="D MMM"
        range
        arrow={false}
        showOtherDays
        multiple
        offsetY={4}
        numberOfMonths={2}
        mapDays={disableSelectedDate}
        render={<S.AppDateRangeInputIcon />}
        onChange={([start, end]: DateObject[]) =>
          handleSetRange([start?.toDate(), end?.toDate()])
        }
        value={[rangeStart, rangeEnd]}
        plugins={[
          <AppDateRangePickerFooter
            position="bottom"
            onClickDoneBtn={() => {
              if (setCurrentRange) {
                setCurrentRange(rangeStart, rangeEnd);
              }
              datePickerRef.current?.closeCalendar();
            }}
            ranges={ranges}
            setRange={handleSetRange}
          />,
        ]}
        ref={datePickerRef}
      />
    </>
  );
};

export default AppDateRangePicker;
