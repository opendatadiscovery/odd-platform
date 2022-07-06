import React from 'react';
import { DataSource, Namespace } from 'generated-sources';
import { useAppDispatch, useAppSelector } from 'lib/redux/hooks';
import { ActivitySingleQueryName } from 'redux/interfaces';
import AppDateRangePicker from 'components/shared/AppDateRangePicker/AppDateRangePicker';
import { getActivitiesQueryParamsByQueryName } from 'redux/selectors';

interface CalendarFilterProps {
  name: string;
  filterOptions: DataSource[] | Namespace[];
  filterName: ActivitySingleQueryName;
}

const CalendarFilter: React.FC = () => {
  const dispatch = useAppDispatch();

  const beginDate = useAppSelector(state =>
    getActivitiesQueryParamsByQueryName(state, 'beginDate')
  ) as Date;
  const endDate = useAppSelector(state =>
    getActivitiesQueryParamsByQueryName(state, 'endDate')
  ) as Date;

  // React.useEffect(() => {
  //   if (!selectedOption) setSelectValue('All');
  //   setSelectValue(selectedOption);
  // }, [selectedOption, setSelectValue]);

  return (
    <AppDateRangePicker
      defaultRange={{ beginDate, endDate }}
      label="Period"
    />
  );
};

export default CalendarFilter;
