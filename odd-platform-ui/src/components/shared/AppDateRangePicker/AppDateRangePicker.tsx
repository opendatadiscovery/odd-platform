import React from 'react';
import { addDays, endOfDay, format, startOfDay } from 'date-fns';
import CalendarIcon from 'components/shared/Icons/CalendarIcon';
import { DateRange, ValueType } from 'rsuite/esm/DateRangePicker/types';
import 'rsuite/dist/rsuite.min.css';
import { useAppDispatch, useUpdateActivityQuery } from 'lib/redux/hooks';
import * as S from './AppDateRangePickerStyles';

interface AppDateRangePickerProps {
  defaultRange: { beginDate: Date; endDate: Date };
  label: string;
}

const AppDateRangePicker: React.FC<AppDateRangePickerProps> = ({
  defaultRange,
  label,
}) => {
  const dispatch = useAppDispatch();

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
        value={[defaultRange.beginDate, defaultRange.endDate]}
        onOk={([beginDate, endDate]: ValueType) => {
          console.log('beginDate, endDate', beginDate, endDate);
          if (beginDate && endDate) {
            useUpdateActivityQuery(
              'beginDate',
              beginDate,
              'add',
              dispatch
            );
            useUpdateActivityQuery('endDate', endDate, 'add', dispatch);
          }
        }}
        caretAs={CalendarIcon}
        renderValue={([beginDate, endDate]: DateRange) =>
          `${format(beginDate, 'd MMM')} - ${format(endDate, 'd MMM')}`
        }
      />
    </>
  );
};

export default AppDateRangePicker;
