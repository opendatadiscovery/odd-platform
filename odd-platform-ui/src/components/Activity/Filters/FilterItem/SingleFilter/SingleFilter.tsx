import React from 'react';
import { Grid } from '@mui/material';
import {
  ActivityEventType,
  DataSource,
  Namespace,
} from 'generated-sources';
import AppTextField from 'components/shared/AppTextField/AppTextField';
import AppMenuItem from 'components/shared/AppMenuItem/AppMenuItem';
import { FilterNames } from 'components/Activity/Filters/Filters';
import { getActivitiesFilters } from 'redux/selectors';
import { useAppDispatch, useAppSelector } from 'lib/redux/hooks';
import { setActivityFilters } from 'redux/reducers/activity.slice';
import { stringFormatted } from 'lib/helpers';

interface SingleFilterProps {
  name: string;
  filterOptions: DataSource[] | Namespace[] | ActivityEventType[];
  filterName: FilterNames;
  // handleSetFilters: (filters: ActivityFilters) => void;
}

const SingleFilter: React.FC<SingleFilterProps> = ({
  name,
  filterOptions,
  filterName,
  // handleSetFilters,
}) => {
  const dispatch = useAppDispatch();

  const filters = useAppSelector(getActivitiesFilters);
  console.log('filters', filters);
  const handleFilterSelect = (
    option: string | { id: number | string; name: string }
  ) => {
    if (typeof option === 'string') {
      dispatch(setActivityFilters({ ...filters, [filterName]: option }));
    } else {
      dispatch(
        setActivityFilters({
          ...filters,
          [filterName]: option.id === 'All' ? null : option.id,
        })
      );
    }
  };

  const optionsList = React.useMemo(
    () =>
      filterOptions?.map(option => {
        if (typeof option === 'string') {
          return (
            <AppMenuItem
              key={option}
              value={option}
              onClick={() => handleFilterSelect(option)}
              maxWidth={190}
            >
              {stringFormatted(option, '_', 'firstLetterOfEveryWord')}
            </AppMenuItem>
          );
        }

        return (
          <AppMenuItem
            key={option.id}
            value={option.id}
            onClick={() => handleFilterSelect(option)}
            maxWidth={190}
          >
            {option.name}
          </AppMenuItem>
        );
      }),
    [filterOptions]
  );

  // const [] = React.useState<>('All');

  return filterOptions.length ? (
    <Grid container>
      <Grid container item xs={12}>
        <AppTextField
          sx={{ mt: 2 }}
          label={name}
          select
          id={`filter-${filterName}`}
          defaultValue="All"
          // value={
          //   filters[filterName]
          //     ? filterOptions?.find(
          //         (el: any) => el.id === filters[filterName]
          //       ).name
          //     : 'All'
          // }
        >
          <AppMenuItem
            value="All"
            maxWidth={190}
            onClick={() => handleFilterSelect({ id: 'All', name: 'All' })}
          >
            All
          </AppMenuItem>
          {optionsList}
        </AppTextField>
      </Grid>
    </Grid>
  ) : null;
};

export default SingleFilter;
