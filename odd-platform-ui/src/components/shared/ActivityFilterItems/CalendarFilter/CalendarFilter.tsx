import React from 'react';
import AppDateRangePicker from 'components/shared/AppDateRangePicker/AppDateRangePicker';
import { formatISO } from 'date-fns';
import { useAppDispatch, useAppSelector } from 'lib/redux/hooks';
import { setActivityQueryParam } from 'redux/reducers/activity.slice';
import { getActivitiesQueryParamsByName } from 'redux/selectors';

const CalendarFilter: React.FC = () => {
  const dispatch = useAppDispatch();

  const defaultBeginDateISO = useAppSelector(
    getActivitiesQueryParamsByName('beginDate')
  ) as string;
  const defaultEndDateISO = useAppSelector(
    getActivitiesQueryParamsByName('endDate')
  ) as string;

  const defaultBeginDate = new Date(defaultBeginDateISO);
  const defaultEndDate = new Date(defaultEndDateISO);
  const defaultRange = {
    beginDate: defaultBeginDate,
    endDate: defaultEndDate,
  };

  const setQueryDateParams = (beginDate: Date, endDate: Date) => {
    dispatch(
      setActivityQueryParam({
        queryName: 'beginDate',
        queryData: formatISO(beginDate, { representation: 'date' }),
      })
    );
    dispatch(
      setActivityQueryParam({
        queryName: 'endDate',
        queryData: formatISO(endDate, { representation: 'date' }),
      })
    );
  };

  return (
    <AppDateRangePicker
      defaultRange={defaultRange}
      label="Period"
      getCurrentRange={setQueryDateParams}
    />
  );
};

export default CalendarFilter;
