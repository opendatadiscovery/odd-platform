import React from 'react';
import AppDateRangePicker from 'components/shared/AppDateRangePicker/AppDateRangePicker';
import { formatISO } from 'date-fns';
import { useAppDispatch, useAppSelector } from 'lib/redux/hooks';
import { setQueryDateParam } from 'redux/reducers/activity.slice';
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

  const [{ beginDate, endDate }, setRange] = React.useState(defaultRange);

  const setDateRange = (rangeStart: Date, rangeEnd: Date) =>
    setRange({ beginDate: rangeStart, endDate: rangeEnd });

  React.useEffect(() => {
    dispatch(
      setQueryDateParam({
        type: 'beginDate',
        value: formatISO(beginDate, { representation: 'date' }),
      })
    );
    dispatch(
      setQueryDateParam({
        type: 'endDate',
        value: formatISO(endDate, { representation: 'date' }),
      })
    );
  }, [beginDate, endDate]);

  return (
    <AppDateRangePicker
      defaultRange={defaultRange}
      label="Period"
      getCurrentRange={setDateRange}
    />
  );
};

export default CalendarFilter;
