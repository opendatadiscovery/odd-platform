import React from 'react';
import { addDays, endOfDay, startOfDay } from 'date-fns';
import { useTranslation } from 'react-i18next';
import { useQueryParams } from 'lib/hooks';
import { toDate } from 'lib/helpers';
import AppDateRangePicker from 'components/shared/elements/AppDateRangePicker/AppDateRangePicker';

// Shared Period filter. Generic over the page's query shape so both the Activity surface
// (defaultActivityQuery, always carries begin/endDate) and the Alerts surface (defaultAlertsQuery,
// leaves the period unset -> "all time" by default) can drive it. `beginDate`/`endDate` are read
// off the URL query and written back as epoch millis.
interface CalendarQuery {
  beginDate?: number;
  endDate?: number;
}

interface CalendarFilterProps<Q extends CalendarQuery> {
  defaultQuery: Q;
}

const CalendarFilter = <Q extends CalendarQuery>({
  defaultQuery,
}: CalendarFilterProps<Q>) => {
  const { t } = useTranslation();

  const {
    queryParams: { beginDate, endDate },
    setQueryParams,
  } = useQueryParams<Q>(defaultQuery);

  // The picker requires a concrete range; when the query leaves the period unset (Alerts default)
  // fall back to a sensible visible window (last week) WITHOUT writing it to the query — leaving the
  // actual filter all-time until the user explicitly picks a range.
  const defaultRange = React.useMemo(
    () => ({
      beginDate: beginDate ? toDate(beginDate) : startOfDay(addDays(new Date(), -6)),
      endDate: endDate ? toDate(endDate) : endOfDay(new Date()),
    }),
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
      label={t('Period')}
      setCurrentRange={setQueryDateParams}
    />
  );
};

export default CalendarFilter;
