import React from 'react';
import { formatISO } from 'date-fns';
import { useAppDispatch, useAppSelector } from 'redux/lib/hooks';
import { setActivityQueryParam } from 'redux/slices/activity.slice';
import { getActivitiesQueryParamsByName } from 'redux/selectors';
import AppDateRangePicker from 'components/shared/AppDateRangePicker/AppDateRangePicker';

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

  const setQueryDateParams = React.useCallback(
    (beginDate: Date, endDate: Date) => {
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
    },
    [dispatch, setActivityQueryParam, formatISO]
  );

  return (
    <AppDateRangePicker
      defaultRange={defaultRange}
      label="Period"
      setCurrentRange={setQueryDateParams}
    />
  );
};

export default CalendarFilter;
