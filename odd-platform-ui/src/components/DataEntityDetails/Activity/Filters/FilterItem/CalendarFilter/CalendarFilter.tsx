import React from 'react';
import { useAppSelector } from 'lib/redux/hooks';
import AppDateRangePicker from 'components/shared/AppDateRangePicker/AppDateRangePicker';
import { getActivitiesQueryParamsByQueryName } from 'redux/selectors';

const CalendarFilter: React.FC = () => {
  const beginDate = useAppSelector(state =>
    getActivitiesQueryParamsByQueryName(state, 'beginDate')
  ) as string;
  const endDate = useAppSelector(state =>
    getActivitiesQueryParamsByQueryName(state, 'endDate')
  ) as string;

  return (
    <AppDateRangePicker
      defaultRange={{
        beginDate: new Date(beginDate),
        endDate: new Date(endDate),
      }}
      label="Period"
    />
  );
};

export default CalendarFilter;
