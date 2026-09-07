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

  // The period the box SHOWS — and only when one is actually in force. Until ST-10 (#1844) this fell back to a
  // visible last-week window when the query left the period unset (the Alerts default), which meant the control
  // displayed "1 Sep ~ 7 Sep" while the filter was all-time: a range the user had not chosen, was not being
  // filtered by, and had no way to tell apart from one that was. `AppDateRangePicker` now accepts no range and
  // shows its placeholder instead. Activity always carries begin/endDate, so that surface is unchanged.
  const defaultRange = React.useMemo(
    () =>
      beginDate || endDate
        ? {
            beginDate: beginDate
              ? toDate(beginDate)
              : startOfDay(addDays(new Date(), -6)),
            endDate: endDate ? toDate(endDate) : endOfDay(new Date()),
          }
        : undefined,
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
      placeholder={t('Pick two dates')}
      setCurrentRange={setQueryDateParams}
    />
  );
};

export default CalendarFilter;
