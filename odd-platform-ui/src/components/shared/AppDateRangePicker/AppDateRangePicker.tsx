import React from 'react';
import { addDays, endOfDay, format, startOfDay } from 'date-fns';
import CalendarIcon from 'components/shared/Icons/CalendarIcon';
import { DateRange, ValueType } from 'rsuite/esm/DateRangePicker/types';
import 'rsuite/dist/rsuite.min.css';
import * as S from './AppDateRangePickerStyles';

interface AppDateRangePickerProps {
  defaultRange: { beginDate: Date; endDate: Date };
  label: string;
  getCurrentRange?: (rangeStart: Date, rangeEnd: Date) => void;
}

const AppDateRangePicker: React.FC<AppDateRangePickerProps> = ({
  defaultRange,
  label,
  getCurrentRange,
}) => {
  const [{ rangeStart, rangeEnd }, setRange] = React.useState({
    rangeStart: defaultRange.beginDate,
    rangeEnd: defaultRange.endDate,
  });

  const locale = {
    sunday: 'Sun',
    monday: 'Mon',
    tuesday: 'Tue',
    wednesday: 'Wed',
    thursday: 'Thu',
    friday: 'Fri',
    saturday: 'Sat',
    ok: 'Done',
  };

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

  const handleOnOk = ([beginDate, endDate]: ValueType) => {
    if (beginDate && endDate && getCurrentRange) {
      setRange({ rangeStart: beginDate, rangeEnd: endDate });
      getCurrentRange(beginDate, endDate);
    }
  };

  const handleRenderValue = ([beginDate, endDate]: DateRange) =>
    `${format(beginDate, 'd MMM')} - ${format(endDate, 'd MMM')}`;

  return (
    <>
      <S.DateRangePickerLabel>{label}</S.DateRangePickerLabel>
      <S.AppDateRangePicker
        format="d MMM yyyy"
        character=" - "
        locale={locale}
        ranges={ranges}
        size="sm"
        cleanable={false}
        value={[rangeStart, rangeEnd]}
        onOk={handleOnOk}
        caretAs={CalendarIcon}
        renderValue={handleRenderValue}
      />
    </>
  );
};

export default AppDateRangePicker;
