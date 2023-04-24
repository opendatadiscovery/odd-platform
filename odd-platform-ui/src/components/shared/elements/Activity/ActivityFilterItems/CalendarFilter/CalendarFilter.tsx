import React from 'react';
import { useQueryParams } from 'lib/hooks';
import {
  type ActivityQuery,
  defaultActivityQuery,
} from 'components/shared/elements/Activity/common';
import { toDate } from 'lib/helpers';
import AppDateRangePicker from 'components/shared/elements/AppDateRangePicker/AppDateRangePicker';

const CalendarFilter: React.FC = () => {
  const {
    queryParams: { beginDate, endDate },
    setQueryParams,
  } = useQueryParams<ActivityQuery>(defaultActivityQuery);

  const defaultRange = React.useMemo(
    () => ({ beginDate: toDate(beginDate), endDate: toDate(endDate) }),
    [beginDate, endDate]
  );

  const setQueryDateParams = React.useCallback(
    (begin: Date, end: Date) => {
      setQueryParams(prev => ({
        ...prev,
        beginDate: begin.getTime(),
        endDate: end.getTime(),
      }));
    },
    [setQueryParams]
  );

  return (
    <AppDateRangePicker
      defaultRange={defaultRange}
      label='Period'
      setCurrentRange={setQueryDateParams}
    />
  );
};

export default CalendarFilter;
